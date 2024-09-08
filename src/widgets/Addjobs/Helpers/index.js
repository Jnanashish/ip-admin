import { post, get } from "../../../Helpers/request";
import { apiEndpoint } from "../../../Helpers/apiEndpoints";
import { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } from "../../../Helpers/toast";
import { updateData } from "../../../Helpers/request";
import { categorytags } from "./staticdata";
//---------------------------------------------------------
// add 30days to current date to generate last data of a job
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
// get company details if there is any based on company name
export const getCompanyDetailsHelper = async (companyName, companyId) => {
    const url = companyName ? `${apiEndpoint.get_company_details}?companyname=${companyName}` : `${apiEndpoint.get_company_details}?id=${companyId}`;
    const data = await get(url);
    if (!!data[0]?.largeLogo || !!data[0]?.smallLogo) {
        showInfoToast(`Logo found in database`);
    } else {
        showWarnToast(`Logo not found, upload manually`);
    }
    return data;
};

export const getJobDetailsHelper = async (params) => {
    if (!!params && !!params?.key && !!params?.value) {
        const apiUrl = `${apiEndpoint.getAllJobDetails}?${params?.key}=${params?.value}`;
        const data = await get(apiUrl);

        if (!!data) {
            showInfoToast(`Company details found in database`);
        } else {
            showWarnToast(`Compant details not found`);
        }
        return data;
    }
    return null;
};

// ---------------------------------------------------------
// Function to map experience with the batch
export const mapExperiencetoBatch = (experience) => {
    let batch = "";
    if (experience === "0 - 1 years") batch = "2024 / 2023 / 2022";
    if (experience === "0 - 2 years") batch = "2024 / 2023 / 2022 / 2021";
    if (experience === "0 - 3 years") batch = "2024 / 2023 / 2022 / 2021 / 2020";
    if (experience === "0 - 4 years") batch = "2024 / 2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "1 - 2 years") batch = "2023 / 2022 / 2021";
    if (experience === "1 - 3 years") batch = "2023 / 2022 / 2021 / 2020";
    if (experience === "1 - 4 years") batch = "2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "0+ years") batch = "2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "1 years") batch = "2023 / 2022";
    if (experience === "1+ years") batch = "2023 / 2022 / 2021 / 2020 / 2019";
    if (experience === "2+ years") batch = "2022 / 2021 / 2020 / 2019";
    if (experience === "3+ years") batch = "2021 / 2020 / 2019";
    if (experience === "College students" || experience === "Final year students") batch = "2025 / 2024";
    if (experience === "Freshers") batch = "2024 / 2023 / 2022";
    return batch;
};

const generateFormData = (jobdetails) => {
    const formData = new FormData();
    const fields = [
        "title",
        "link",
        "batch",
        "role",
        "jobtype",
        "degree",
        "salary",
        "jobdesc",
        "eligibility",
        "experience",
        "lastdate",
        "skills",
        "responsibility",
        "aboutCompany",
        "location",
        "jdpage",
        "companytype",
        "companyName",
        "tags",
        "workMode",
        "benifits",
        "platform",
        "jobId",
        "imagePath",
        "companyId",
        "isActive"
    ];
    fields.forEach((field) => {
        if (jobdetails[field] !== undefined && jobdetails[field] !== null) {
            formData.append(field, jobdetails[field]);
        }
    });
    return formData;
};

// ---------------------------------------------------------
// [ADD JOB DETAILS] add job details data and redirect to admin page if success
export const addJobDataHelper = async (jobdetails) => {
    const formData = generateFormData(jobdetails);
    console.log("jobdetails in add", jobdetails);
    console.log("formData", formData);

    const res = await post(apiEndpoint.addJobData, formData, "Add new job");
    if (!!res) {
        showSuccessToast("Job data added successfully");
        return { status: 200 };
    } else {
        showErrorToast("An error occured while adding Job");
        return { status: 404 };
    }
};

// ---------------------------------------------------------
// update job details of a particular job based on id
export const updateJobDetails = async (jobdetails, id) => {
    const formData = generateFormData(jobdetails);

    if (!!id && !!formData) {
        const res = await updateData(`${apiEndpoint.updateJobDetails}${id}`, formData);
        if (!!res) {
            showSuccessToast("Job data updated successfully");
            return { status: 200 };
        } else {
            showErrorToast("An error occured while adding Job");
            return { status: 404 };
        }
    }
    return null;
};

// ["software", "frontend", "backend", "fullstack", "web3", "devops", "testing", "app", "datascience","analytics", "uiux", "ai", "ml","android","ios","blockchain", "hacking", "security"]
export const generateTagsfromRole = (jobrole) => {
    const selectedTags = [];
    const role = jobrole.toLowerCase()

    categorytags.forEach(tag => {
        if (role.includes(tag)) {
            selectedTags.push(tag);
        }
    });

    if(role.includes("software") && (role.includes("developer") || role.includes("engineer") || role.includes("development")) && selectedTags?.length === 0){
        selectedTags.push("software")
    }

    if(role.includes("frontend") || role.includes("javascript") || role.includes("react") || role.includes("next") || role.includes("web") || role.includes("fullstack")){
        selectedTags.push("frontend")
    }

    if(role.includes("python") || role.includes("backend") || role.includes("fullstack") || role.includes("django") || role.includes("java")){
        selectedTags.push("backend")
    }

    if(role.includes("qa") || role.includes("test") || role.includes("manual") || role.includes("automation") || role.includes("quality")){
        selectedTags.push("testing")
    }

    if(role.includes("android") || role.includes("ios") || role.includes("flutter") || role.includes("react native")){
        selectedTags.push("app")
    }

    return selectedTags;
};