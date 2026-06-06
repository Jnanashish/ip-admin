export const apiEndpoint = {
    // image upload — poster/banner CDN URLs (used by imageHelpers)
    getImagecdnUrl: "/api/jd/getposterlink",

    // analytics
    analyticsSummary: "/api/analytics/summary",
    analyticsJobsOverTime: "/api/analytics/jobs-over-time",
    analyticsClicksOverTime: "/api/analytics/clicks-over-time",
    analyticsTopJobs: "/api/analytics/top-jobs",
    analyticsJobsByCategory: "/api/analytics/jobs-by-category",

    // Blog
    getBlogList: "/api/blogs/get",
    getBlogById: "/api/blogs/get",
    addBlog: "/api/blogs/add",
    updateBlog: "/api/blogs/update",
    deleteBlog: "/api/blogs/delete",
    archiveBlogs: "/api/blogs/archive",
    uploadBlogImage: "/api/blogs/upload-image",
    getBlogCategories: "/api/blogs/categories",
    getBlogTags: "/api/blogs/tags",
};
