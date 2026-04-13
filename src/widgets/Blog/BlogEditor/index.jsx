import React, { useState, useCallback, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../Components/ui/button";
import Loader from "../../../Components/Loader";
import EditTab from "./EditTab";
import PreviewTab from "./PreviewTab";
import SeoTab from "./SeoTab";
import SettingsTab from "./SettingsTab";
import ActionsBar from "./ActionsBar";
import { getInitialBlogData } from "./helpers";
import {
    getBlogById,
    createBlog,
    updateBlog,
    getBlogCategories,
    getBlogTags,
} from "../../../Apis/Blog";
import { showSuccessToast, showErrorToast } from "../../../Helpers/toast";
import { UserContext } from "../../../Context/userContext";
import { cn } from "../../../lib/utils";

const TABS = [
    { key: "edit", label: "Edit" },
    { key: "preview", label: "Preview" },
    { key: "seo", label: "SEO" },
    { key: "settings", label: "Settings" },
];

const AUTO_SAVE_INTERVAL = 30000;

const BlogEditorWidget = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [blogData, setBlogData] = useState(getInitialBlogData);
    const [activeTab, setActiveTab] = useState("edit");
    const [isLoading, setIsLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [blogId, setBlogId] = useState(id || null);
    const [categories, setCategories] = useState([]);
    const [existingTags, setExistingTags] = useState([]);
    const [loadError, setLoadError] = useState(false);

    const autoSaveRef = useRef(null);
    const isDirtyRef = useRef(false);
    const blogDataRef = useRef(blogData);
    const blogIdRef = useRef(blogId);
    const saveInFlightRef = useRef(false);

    // Keep refs in sync
    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty]);
    useEffect(() => {
        blogDataRef.current = blogData;
    }, [blogData]);
    useEffect(() => {
        blogIdRef.current = blogId;
    }, [blogId]);

    // Fetch existing blog for edit mode
    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            setIsLoading(true);
            try {
                const data = await getBlogById(id);
                if (data) {
                    setBlogData({
                        ...getInitialBlogData(),
                        ...data,
                        seo: { ...getInitialBlogData().seo, ...(data.seo || {}) },
                    });
                } else {
                    showErrorToast("Failed to load blog post");
                    setLoadError(true);
                }
            } catch {
                showErrorToast("Failed to load blog post");
                setLoadError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    // Fetch categories and tags
    useEffect(() => {
        const fetchMeta = async () => {
            const [cats, tags] = await Promise.all([
                getBlogCategories().catch(() => []),
                getBlogTags().catch(() => []),
            ]);
            if (Array.isArray(cats)) setCategories(cats);
            if (Array.isArray(tags)) setExistingTags(tags);
        };
        fetchMeta();
    }, []);

    // Set default author
    useEffect(() => {
        if (!blogData.author && user?.email) {
            setBlogData((prev) => ({ ...prev, author: user.email }));
        }
    }, [user?.email, blogData.author]);

    // Unified field updater
    const handleChange = useCallback((updates) => {
        setBlogData((prev) => ({ ...prev, ...updates }));
        setIsDirty(true);
    }, []);

    // Save logic
    const saveBlog = useCallback(
        async (publishAction = false) => {
            if (saveInFlightRef.current) return;
            saveInFlightRef.current = true;
            setIsSaving(true);
            try {
                const payload = { ...blogDataRef.current };

                if (publishAction && payload.status === "draft") {
                    payload.status = "published";
                    payload.publishedAt = new Date().toISOString();
                }

                let res;
                if (blogIdRef.current) {
                    res = await updateBlog(blogIdRef.current, payload);
                } else {
                    res = await createBlog(payload);
                    if (res?._id || res?.id) {
                        const newId = res._id || res.id;
                        setBlogId(newId);
                        // Update URL without full re-render
                        window.history.replaceState(null, "", `/blogs/${newId}/edit`);
                    }
                }

                if (res) {
                    setIsDirty(false);
                    setLastSavedAt(Date.now());
                    if (publishAction) {
                        showSuccessToast(
                            payload.status === "scheduled"
                                ? "Blog post scheduled"
                                : "Blog post published"
                        );
                        navigate("/blogs");
                    }
                }
            } catch {
                showErrorToast("Failed to save blog post");
            } finally {
                saveInFlightRef.current = false;
                setIsSaving(false);
            }
        },
        [navigate]
    );

    const handleSaveDraft = useCallback(() => saveBlog(false), [saveBlog]);
    const handlePublish = useCallback(() => saveBlog(true), [saveBlog]);
    const handlePreview = useCallback(() => {
        if (blogId) navigate(`/blogs/${blogId}/preview`);
    }, [blogId, navigate]);

    // Auto-save
    useEffect(() => {
        autoSaveRef.current = setInterval(() => {
            if (isDirtyRef.current && !saveInFlightRef.current) {
                saveBlog(false);
            }
        }, AUTO_SAVE_INTERVAL);
        return () => clearInterval(autoSaveRef.current);
    }, [saveBlog]);

    if (isLoading) return <Loader />;
    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-sm text-muted-foreground">Failed to load blog post.</p>
                <Button variant="outline" onClick={() => navigate("/blogs")} className="min-h-[44px]">
                    Back to Blog List
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/blogs")}
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label="Back to blog list"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {id ? "Edit Post" : "New Post"}
                </h1>
            </div>

            {/* Mobile Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 lg:hidden">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[40px]",
                            activeTab === tab.key
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Desktop: Two-pane layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 flex-1 min-h-0">
                {/* Left pane: Edit */}
                <div className="overflow-auto space-y-6">
                    <EditTab blogData={blogData} onChange={handleChange} />
                </div>
                {/* Right pane: Preview + SEO + Settings as sections */}
                <div className="overflow-auto space-y-6">
                    <div className="rounded-lg border border-border p-4">
                        <h2 className="text-lg font-semibold tracking-tight mb-4">Preview</h2>
                        <PreviewTab blogData={blogData} />
                    </div>
                    <div className="rounded-lg border border-border p-4">
                        <h2 className="text-lg font-semibold tracking-tight mb-4">SEO</h2>
                        <SeoTab blogData={blogData} onChange={handleChange} />
                    </div>
                    <div className="rounded-lg border border-border p-4">
                        <h2 className="text-lg font-semibold tracking-tight mb-4">Settings</h2>
                        <SettingsTab
                            blogData={blogData}
                            onChange={handleChange}
                            categories={categories}
                            existingTags={existingTags}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile: Single pane content */}
            <div className="lg:hidden flex-1 min-h-0">
                {activeTab === "edit" && (
                    <EditTab blogData={blogData} onChange={handleChange} />
                )}
                {activeTab === "preview" && <PreviewTab blogData={blogData} />}
                {activeTab === "seo" && (
                    <SeoTab blogData={blogData} onChange={handleChange} />
                )}
                {activeTab === "settings" && (
                    <SettingsTab
                        blogData={blogData}
                        onChange={handleChange}
                        categories={categories}
                        existingTags={existingTags}
                    />
                )}
            </div>

            {/* Actions Bar */}
            <ActionsBar
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                onPreview={handlePreview}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
                status={blogData.status}
                blogId={blogId}
            />
        </div>
    );
};

export default BlogEditorWidget;
