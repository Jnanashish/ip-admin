import React, { useRef, useCallback, useState } from "react";
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    Link,
    Image,
    Code,
    Quote,
    Upload,
    ClipboardPaste,
} from "lucide-react";
import { Button } from "../ui/button";
import { uploadBlogImage } from "../../Apis/Blog";
import { cleanSeoContent, wordCount, readingTime } from "../../widgets/Blog/BlogEditor/helpers";

const toolbarActions = [
    { icon: Bold, label: "Bold", before: "**", after: "**", placeholder: "bold text" },
    { icon: Italic, label: "Italic", before: "_", after: "_", placeholder: "italic text" },
    { icon: Heading2, label: "H2", before: "\n## ", after: "\n", placeholder: "Heading" },
    { icon: Heading3, label: "H3", before: "\n### ", after: "\n", placeholder: "Heading" },
    { icon: Link, label: "Link", before: "[", after: "](url)", placeholder: "link text" },
    { icon: Image, label: "Image", before: "![", after: "](url)", placeholder: "alt text" },
    { icon: Code, label: "Code", before: "\n```\n", after: "\n```\n", placeholder: "code" },
    { icon: Quote, label: "Quote", before: "\n> ", after: "\n", placeholder: "quote" },
];

const MarkdownEditor = ({ value, onChange }) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const insertAtCursor = useCallback(
        (before, after, placeholder) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = value || "";
            const selectedText = text.substring(start, end);
            const insertion = selectedText || placeholder;

            const newText =
                text.substring(0, start) +
                before +
                insertion +
                after +
                text.substring(end);

            onChange(newText);

            requestAnimationFrame(() => {
                textarea.focus();
                const cursorPos = start + before.length;
                const selEnd = cursorPos + insertion.length;
                textarea.setSelectionRange(cursorPos, selEnd);
            });
        },
        [value, onChange]
    );

    const handleToolbarClick = useCallback(
        (action) => {
            insertAtCursor(action.before, action.after, action.placeholder);
        },
        [insertAtCursor]
    );

    const handleImageUpload = useCallback(async () => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            try {
                const res = await uploadBlogImage(file);
                if (res?.url) {
                    const textarea = textareaRef.current;
                    const start = textarea?.selectionStart || (value || "").length;
                    const text = value || "";
                    const md = `![${file.name}](${res.url})`;
                    const newText =
                        text.substring(0, start) + md + text.substring(start);
                    onChange(newText);
                }
            } catch {
                // Toast is handled by request helper
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [value, onChange]
    );

    const handlePasteFromSeo = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            const cleaned = cleanSeoContent(text);
            const textarea = textareaRef.current;
            const start = textarea?.selectionStart ?? (value || "").length;
            const end = textarea?.selectionEnd ?? start;
            const current = value || "";
            const newText =
                current.substring(0, start) + cleaned + current.substring(end);
            onChange(newText);
        } catch {
            // Clipboard access denied — user needs to paste manually
        }
    }, [value, onChange]);

    const words = wordCount(value || "");
    const time = readingTime(value || "");

    return (
        <div className="space-y-0 rounded-md border border-border">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5 bg-muted/30">
                {toolbarActions.map((action) => (
                    <Button
                        key={action.label}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToolbarClick(action)}
                        className="h-8 w-8 p-0"
                        aria-label={action.label}
                    >
                        <action.icon className="h-4 w-4" />
                    </Button>
                ))}
                <div className="w-px h-5 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleImageUpload}
                    disabled={isUploading}
                    className="h-8 gap-1 px-2 text-xs"
                >
                    <Upload className="h-3.5 w-3.5" />
                    {isUploading ? "Uploading..." : "Upload"}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteFromSeo}
                    className="h-8 gap-1 px-2 text-xs"
                >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    Paste SEO
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write your blog post in markdown..."
                className="w-full resize-y font-mono text-sm bg-transparent p-3 min-h-[300px] lg:min-h-[500px] outline-none placeholder:text-muted-foreground"
            />

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
                <span>{words} words</span>
                <span>{time}</span>
            </div>
        </div>
    );
};

export default MarkdownEditor;
