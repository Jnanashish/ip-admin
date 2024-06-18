import { post, get, deleteData } from "../Helpers/request";
import { apiEndpoint } from "../Helpers/apiEndpoints";
import { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } from "../Helpers/toast";
import { updateData } from "../Helpers/request";

// get company details if there is any based on company name or company Id
export const getCompanyDetailsHelper = async (companyName, companyId) => {
    // pass company name or company id as params
    const url = companyId ? `${apiEndpoint.get_company_details}?id=${companyId}` : `${apiEndpoint.get_company_details}?companyname=${companyName}`;
    const res = await get(url);

    // if logo already present
    if (!!res[0]?.largeLogo || !!res[0]?.smallLogo) {
        showInfoToast(`Logo found in database`);
    } else {
        showWarnToast(`Logo not found, upload manually`);
    }
    return res;
};


// get list of company list
export const getCompanyList = async () => {
    const res = await get(`${apiEndpoint.get_company_details}`);
    return res;
}

// delete company based on company ID
export const deleteCompany = async (companyId) => {
    const res = await deleteData(`${apiEndpoint.delete_company_details}/${companyId}`);
    return res;
}