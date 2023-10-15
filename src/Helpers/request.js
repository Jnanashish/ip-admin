import { API } from "../Backend";
import { ShowSuccessToast, ShowErrorToast } from "./toast";

export const post = async (url, formData, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "POST",
        body: formData,
    });
    if (res.status === 201 || res.status === 200) {
        ShowSuccessToast(`${!!apiname ? apiname : "Request"} successed (POST)`);
        const data = await res.json();
        return data;
    } else {
        ShowErrorToast(`Error occured in ${!!apiname ? apiname : ""} POST request.`);
    }
};


export const get = async (url, apiname) => {
    const res = await fetch(`${API}${url}`, {
        method: "GET",
    });

    if (res.status === 201 || res.status === 200) {
        // ShowSuccessToast(`${!!apiname ? apiname : "Request"} successed (GET)`);
        const data = await res.json();
        return data;
    } else {
        ShowErrorToast(`Error occured in ${!!apiname ? apiname : ""} GET request.`);
    }
}
