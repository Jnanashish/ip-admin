import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "Components/ui/button";

import { sendSocialDigest } from "api/v2/socialDigest";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    showWarnToast,
} from "Helpers/toast";

const errorText = (error, fallback) => error?.error || error?.message || fallback;

// One click posts the top `count` best-to-post jobs to the backend's Telegram
// digest channel, with their banners as files, the Instagram caption and the
// WhatsApp message — the same digest the 4 PM run sends, which then skips the
// jobs sent here.
const TelegramDigestButton = ({ count }) => {
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        const res = await sendSocialDigest(count);
        setSending(false);

        if (res.status === 409) {
            showWarnToast("A digest is already being sent");
            return;
        }
        if (res.error) {
            showErrorToast(errorText(res.error, "Failed to send the digest"));
            return;
        }

        const result = res.data?.data;
        if (!result?.sent) {
            showInfoToast(
                `No unsent best-to-post jobs from the last ${result?.lookbackHours || 24} hours`
            );
            return;
        }
        const sent = result.jobs.length;
        showSuccessToast(
            sent < count
                ? `Sent ${sent} job(s) to Telegram — only ${sent} qualified`
                : `Sent ${sent} jobs to Telegram`
        );
        // The digest still went out; the Telegram list flags which jobs lack one.
        if (result.banners?.failed) {
            showWarnToast(
                `${result.banners.failed} banner(s) failed to render — make them with the job's Banner button in the jobs list`
            );
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleSend}
            disabled={sending}
            title="Posts the top unsent best-to-post jobs to the Telegram digest channel now. The 4 PM run skips jobs sent here."
        >
            {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Send className="h-4 w-4 mr-2" />
            )}
            {sending ? "Sending…" : `Send top ${count} to Telegram`}
        </Button>
    );
};

export default TelegramDigestButton;
