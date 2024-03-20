import { post, get } from "../../../Helpers/request";
import { apiEndpoint } from "../../../Helpers/apiEndpoints";
import { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } from "../../../Helpers/toast";
import { API } from "../../../Backend";
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
    if (!!data?.data[0]?.largeLogo && !!data?.data[0]?.smallLogo) {
        showInfoToast(`${companyName} Logo found in database`);
    } else {
        showWarnToast(`${companyName} Logo not found, upload manually`);
    }
    return data;
};

// ---------------------------------------------------------
// add job details data and redirect to admin page if success
export const addJobDataHelper = async (jobdetails, bannerlink) => {
    const formData = new FormData();

    formData.append("title", jobdetails.title);
    formData.append("link", jobdetails.link);
    formData.append("batch", jobdetails.batch);
    formData.append("role", jobdetails.role);
    formData.append("jobtype", jobdetails.jobtype);
    formData.append("degree", jobdetails.degree);
    formData.append("salary", jobdetails.salary);
    formData.append("jobdesc", jobdetails.jobdesc);
    formData.append("eligibility", jobdetails.eligibility);
    formData.append("experience", jobdetails.experience);
    formData.append("lastdate", jobdetails.lastdate);
    formData.append("skills", jobdetails.skills);
    formData.append("responsibility", jobdetails.responsibility);
    formData.append("aboutCompany", jobdetails.aboutCompany);
    formData.append("location", jobdetails.location);
    formData.append("jdpage", jobdetails.jdpage);
    formData.append("companytype", jobdetails.companytype);
    formData.append("companyName", jobdetails.companyName);
    if (jobdetails.jdBanner !== "N") formData.append("jdbanner", jobdetails.jdBanner);
    if (!!bannerlink) formData.append("jdbanner", bannerlink);
    if (!!jobdetails.imagePath) formData.append("imagePath", jobdetails.imagePath);

    const res = await post(apiEndpoint.addJobData, formData, "Add new job");
    if (!!res) {
        showSuccessToast("Job data added successfully");
        return { status: 200 };
    } else {
        showErrorToast("An error occured while adding Job");
        return { status: 404 };
    }
};

// function to map experience with the batch
export const mapExperiencetoBatch = (experience) => {
    let batch = "";
    if (experience === "0 - 1 years") batch = "2023 / 2022";
    if (experience === "0 - 2 years") batch = "2023 / 2022 / 2021";
    if (experience === "0 - 3 years") batch = "2023 / 2022 / 2021 / 2020";
    if (experience === "0 - 4 years") batch = "2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "0+ years") batch = "2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "1+ years") batch = "2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "2+ years") batch = "2022 / 2021 / 2020 / 2019";
    if (experience === "3+ years") batch = "2021 / 2020 / 2019";
    if (experience === "College students" || experience === "Final year students") batch = "2025 / 2024";
    if (experience === "Freshers") batch = "2024 / 2023 / 2022";
    return batch;
};

// // add job details data and redirect to admin page if success
// export const addJobDataHelper = async (
//     title,
//     link,
//     batch,
//     role,
//     jobtype,
//     degree,
//     salary,
//     jobdesc,
//     eligibility,
//     experience,
//     lastdate,
//     skills,
//     responsibility,
//     aboutCompany,
//     location,
//     jdpage,
//     companytype,
//     telegrambanner,
//     companyName,
//     resizedImage,
//     imagePath,
//     bannerlink
// ) => {
//     const formData = new FormData();

//     formData.append("title", title);
//     formData.append("link", link);
//     formData.append("batch", batch);
//     formData.append("role", role);
//     formData.append("jobtype", jobtype);
//     formData.append("degree", degree);
//     formData.append("salary", salary);
//     formData.append("jobdesc", jobdesc);
//     formData.append("eligibility", eligibility);
//     formData.append("experience", experience);
//     formData.append("lastdate", lastdate);
//     formData.append("skills", skills);
//     formData.append("responsibility", responsibility);
//     formData.append("aboutCompany", aboutCompany);
//     formData.append("location", location);
//     formData.append("jdpage", jdpage);
//     formData.append("companytype", companytype);
//     if (telegrambanner !== "N") formData.append("jdbanner", telegrambanner);
//     formData.append("companyName", companyName);
//     // if (resizedImage !== "N") formData.append("photo", resizedImage);
//     if (imagePath) formData.append("imagePath", imagePath);

//     // const bannerlink = await uploadBannertoCDN()
//     if (telegrambanner === "N") formData.append("jdbanner", bannerlink);

//     const res = await post(apiEndpoint.addJobData, formData, "Add new job");
//     if (res) {
//         showSuccessToast("Job data added successfully");
//         return { status: 200 };
//     } else {
//         showErrorToast("An error occured while adding Job");
//         return { status: 404 };
//     }
// };

export const updateData = async (jobdetails, id) => {
    const formData = new FormData();

    formData.append("title", jobdetails?.title);
    formData.append("link", jobdetails?.link);
    formData.append("batch", jobdetails?.batch);
    formData.append("role", jobdetails?.role);
    formData.append("jobtype", jobdetails?.jobtype);
    formData.append("degree", jobdetails?.degree);
    formData.append("salary", jobdetails?.salary);
    formData.append("jobdesc", jobdetails?.jobdesc);
    formData.append("eligibility", jobdetails?.eligibility);
    formData.append("experience", jobdetails?.experience);
    formData.append("lastdate", jobdetails?.lastdate);
    formData.append("skills", jobdetails?.skills);
    formData.append("responsibility", jobdetails?.responsibility);
    formData.append("aboutCompany", jobdetails?.aboutCompany);
    formData.append("location", jobdetails?.location);
    formData.append("imagePath", jobdetails?.imagePath);

    const res = await fetch(`${API}/jd/update/${id}`, {
        method: "PUT",
        body: formData,
    });

    return res;
};
