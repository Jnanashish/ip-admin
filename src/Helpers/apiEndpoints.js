export const apiEndpoint = {
    // handling image
    getImagecdnUrl: "/jd/getposterlink",

    // job description
    getAllJobDetails: "/jd/get",
    deleteJob: "/jd/delete",
    updateJobDetails: "/jd/update/",
    addJobData: "/jd/add",
    trackApplyClick: "/jd/update/count",

    // analytics
    analyticsSummary: "/analytics/summary",
    analyticsJobsOverTime: "/analytics/jobs-over-time",
    analyticsClicksOverTime: "/analytics/clicks-over-time",
    analyticsTopJobs: "/analytics/top-jobs",
    analyticsJobsByCategory: "/analytics/jobs-by-category",

    // company details
    addCompanyDetails: "/companydetails/add",
    getCompanyDetails: "/companydetails/get",
    updateCompanyDetails: "/companydetails/update",
    deleteCompanyDetails: "/companydetails/delete",

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
