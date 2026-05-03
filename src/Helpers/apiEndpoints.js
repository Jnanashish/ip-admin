export const apiEndpoint = {
    // job description (kept for non-admin readers + Scraper writeback; v2 owns admin writes)
    getAllJobDetails: "/api/jd/get",
    updateJobDetails: "/api/jd/update/",
    getImagecdnUrl: "/api/jd/getposterlink",

    // analytics
    analyticsSummary: "/api/analytics/summary",
    analyticsJobsOverTime: "/api/analytics/jobs-over-time",
    analyticsClicksOverTime: "/api/analytics/clicks-over-time",
    analyticsTopJobs: "/api/analytics/top-jobs",
    analyticsJobsByCategory: "/api/analytics/jobs-by-category",

    // company details (read-only — kept for Banners; v2 owns writes)
    getCompanyDetails: "/api/companydetails/get",

    // Ad manager (banner ads, link ads, image-link ads)
    addAdBanner: "/api/sda/banner/add",
    getAdBanners: "/api/sda/banner/get",
    deleteAdBanner: "/api/sda/banner/delete",
    addAdLink: "/api/sda/link/add",
    getAdLinks: "/api/sda/link/get",
    deleteAdLink: "/api/sda/link/delete",
    addAdLinkImage: "/api/sda/linkimg/add",
    getAdLinkImages: "/api/sda/linkimg/get",
    deleteAdLinkImage: "/api/sda/linkimg/delete",
    updateAdPopupType: "/api/showadpop/update",

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
