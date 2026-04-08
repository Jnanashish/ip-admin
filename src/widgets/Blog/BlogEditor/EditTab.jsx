import React, { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Link as LinkIcon } from "lucide-react";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { Button } from "../../../Components/ui/button";
import CharCounter from "../../../Components/Blog/CharCounter";
import MarkdownEditor from "../../../Components/Blog/MarkdownEditor";
import { slugify } from "./helpers";
import { uploadBlogImage } from "../../../Apis/Blog";

const EditTab = ({ blogData, onChange }) => {
    const fileInputRef = useRef(null);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [coverUrlInput, setCoverUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [imageDimensions, setImageDimensions] = useState(null);

    const handleTitleChange = useCallback(
        (e) => {
            const title = e.target.value;
            onChange({
                title,
                slug: slugify(title),
            });
        },
        [onChange]
    );

    const handleSlugChange = useCallback(
        (e) => {
            onChange({ slug: slugify(e.target.value) });
        },
        [onChange]
    );

    const handleExcerptChange = useCallback(
        (e) => {
            onChange({ excerpt: e.target.value });
        },
        [onChange]
    );

    const handleContentChange = useCallback(
        (content) => {
            onChange({ content });
        },
        [onChange]
    );

    const handleCoverUpload = useCallback(
        async (file) => {
            if (!file) return;
            setIsUploadingCover(true);
            try {
                const res = await uploadBlogImage(file);
                if (res?.url) {
                    onChange({ coverImage: res.url });
                    loadImageDimensions(res.url);
                }
            } finally {
                setIsUploadingCover(false);
            }
        },
        [onChange]
    );

    const handleFileInput = useCallback(
        (e) => {
            handleCoverUpload(e.target.files?.[0]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [handleCoverUpload]
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) {
                handleCoverUpload(file);
            }
        },
        [handleCoverUpload]
    );

    const handleCoverUrl = useCallback(() => {
        if (coverUrlInput.trim()) {
            onChange({ coverImage: coverUrlInput.trim() });
            loadImageDimensions(coverUrlInput.trim());
            setCoverUrlInput("");
            setShowUrlInput(false);
        }
    }, [coverUrlInput, onChange]);

    const loadImageDimensions = (url) => {
        const img = new window.Image();
        img.onload = () => setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => setImageDimensions(null);
        img.src = url;
    };

    const removeCover = useCallback(() => {
        onChange({ coverImage: "" });
        setImageDimensions(null);
    }, [onChange]);

    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Title</Label>
                <Input
                    value={blogData.title}
                    onChange={handleTitleChange}
                    placeholder="Your blog post title"
                    className="text-xl font-semibold min-h-[48px] tracking-tight"
                />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Slug</Label>
                <Input
                    value={blogData.slug}
                    onChange={handleSlugChange}
                    placeholder="your-post-slug"
                    className="font-mono text-sm min-h-[44px]"
                />
                {blogData.slug && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <LinkIcon className="h-3 w-3" />
                        careersat.tech/blog/{blogData.slug}
                    </p>
                )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Excerpt</Label>
                    <CharCounter current={blogData.excerpt.length} max={160} />
                </div>
                <textarea
                    value={blogData.excerpt}
                    onChange={handleExcerptChange}
                    placeholder="Brief summary of the post for previews and SEO..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] resize-y"
                />
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Cover Image</Label>
                {blogData.coverImage ? (
                    <div className="relative rounded-md border border-border overflow-hidden">
                        <img
                            src={blogData.coverImage}
                            alt="Cover preview"
                            className="w-full max-h-[200px] object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={removeCover}
                                className="h-7 w-7 p-0"
                                aria-label="Remove cover"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        {imageDimensions && (
                            <p className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50">
                                {imageDimensions.w} x {imageDimensions.h}px
                            </p>
                        )}
                    </div>
                ) : (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    >
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {isUploadingCover
                                ? "Uploading..."
                                : "Drop image, click to browse, or paste URL"}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-h-[36px]"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUrlInput(!showUrlInput);
                                }}
                            >
                                Paste URL
                            </Button>
                        </div>
                    </div>
                )}
                {showUrlInput && !blogData.coverImage && (
                    <div className="flex gap-2">
                        <Input
                            value={coverUrlInput}
                            onChange={(e) => setCoverUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="min-h-[44px]"
                            onKeyDown={(e) => e.key === "Enter" && handleCoverUrl()}
                        />
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleCoverUrl}
                            className="min-h-[44px]"
                        >
                            Add
                        </Button>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {/* Content (Markdown Editor) */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Content</Label>
                <MarkdownEditor value={blogData.content} onChange={handleContentChange} />
            </div>
        </div>
    );
};

export default EditTab;
