import { scraperGet, scraperPost, scraperDelete } from "Helpers/scraperRequest";
import { scraperEndpoints } from "Helpers/scraperApiEndpoints";
import { get } from "Helpers/request";
import { apiEndpoint } from "Helpers/apiEndpoints";
import { API } from "Backend";

const silentUpdate = async (url, formData) => {
    const res = await fetch(`${API}${url}`, {
        method: "PUT",
        headers: { "x-api-key": process.env.REACT_APP_API_KEY },
        body: formData,
    });
    if (res.status === 200 || res.status === 201) return res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}`);
};

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

// One-off backfill for already-published jobs that were approved before the
// logo/jdpage fix landed. Fetches the latest `limit` jobs and, for each one
// that is missing imagePath or jdpage=true, looks up the company record and
// PUTs a partial update. Returns a summary so the caller can show a toast.
export const backfillLatestJobs = async (limit = 80, onProgress) => {
    const res = await get(
        `${apiEndpoint.getAllJobDetails}?filterData=false&page=1&size=${limit}`
    );
    const jobs = res?.data || [];
    const detailsCache = {};
    const summary = { total: jobs.length, updated: 0, skipped: 0, failed: 0, errors: [] };

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        onProgress?.({ current: i + 1, total: jobs.length, companyName: job.companyName });

        const needsLogo = !job.imagePath;
        const needsJdpage = job.jdpage !== "true" && job.jdpage !== true;
        if (!needsLogo && !needsJdpage) {
            summary.skipped++;
            continue;
        }

        const updates = {};
        if (needsJdpage) updates.jdpage = "true";

        if (needsLogo && job.companyName) {
            if (!(job.companyName in detailsCache)) {
                detailsCache[job.companyName] = await fetchCompanyDetails(job.companyName);
            }
            const details = detailsCache[job.companyName];
            if (details?.imagePath) updates.imagePath = details.imagePath;
            if (details?.companyId && !job.companyId) updates.companyId = details.companyId;
        }

        if (Object.keys(updates).length === 0) {
            summary.skipped++;
            continue;
        }

        const formData = new FormData();
        Object.entries(updates).forEach(([k, v]) => formData.append(k, v));

        try {
            await silentUpdate(`${apiEndpoint.updateJobDetails}${job._id}`, formData);
            summary.updated++;
        } catch (err) {
            summary.failed++;
            summary.errors.push({ id: job._id, companyName: job.companyName, error: err?.message });
        }
    }

    return summary;
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
