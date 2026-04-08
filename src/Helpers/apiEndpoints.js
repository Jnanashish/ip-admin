export const apiEndpoint = {
    // handling image
    getImagecdnUrl: "/jd/getposterlink",

    // job description
    getAllJobDetails: "/jd/get",
    all_job_details: "/jd/get",
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
    get_company_details: "/companydetails/get",
    get_company_logo: "/companydetails/logo",
    update_company_details: "/companydetails/update",
    delete_company_details: "/companydetails/delete",

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
