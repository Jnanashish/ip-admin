import { post } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
export const submitCompanyDetailsHelper = async (comapnyDetails) => {
    const formData = new FormData();
    formData.append("companyLogo", comapnyDetails.smallLogoUrl);
    formData.append("companyBanner", comapnyDetails.bigLogoUrl);
    formData.append("companyInfo", comapnyDetails.info);
    formData.append("companyType", comapnyDetails.companyType);
    formData.append("careerPageLink", comapnyDetails.careersPageLink);
    formData.append("linkedinPageLink", comapnyDetails.linkedinLink);
    formData.append("companyName", comapnyDetails.name);

    return await post(apiEndpoint.addCompanyDetails, formData);
};