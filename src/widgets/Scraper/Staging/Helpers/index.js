import { scraperGet, scraperPost, scraperDelete } from "Helpers/scraperRequest";
import { scraperEndpoints } from "Helpers/scraperApiEndpoints";

export const fetchStagingJobs = async ({ status, source, page = 1, size = 20 }) => {
    const params = new URLSearchParams({ page, size });
    if (status && status !== "all") params.append("status", status);
    if (source) params.append("source", source);
    return scraperGet(`${scraperEndpoints.stagingList}?${params.toString()}`);
};

export const fetchStagingJob = async (id) => {
    return scraperGet(scraperEndpoints.stagingDetail(id));
};

export const approveJob = async (id, overrides = {}) => {
    const payload = { overrides: { ...overrides, status: "published" } };
    return scraperPost(scraperEndpoints.stagingApprove(id), payload, "Approve");
};

export const rejectJob = async (id, reason = "") => {
    return scraperPost(scraperEndpoints.stagingReject(id), { reason }, "Reject");
};

export const bulkApproveJobs = async (ids, perJobOverrides = {}) => {
    const merged = (ids || []).reduce((acc, jobId) => {
        acc[jobId] = { ...(perJobOverrides[jobId] || {}), status: "published" };
        return acc;
    }, {});
    return scraperPost(
        scraperEndpoints.stagingBulkApprove,
        { ids, perJobOverrides: merged },
        "Bulk Approve"
    );
};

export const deleteStagingJob = async (id) => {
    return scraperDelete(scraperEndpoints.stagingDelete(id), "Delete");
};

export const fetchAllPendingJobs = async () => {
    const allJobs = [];
    let page = 1;
    const size = 100;
    while (true) {
        const res = await fetchStagingJobs({ status: "pending", source: "", page, size });
        const pageJobs = res?.data || [];
        if (!pageJobs.length) break;
        allJobs.push(...pageJobs);
        if (pageJobs.length < size) break;
        page++;
    }
    return allJobs;
};
