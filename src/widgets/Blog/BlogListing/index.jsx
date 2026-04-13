import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    PlusCircle,
    Search,
    Pencil,
    Trash2,
    Archive,
    Eye,
} from "lucide-react";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { Badge } from "../../../Components/ui/badge";
import { Card, CardContent } from "../../../Components/ui/card";
import { Checkbox } from "../../../Components/ui/checkbox";
import Loader from "../../../Components/Loader";
import { getBlogList, deleteBlog, archiveBlogs } from "../../../Apis/Blog";
import { showSuccessToast, showErrorToast } from "../../../Helpers/toast";

const STATUS_COLORS = {
    draft: "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400",
    published: "border-green-300 text-green-600 dark:border-green-600 dark:text-green-400",
    scheduled: "border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400",
    archived: "border-red-300 text-red-600 dark:border-red-600 dark:text-red-400",
};

const STATUS_OPTIONS = ["all", "draft", "published", "scheduled", "archived"];

const BlogListingWidget = () => {
    const navigate = useNavigate();
    const [blogList, setBlogList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBlogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getBlogList();
            if (!data) {
                setError("Failed to load blog posts.");
                return;
            }
            setBlogList(Array.isArray(data) ? data : []);
        } catch {
            setError("Failed to load blog posts.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const filteredBlogs = useMemo(() => {
        return blogList.filter((blog) => {
            const matchesSearch =
                !searchTerm.trim() ||
                blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "all" || blog.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [blogList, searchTerm, statusFilter]);

    const handleDelete = useCallback(
        async (blogId) => {
            const res = await deleteBlog(blogId);
            if (res) {
                setBlogList((prev) => prev.filter((b) => b._id !== blogId));
                setSelectedBlogs((prev) => prev.filter((id) => id !== blogId));
            }
        },
        []
    );

    const handleBulkArchive = useCallback(async () => {
        if (selectedBlogs.length === 0) return;
        const res = await archiveBlogs(selectedBlogs);
        if (res) {
            showSuccessToast(`${selectedBlogs.length} posts archived`);
            setBlogList((prev) =>
                prev.map((b) =>
                    selectedBlogs.includes(b._id)
                        ? { ...b, status: "archived" }
                        : b
                )
            );
            setSelectedBlogs([]);
        }
    }, [selectedBlogs]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedBlogs.length === 0) return;
        let success = 0;
        for (const blogId of selectedBlogs) {
            const res = await deleteBlog(blogId);
            if (res) success++;
        }
        if (success > 0) {
            showSuccessToast(`${success} posts deleted`);
            setBlogList((prev) =>
                prev.filter((b) => !selectedBlogs.includes(b._id))
            );
            setSelectedBlogs([]);
        }
    }, [selectedBlogs]);

    const toggleSelect = useCallback((blogId) => {
        setSelectedBlogs((prev) =>
            prev.includes(blogId)
                ? prev.filter((id) => id !== blogId)
                : [...prev, blogId]
        );
    }, []);

    const filteredIds = useMemo(() => filteredBlogs.map((b) => b._id), [filteredBlogs]);
    const allFilteredSelected =
        filteredIds.length > 0 && filteredIds.every((id) => selectedBlogs.includes(id));

    const toggleSelectAll = useCallback(() => {
        if (allFilteredSelected) {
            setSelectedBlogs((prev) => prev.filter((id) => !filteredIds.includes(id)));
        } else {
            setSelectedBlogs((prev) => Array.from(new Set([...prev, ...filteredIds])));
        }
    }, [allFilteredSelected, filteredIds]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Blog Posts</h1>
                <Button
                    onClick={() => navigate("/blogs/new")}
                    className="min-h-[44px] gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    New Post
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search posts..."
                        className="pl-9 min-h-[44px]"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-[44px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-[160px]"
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Bulk Actions */}
            {selectedBlogs.length > 0 && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
                    <Badge variant="secondary">{selectedBlogs.length} selected</Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkArchive}
                        className="min-h-[36px] gap-1"
                    >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="min-h-[36px] gap-1"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </Button>
                </div>
            )}

            {/* Error State */}
            {error && (
                <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                        {error}
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!error && filteredBlogs.length === 0 && (
                <Card>
                    <CardContent className="p-6 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {blogList.length === 0
                                ? "No blog posts yet. Create your first post!"
                                : "No posts match your filters."}
                        </p>
                        {blogList.length === 0 && (
                            <Button
                                variant="outline"
                                onClick={() => navigate("/blogs/new")}
                                className="min-h-[44px]"
                            >
                                Create First Post
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Desktop Table */}
            {filteredBlogs.length > 0 && (
                <div className="hidden sm:block rounded-md border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="p-3 text-left w-10">
                                    <Checkbox
                                        checked={allFilteredSelected}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-3 text-left font-medium">Title</th>
                                <th className="p-3 text-left font-medium">Status</th>
                                <th className="p-3 text-left font-medium">Category</th>
                                <th className="p-3 text-left font-medium">Published</th>
                                <th className="p-3 text-right font-medium">Views</th>
                                <th className="p-3 text-right font-medium w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBlogs.map((blog) => (
                                <tr
                                    key={blog._id}
                                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                                    onClick={() =>
                                        navigate(`/blogs/${blog._id}/edit`)
                                    }
                                >
                                    <td
                                        className="p-3"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={selectedBlogs.includes(blog._id)}
                                            onCheckedChange={() =>
                                                toggleSelect(blog._id)
                                            }
                                        />
                                    </td>
                                    <td className="p-3 font-medium truncate max-w-[300px]">
                                        {blog.title || "Untitled"}
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            variant="outline"
                                            className={STATUS_COLORS[blog.status] || ""}
                                        >
                                            {blog.status}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {blog.category || "—"}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {formatDate(blog.publishedAt)}
                                    </td>
                                    <td className="p-3 text-right tabular-nums">
                                        {blog.views ?? 0}
                                    </td>
                                    <td
                                        className="p-3 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(`/blogs/${blog._id}/edit`)
                                                }
                                                className="h-8 w-8 p-0"
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(blog._id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile Cards */}
            {filteredBlogs.length > 0 && (
                <div className="sm:hidden space-y-2">
                    {filteredBlogs.map((blog) => (
                        <Card
                            key={blog._id}
                            className="cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() => navigate(`/blogs/${blog._id}/edit`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="pt-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={selectedBlogs.includes(blog._id)}
                                            onCheckedChange={() =>
                                                toggleSelect(blog._id)
                                            }
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <p className="font-medium text-sm truncate">
                                            {blog.title || "Untitled"}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    STATUS_COLORS[blog.status] || ""
                                                }
                                            >
                                                {blog.status}
                                            </Badge>
                                            {blog.category && (
                                                <span className="text-xs text-muted-foreground">
                                                    {blog.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{formatDate(blog.publishedAt)}</span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {blog.views ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="flex gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/blogs/${blog._id}/edit`)
                                            }
                                            className="h-9 w-9 p-0"
                                            aria-label="Edit"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(blog._id)}
                                            className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogListingWidget;
