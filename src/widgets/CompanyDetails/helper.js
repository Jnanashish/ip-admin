import { post, updateData } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { showSuccessToast, showErrorToast } from "../../Helpers/toast";
export const submitCompanyDetailsHelper = async (comapnyDetails) => {
    const formData = new FormData();
    formData.append("smallLogo", comapnyDetails.smallLogo);
    formData.append("largeLogo", comapnyDetails.largeLogo);
    formData.append("companyInfo", comapnyDetails.companyInfo);
    formData.append("companyType", comapnyDetails.companyType);
    formData.append("careerPageLink", comapnyDetails.careerPageLink);
    formData.append("linkedinPageLink", comapnyDetails.linkedinPageLink);
    formData.append("companyName", comapnyDetails.companyName);

    const res = await post(apiEndpoint.addCompanyDetails, formData);
    if (!!res) {
        showSuccessToast("Company details added successfully");
        return { status: 200, id : res?.id };
    } else {
        showErrorToast("An error occured while adding Job");
        return { status: 404 };
    }
};

export const updateCompanyDetailsHelper = async (comapnyDetails, comapnyId) => {
    const formData = new FormData();
    formData.append("smallLogo", comapnyDetails.smallLogo);
    formData.append("largeLogo", comapnyDetails.largeLogo);
    formData.append("companyInfo", comapnyDetails.companyInfo);
    formData.append("companyType", comapnyDetails.companyType);
    formData.append("careerPageLink", comapnyDetails.careerPageLink);
    formData.append("linkedinPageLink", comapnyDetails.linkedinPageLink);
    formData.append("companyName", comapnyDetails.companyName);

    const res = await updateData(`${apiEndpoint.update_company_details}/${comapnyId}`, formData);
    if (!!res) {
        showSuccessToast("Company details updated successfully");
        return { status: 200 };
    } else {
        showErrorToast("An error occured while adding Job");
        return { status: 404 };
    }
};