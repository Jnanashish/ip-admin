import React, { useCallback } from "react";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { Switch } from "../../../Components/ui/switch";
import CharCounter from "../../../Components/Blog/CharCounter";
import TagInput from "../../../Components/Blog/TagInput";
import SerpPreview from "../../../Components/Blog/SerpPreview";
import { uploadBlogImage } from "../../../Apis/Blog";
import { useRef, useState } from "react";
import { Button } from "../../../Components/ui/button";
import { ImagePlus, X } from "lucide-react";

const SeoTab = ({ blogData, onChange }) => {
    const seo = blogData.seo || {};
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSeoChange = useCallback(
        (field, value) => {
            onChange({
                seo: { ...seo, [field]: value },
            });
        },
        [seo, onChange]
    );

    const handleOgImageUpload = useCallback(
        async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsUploading(true);
            try {
                const res = await uploadBlogImage(file);
                if (res?.url) handleSeoChange("ogImage", res.url);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [handleSeoChange]
    );

    return (
        <div className="space-y-4">
            {/* SERP Preview */}
            <SerpPreview
                title={seo.metaTitle || blogData.title}
                url={
                    seo.canonicalUrl ||
                    (blogData.slug
                        ? `careersat.tech/blog/${blogData.slug}`
                        : undefined)
                }
                description={seo.metaDescription || blogData.excerpt}
            />

            {/* Meta Title */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Meta Title</Label>
                    <CharCounter current={(seo.metaTitle || "").length} max={60} />
                </div>
                <Input
                    value={seo.metaTitle || ""}
                    onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
                    placeholder={blogData.title || "SEO title (defaults to post title)"}
                    className="min-h-[44px]"
                />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Meta Description</Label>
                    <CharCounter current={(seo.metaDescription || "").length} max={160} />
                </div>
                <textarea
                    value={seo.metaDescription || ""}
                    onChange={(e) =>
                        handleSeoChange("metaDescription", e.target.value)
                    }
                    placeholder={blogData.excerpt || "SEO description (defaults to excerpt)"}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] resize-y"
                />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Canonical URL</Label>
                <Input
                    value={seo.canonicalUrl || ""}
                    onChange={(e) => handleSeoChange("canonicalUrl", e.target.value)}
                    placeholder="https://careersat.tech/blog/your-slug"
                    className="font-mono text-sm min-h-[44px]"
                />
            </div>

            {/* OG Image */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">OG Image</Label>
                {seo.ogImage ? (
                    <div className="relative rounded-md border border-border overflow-hidden">
                        <img
                            src={seo.ogImage}
                            alt="OG preview"
                            className="w-full max-h-[120px] object-cover"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSeoChange("ogImage", "")}
                            className="absolute top-2 right-2 h-7 w-7 p-0"
                            aria-label="Remove OG image"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="min-h-[44px] gap-2"
                    >
                        <ImagePlus className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload OG Image"}
                    </Button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOgImageUpload}
                    className="hidden"
                />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Keywords</Label>
                <TagInput
                    tags={seo.keywords || []}
                    onChange={(keywords) => handleSeoChange("keywords", keywords)}
                    placeholder="Add keyword..."
                />
            </div>

            {/* Noindex Toggle */}
            <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                    <Label className="text-sm font-medium">Noindex</Label>
                    <p className="text-xs text-muted-foreground">
                        Hide this post from search engines
                    </p>
                </div>
                <Switch
                    checked={seo.noindex || false}
                    onCheckedChange={(checked) => handleSeoChange("noindex", checked)}
                />
            </div>
        </div>
    );
};

export default SeoTab;
