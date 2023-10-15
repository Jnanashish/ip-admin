import Compressor from "compressorjs";
import html2canvas from "html2canvas";

import { ShowErrorToast, ShowInfoToast, ShowWarnToast, ShowSuccessToast } from "./toast";
import { post, get } from "./request";
import { apiEndpoint } from "./apiEndpoints";

const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;
const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME;
const TOKEN = process.env.REACT_APP_TOKEN;

// short long job link with bitly
export const shortenurl = async (link) => {
    const res = await fetch("https://api-ssl.bitly.com/v4/shorten", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ long_url: link, domain: "bit.ly" }),
    });
    const json = await res.json();
    const data = await json.link;
    if (data) return data;
    return link;
};

// send message to telegram
export const sendMessage = (msg) => {
    fetch(`https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${MY_CHANNEL_NAME}&text=${msg}&disable_web_page_preview=true&disable_notification=true`, {
        method: "POST",
    })
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return err;
        });
};

export const getLinkClickCount = async (link) => {
    const linkWithoutHttps = link.replace(/^https:\/\//, "");
    const res = await fetch(`https://api-ssl.bitly.com/v4/bitlinks/${linkWithoutHttps}/clicks?unit=month`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });
    const json = await res.json();
    return json;
};

// ---------------------------------------------------------
// copy any texy to clipboard
export const copyToClipBoard = (text) => {
    navigator.clipboard.writeText(text);
};

// ---------------------------------------------------------
// upload company logo - take company logo cdn url and name
export const uploadCompanyLogoHelper = async (companyName, companyBigLogoUrl, companySmallLogoUrl) => {
    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("largeLogo", companyBigLogoUrl);
    formData.append("smallLogo", companySmallLogoUrl);

    const res = await post(apiEndpoint.addCompanyLogo, formData);

    if (res) {
        ShowSuccessToast("Company logo added Successfully");
    } else {
        ShowErrorToast("An error Occured");
    }

    return res;
};
