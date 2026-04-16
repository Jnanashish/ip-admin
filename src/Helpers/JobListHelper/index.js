import { copyToClipBoard } from "../utility";
import { showSuccessToast } from "../toast";
import { translate } from "../textTransform";

import { hashtags, linkedinHashtags } from "./staticdata";

const date = new Date();
const weeknum = date.getDay();
const instagramHashtags = hashtags[weeknum % 3];
const linkedinHashtag = linkedinHashtags[weeknum % 3];

export const messageTemplate = (item, platform, useWebsiteLink = false) => {
    switch (platform) {
        case "whatsapp":
            const companyName = item?.companyName?.replace(/[A-Za-z]/g, translate);
            const title = companyName + item?.title.replace(/[A-Za-z]/g, translate);
            const applyLink = useWebsiteLink ? generateLinkFromRole(item?.title, item?._id) : item.link;
            return title +
                "\nBatch : " + item.batch +
                "\nDegree : " + item.degree +
                "\n\nApply Here 👉 " + applyLink;

        case "instagram":
            const commentLink = "Comment 👉 Link to get the apply link in your DM \n";
            const igTitle = item?.companyName + " is hiring freshers for " + item?.role + " role.";
            return commentLink + igTitle +
                "\n\nBatch : " + item.batch +
                "\nDegree : " + item.degree +
                "\n\n👉 Visit link given in Bio to apply. " +
                "\n\n" + "Follow @careersattech to get regular Job updates." +
                "\n\n\n" + instagramHashtags;

        case "linkedin":
            return item.title +
                "\n\nBatch :- " + item.batch +
                "\nDegree :- " + item.degree +
                "\n\nApply Link in comment\n\n" +
                item.link + "\n\n" +
                "\n.\n.\n.\n" + linkedinHashtag;

        case "applyLink":
            return item?.companyName + " apply link : " + item?.link;

        default:
            return "";
    }
};

// Instagram: generate Instagram post caption
export const generateInstagramCaption = (res) => {
    const temp = messageTemplate(res, "instagram");
    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// LinkedIn: generate LinkedIn post caption
export const generateLinkedinCaption = (res) => {
    const temp = messageTemplate(res, "linkedin");
    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// copy apply link of selected job
export const copyApplyLink = (item) => {
    const applyLink = messageTemplate(item, "applyLink");
    copyToClipBoard(applyLink);
    showSuccessToast("Copied");
};

// ------------------------------------------------------------------------------------------------

// copy message for whatsapp
export const copyWhatsAppMessage = (item) => {
    const msg = messageTemplate(item, "whatsapp");
    copyToClipBoard(msg);
    showSuccessToast("Copied");
};

// [HELPER] generate slug from role
export const slugifyRole = (role) => {
    if (!!role) {
        return role
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")        // Replace spaces with hyphens
            .replace(/[^\w\-]+/g, "")    // Remove all non-word characters
            .replace(/\-\-+/g, "-");     // Collapse multiple hyphens
    }
    return role;
};

// [HELPER] generate link from role and job id
const generateLinkFromRole = (role, jobId) => {
    const slugifiedRole = slugifyRole(role);
    return `https://careersat.tech/${slugifiedRole}/${jobId}`;
};

// [HELPER] format the message for whatsapp
const formatWhatsAppMessage = (item, index, useWebsiteLink) => {
    return index + ". " + messageTemplate(item, "whatsapp", useWebsiteLink) + "\n\n";
};

// generate whatsapp message from selected job list
// if useWebsiteLink is true, then the website link will be used instead of the link in the job data
export const generateWhatsAppMessage = (selectedJobList, useWebsiteLink = false) => {
    let message = "";
    selectedJobList.forEach((item, index) => {
        message += formatWhatsAppMessage(item, index + 1, useWebsiteLink);
    });

    navigator.clipboard.writeText(message);
    showSuccessToast("Copied");
};
