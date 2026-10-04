import React, { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "Components/ui/dialog";

import { previewSocialDigest, sendSocialDigest } from "api/v2/socialDigest";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    showWarnToast,
} from "Helpers/toast";

const errorText = (error, fallback) => error?.error || error?.message || fallback;

// Sends the backend's Telegram digest on demand — the same jobs and messages
// the 4 PM run would post. Opening the dialog fetches a dry-run preview, so the
// admin sees exactly which jobs go out before confirming.
const TelegramDigestButton = () => {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [sending, setSending] = useState(false);

    // Reopening the dialog while an older preview is still in flight must not
    // let the stale response overwrite the fresh one.
    const previewRequest = useRef(0);

    const openDialog = async () => {
        const requestId = ++previewRequest.current;
        setOpen(true);
        setPreview(null);
        setLoadingPreview(true);

        const res = await previewSocialDigest();
        if (requestId !== previewRequest.current) return;
        setLoadingPreview(false);

        if (res.error) {
            setOpen(false);
            showErrorToast(errorText(res.error, "Failed to load the digest preview"));
            return;
        }
        setPreview(res.data?.data || { jobs: [] });
    };

    const handleSend = async () => {
        setSending(true);
        const res = await sendSocialDigest();
        setSending(false);

        if (res.status === 409) {
            showWarnToast("A digest is already being sent");
            return;
        }
        if (res.error) {
            showErrorToast(errorText(res.error, "Failed to send the digest"));
            return;
        }

        setOpen(false);
        const result = res.data?.data;
        if (!result?.sent) {
            showInfoToast("No best-to-post jobs left to send");
            return;
        }
        showSuccessToast(`Sent ${result.jobs.length} job(s) to Telegram`);
    };

    const jobs = preview?.jobs || [];

    return (
        <>
            <Button variant="outline" onClick={openDialog}>
                <Send className="h-4 w-4 mr-2" />
                Send to Telegram
            </Button>

            <Dialog open={open} onOpenChange={(next) => !sending && setOpen(next)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send to Telegram</DialogTitle>
                        <DialogDescription>
                            Posts these best-to-post jobs to the social digest channel now,
                            with the Instagram caption and WhatsApp message. The daily 4 PM
                            run skips jobs sent here.
                        </DialogDescription>
                    </DialogHeader>

                    {loadingPreview ? (
                        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading preview…
                        </div>
                    ) : jobs.length ? (
                        <ol className="rounded-md border border-border divide-y divide-border">
                            {jobs.map((job, i) => (
                                <li key={job._id} className="px-3 py-2 text-sm">
                                    <span className="text-muted-foreground">{i + 1}.</span>{" "}
                                    <span className="font-medium">{job.companyName}</span> — {job.title}
                                    {job.companyType && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {job.companyType}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="py-6 text-sm text-muted-foreground">
                            No unsent best-to-post jobs from the last{" "}
                            {preview?.lookbackHours || 24} hours.
                        </p>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={sending || loadingPreview || !jobs.length}
                        >
                            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {jobs.length ? `Send ${jobs.length} now` : "Send now"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TelegramDigestButton;
