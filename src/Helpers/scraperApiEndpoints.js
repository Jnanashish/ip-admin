export const scraperEndpoints = {
    scrapeRun: "/admin/scrape/run",
    stagingList: "/admin/scrape/staging",
    stagingDetail: (id) => `/admin/scrape/staging/${id}`,
    stagingApprove: (id) => `/admin/scrape/staging/${id}/approve`,
    stagingReject: (id) => `/admin/scrape/staging/${id}/reject`,
    stagingBulkApprove: "/admin/scrape/staging/approve-bulk",
    stagingDelete: (id) => `/admin/scrape/staging/${id}`,
    scrapeLogs: "/admin/scrape/logs",
    scrapeHealth: "/admin/scrape/health",
    testAdapter: (name) => `/admin/scrape/test-adapter/${name}`,
};
