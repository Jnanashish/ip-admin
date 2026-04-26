import { get } from "../Helpers/request";
import { apiEndpoint } from "../Helpers/apiEndpoints";
import { showInfoToast, showWarnToast } from "../Helpers/toast";

export const getCompanyDetailsHelper = async (companyName, companyId) => {
    const url = companyId
        ? `${apiEndpoint.getCompanyDetails}?id=${companyId}`
        : `${apiEndpoint.getCompanyDetails}?companyname=${companyName}`;
    const res = await get(url);

    if (!!res[0]?.largeLogo || !!res[0]?.smallLogo) {
        showInfoToast(`Logo found in database`);
    } else {
        showWarnToast(`Logo not found, upload manually`);
    }
    return res;
};
