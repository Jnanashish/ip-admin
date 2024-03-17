
import { post, get } from "../../../Helpers/request";
import { apiEndpoint } from "../../../Helpers/apiEndpoints";
import { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } from "../../../Helpers/toast";

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
    if(!!data?.data[0]?.largeLogo && !!data?.data[0]?.smallLogo){
        showInfoToast(`${companyName} Logo found in database`)
    } else {
        showWarnToast(`${companyName} Logo not found, upload manually`)
    }
    return data;
};

// ---------------------------------------------------------
// add job details data and redirect to admin page if success
export const addJobDataHelper = async (title, link, batch, role, jobtype, degree, salary, jobdesc, eligibility, experience, lastdate, skills, responsibility, aboutCompany, location, jdpage, companytype, telegrambanner, companyName, resizedImage, imagePath, bannerlink) => {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("link", link);
    formData.append("batch", batch);
    formData.append("role", role);
    formData.append("jobtype", jobtype);
    formData.append("degree", degree);
    formData.append("salary", salary);
    formData.append("jobdesc", jobdesc);
    formData.append("eligibility", eligibility);
    formData.append("experience", experience);
    formData.append("lastdate", lastdate);
    formData.append("skills", skills);
    formData.append("responsibility", responsibility);
    formData.append("aboutCompany", aboutCompany);
    formData.append("location", location);
    formData.append("jdpage", jdpage);
    formData.append("companytype", companytype);
    if(telegrambanner !== "N") formData.append("jdbanner", telegrambanner);
    formData.append("companyName", companyName);
    if(resizedImage !== "N") formData.append("photo", resizedImage);
    if (imagePath) formData.append("imagePath", imagePath);
    
    // const bannerlink = await uploadBannertoCDN()
    if(telegrambanner === "N") formData.append("jdbanner", bannerlink);


    const res = await post(apiEndpoint.addJobData, formData, "Add new job");
    if (res) {
        showSuccessToast("Job data added successfully");
        return { status : 200 }
    } else {
        showErrorToast("An error occured while adding Job");
        return { status : 404 }
    }
};
