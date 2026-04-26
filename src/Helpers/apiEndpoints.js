export const apiEndpoint = {
    // job description (kept for non-admin readers + Scraper writeback; v2 owns admin writes)
    getAllJobDetails: "/jd/get",
    updateJobDetails: "/jd/update/",
    getImagecdnUrl: "/jd/getposterlink",

    // analytics
    analyticsSummary: "/analytics/summary",
    analyticsJobsOverTime: "/analytics/jobs-over-time",
    analyticsClicksOverTime: "/analytics/clicks-over-time",
    analyticsTopJobs: "/analytics/top-jobs",
    analyticsJobsByCategory: "/analytics/jobs-by-category",

    // company details (read-only — kept for Banners; v2 owns writes)
    getCompanyDetails: "/companydetails/get",

    // Ad manager (banner ads, link ads, image-link ads)
    addAdBanner: "/sda/banner/add",
    getAdBanners: "/sda/banner/get",
    deleteAdBanner: "/sda/banner/delete",
    addAdLink: "/sda/link/add",
    getAdLinks: "/sda/link/get",
    deleteAdLink: "/sda/link/delete",
    addAdLinkImage: "/sda/linkimg/add",
    getAdLinkImages: "/sda/linkimg/get",
    deleteAdLinkImage: "/sda/linkimg/delete",
    updateAdPopupType: "/showadpop/update",

    // Blog
    getBlogList: "/blogs/get",
    getBlogById: "/blogs/get",
    addBlog: "/blogs/add",
    updateBlog: "/blogs/update",
    deleteBlog: "/blogs/delete",
    archiveBlogs: "/blogs/archive",
    uploadBlogImage: "/blogs/upload-image",
    getBlogCategories: "/blogs/categories",
    getBlogTags: "/blogs/tags",
};
