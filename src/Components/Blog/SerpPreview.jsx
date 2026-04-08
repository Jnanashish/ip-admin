import React from "react";

const SerpPreview = ({ title, url, description }) => {
    const displayTitle = (title || "").slice(0, 60) || "Page Title";
    const displayUrl = url || "careersat.tech/blog/your-post-slug";
    const displayDesc =
        (description || "").slice(0, 160) || "Your meta description will appear here...";

    return (
        <div className="rounded-lg border border-border bg-card p-4 space-y-1 font-sans">
            <p className="text-xs text-muted-foreground">Search preview</p>
            <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] truncate leading-snug">
                {displayTitle}
            </p>
            <p className="text-xs text-[#006621] dark:text-[#bdc1c6] truncate">
                {displayUrl}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {displayDesc}
            </p>
        </div>
    );
};

export default SerpPreview;
