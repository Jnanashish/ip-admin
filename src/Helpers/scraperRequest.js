import { showSuccessToast, showErrorToast } from "./toast";

const SCRAPER_API = process.env.REACT_APP_SCRAPER_URL;
const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET;

const getHeaders = (includeJson = true) => ({
    "x-admin-secret": ADMIN_SECRET,
    ...(includeJson && { "Content-Type": "application/json" }),
});

const parseErrorResponse = async (res, fallbackMsg) => {
    try {
        const data = await res.json();
        return data?.error || data?.message || fallbackMsg;
    } catch {
        return fallbackMsg;
    }
};

export const scraperGet = async (url) => {
    const res = await fetch(`${SCRAPER_API}${url}`, {
        method: "GET",
        headers: getHeaders(false),
    });

    if (res.status === 200 || res.status === 201) {
        return await res.json();
    } else {
        const error = await parseErrorResponse(res, "Error in scraper GET request.");
        showErrorToast(error);
    }
};

export const scraperPost = async (url, body, apiname) => {
    const res = await fetch(`${SCRAPER_API}${url}`, {
        method: "POST",
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 200 || res.status === 201) {
        if (apiname) showSuccessToast(`${apiname} succeeded`);
        return await res.json();
    } else {
        const error = await parseErrorResponse(res, `Error in ${apiname || "scraper"} POST request.`);
        showErrorToast(error);
    }
};

export const scraperDelete = async (url, apiname) => {
    const res = await fetch(`${SCRAPER_API}${url}`, {
        method: "DELETE",
        headers: getHeaders(false),
    });

    if (res.status === 200 || res.status === 201) {
        if (apiname) showSuccessToast(`${apiname} succeeded`);
        return await res.json();
    } else {
        const error = await parseErrorResponse(res, `Error in ${apiname || "scraper"} DELETE request.`);
        showErrorToast(error);
    }
};
