import { apiV2, buildQueryString } from "./client";

const BASE = "/api/admin/jobs/v2";

export const createJobV2 = (data) => apiV2.post(BASE, data);

export const updateJobV2 = (id, partialData) =>
    apiV2.patch(`${BASE}/${encodeURIComponent(id)}`, partialData);

export const fetchJobV2 = (id) =>
    apiV2.get(`${BASE}/${encodeURIComponent(id)}`);

export const deleteJobV2 = (id) =>
    apiV2.delete(`${BASE}/${encodeURIComponent(id)}`);

export const listJobsV2 = (query = {}) =>
    apiV2.get(`${BASE}${buildQueryString(query)}`);
