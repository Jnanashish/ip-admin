import { post, get } from "../Helpers/request";
import { apiEndpoint } from "../Helpers/apiEndpoints";
import { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } from "../Helpers/toast";
import { updateData } from "../Helpers/request";

// get job details based on params
export const getJobDetailsHelper = async (params, page = 1, size = 10) => {


    // let api_url = `${apiEndpoint.all_job_details}?page=${page}&size=${size}`;

    // // if param present then create api url with param filter
    // !!params && Array.isArray(params) && params?.length > 0 && params.forEach((param) => {
    //     const key = Object.keys(param)[0];
    //     const value = param[key];

    //     api_url += `&${key}=${value}`;
    // });


    console.log("PARAMS", params);
    if (!!params && !!params?.key && !!params?.value) {
        const apiUrl = `${apiEndpoint.getAllJobDetails}?${params?.key}=${params?.value}&size=${size}&page=${page}`;
        const res = await get(apiUrl);

        if (!!res) {
            showInfoToast(`Company details found in database`);
        } else {
            showWarnToast(`Compant details not found`);
        }
        return res;

    console.log("RES", res);

    }
    return null;
};