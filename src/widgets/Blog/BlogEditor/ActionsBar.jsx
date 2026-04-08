import React, { useState, useEffect } from "react";
import { Save, Eye, Send, Clock } from "lucide-react";
import { Button } from "../../../Components/ui/button";

const ActionsBar = ({
    onSaveDraft,
    onPublish,
    onPreview,
    isSaving,
    lastSavedAt,
    status,
    blogId,
}) => {
    const [savedAgo, setSavedAgo] = useState("");

    useEffect(() => {
        if (!lastSavedAt) {
            setSavedAgo("");
            return;
        }
        const update = () => {
            const seconds = Math.floor((Date.now() - lastSavedAt) / 1000);
            if (seconds < 5) setSavedAgo("Saved just now");
            else if (seconds < 60) setSavedAgo(`Saved ${seconds}s ago`);
            else setSavedAgo(`Saved ${Math.floor(seconds / 60)}m ago`);
        };
        update();
        const interval = setInterval(update, 5000);
        return () => clearInterval(interval);
    }, [lastSavedAt]);

    const publishLabel = status === "scheduled" ? "Schedule" : "Publish";
    const publishIcon =
        status === "scheduled" ? (
            <Clock className="h-4 w-4" />
        ) : (
            <Send className="h-4 w-4" />
        );

    return (
        <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
            <div className="flex items-center gap-2">
                {/* Save Draft */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSaveDraft}
                    disabled={isSaving}
                    className="min-h-[44px] gap-2 flex-1 sm:flex-none"
                >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">
                        {isSaving ? "Saving..." : "Save Draft"}
                    </span>
                    <span className="sm:hidden">
                        {isSaving ? "..." : "Draft"}
                    </span>
                </Button>

                {/* Preview */}
                {blogId && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onPreview}
                        className="min-h-[44px] gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Preview</span>
                    </Button>
                )}

                {/* Spacer + Saved indicator */}
                <div className="flex-1 text-right">
                    {savedAgo && (
                        <span className="text-xs text-muted-foreground">
                            {savedAgo}
                        </span>
                    )}
                </div>

                {/* Publish / Schedule */}
                <Button
                    type="button"
                    variant="default"
                    onClick={onPublish}
                    disabled={isSaving}
                    className="min-h-[44px] gap-2"
                >
                    {publishIcon}
                    {publishLabel}
                </Button>
            </div>
        </div>
    );
};

export default ActionsBar;
