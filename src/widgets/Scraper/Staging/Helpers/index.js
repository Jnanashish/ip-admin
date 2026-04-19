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

// Mirrors the AddJobs flow (widgets/Addjobs/index.js getCompanyDetails):
// look up the company record by name and return the fields the job payload needs.
const fetchCompanyDetails = async (companyName) => {
    if (!companyName) return null;
    try {
        const url = `${apiEndpoint.getCompanyDetails}?companyname=${encodeURIComponent(companyName)}`;
        const res = await get(url);
        const data = res?.[0];
        if (!data) return null;
        return {
            imagePath: data.smallLogo || null,
            companyId: data._id || null,
        };
    } catch (err) {
        console.warn(`[scraper] Company details lookup failed for "${companyName}":`, err);
        return null;
    }
};

const buildCompanyOverrides = (details, overrides) => {
    if (!details) return {};
    const extra = {};
    if (details.imagePath && !overrides.imagePath) extra.imagePath = details.imagePath;
    if (details.companyId && !overrides.companyId) extra.companyId = details.companyId;
    return extra;
};

export const approveJob = async (id, overrides = {}, companyName = "") => {
    const details = await fetchCompanyDetails(companyName);
    const merged = { ...overrides, ...buildCompanyOverrides(details, overrides), jdpage: "true" };
    const body = { overrides: merged };
    return scraperPost(scraperEndpoints.stagingApprove(id), body, "Approve");
};

export const rejectJob = async (id, reason = "") => {
    return scraperPost(scraperEndpoints.stagingReject(id), { reason }, "Reject");
};

export const bulkApproveJobs = async (ids, jobsMap = {}) => {
    const detailsCache = {};
    const perJobOverrides = {};

    for (const id of ids) {
        const companyName = jobsMap[id];
        if (!companyName) {
            perJobOverrides[id] = { jdpage: "true" };
            continue;
        }
        if (!(companyName in detailsCache)) {
            detailsCache[companyName] = await fetchCompanyDetails(companyName);
        }
        perJobOverrides[id] = {
            ...buildCompanyOverrides(detailsCache[companyName], {}),
            jdpage: "true",
        };
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
