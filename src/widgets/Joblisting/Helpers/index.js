import { copyToClipBoard } from "../../../Helpers/utility";
import { showSuccessToast } from "../../../Helpers/toast";

import { hashtags, captionline, linkedinHashtags } from "./staticdata";

const date = new Date();
const weeknum = date.getDay();
const line = captionline[weeknum % 2];
const hash = hashtags[weeknum % 3];
const linkedinHashtag = linkedinHashtags[weeknum % 3];

const translate = (char) => {
    let diff;
    if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
    else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
    return String.fromCodePoint(char.codePointAt(0) + diff);
};

const generateWhatsAppmessage = (item) => {
    const msg =
        item.title.replace(/[A-Za-z]/g, translate) +
        "\nBatch : " +
        item.batch +
        "\nDegree : " +
        item.degree +
        "\n\nApply Here 👉 " +
        item.link +
        "\n\nFor more Jobs visit " +
        "https://bit.ly/careersattechWA";

    return msg;
};

// copy message for whatsapp
export const copyWhatsAppMessage = (item) => {
    const msg = generateWhatsAppmessage(item);
    copyToClipBoard(msg);
    showSuccessToast("Copied");
};

// Instagram
// generate instagram post caption
export const generateCaptionHelper = (res) => {
    const title = res?.companyName + " is hiring freshers for " + res?.title + " role."
    const temp = title + "\n\nBatch : " + res.batch + "\nDegree : " + res.degree + "\n\n👉 Visit link given in Bio to apply. " + "\n\n" + "Follow @careersattech to get regular Job updates." + "\n\n\n" + hash;

    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// Linkedin
// Generate linkedin post caption
export const generateLinkedinCaption = (res) => {
    const temp = res.title + "\n\nBatch :- " + res.batch + "\nDegree :- " + res.degree + "\n\nApply Link in comment\n\n" + res.link + "\n\n"  + "\n.\n.\n.\n" + linkedinHashtag;

    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// formet the message for whatsapp
const generateCombinedWhatsAppmessage = (item, index, useWebsiteLink) => {    
    const applyLink = (useWebsiteLink || index === 2) ? jobDescriptionLink(item?.title, item?._id) : item.link;
    const msg = index + ". " + item.title.replace(/[A-Za-z]/g, translate) + "\nBatch : " + item.batch + "\nDegree : " + item.degree + "\n\nApply Here : " + applyLink + "\n\n";

    return msg;
};

// copy message for whatsapp, message will be generated from multiple jobs
export const generateCombinedWhatsAppMessage = (selectedJobList, useWebsiteLink = false) => {
    let message = "";
    selectedJobList.map((item, index) => {
        let msg = generateCombinedWhatsAppmessage(item, index + 1, useWebsiteLink);
        message = message + msg;
    });

    navigator.clipboard.writeText(message);
    showSuccessToast("Copied");
};

// copy apply link of selected job
export const copyApplyLink = (item) => {
    const applyLink = item?.companyName + " apply link : " + item?.link;
    copyToClipBoard(applyLink);
    showSuccessToast("Copied");
};


// generte slug from job title
export const generateSlugFromrole = (role) => {
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

export const jobDescriptionLink = (role, jobId) => {
    const slugifiedRole = generateSlugFromrole(role);
    const baseUrl = "https://careersat.tech";
    const link = `${baseUrl}/${slugifiedRole}/${jobId}`
    return link;
}

