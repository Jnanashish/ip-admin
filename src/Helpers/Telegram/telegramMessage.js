import { showErrorToast, showSuccessToast } from "../toast";
const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;

const translate = (char) => {
    let diff;
    if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
    else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
    return String.fromCodePoint(char.codePointAt(0) + diff);
};

const sendTelegramMsgHelper = async (chanelName, title, batch, degree, link) => {
    const btitle = title.replace(/[A-Za-z]/g, translate);
    // Encode user-controlled data to prevent URL injection
    const encodedBatch = encodeURIComponent(batch);
    const encodedDegree = encodeURIComponent(degree);
    const encodedLink = encodeURIComponent(link);
    const msg = encodeURIComponent(
        btitle + "\n\nBatch: " + encodedBatch + "\n\nDegree: " + encodedDegree + "\n\nApply Link: " + encodedLink
    );

    return fetch(`https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${chanelName}&text=${msg}&disable_web_page_preview=true&disable_notification=true`, { method: "POST" })
        .then((res) => {
            showSuccessToast("Message sent");
        })
        .catch((err) => {
            showErrorToast("An error occured", err);
        });
};

const sendTelegramMsgwithImageHelper = async (chanelName, title, link, telegrambanner) => {
    const btitle = title.replace(/[A-Za-z]/g, translate);
    // Encode user-controlled data to prevent URL injection
    const encodedLink = encodeURIComponent(link);
    const encodedPhoto = encodeURIComponent(telegrambanner);
    const msg = encodeURIComponent(btitle + "\n\nApply Link: " + encodedLink);

    return fetch(`https://api.telegram.org/bot${BOT_API_KEY}/sendPhoto?chat_id=${chanelName}&photo=${encodedPhoto}&caption=${msg}&disable_web_page_preview=true&disable_notification=true`, {
        method: "POST",
    })
        .then((res) => {
            showSuccessToast("Message sent");
        })
        .catch((err) => {
            showErrorToast("An error occured", err);
        });
};

export const handleTelegramSubmitHelper = (batch, telegrambanner, title, degree, link) => {
    if (batch.includes("2022")) {
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2022;
        if (telegrambanner === "N") sendTelegramMsgHelper(MY_CHANNEL_NAME, title, batch, degree, link);
        else sendTelegramMsgwithImageHelper(MY_CHANNEL_NAME, title, link, telegrambanner);
    }

    if (batch.includes("2023")) {
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2023;
        if (telegrambanner === "N") sendTelegramMsgHelper(MY_CHANNEL_NAME, title, batch, degree, link);
        else sendTelegramMsgwithImageHelper(MY_CHANNEL_NAME, title, link, telegrambanner);
    }

    const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME;
    if (telegrambanner === "N") sendTelegramMsgHelper(MY_CHANNEL_NAME, title, batch, degree, link);
    else sendTelegramMsgwithImageHelper(MY_CHANNEL_NAME, title, link, telegrambanner);
};
