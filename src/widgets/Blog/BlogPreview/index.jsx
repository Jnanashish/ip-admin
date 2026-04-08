import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../Components/ui/button";
import { Badge } from "../../../Components/ui/badge";
import Loader from "../../../Components/Loader";
import MarkdownPreview from "../../../Components/Blog/MarkdownPreview";
import { getBlogById } from "../../../Apis/Blog";
import { showErrorToast } from "../../../Helpers/toast";

const BlogPreviewWidget = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            setIsLoading(true);
            try {
                const data = await getBlogById(id);
                if (data) setBlog(data);
                else showErrorToast("Blog post not found");
            } catch {
                showErrorToast("Failed to load blog post");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (isLoading) return <Loader />;
    if (!blog) {
        return (
            <div className="text-center text-sm text-muted-foreground py-12">
                Blog post not found.
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Nav */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/blogs/${id}/edit`)}
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label="Back to editor"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Preview</span>
            </div>

            {/* Cover */}
            {blog.coverImage && (
                <img
                    src={blog.coverImage}
                    alt={blog.title || "Cover"}
                    className="w-full max-h-[400px] object-cover rounded-lg"
                />
            )}

            {/* Title & Meta */}
            <div className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tight">{blog.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {blog.author && <span>By {blog.author}</span>}
                    {blog.publishedAt && (
                        <>
                            <span>&middot;</span>
                            <span>{formatDate(blog.publishedAt)}</span>
                        </>
                    )}
                    {blog.category && (
                        <>
                            <span>&middot;</span>
                            <Badge variant="outline" className="text-xs">
                                {blog.category}
                            </Badge>
                        </>
                    )}
                </div>
                {blog.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                        {blog.excerpt}
                    </p>
                )}
            </div>

            <hr className="border-border" />

            {/* Content */}
            <MarkdownPreview content={blog.content} />

            {/* Tags */}
            {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
                    {blog.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogPreviewWidget;
