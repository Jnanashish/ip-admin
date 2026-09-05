import { copyToClipBoard } from "../utility";
import { showSuccessToast } from "../toast";
import { translate } from "../textTransform";

import { hashtags, linkedinHashtags } from "./staticdata";

export { buildCaption } from "./captionBuilder";
export {
    deriveInsights,
    pickTemplate,
    pickCodeword,
    detectRole,
    detectTech,
    detectCity,
    companyKey,
} from "./jobInsights";
export {
    captionTemplates,
    hashtagsByTemplate,
    TEMPLATE_OPTIONS,
} from "./captionTemplates";
export { hashtagBank, avoidList, comboPacks } from "./hashtagBank";

const FRONTEND_URL =
    process.env.REACT_APP_FRONTEND_URL || "https://careersat.tech";

const date = new Date();
const weeknum = date.getDay();
const instagramHashtags = hashtags[weeknum % 3];
const linkedinHashtag = linkedinHashtags[weeknum % 3];

const formatList = (val) => {
    if (Array.isArray(val)) return val.join(", ");
    return val || "";
};

const stylize = (s = "") => s.replace(/[A-Za-z]/g, translate);

const getApplyLink = (item) => item?.applyLink || item?.link || "";

const getWebsiteLink = (item) => {
    if (!item?.slug) return getApplyLink(item);
    return `${FRONTEND_URL}/jobs/${item.slug}`;
};

const getRole = (item) => item?.title || item?.role || "";

export const messageTemplate = (item, platform, useWebsiteLink = false) => {
    const role = getRole(item);
    const batch = formatList(item?.batch);
    const degree = formatList(item?.degree);
    const link = useWebsiteLink ? getWebsiteLink(item) : getApplyLink(item);

    switch (platform) {
        case "whatsapp": {
            const titleStyled = stylize((item?.companyName || "") + role);
            return (
                titleStyled +
                "\nBatch : " + batch +
                "\nDegree : " + degree +
                "\n\nApply Here 👉 " + link
            );
        }
        case "instagram": {
            const igTitle =
                (item?.companyName || "") +
                " is hiring freshers for " +
                role +
                " role.";
            return (
                igTitle +
                "\n\nBatch : " + batch +
                "\nDegree : " + degree
            );
        }
        case "linkedin":
            return (
                role +
                "\n\nBatch :- " + batch +
                "\nDegree :- " + degree +
                "\n\nApply Link in comment\n\n" +
                getApplyLink(item) +
                "\n\n" +
                "\n.\n.\n.\n" + linkedinHashtag
            );
        case "applyLink":
            return (
                (item?.companyName || "") +
                " apply link : " +
                getApplyLink(item)
            );
        default:
            return "";
    }
};

const toList = (jobs) => (Array.isArray(jobs) ? jobs : jobs ? [jobs] : []);

// The build* functions return the text. The generate*/copy* wrappers below add
// the clipboard write and toast — screens that need to display the text (the
// digest previews it before you copy) call the builders directly.
export const buildInstagramCaption = (jobs) => {
    const list = toList(jobs);
    if (!list.length) return "";
    const header = "Comment 👉 Link to get the apply link in your DM \n";
    const blocks = list.map((item, i) => {
        const prefix = list.length > 1 ? `${i + 1}. ` : "";
        return prefix + messageTemplate(item, "instagram");
    });
    const footer =
        "\n\n👉 Visit link given in Bio to apply." +
        "\n\nFollow @careersattech to get regular Job updates." +
        "\n\n\n" + instagramHashtags;
    return header + blocks.join("\n\n") + footer;
};

export const generateInstagramCaption = (jobs) => {
    const text = buildInstagramCaption(jobs);
    if (!text) return;
    copyToClipBoard(text);
    showSuccessToast("Copied");
};

export const generateLinkedinCaption = (item) => {
    copyToClipBoard(messageTemplate(item, "linkedin"));
    showSuccessToast("Copied");
};

export const copyApplyLink = (item) => {
    copyToClipBoard(messageTemplate(item, "applyLink"));
    showSuccessToast("Copied");
};

export const copyWhatsAppMessage = (item) => {
    copyToClipBoard(messageTemplate(item, "whatsapp"));
    showSuccessToast("Copied");
};

export const buildWhatsAppMessage = (jobs, useWebsiteLink = false) => {
    const list = toList(jobs);
    if (!list.length) return "";
    return list
        .map(
            (item, i) =>
                `${i + 1}. ` +
                messageTemplate(item, "whatsapp", useWebsiteLink) +
                "\n\n"
        )
        .join("");
};

export const generateWhatsAppMessage = (jobs, useWebsiteLink = false) => {
    const message = buildWhatsAppMessage(jobs, useWebsiteLink);
    if (!message) return;
    copyToClipBoard(message);
    showSuccessToast("Copied");
};
