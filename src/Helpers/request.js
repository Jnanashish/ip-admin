import { API } from "../Backend";
import { showSuccessToast, showErrorToast } from "./toast";

export const post = async (url, formData, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "POST",
        body: formData,
    });
    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (POST)`);
        const data = await res.json();
        return data;
    } else {
        showErrorToast(`Error occured in ${!!apiname ? apiname : ""} POST request.`);
    }
};


export const get = async (url, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "GET",
    });

    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (GET)`);
        const data = await res.json();
        return data;
    } else {
        showErrorToast(`Error occured in ${!!apiname ? apiname : ""} GET request.`);
    }
}

export const deleteData = async (url, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "DELETE",
    });

    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (DELETE)`);
        const data = await res.json();
        return data;
    } else {
        showErrorToast(`Error occured in ${!!apiname ? apiname : ""} DELETE request.`);
    }
}

export const updateData = async (url, formData, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "PUT",
        body: formData,
    });

    if (res.status === 201 || res.status === 200) {
        showSuccessToast(`${!!apiname ? apiname : "Request"} successed (UPDATE)`);
        const data = await res.json();
        return data;
    } else {
        showErrorToast(`Error occured in ${!!apiname ? apiname : ""} UPDATE request.`);
    }
}
