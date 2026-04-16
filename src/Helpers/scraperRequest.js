import { showSuccessToast, showErrorToast } from "./toast";
import { parseErrorResponse } from "./parseErrorResponse";

const SCRAPER_API = process.env.REACT_APP_SCRAPER_URL;
const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET;
const REQUEST_TIMEOUT_MS = 30000;

const getHeaders = (includeJson = true) => ({
    "x-admin-secret": ADMIN_SECRET,
    ...(includeJson && { "Content-Type": "application/json" }),
});

const withTimeout = (promise, controller) => {
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return promise.finally(() => clearTimeout(timer));
};

export const scraperGet = async (url) => {
    const controller = new AbortController();
    try {
        const res = await withTimeout(
            fetch(`${SCRAPER_API}${url}`, {
                method: "GET",
                headers: getHeaders(false),
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            return await res.json();
        }
        const error = await parseErrorResponse(res, "Error in scraper GET request.");
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};

export const scraperPost = async (url, body, apiname) => {
    const controller = new AbortController();
    try {
        const res = await withTimeout(
            fetch(`${SCRAPER_API}${url}`, {
                method: "POST",
                headers: getHeaders(),
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            if (apiname) showSuccessToast(`${apiname} succeeded`);
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error in ${apiname || "scraper"} POST request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};

export const scraperDelete = async (url, apiname) => {
    const controller = new AbortController();
    try {
        const res = await withTimeout(
            fetch(`${SCRAPER_API}${url}`, {
                method: "DELETE",
                headers: getHeaders(false),
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            if (apiname) showSuccessToast(`${apiname} succeeded`);
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error in ${apiname || "scraper"} DELETE request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};
