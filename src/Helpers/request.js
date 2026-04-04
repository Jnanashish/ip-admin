import { API } from "../Backend";
import { showSuccessToast, showErrorToast } from "./toast";

const API_KEY = process.env.REACT_APP_API_KEY;

const getAuthHeaders = () => ({
    "x-api-key": API_KEY,
});

const parseErrorResponse = async (res, fallbackMsg) => {
    try {
        const data = await res.json();
        return data?.error || fallbackMsg;
    } catch {
        return fallbackMsg;
    }
};

export const post = async (url, body, apiname) => {
    const isFormData = body instanceof FormData;
    const headers = {
        ...getAuthHeaders(),
        ...(!isFormData && { "Content-Type": "application/json" }),
    };

    const res = await fetch(`${API}${url}`, {
        method: "POST",
        headers,
        body: isFormData ? body : JSON.stringify(body),
    });
    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (POST)`);
        const data = await res.json();
        return data;
    } else {
        const error = await parseErrorResponse(res, `Error occured in ${!!apiname ? apiname : ""} POST request.`);
        showErrorToast(error);
    }
};


export const get = async (url, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (res.status === 201 || res.status === 200) {
        let data;
        if (!!res) {
            data = await res.json();
        }
        return data;
    } else {
        const error = await parseErrorResponse(res, `Error occured in ${!!apiname ? apiname : ""} get request.`);
        showErrorToast(error);
    }
}

export const deleteData = async (url, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (DELETE)`);
        const data = await res.json();
        return data;
    } else {
        const error = await parseErrorResponse(res, `Error occured in ${!!apiname ? apiname : ""} DELETE request.`);
        showErrorToast(error);
    }
}

export const updateData = async (url, body, apiname) => {
    const isFormData = body instanceof FormData;
    const headers = {
        ...getAuthHeaders(),
        ...(!isFormData && { "Content-Type": "application/json" }),
    };

    const res = await fetch(`${API}${url}`, {
        method: "PUT",
        headers,
        body: isFormData ? body : JSON.stringify(body),
    });

    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (UPDATE)`);
        const data = await res.json();
        return data;
    } else {
        const error = await parseErrorResponse(res, `Error occured in ${!!apiname ? apiname : ""} UPDATE request.`);
        showErrorToast(error);
    }
}
