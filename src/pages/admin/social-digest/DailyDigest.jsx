import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Copy,
    Download,
    ImageIcon,
    Link2,
    Loader2,
    RefreshCw,
    RotateCcw,
} from "lucide-react";

import { Button } from "Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Label } from "Components/ui/label";
import { Textarea } from "Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "Components/ui/select";

import CareersAtTechBanner from "Components/Canvas/CareersAtTechBanner";

import { captureCanvasDataUrl, saveDataUrl, uploadDataUrl } from "Helpers/imageHelpers";
import { copyToClipBoard } from "Helpers/utility";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    showWarnToast,
} from "Helpers/toast";
import { buildCaption } from "Helpers/JobListHelper/captionBuilder";
import { buildWhatsAppMessage } from "Helpers/JobListHelper";
import {
    adaptJobForCanvas,
    companyFromJob,
} from "Helpers/JobListHelper/jobCanvasAdapter";
import {
    fetchNextDigestJobs,
    jobId,
    markSeen,
    resetSeen,
} from "Helpers/JobListHelper/digestSelector";

const DIGEST_SIZE = 5;

// Same CTA lines the single-banner screen offers, applied to the whole batch.
const CTA_OPTIONS = [
    { id: "1", title: "", line: "Comment Link to get the apply link in DM" },
    { id: "2", title: "Apply Link : ", line: "Link in Bio (visit : careersat.tech)" },
    { id: "3", title: "Apply Here : ", line: "Check our website for more details" },
    { id: "4", title: "", line: "Join instagram channel for apply link 👇" },
    { id: "5", title: "", line: "Comment YES for the apply link" },
];

const CANVAS_CSS = {
    imgsize: "60%",
    marginLeft: "0px",
    marginTop: "0px",
    marginBottom: "0px",
    fontSize: "96px",
};

const canvasIdFor = (id) => `digest-banner-${id}`;

const slugForFile = (job) =>
    `${job?.companyName || "company"}-${job?.title || "job"}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

// html-to-image snapshots whatever is painted right now, so a company logo that
// is still in flight captures as a blank box. Wait for every <img> to settle
// (load or error) before capturing, with a ceiling so one dead CDN URL cannot
// hang the whole batch.
const IMAGE_WAIT_TIMEOUT_MS = 8000;

const waitForImages = (root) => {
    if (!root) return Promise.resolve();
    const pending = Array.from(root.querySelectorAll("img")).filter(
        (img) => !(img.complete && img.naturalHeight !== 0)
    );
    if (!pending.length) return Promise.resolve();

    return Promise.race([
        Promise.all(
            pending.map(
                (img) =>
                    new Promise((resolve) => {
                        img.addEventListener("load", resolve, { once: true });
                        img.addEventListener("error", resolve, { once: true });
                    })
            )
        ),
        new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS)),
    ]);
};

// Two frames guarantees React has committed the new banners and the browser has
// laid them out before we measure scrollWidth/scrollHeight.
const nextPaint = () =>
    new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

const DailyDigest = () => {
    const [jobs, setJobs] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [exhausted, setExhausted] = useState(false);
    const [ctaId, setCtaId] = useState("1");
    const [useWebsiteLink, setUseWebsiteLink] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);

    const stageRef = useRef(null);
    // Bumped on every fetch so the capture effect reruns even when the same job
    // set comes back, and so a stale in-flight capture can detect it lost.
    const [renderToken, setRenderToken] = useState(0);
    const latestToken = useRef(0);

    const ctaDetails = useMemo(() => {
        const cta = CTA_OPTIONS.find((c) => c.id === ctaId) || CTA_OPTIONS[0];
        return { ctaTitle: cta.title, ctaLine: cta.line };
    }, [ctaId]);

    // Captions read the raw API job — deriveInsights wants the untouched
    // batch/degree/jobLocation arrays, which the canvas adapter flattens.
    const instagramCaption = useMemo(
        () => (jobs.length ? buildCaption({ jobs }) : ""),
        [jobs]
    );

    const whatsappMessage = useMemo(
        () => (jobs.length ? buildWhatsAppMessage(jobs, useWebsiteLink) : ""),
        [jobs, useWebsiteLink]
    );

    const loadNext = useCallback(async () => {
        setLoading(true);
        try {
            const { jobs: next, exhausted: done } = await fetchNextDigestJobs(DIGEST_SIZE);

            if (!next.length) {
                setExhausted(true);
                showWarnToast("No unseen published jobs left. Reset history to start over.");
                return;
            }

            setExhausted(done);
            setBanners([]);
            setJobs(next);
            markSeen(next);
            latestToken.current += 1;
            setRenderToken(latestToken.current);

            if (next.length < DIGEST_SIZE) {
                showInfoToast(`Only ${next.length} unseen job(s) left.`);
            }
        } catch (err) {
            showErrorToast(err.message || "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, []);

    // Capture runs off the rendered offscreen stage, one banner at a time —
    // html-to-image is main-thread heavy and five parallel captures on a 1080px
    // canvas visibly janks the page.
    useEffect(() => {
        if (!renderToken || !jobs.length) return;

        let cancelled = false;
        const token = renderToken;

        const run = async () => {
            setCapturing(true);
            try {
                await nextPaint();
                await waitForImages(stageRef.current);
                await nextPaint();

                const captured = [];
                for (const job of jobs) {
                    if (cancelled || token !== latestToken.current) return;
                    const id = jobId(job);
                    const dataUrl = await captureCanvasDataUrl(canvasIdFor(id));
                    captured.push({
                        id,
                        title: job.title || "Untitled",
                        companyName: job.companyName || "",
                        slug: job.slug || "",
                        fileName: slugForFile(job),
                        dataUrl,
                        cdnUrl: null,
                    });
                }

                if (cancelled || token !== latestToken.current) return;
                setBanners(captured);

                const failed = captured.filter((b) => !b.dataUrl).length;
                if (failed) showWarnToast(`${failed} banner(s) failed to render.`);
            } finally {
                if (!cancelled) setCapturing(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [renderToken, jobs]);

    const handleDownload = (banner) => {
        if (!banner.dataUrl) return;
        saveDataUrl(banner.dataUrl, banner.fileName);
    };

    const handleDownloadAll = () => {
        const ready = banners.filter((b) => b.dataUrl);
        if (!ready.length) return;
        ready.forEach((b, i) => setTimeout(() => saveDataUrl(b.dataUrl, b.fileName), i * 250));
        showSuccessToast(`Downloading ${ready.length} banner(s)`);
    };

    const handleCdnLink = async (banner) => {
        if (banner.cdnUrl) {
            copyToClipBoard(banner.cdnUrl);
            showSuccessToast("CDN link copied");
            return;
        }
        if (!banner.dataUrl) return;

        setUploadingId(banner.id);
        try {
            const url = await uploadDataUrl(banner.dataUrl);
            if (!url) {
                showErrorToast("Upload failed");
                return;
            }
            setBanners((prev) =>
                prev.map((b) => (b.id === banner.id ? { ...b, cdnUrl: url } : b))
            );
            copyToClipBoard(url);
            showSuccessToast("Uploaded — link copied");
        } catch (err) {
            showErrorToast(err.message || "Upload failed");
        } finally {
            setUploadingId(null);
        }
    };

    const handleCopy = (text, label) => {
        if (!text) return;
        copyToClipBoard(text);
        showSuccessToast(`${label} copied`);
    };

    const handleResetHistory = () => {
        resetSeen();
        setExhausted(false);
        showSuccessToast("Digest history cleared");
    };

    const busy = loading || capturing;

    return (
        <div className="px-4 lg:px-6 pt-6 pb-10 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Daily Digest</h1>
                    <p className="text-sm text-muted-foreground">
                        Five fresh job posters with an Instagram caption and a WhatsApp
                        message. Every click serves jobs you have not seen before.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleResetHistory} disabled={busy}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset history
                    </Button>
                    <Button onClick={loadNext} disabled={busy}>
                        {busy ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        {capturing ? "Rendering…" : `Get next ${DIGEST_SIZE} jobs`}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Banner CTA</Label>
                    <Select value={ctaId} onValueChange={setCtaId}>
                        <SelectTrigger className="h-9 w-[320px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CTA_OPTIONS.map((cta) => (
                                <SelectItem key={cta.id} value={cta.id}>
                                    {cta.title ? `${cta.title}${cta.line}` : cta.line}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {banners.some((b) => b.dataUrl) && (
                    <Button variant="outline" onClick={handleDownloadAll}>
                        <Download className="h-4 w-4 mr-2" />
                        Download all
                    </Button>
                )}
            </div>

            {exhausted && jobs.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    End of the published list — reset history to cycle through again.
                </p>
            )}

            {!jobs.length && !busy && (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Hit “Get next {DIGEST_SIZE} jobs” to build today’s digest.
                        </p>
                    </CardContent>
                </Card>
            )}

            {jobs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {jobs.map((job, i) => {
                        const id = jobId(job);
                        const banner = banners.find((b) => b.id === id);
                        return (
                            <Card key={id} className="overflow-hidden">
                                <CardHeader className="p-4 pb-2 space-y-1">
                                    <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
                                        {i + 1}. {job.title || "Untitled"}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {job.companyName}
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 space-y-3">
                                    <div className="aspect-square rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                                        {banner?.dataUrl ? (
                                            <img
                                                src={banner.dataUrl}
                                                alt={`${job.companyName} banner`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            disabled={!banner?.dataUrl}
                                            onClick={() => handleDownload(banner)}
                                        >
                                            <Download className="h-4 w-4 mr-1.5" />
                                            Save
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Upload banner and copy CDN link"
                                            disabled={!banner?.dataUrl || uploadingId === id}
                                            onClick={() => handleCdnLink(banner)}
                                        >
                                            {uploadingId === id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Link2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {jobs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-lg font-semibold tracking-tight">
                                Instagram caption
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(instagramCaption, "Caption")}
                            >
                                <Copy className="h-4 w-4 mr-1.5" />
                                Copy
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                readOnly
                                value={instagramCaption}
                                className="min-h-[260px] font-mono text-xs"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-lg font-semibold tracking-tight">
                                WhatsApp message
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setUseWebsiteLink((v) => !v)}
                                >
                                    {useWebsiteLink ? "Site links" : "Apply links"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(whatsappMessage, "Message")}
                                >
                                    <Copy className="h-4 w-4 mr-1.5" />
                                    Copy
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                readOnly
                                value={whatsappMessage}
                                className="min-h-[260px] font-mono text-xs"
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Offscreen render stage. The banners must be laid out at full size
                for html-to-image to measure them, so they are moved out of view
                rather than hidden — display:none would capture as blank. */}
            <div
                ref={stageRef}
                aria-hidden="true"
                style={{
                    position: "fixed",
                    top: 0,
                    left: "-100000px",
                    pointerEvents: "none",
                    opacity: 0,
                }}
            >
                {jobs.map((job) => {
                    const id = jobId(job);
                    return (
                        <CareersAtTechBanner
                            key={id}
                            canvasId={canvasIdFor(id)}
                            jobinfo={adaptJobForCanvas(job) || {}}
                            companyDetails={companyFromJob(job) || {}}
                            ctaDetails={ctaDetails}
                            canvasCss={CANVAS_CSS}
                            instaChannelCTA={ctaId === "4"}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default DailyDigest;
