import { scraperGet, scraperPost, scraperDelete } from "Helpers/scraperRequest";
import { scraperEndpoints } from "Helpers/scraperApiEndpoints";
import { get } from "Helpers/request";
import { apiEndpoint } from "Helpers/apiEndpoints";

export const fetchStagingJobs = async ({ status, source, page = 1, size = 20 }) => {
    const params = new URLSearchParams({ page, size });
    if (status && status !== "all") params.append("status", status);
    if (source) params.append("source", source);
    return scraperGet(`${scraperEndpoints.stagingList}?${params.toString()}`);
};

export const fetchStagingJob = async (id) => {
    return scraperGet(scraperEndpoints.stagingDetail(id));
};

const fetchCompanyLogo = async (companyName) => {
    if (!companyName) return null;
    try {
        const res = await get(`${apiEndpoint.getCompanyDetails}?companyname=${companyName}`);
        return res?.[0]?.smallLogo || null;
    } catch {
        return null;
    }
};

export const approveJob = async (id, overrides = {}, companyName = "") => {
    const logo = overrides.imagePath ? null : await fetchCompanyLogo(companyName);
    const merged = { ...overrides, ...(logo ? { imagePath: logo } : {}), jdpage: "true" };
    const body = { overrides: merged };
    return scraperPost(scraperEndpoints.stagingApprove(id), body, "Approve");
};

export const rejectJob = async (id, reason = "") => {
    return scraperPost(scraperEndpoints.stagingReject(id), { reason }, "Reject");
};

export const bulkApproveJobs = async (ids, jobsMap = {}) => {
    const logoCache = {};
    const perJobOverrides = {};

    for (const id of ids) {
        const companyName = jobsMap[id];
        if (!companyName) {
            perJobOverrides[id] = { jdpage: "true" };
            continue;
        }
        if (!(companyName in logoCache)) {
            logoCache[companyName] = await fetchCompanyLogo(companyName);
        }
        const logo = logoCache[companyName];
        perJobOverrides[id] = { ...(logo ? { imagePath: logo } : {}), jdpage: "true" };
    }

    return scraperPost(
        scraperEndpoints.stagingBulkApprove,
        { ids, perJobOverrides },
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
