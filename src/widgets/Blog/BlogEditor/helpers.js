export const slugify = (text) => {
    return (text || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

export const wordCount = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
};

export const readingTime = (text) => {
    const words = wordCount(text);
    if (words === 0) return "0 min read";
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
};

export const cleanSeoContent = (text) => {
    if (!text) return "";
    return text
        .replace(/\u201C|\u201D/g, '"')   // smart double quotes
        .replace(/\u2018|\u2019/g, "'")    // smart single quotes
        .replace(/\u2013/g, "-")           // en dash
        .replace(/\u2014/g, "--")          // em dash
        .replace(/\u2026/g, "...")         // ellipsis
        .replace(/\u00A0/g, " ")           // non-breaking space
        .replace(/\r\n/g, "\n")            // normalize line breaks
        .replace(/\r/g, "\n")
        .replace(/\n{3,}/g, "\n\n")        // collapse 3+ newlines
        .replace(/[ \t]+$/gm, "")          // trim trailing whitespace per line
        .trim();
};

export const getInitialBlogData = () => ({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: [],
    author: "",
    status: "draft",
    publishedAt: null,
    scheduledAt: null,
    seo: {
        metaTitle: "",
        metaDescription: "",
        canonicalUrl: "",
        ogImage: "",
        keywords: [],
        noindex: false,
    },
});
