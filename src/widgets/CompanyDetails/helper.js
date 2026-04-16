import { post, updateData } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { showSuccessToast, showErrorToast } from "../../Helpers/toast";

const COMPANY_FIELDS = [
    "smallLogo",
    "largeLogo",
    "companyInfo",
    "companyType",
    "careerPageLink",
    "linkedinPageLink",
    "companyName",
];

const buildCompanyFormData = (companyDetails) => {
    const formData = new FormData();
    COMPANY_FIELDS.forEach((field) => {
        formData.append(field, companyDetails[field]);
    });
    return formData;
};

export const submitCompanyDetailsHelper = async (companyDetails) => {
    const formData = buildCompanyFormData(companyDetails);
    const res = await post(apiEndpoint.addCompanyDetails, formData);
    if (!!res) {
        showSuccessToast("Company details added successfully");
        return { status: 200, id: res?.id };
    }
    showErrorToast("An error occurred while adding Company");
    return { status: 404 };
};

export const updateCompanyDetailsHelper = async (companyDetails, companyId) => {
    const formData = buildCompanyFormData(companyDetails);
    const res = await updateData(`${apiEndpoint.updateCompanyDetails}/${companyId}`, formData);
    if (!!res) {
        showSuccessToast("Company details updated successfully");
        return { status: 200 };
    }
    showErrorToast("An error occurred while updating Company");
    return { status: 404 };
};
