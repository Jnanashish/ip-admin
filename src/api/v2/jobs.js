import { apiV2, buildQueryString } from "./client";

const BASE = "/api/admin/jobs/v2";

export const createJobV2 = (data) => apiV2.post(BASE, data);

export const updateJobV2 = (id, partialData) =>
    apiV2.patch(`${BASE}/${encodeURIComponent(id)}`, partialData);

export const fetchJobV2 = (id) =>
    apiV2.get(`${BASE}/${encodeURIComponent(id)}`);

// Soft-archive — the default removal. Reversible via restoreJobV2.
export const archiveJobV2 = (id) =>
    apiV2.post(`${BASE}/${encodeURIComponent(id)}/archive`);

// Undo an archive. 404 means "not archived / already restored".
export const restoreJobV2 = (id) =>
    apiV2.post(`${BASE}/${encodeURIComponent(id)}/restore`);

// Permanent hard-delete — junk only. The `?permanent=true` flag is REQUIRED;
// without it the backend refuses with 400 by design.
export const permanentlyDeleteJobV2 = (id) =>
    apiV2.delete(`${BASE}/${encodeURIComponent(id)}?permanent=true`);

export const listJobsV2 = (query = {}) =>
    apiV2.get(`${BASE}${buildQueryString(query)}`);

export const scrapeAndPostJob = (applyLink) =>
    apiV2.post("/api/admin/jobs/scrape-and-post", { applyLink });

// ── Apply-link verification / flagged-job cleanup ──────────────────────────
// Background scan that checks published jobs' apply links, archives dead ones,
// and flags inconclusive ones. 202 = scan started (poll status); 409 = already
// running. Omit `limit` to scan all published jobs (backend caps 1–5000).
export const verifyApplyLinksV2 = (limit) =>
    apiV2.post(`${BASE}/verify-now`, limit ? { limit } : {});

// Poll until `running` flips to false; `lastRun` then holds the summary.
export const getVerifyStatusV2 = () => apiV2.get(`${BASE}/verify-now/status`);

// Jobs needing review. query: { page, limit, result? } — result ∈ expired|inconclusive.
export const listFlaggedJobsV2 = (query = {}) =>
    apiV2.get(`${BASE}/flagged${buildQueryString(query)}`);

// Soft-delete flagged jobs. payload = { ids: [...] } OR { all: true } (exactly one).
export const purgeFlaggedJobsV2 = (payload) =>
    apiV2.post(`${BASE}/flagged/purge`, payload);
