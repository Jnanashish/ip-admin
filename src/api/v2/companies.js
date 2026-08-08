import { apiV2, buildQueryString } from "./client";

const BASE = "/api/admin/companies/v2";

export const listCompaniesV2 = (query = {}) =>
    apiV2.get(`${BASE}${buildQueryString(query)}`);

export const fetchCompanyV2 = (id) =>
    apiV2.get(`${BASE}/${encodeURIComponent(id)}`);

export const createCompanyV2 = (data) => apiV2.post(BASE, data);

export const updateCompanyV2 = (id, partialData) =>
    apiV2.patch(`${BASE}/${encodeURIComponent(id)}`, partialData);

// Soft-archive — the default removal. Reversible via restoreCompanyV2.
// 409 when published jobs still reference the company.
export const archiveCompanyV2 = (id) =>
    apiV2.post(`${BASE}/${encodeURIComponent(id)}/archive`);

// Undo an archive. 404 means "not archived / already restored".
export const restoreCompanyV2 = (id) =>
    apiV2.post(`${BASE}/${encodeURIComponent(id)}/restore`);

// Permanent hard-delete — junk only. The `?permanent=true` flag is REQUIRED;
// without it the backend refuses with 400 by design. 409 when ANY job still
// references the company, archived ones included.
export const permanentlyDeleteCompanyV2 = (id) =>
    apiV2.delete(`${BASE}/${encodeURIComponent(id)}?permanent=true`);
