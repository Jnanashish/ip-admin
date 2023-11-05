import { copyToClipBoard } from "../../../Helpers/utility";
import { ShowErrorToast, ShowSuccessToast, ShowInfoToast, ShowWarnToast } from "../../../Helpers/toast";

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

export const copyWhatsAppMessage = (item) => {
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

    copyToClipBoard(msg);
    ShowInfoToast("Copied");
};

export const generateCaptionHelper = (res) => {
    const temp = res.title + ". Visit Link in Bio to apply. 🔝" + "\n\nBatch : " + res.batch + "\nDegree : " + res.degree + "\n\nApply Link in Bio " + "\n\n" + line + "\n.\n.\n.\n" + hash;

    navigator.clipboard.writeText(temp);
    ShowSuccessToast("Copied");
};


export const generateLinkedinCaption = (res) => {
    const temp = res.title + "\n\nApply Link in comment\n\n" + res.link + "\n\n" + line + "\n.\n.\n.\n" + hash;

    navigator.clipboard.writeText(temp);
    ShowSuccessToast("Copied");
};
