
import { post, get } from "../../../Helpers/request";
import { apiEndpoint } from "../../../Helpers/apiEndpoints";
import { ShowErrorToast, ShowSuccessToast, ShowInfoToast, ShowWarnToast } from "../../../Helpers/toast";

//---------------------------------------------------------
// add 30days to current date
export const generateLastDatetoApplyHelper = () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 30);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
};

// ---------------------------------------------------------
// get company logo if there based on company name
export const getCompanyLogoHelper = async (companyName) => {
    const data = await get(`${apiEndpoint.getCompanyLogo}?companyName=${companyName}`);
    if(data?.data[0]?.largeLogo !== "null" && data?.data[0]?.smallLogo !== "null"){
        ShowInfoToast(`${companyName} Logo found in database`)
    } else {
        ShowWarnToast(`${companyName} Logo not found, upload manually`)
    }
    return data;
};

// ---------------------------------------------------------
// add job details data and redirect to admin page if success
export const addJobDataHelper = async (formData) => {
    const res = await post(apiEndpoint.addJobData, formData, "Add new job");
    if (res) {
        ShowSuccessToast("Job data added successfully");
        return { status : 200 }
    } else {
        ShowErrorToast("An error occured while adding Job");
        return { status : 404 }
    }
};
