import React, { useEffect, useMemo, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "Components/ui/sheet";
import { Button } from "Components/ui/button";
import { Label } from "Components/ui/label";
import { Textarea } from "Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "Components/ui/select";

import { copyToClipBoard } from "Helpers/utility";
import { showSuccessToast } from "Helpers/toast";
import { buildCaption } from "Helpers/JobListHelper/captionBuilder";
import {
    deriveInsights,
    pickTemplate,
} from "Helpers/JobListHelper/jobInsights";
import { TEMPLATE_OPTIONS } from "Helpers/JobListHelper/captionTemplates";

const AUTO = "auto";

const CaptionGeneratorSheet = ({ open, onOpenChange, jobs = [] }) => {
    const insights = useMemo(() => deriveInsights(jobs), [jobs]);
    const autoTemplate = useMemo(() => pickTemplate(insights), [insights]);

    const [templateKey, setTemplateKey] = useState(AUTO);
    const [hashtagMode, setHashtagMode] = useState(AUTO);
    const [customHashtags, setCustomHashtags] = useState("");
    const [preview, setPreview] = useState("");
    const [dirty, setDirty] = useState(false);

    const resolvedTemplateKey =
        templateKey === AUTO ? autoTemplate : templateKey;

    useEffect(() => {
        if (!open) return;
        setTemplateKey(AUTO);
        setHashtagMode(AUTO);
        setCustomHashtags("");
        setDirty(false);
    }, [open]);

    useEffect(() => {
        if (!open || dirty) return;
        const text = buildCaption({
            jobs,
            templateKey: resolvedTemplateKey,
            customHashtags:
                hashtagMode === "custom" ? customHashtags : undefined,
        });
        setPreview(text);
    }, [open, dirty, jobs, resolvedTemplateKey, hashtagMode, customHashtags]);

    const handleCopy = () => {
        if (!preview) return;
        copyToClipBoard(preview);
        showSuccessToast("Copied");
    };

    const handleReset = () => {
        setTemplateKey(AUTO);
        setHashtagMode(AUTO);
        setCustomHashtags("");
        setDirty(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-xl w-full flex flex-col gap-0 p-0"
            >
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                    <SheetTitle className="text-lg font-semibold tracking-tight">
                        Instagram caption
                    </SheetTitle>
                    <SheetDescription>
                        {jobs.length} job{jobs.length === 1 ? "" : "s"} selected
                        {" · "}
                        Auto template:{" "}
                        <span className="font-medium text-foreground">
                            {autoTemplate}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Template
                        </Label>
                        <Select
                            value={templateKey}
                            onValueChange={(v) => {
                                setTemplateKey(v);
                                setDirty(false);
                            }}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AUTO}>
                                    Auto pick ({autoTemplate})
                                </SelectItem>
                                {TEMPLATE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.key} value={opt.key}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Hashtags
                        </Label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={
                                    hashtagMode === AUTO ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => {
                                    setHashtagMode(AUTO);
                                    setDirty(false);
                                }}
                            >
                                Auto
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    hashtagMode === "custom"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => {
                                    setHashtagMode("custom");
                                    setDirty(false);
                                }}
                            >
                                Custom
                            </Button>
                        </div>
                        {hashtagMode === "custom" && (
                            <Textarea
                                rows={3}
                                value={customHashtags}
                                onChange={(e) => {
                                    setCustomHashtags(e.target.value);
                                    setDirty(false);
                                }}
                                placeholder="#offcampusdrive #placementdrive ..."
                                className="font-sans"
                            />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                                Preview {dirty && "(edited)"}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                {preview.length} chars
                            </span>
                        </div>
                        <Textarea
                            rows={18}
                            value={preview}
                            onChange={(e) => {
                                setPreview(e.target.value);
                                setDirty(true);
                            }}
                            className="font-sans text-sm leading-relaxed"
                        />
                    </div>
                </div>

                <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Reset
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!preview}
                    >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy caption
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CaptionGeneratorSheet;
