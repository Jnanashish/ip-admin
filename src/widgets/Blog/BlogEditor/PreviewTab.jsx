import React from "react";
import MarkdownPreview from "../../../Components/Blog/MarkdownPreview";

const PreviewTab = ({ blogData }) => {
    return (
        <div className="space-y-4">
            {blogData.coverImage && (
                <img
                    src={blogData.coverImage}
                    alt={blogData.title || "Cover"}
                    className="w-full max-h-[300px] object-cover rounded-md"
                />
            )}
            {blogData.title && (
                <h1 className="text-2xl font-bold tracking-tight">
                    {blogData.title}
                </h1>
            )}
            {blogData.excerpt && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {blogData.excerpt}
                </p>
            )}
            {(blogData.title || blogData.excerpt) && blogData.content && (
                <hr className="border-border" />
            )}
            <MarkdownPreview content={blogData.content} />
        </div>
    );
};

export default PreviewTab;
