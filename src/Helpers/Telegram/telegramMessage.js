import { showErrorToast, showSuccessToast } from "../toast";
import { translate } from "../textTransform";

const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;

const sendTelegramMsgHelper = async (channelName, title, batch, degree, link) => {
    const boldTitle = title.replace(/[A-Za-z]/g, translate);
    const msg = encodeURIComponent(
        boldTitle + "\n\nBatch: " + batch + "\n\nDegree: " + degree + "\n\nApply Link: " + link
    );

    return fetch(`https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${channelName}&text=${msg}&disable_web_page_preview=true&disable_notification=true`, { method: "POST" })
        .then(() => {
            showSuccessToast("Message sent");
        })
        .catch((err) => {
            showErrorToast("An error occurred", err);
        });
};

const sendTelegramMsgwithImageHelper = async (channelName, title, link, telegrambanner) => {
    const boldTitle = title.replace(/[A-Za-z]/g, translate);
    const encodedPhoto = encodeURIComponent(telegrambanner);
    const msg = encodeURIComponent(boldTitle + "\n\nApply Link: " + link);

    return fetch(`https://api.telegram.org/bot${BOT_API_KEY}/sendPhoto?chat_id=${channelName}&photo=${encodedPhoto}&caption=${msg}&disable_web_page_preview=true&disable_notification=true`, {
        method: "POST",
    })
        .then(() => {
            showSuccessToast("Message sent");
        })
        .catch((err) => {
            showErrorToast("An error occurred", err);
        });
};

export const handleTelegramSubmitHelper = (batch, telegrambanner, title, degree, link) => {
    if (batch.includes("2022")) {
        const channelName = process.env.REACT_APP_MY_CHANNEL_NAME_2022;
        if (telegrambanner === "N") sendTelegramMsgHelper(channelName, title, batch, degree, link);
        else sendTelegramMsgwithImageHelper(channelName, title, link, telegrambanner);
    }

    if (batch.includes("2023")) {
        const channelName = process.env.REACT_APP_MY_CHANNEL_NAME_2023;
        if (telegrambanner === "N") sendTelegramMsgHelper(channelName, title, batch, degree, link);
        else sendTelegramMsgwithImageHelper(channelName, title, link, telegrambanner);
    }

    const channelName = process.env.REACT_APP_MY_CHANNEL_NAME;
    if (telegrambanner === "N") sendTelegramMsgHelper(channelName, title, batch, degree, link);
    else sendTelegramMsgwithImageHelper(channelName, title, link, telegrambanner);
};
