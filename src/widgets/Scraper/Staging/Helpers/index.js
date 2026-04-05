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
    const merged = { jdpage: true, ...overrides };
    const body = { overrides: merged };
    return scraperPost(scraperEndpoints.stagingApprove(id), body, "Approve");
};

export const rejectJob = async (id, reason = "") => {
    return scraperPost(scraperEndpoints.stagingReject(id), { reason }, "Reject");
};

export const bulkApproveJobs = async (ids) => {
    return scraperPost(scraperEndpoints.stagingBulkApprove, { ids }, "Bulk Approve");
};

export const deleteStagingJob = async (id) => {
    return scraperDelete(scraperEndpoints.stagingDelete(id), "Delete");
};
