import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownPreview = ({ content }) => {
    if (!content) {
        return (
            <p className="text-sm text-muted-foreground italic">
                Nothing to preview yet. Start writing in the editor.
            </p>
        );
    }

    return (
        <div className="prose-blog">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;
