import { copyToClipBoard } from "../utility";
import { showSuccessToast } from "../toast";

// Import from centralized config
import { hashtags, linkedinHashtags } from "../../Config/social";

const date = new Date();
const weeknum = date.getDay();
const instagramHashtags = hashtags[weeknum % 3];
const linkedinHashtag = linkedinHashtags[weeknum % 3];

export const messageTemplate = (item, platform, useWebsiteLink = false) => {
    switch (platform) {
        case "whatsapp":
            const title = item?.title.replace(/[A-Za-z]/g, translate);
            const applyLink = useWebsiteLink ? generateLinkFromRole(item?.title, item?._id) : item.link;
            return title +
                "\nBatch : " + item.batch +
                "\nDegree : " + item.degree +
                "\n\nApply Here 👉 " + applyLink +
                "\n\nFor more Jobs visit " +
                "https://bit.ly/careersattechWA";
            
        case "instagram":
            const igTitle = item?.companyName + " is hiring freshers for " + item?.title + " role.";
            return igTitle + 
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

const translate = (char) => {
    let diff;
    if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
    else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
    return String.fromCodePoint(char.codePointAt(0) + diff);
};


// Instagram generate instagram post caption
export const genererateInstagramCaption = (res) => {
    const temp = messageTemplate(res, "instagram");
    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// Linkedin Generate linkedin post caption
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
            .toString() // Convert to string
            .toLowerCase() // Convert to lowercase
            .trim() // Remove whitespace from both ends
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/[^\w\-]+/g, "") // Remove all non-word characters
            .replace(/\-\-+/g, "-"); // Replace multiple hyphens with a single hyphen
    }
    return role;
};

// [HELPER] generate link from role and job id
const generateLinkFromRole = (role, jobId) => {
    const slugifiedRole = slugifyRole(role);
    return `https://careersat.tech/${slugifiedRole}/${jobId}`;
};

// [HELPER] formet the message for whatsapp
const HELPER_generateWhatsAppMessage = (item, index, useWebsiteLink) => {
    const msg = index + ". " + messageTemplate(item, "whatsapp", useWebsiteLink) + "\n\n";
    return msg;
};

// generate whatsapp message from selected job
// if useWebsiteLink is true, then the website link will be used instead of the link in the job data
export const generateWhatsAppMessage = (selectedJobList, useWebsiteLink = false) => {
    let message = "";
    selectedJobList.map((item, index) => {
        let msg = HELPER_generateWhatsAppMessage(item, index + 1, useWebsiteLink);
        message = message + msg;
    });

    navigator.clipboard.writeText(message);
    showSuccessToast("Copied");
};
