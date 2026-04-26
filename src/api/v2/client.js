import { auth } from "Config/firebase_config";

const REQUEST_TIMEOUT_MS = 30000;
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const authHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseBody = async (res) => {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const request = async (method, path, body) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const headers = {
            ...(await authHeader()),
            ...(body !== undefined && { "Content-Type": "application/json" }),
        };

        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        const parsed = await parseBody(res);

        if (res.ok) {
            return { status: res.status, data: parsed, error: null };
        }
        return { status: res.status, data: null, error: parsed };
    } catch (err) {
        return { status: 0, data: null, error: { message: err?.name === "AbortError" ? "Request timed out" : "Network error" } };
    } finally {
        clearTimeout(timer);
    }
};

export const apiV2 = {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body ?? {}),
    patch: (path, body) => request("PATCH", path, body ?? {}),
    delete: (path) => request("DELETE", path),
};

export const buildQueryString = (query = {}) => {
    const entries = Object.entries(query).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
    );
    if (entries.length === 0) return "";
    const usp = new URLSearchParams();
    entries.forEach(([k, v]) => usp.append(k, String(v)));
    return `?${usp.toString()}`;
};
