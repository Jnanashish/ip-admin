import { API } from "../Backend";
import { showSuccessToast, showErrorToast } from "./toast";
import { parseErrorResponse } from "./parseErrorResponse";

const API_KEY = process.env.REACT_APP_API_KEY;
const REQUEST_TIMEOUT_MS = 30000;

const getAuthHeaders = () => ({
    "x-api-key": API_KEY,
});

const withTimeout = (promise, controller) => {
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return promise.finally(() => clearTimeout(timer));
};

const labelFor = (name) => (name ? name : "Request");

export const post = async (url, body, apiname) => {
    const controller = new AbortController();
    try {
        const isFormData = body instanceof FormData;
        const headers = {
            ...getAuthHeaders(),
            ...(!isFormData && { "Content-Type": "application/json" }),
        };

        const res = await withTimeout(
            fetch(`${API}${url}`, {
                method: "POST",
                headers,
                body: isFormData ? body : JSON.stringify(body),
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            showSuccessToast(`${labelFor(apiname)} succeeded (POST)`);
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error occurred in ${apiname || ""} POST request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};

export const get = async (url, apiname) => {
    const controller = new AbortController();
    try {
        const res = await withTimeout(
            fetch(`${API}${url}`, {
                method: "GET",
                headers: getAuthHeaders(),
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error occurred in ${apiname || ""} GET request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};

export const deleteData = async (url, apiname) => {
    const controller = new AbortController();
    try {
        const res = await withTimeout(
            fetch(`${API}${url}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            showSuccessToast(`${labelFor(apiname)} succeeded (DELETE)`);
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error occurred in ${apiname || ""} DELETE request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};

export const updateData = async (url, body, apiname) => {
    const controller = new AbortController();
    try {
        const isFormData = body instanceof FormData;
        const headers = {
            ...getAuthHeaders(),
            ...(!isFormData && { "Content-Type": "application/json" }),
        };

        const res = await withTimeout(
            fetch(`${API}${url}`, {
                method: "PUT",
                headers,
                body: isFormData ? body : JSON.stringify(body),
                signal: controller.signal,
            }),
            controller
        );

        if (res.status === 200 || res.status === 201) {
            showSuccessToast(`${labelFor(apiname)} succeeded (UPDATE)`);
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error occurred in ${apiname || ""} UPDATE request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};
