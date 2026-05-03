import { auth } from "Config/firebase_config";

const REQUEST_TIMEOUT_MS = 30000;
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const getFreshToken = async (forceRefresh = false) => {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return null;
    try {
        return await user.getIdToken(forceRefresh);
    } catch {
        return null;
    }
};

const buildHeaders = (token, hasBody) => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
});

const parseBody = async (res) => {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const doFetch = async (method, path, body, token) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: buildHeaders(token, body !== undefined),
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        const parsed = await parseBody(res);
        return { res, parsed };
    } finally {
        clearTimeout(timer);
    }
};

const request = async (method, path, body) => {
    try {
        let token = await getFreshToken(false);
        let { res, parsed } = await doFetch(method, path, body, token);

        if (res.status === 401) {
            const errMsg =
                (parsed && typeof parsed === "object" && parsed.error) ||
                (typeof parsed === "string" ? parsed : "");
            // eslint-disable-next-line no-console
            console.warn(
                `[apiV2] 401 on ${method} ${path} — backend said:`,
                errMsg || "(empty body)",
                token ? "(token was attached)" : "(no token attached — user not signed in?)"
            );

            if (token) {
                const refreshed = await getFreshToken(true);
                if (refreshed && refreshed !== token) {
                    ({ res, parsed } = await doFetch(method, path, body, refreshed));
                }
            }
        }

        if (res.ok) {
            return { status: res.status, data: parsed, error: null };
        }
        return { status: res.status, data: null, error: parsed };
    } catch (err) {
        return {
            status: 0,
            data: null,
            error: {
                message:
                    err?.name === "AbortError" ? "Request timed out" : "Network error",
            },
        };
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
