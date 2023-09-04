import React, { useState, useContext, useEffect } from "react";

//import css
import styles from "./joblinks.module.scss";

// copy text to device
import useClipboard from "react-use-clipboard";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SendIcon from "@mui/icons-material/Send";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CircularProgress from "@mui/material/CircularProgress";

import { Button, Switch, FormControlLabel } from "@mui/material";

import { API } from "../../Backend";

// import components
import Adminlinkcard from "./Adminlinkcard";
import EditData from "./Editdata";
import { UserContext } from "../../Context/userContext";

const UpdateData = () => {
    const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;
    const [data, setData] = useState([]);
    const [flag, setFlag] = useState("");
    const [caption, setCaption] = useState("");
    const [isCopied, setCopied] = useClipboard(caption);
    const [email, setEmail] = useState("");
    const [isApiCalled, setIsApiCalled] = useState(false);
    const [showBitlyClick, setShowBitlyClick] = useState(false);

    const [captionline, setCaptionline] = useState([
        "Follow 👉 @careersattech to get regular Job and Internship updates.",
        "👉 Join interviewPrep in Telegram to get free resources for interview preparation.",
    ]);

    const [hashtags, setHashtags] = useState([
        "#offcampusdrive #placementdrive #jobsinindia #jobupdates #jobsforfreshers #offcampus #hiring #freshers #jobs #jobseek #jobsearch",
        "#codinginterview #jobsforfreshers #engineerjobs #freshersjobs #hiring #computerscienceengineering #hiringnow #jobseekers #placementdrive",
        "#offcampusdrive #freshers #offcampus #hiring #softwaredeveloper #campusplacements #placementdrive #hiringalert #jobupdates #engineerjobs ",
    ]);

    const sendTelegramMsg = (chanelName, item) => {
        const btitle = item.title.replace(/[A-Za-z]/g, translate);

        const msg =
            btitle +
            "%0A%0ABatch%20%3A%20" +
            item.batch +
            "%0A%0ADegree%20%3A%20" +
            item.degree +
            "%0A%0AApply Link%20%3A%20" +
            item.link;

        return fetch(
            `https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${chanelName}&text=${msg}&disable_web_page_preview=true&disable_notification=true`,
            {
                method: "POST",
            }
        )
            .then((res) => {
                toast("Message sent");
            })
            .catch((err) => {
                console.log("ERROR");
                toast.error("An error Occured");
            });
    };

    const context = useContext(UserContext);
    const isUserLogedIn = context.user?.email;

    useEffect(() => {
        setEmail(context.user?.email);
    }, []);

    const translate = (char) => {
        let diff;
        if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
        else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
        return String.fromCodePoint(char.codePointAt(0) + diff);
    };
    const sendTelegramMsgwithImage = (chanelName, item) => {
        const btitle = item.title.replace(/[A-Za-z]/g, translate);
        const msg = btitle + "%0A%0AApply Link%20%3A%20" + item.link;

        return fetch(
            `https://api.telegram.org/bot${BOT_API_KEY}/sendPhoto?chat_id=${chanelName}&photo=${item.jdbanner}&caption=${msg}&disable_web_page_preview=true&disable_notification=true`,
            {
                method: "POST",
            }
        )
            .then((res) => {
                console.log("SUCCESS");
                toast("Message sent");
            })
            .catch((err) => {
                console.log("ERROR", err);
                toast.error("An error Occured");
            });
    };

    const copylink = (item) => {
        const applyLink = item.companyName + "Apply Link : " + item.link;
        navigator.clipboard.writeText(applyLink);
        toast("Copied");
    };

    const handleTelegramSubmit = (item) => {
        console.log("ITEM", item);
        if (item.batch.includes("2022")) {
            const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2022;
            if (item.jdbanner === "N") sendTelegramMsg(MY_CHANNEL_NAME, item);
            else sendTelegramMsgwithImage(MY_CHANNEL_NAME, item);
        }
        if (item.jdbanner.includes("2023")) {
            const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2023;
            if (item.jdbanner === "N") sendTelegramMsg(MY_CHANNEL_NAME, item);
            else sendTelegramMsgwithImage(MY_CHANNEL_NAME, item);
        }
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME;
        if (item.jdbanner === "N") sendTelegramMsg(MY_CHANNEL_NAME, item);
        else sendTelegramMsgwithImage(MY_CHANNEL_NAME, item);
    };

    const date = new Date();
    const weeknum = date.getDay();
    const line = captionline[weeknum % 2];
    const hash = hashtags[weeknum % 3];

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setIsApiCalled(true);
        try {
            const res = await fetch(`${API}/jd/get/all`, {
                method: "GET",
            });
            const data = await res.json();
            setIsApiCalled(false);
            setData(data);
        } catch (error) {
            console.log(error);
            toast.error("An error loading occured");
            setIsApiCalled(false);
        }
    };

    const generateCaption = (id) => {
        const res = data.filter((item) => item._id === id);
        const temp =
            res[0].title +
            ". Visit Link in Bio to apply. 🔝" +
            "\n\nBatch : " +
            res[0].batch +
            "\nDegree : " +
            res[0].degree +
            "\n\nApply Link in Bio " +
            "\n\n" +
            line +
            "\n.\n.\n.\n" +
            hash;

        navigator.clipboard.writeText(temp);
        toast("Copied");
    };

    const generateLinkedinCaption = (id) => {
        const res = data.filter((item) => item._id === id);
        const temp =
            res[0].title + "\n\nApply Link in comment\n\n" + res[0].link + "\n\n" + line + "\n.\n.\n.\n" + hash;

        navigator.clipboard.writeText(temp);
        toast("Copied");
    };

    const downloadBanner = async (item) => {
        const image = await fetch(item.jdbanner);
        const imageBlog = await image.blob();
        const imageURL = URL.createObjectURL(imageBlog);

        const link = document.createElement("a");
        link.href = imageURL;
        link.download = item.companyName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClick = (id) => {
        if (flag) {
            setFlag("");
        } else {
            setFlag(id);
        }
    };

    // const sendIGCaption = () => {
    //     var url =
    //         "https://api.whatsapp.com/send?phone=" +
    //         "" +
    //         "&text=" +
    //         encodeURIComponent(message);

    //     return url;
    // };
    // const sendIGCaption = () => {
    //     var url =
    //         "https://api.whatsapp.com/send?phone=" +
    //         "" +
    //         "&text=" +
    //         encodeURIComponent(message);

    //     return url;
    // };
    const copyWhatsAppMessage = (item) => {
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
        navigator.clipboard.writeText(msg);
        toast("Copied");
    };

    return (
        <div className={styles.update_data_container}>
            <br />
            <div className={styles.headerContainer}>
                <h2 className={styles.adminpanel_title}>List of available Jobs - {data.length}</h2>
                {isApiCalled && (
                    <div className={styles.loaderCon}>
                        <CircularProgress size={80} />
                    </div>
                )}

                <FormControlLabel
                    onChange={() => setShowBitlyClick(!showBitlyClick)}
                    control={<Switch />}
                    label="Show Bit.ly click"
                />
            </div>
            <div>
                {data.map((item) => {
                    return (
                        <div key={item._id} className={styles.updatedata_con}>
                            <Adminlinkcard showBitlyClick={showBitlyClick} item={item} />

                            <div className={styles.adminlink_con}>
                                <div className={styles.btn_con}>
                                    <Button
                                        size="medium"
                                        disableElevation
                                        className={styles.btn}
                                        fullWidth
                                        disabled={item.jdbanner === "N"}
                                        onClick={() => downloadBanner(item)}
                                        variant="contained"
                                        endIcon={<CloudDownloadIcon />}
                                    >
                                        Banner
                                    </Button>
                                    <Button
                                        style={{ backgroundColor: "#0069ff" }}
                                        size="medium"
                                        className={styles.btn}
                                        fullWidth
                                        onClick={() => copylink(item)}
                                        disableElevation
                                        variant="contained"
                                    >
                                        Copy Link
                                    </Button>
                                </div>
                                <div className={styles.btn_con2}>
                                    {isUserLogedIn && (
                                        <Button
                                            disableElevation
                                            disabled={email !== "jhandique1999@gmail.com"}
                                            className={styles.btn}
                                            size="medium"
                                            onClick={() => handleTelegramSubmit(item)}
                                            variant="contained"
                                            endIcon={<SendIcon />}
                                        >
                                            Telegram
                                        </Button>
                                    )}
                                    <Button
                                        disableElevation
                                        className={styles.btn}
                                        size="medium"
                                        onClick={() => generateCaption(item._id)}
                                        variant="contained"
                                    >
                                        {isCopied ? "Copied" : " Caption (IG)"}
                                    </Button>
                                    <Button
                                        disableElevation
                                        className={styles.btn}
                                        size="medium"
                                        onClick={() => generateLinkedinCaption(item._id)}
                                        variant="contained"
                                    >
                                        {isCopied ? "Copied" : "Caption (Linkedin)"}
                                    </Button>
                                    <Button
                                        disableElevation
                                        size="medium"
                                        className={styles.btn}
                                        onClick={() => copyWhatsAppMessage(item)}
                                        variant="contained"
                                        endIcon={<WhatsAppIcon />}
                                    >
                                        Message
                                    </Button>
                                </div>
                            </div>
                            <br />
                            {item._id === flag && <EditData data={item} />}

                            {/* <Update item = {item}/>*/}
                            <hr className={styles.line} />
                        </div>
                    );
                })}
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpdateData;
