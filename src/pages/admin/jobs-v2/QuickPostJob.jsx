import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ExternalLink, Pencil, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
import { Badge } from "Components/ui/badge";

import { scrapeAndPostJob } from "api/v2/jobs";
import { showSuccessToast, showErrorToast } from "Helpers/toast";

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "https://careersat.tech";

const isValidUrl = (value) => {
    if (!value) return false;
    try {
        const u = new URL(value.trim());
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
};

const confidenceVariant = (c) => {
    if (c === "high") return { label: "High confidence", className: "border-emerald-300 text-emerald-700 dark:text-emerald-400" };
    if (c === "medium") return { label: "Medium confidence", className: "border-amber-300 text-amber-700 dark:text-amber-400" };
    return { label: "Low confidence", className: "border-rose-300 text-rose-700 dark:text-rose-400" };
};

const QuickPostJob = () => {
    const navigate = useNavigate();
    const [applyLink, setApplyLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const trimmed = applyLink.trim();
    const canSubmit = !submitting && isValidUrl(trimmed);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setResult(null);
        const { status, data, error } = await scrapeAndPostJob(trimmed);

        if (status === 201 && data?.data?._id) {
            showSuccessToast("Job posted successfully");
            setResult({ kind: "success", status, body: data });
        } else if (status === 0) {
            showErrorToast(error?.message || "Network error");
            setResult({ kind: "network", status, body: error });
        } else {
            const code = error?.errorCode || null;
            showErrorToast(error?.error || error?.message || `Request failed (${status})`);
            setResult({ kind: "error", status, code, body: error });
        }
        setSubmitting(false);
    };

    const handleEnterKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    };

    const reset = () => {
        setResult(null);
        setApplyLink("");
    };

    return (
        <div className="mx-auto w-full max-w-[720px] space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Quick Post</h1>
                <p className="text-sm text-muted-foreground">
                    Paste a job apply link. We'll scrape it, check it, and post it.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">Apply link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Label htmlFor="applyLink" className="sr-only">
                        Apply link
                    </Label>
                    <Input
                        id="applyLink"
                        type="url"
                        inputMode="url"
                        autoFocus
                        autoComplete="off"
                        placeholder="https://jobs.greenhouse.io/..."
                        className="h-12 text-base"
                        value={applyLink}
                        onChange={(e) => setApplyLink(e.target.value)}
                        onKeyDown={handleEnterKey}
                        disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground">
                        Best with Greenhouse, Lever, Ashby, Workday and most company career pages.
                        LinkedIn and Indeed often fail due to bot protection — use manual entry for those.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="w-full sm:w-auto"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scraping…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Scrape & Post
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result?.kind === "success" && (
                <SuccessResult result={result} navigate={navigate} onReset={reset} />
            )}

            {result?.kind === "error" && (
                <ErrorResult result={result} applyLink={trimmed} navigate={navigate} onReset={reset} />
            )}

            {result?.kind === "network" && (
                <Card className="border-destructive">
                    <CardContent className="pt-6 text-sm">
                        Network error. Check your connection and retry.
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const SuccessResult = ({ result, navigate, onReset }) => {
    const body = result.body || {};
    const job = body.data || {};
    const confidence = body.confidence || "low";
    const warnings = Array.isArray(body.warnings) ? body.warnings : [];
    const companyWasCreated = !!body.companyWasCreated;
    const variant = confidenceVariant(confidence);

    return (
        <Card className="border-emerald-300/60">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        Job posted
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{job.title}{job.companyName ? ` — ${job.companyName}` : ""}</p>
                </div>
                <Badge variant="outline" className={variant.className}>
                    {variant.label}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
                    <div>slug: {job.slug || "—"}</div>
                    <div>status: {job.status || "—"}</div>
                    <div>requestId: {body.requestId || "—"}</div>
                </div>

                {warnings.length > 0 && (
                    <div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
                        <div className="mb-1 flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            Warnings
                        </div>
                        <ul className="ml-5 list-disc space-y-0.5 text-amber-700 dark:text-amber-400">
                            {warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {companyWasCreated && (
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                        Company stub was created. Consider enriching it with logo, description and details.
                        {typeof job.company === "string" && (
                            <div className="mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/companies/${job.company}/edit`)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Enrich company
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={() => navigate(`/admin/jobs/${job._id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit job
                    </Button>
                    {job.slug && (
                        <Button asChild variant="outline">
                            <a
                                href={`${FRONTEND_URL}/job/${job.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View on site
                            </a>
                        </Button>
                    )}
                    <Button variant="ghost" onClick={onReset}>
                        Post another
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ErrorResult = ({ result, applyLink, navigate, onReset }) => {
    const body = result.body || {};
    const code = result.code;
    const status = result.status;
    const message = body.error || body.message || `Request failed (${status})`;
    const requestId = body.requestId;

    if (code === "DUPLICATE" && body.existingJob?._id) {
        const j = body.existingJob;
        return (
            <Card className="border-amber-300/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Duplicate
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p>A job with this apply link already exists.</p>
                    <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
                        <div>title: {j.title}</div>
                        <div>slug: {j.slug}</div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button onClick={() => navigate(`/admin/jobs/${j._id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Open existing
                        </Button>
                        <Button variant="ghost" onClick={onReset}>
                            Try another link
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (code === "VALIDATION_FAILED") {
        const partial = body.partialExtraction || null;
        const validationErrors = Array.isArray(body.validationErrors) ? body.validationErrors : [];
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Extracted job needs manual edits
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p>{message}</p>
                    {validationErrors.length > 0 && (
                        <ul className="ml-5 list-disc space-y-0.5 text-muted-foreground">
                            {validationErrors.map((e, i) => (
                                <li key={i}>
                                    <span className="font-mono">{e.path}</span>: {e.message}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            onClick={() =>
                                navigate("/admin/jobs/new", {
                                    state: { prefill: { ...(partial || {}), applyLink } },
                                })
                            }
                            disabled={!partial}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit manually
                        </Button>
                        <Button variant="ghost" onClick={onReset}>
                            Try another link
                        </Button>
                    </div>
                    {requestId && (
                        <p className="font-mono text-xs text-muted-foreground">requestId: {requestId}</p>
                    )}
                </CardContent>
            </Card>
        );
    }

    if (code === "FETCH_BLOCKED") {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Site blocked the scraper
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p>{message}</p>
                    <p className="text-muted-foreground">
                        This source uses anti-bot protection. Use manual entry instead.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            onClick={() =>
                                navigate("/admin/jobs/new", {
                                    state: { prefill: { applyLink } },
                                })
                            }
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Post manually
                        </Button>
                        <Button variant="ghost" onClick={onReset}>
                            Try another link
                        </Button>
                    </div>
                    {requestId && (
                        <p className="font-mono text-xs text-muted-foreground">requestId: {requestId}</p>
                    )}
                </CardContent>
            </Card>
        );
    }

    const retryable =
        code === "EXTRACTION_FAILED" ||
        code === "FETCH_TIMEOUT" ||
        code === "FETCH_FAILED" ||
        status === 429;

    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {code || `Error ${status}`}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <p>{message}</p>
                {Array.isArray(body.details) && body.details.length > 0 && (
                    <ul className="ml-5 list-disc space-y-0.5 text-muted-foreground">
                        {body.details.map((d, i) => (
                            <li key={i}>
                                <span className="font-mono">{d.path}</span>: {d.message}
                            </li>
                        ))}
                    </ul>
                )}
                {body.rawResponseSnippet && (
                    <pre className="overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
                        {body.rawResponseSnippet}
                    </pre>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                    {retryable && (
                        <Button variant="outline" onClick={onReset}>
                            Retry
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() =>
                            navigate("/admin/jobs/new", {
                                state: { prefill: { applyLink } },
                            })
                        }
                    >
                        Post manually
                    </Button>
                </div>
                {requestId && (
                    <p className="font-mono text-xs text-muted-foreground">requestId: {requestId}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default QuickPostJob;
