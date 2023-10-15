const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;
// import { ToastContainer, toast } from "react-toastify";


const translate = (char) => {
    let diff;
    if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
    else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
    return String.fromCodePoint(char.codePointAt(0) + diff);
};

const sendTelegramMsg = async (chanelName, title, batch, degree, link) => {
    const btitle = title.replace(/[A-Za-z]/g, translate);
    const msg =
        btitle + "%0A%0ABatch%20%3A%20" + batch + "%0A%0ADegree%20%3A%20" + degree + "%0A%0AApply Link%20%3A%20" + link;

    return fetch(
        `https://api.telegram.org/botw${BOT_API_KEY}/sendMessage?chat_id=${chanelName}&text=${msg}&disable_web_page_preview=true&disable_notification=true`,
        { method: "POST" }
    )
        .then((res) => {
            // toast("Message sent");
        })
        .catch((err) => {
            // toast.error("An error Occured", err);
        });
};

const sendTelegramMsgwithImage = async (chanelName, title, link, telegrambanner) => {
    const btitle = title.replace(/[A-Za-z]/g, translate);
    const msg = btitle + "%0A%0AApply Link%20%3A%20" + link;

    return fetch(
        `https://api.telegram.org/botw${BOT_API_KEY}/sendPhoto?chat_id=${chanelName}&photo=${telegrambanner}&caption=${msg}&disable_web_page_preview=true&disable_notification=true`,
        {
            method: "POST",
        }
    )
        .then((res) => {
            // toast("Message sent");
        })
        .catch((err) => {
            // toast.error("An error Occured", err);
        });
};

const handleTelegramSubmit = (batch, telegrambanner, title, degree, link) => {
    if (batch.includes("2022")) {
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2022;
        if (telegrambanner === "N") sendTelegramMsg(MY_CHANNEL_NAME, title, batch, degree, link);
        else sendTelegramMsgwithImage(MY_CHANNEL_NAME, title, link, telegrambanner);
    }

    if (batch.includes("2023")) {
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2023;
        if (telegrambanner === "N") sendTelegramMsg(MY_CHANNEL_NAME, title, batch, degree, link);
        else sendTelegramMsgwithImage(MY_CHANNEL_NAME, title, link, telegrambanner);
    }

    const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME;
    if (telegrambanner === "N") sendTelegramMsg(MY_CHANNEL_NAME, title, batch, degree, link);
    else sendTelegramMsgwithImage(MY_CHANNEL_NAME, title, link, telegrambanner);
};
