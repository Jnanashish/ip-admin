import { copyToClipBoard } from "../../../Helpers/utility";
import { showSuccessToast } from "../../../Helpers/toast";

import { hashtags, captionline } from "./staticdata";

const date = new Date();
const weeknum = date.getDay();
const line = captionline[weeknum % 2];
const hash = hashtags[weeknum % 3];

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

// generate instagram post caption
export const generateCaptionHelper = (res) => {
    const temp = res.title + ". Visit Link in Bio to apply. 🔝" + "\n\nBatch : " + res.batch + "\nDegree : " + res.degree + "\n\nApply Link in Bio " + "\n\n" + line + "\n.\n.\n.\n" + hash;

    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// generate linkedin post caption
export const generateLinkedinCaption = (res) => {
    const temp = res.title + "\n\nApply Link in comment\n\n" + res.link + "\n\n" + line + "\n.\n.\n.\n" + hash;

    navigator.clipboard.writeText(temp);
    showSuccessToast("Copied");
};

// formet the message for whatsapp
const generateCombinedWhatsAppmessage = (item, index) => {
    const msg = index + ". " + item.title.replace(/[A-Za-z]/g, translate) + "\nBatch : " + item.batch + "\nDegree : " + item.degree + "\n\nApply Here : " + item.link + "\n\n";

    return msg;
};

// copy message for whatsapp, message will be generated from multiple jobs
export const generateCombinedWhatsAppMessage = (selectedJobList) => {
    let message = "";
    selectedJobList.map((item, index) => {
        let msg = generateCombinedWhatsAppmessage(item, index + 1);
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
