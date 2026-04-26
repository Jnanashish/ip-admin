import { get } from "../../../Helpers/request";
import { apiEndpoint } from "../../../Helpers/apiEndpoints";
import { showInfoToast, showWarnToast } from "../../../Helpers/toast";

export const getJobDetailsHelper = async (params, page, size = 10) => {
    if (!!params && !!params?.key && !!params?.value) {
        let apiUrl = `${apiEndpoint.getAllJobDetails}?${params?.key}=${params?.value}`;

        if (page && size) {
            apiUrl += `&page=${page}&size=${size}`;
        }

        const data = await get(apiUrl);

        if (!!data) {
            showInfoToast(`Company details found in database`);
        } else {
            showWarnToast(`Company details not found`);
        }
        return data;
    }
    return null;
};
