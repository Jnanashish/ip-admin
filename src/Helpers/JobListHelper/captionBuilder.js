import { hashtagBank } from "./hashtagBank";
import {
    captionTemplates,
    hashtagsByTemplate,
} from "./captionTemplates";
import {
    deriveInsights,
    pickTemplate,
    pickCodeword,
} from "./jobInsights";

const DEFAULT_CLOSING = {
    alert: "Which one are you applying to first? Drop the company name 👇",
    codeFocused:
        "Which stack are you strongest in? Drop it in the comments 👇",
    curation: "Which company has been on your dream list? 👇",
    questionHook: "Drop the company you're applying to first 👇",
    tier1: "Which one is your #1? Drop the name 👇",
    internship: "Which one matches your skills? Drop the company 👇",
    spotlight: "Which team would you join? Drop the role number 👇",
};

// Instagram allows only 5 hashtags per post.
const MAX_HASHTAGS = 5;

// De-dupe + cap a whitespace-separated hashtag string to MAX_HASHTAGS.
const capHashtags = (str) =>
    Array.from(new Set(str.split(/\s+/).filter(Boolean)))
        .slice(0, MAX_HASHTAGS)
        .join(" ");

const pickHashtagsString = (insights, templateKey) => {
    const techTags = (hashtagBank.techStack[insights.role] ||
        hashtagBank.techStack.generic).slice(0, 4);

    const companyTagArr =
        insights.companyKeys.length === 1
            ? hashtagBank.company[insights.companyKeys[0]] || []
            : [];
    const companyTag = companyTagArr[0];

    const locationTagArr =
        insights.cityKeys.length === 1
            ? hashtagBank.location[insights.cityKeys[0]] || []
            : [];
    const locationTag = locationTagArr[0];

    const mapper =
        hashtagsByTemplate[templateKey] || hashtagsByTemplate.default;
    const tags = mapper({ techTags, companyTag, locationTag, insights });
    return capHashtags(Array.from(new Set(tags)).join(" "));
};

const replaceCodeword = (template, codeword) => {
    if (!codeword || codeword === "LINK") return template;
    return template.replace(/"LINK"/g, `"${codeword}"`);
};

const replaceClosingQuestion = (template, templateKey, closingQuestion) => {
    if (!closingQuestion) return template;
    const original = DEFAULT_CLOSING[templateKey];
    if (!original || !template.includes(original)) return template;
    return template.replace(original, closingQuestion);
};

export const buildCaption = ({
    jobs = [],
    templateKey,
    codeword,
    closingQuestion,
    customHashtags,
} = {}) => {
    const list = Array.isArray(jobs) ? jobs : [];
    if (!list.length) return "";

    const insights = deriveInsights(list);
    const finalTemplateKey = templateKey || pickTemplate(insights);
    const finalCodeword =
        codeword || pickCodeword(insights, finalTemplateKey);
    const hashtags =
        typeof customHashtags === "string" && customHashtags.trim()
            ? capHashtags(customHashtags.trim())
            : pickHashtagsString(insights, finalTemplateKey);

    const baseTemplate =
        captionTemplates[finalTemplateKey] || captionTemplates.alert;

    let out = baseTemplate;
    out = replaceClosingQuestion(out, finalTemplateKey, closingQuestion);
    out = replaceCodeword(out, finalCodeword);

    const replacements = {
        "{COUNT}": String(insights.count),
        "{ROLE}": insights.role,
        "{ROLE_CAP}": insights.roleCap,
        "{TECH}": insights.tech,
        "{COMPANIES}": insights.companies || "",
        "{JOBS_LIST}": insights.jobsList || "",
        "{BATCHES}": insights.batches || "",
        "{DEGREES}": insights.degrees || "",
        "{HASHTAGS}": hashtags,
    };

    for (const [token, value] of Object.entries(replacements)) {
        out = out.split(token).join(value);
    }

    return out;
};
