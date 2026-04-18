import { get, deleteData } from "../Helpers/request";
import { apiEndpoint } from "../Helpers/apiEndpoints";
import { showInfoToast, showWarnToast } from "../Helpers/toast";

// get company details if there is any based on company name or company Id
export const getCompanyDetailsHelper = async (companyName, companyId) => {
    // pass company name or company id as params
    const url = companyId
        ? `${apiEndpoint.getCompanyDetails}?id=${companyId}`
        : `${apiEndpoint.getCompanyDetails}?companyname=${companyName}`;
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
    const res = await get(`${apiEndpoint.getCompanyDetails}`);
    return res;
};

// delete company based on company ID
export const deleteCompany = async (companyId) => {
    const res = await deleteData(`${apiEndpoint.deleteCompanyDetails}/${companyId}`);
    return res;
};
