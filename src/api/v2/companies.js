import { apiV2, buildQueryString } from "./client";

const BASE = "/api/admin/companies/v2";

export const listCompaniesV2 = (query = {}) =>
    apiV2.get(`${BASE}${buildQueryString(query)}`);

export const fetchCompanyV2 = (id) =>
    apiV2.get(`${BASE}/${encodeURIComponent(id)}`);

export const createCompanyV2 = (data) => apiV2.post(BASE, data);

export const updateCompanyV2 = (id, partialData) =>
    apiV2.patch(`${BASE}/${encodeURIComponent(id)}`, partialData);

export const deleteCompanyV2 = (id) =>
    apiV2.delete(`${BASE}/${encodeURIComponent(id)}`);
