import React, { useState, useContext, useEffect } from "react";
import useClipboard from "react-use-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//import css
import styles from "./joblinks.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import CustomDivider from "../../Components/Divider/Divider";

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

import { hashtags, captionline } from "./Helpers/staticdata";
import { handleTelegramSubmitHelper } from "../../Helpers/socialhandler";
import { copyWhatsAppMessage, generateCaptionHelper, generateLinkedinCaption } from "./Helpers";

const UpdateData = () => {
    const [data, setData] = useState([]);
    const [flag, setFlag] = useState("");
    const [caption, setCaption] = useState("");
    const [isCopied, setCopied] = useClipboard(caption);
    const [email, setEmail] = useState("");
    const [isApiCalled, setIsApiCalled] = useState(false);
    const [showBitlyClick, setShowBitlyClick] = useState(false);

    const context = useContext(UserContext);
    const isUserLogedIn = context.user?.email || true;

    useEffect(() => {
        setEmail(context.user?.email);
    }, []);

    const translate = (char) => {
        let diff;
        if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
        else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
        return String.fromCodePoint(char.codePointAt(0) + diff);
    };

    const copylink = (item) => {
        const applyLink = item.companyName + "Apply Link : " + item.link;
        navigator.clipboard.writeText(applyLink);
        toast("Copied");
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

    return (
        <div className={styles.update_data_container}>
            <div className={styles.headerContainer}>
                <h2 className={styles.adminpanel_title}>List of available Jobs - {data.length}</h2>
                {isApiCalled && (
                    <div className={styles.loaderCon}>
                        <CircularProgress size={80} />
                    </div>
                )}

                <FormControlLabel onChange={() => setShowBitlyClick(!showBitlyClick)} control={<Switch />} label="Show Bit.ly click count" />
            </div>
            <div>
                {data.map((item) => {
                    return (
                        <div key={item._id} className={styles.updatedata_con}>
                            <Adminlinkcard showBitlyClick={showBitlyClick} item={item} />

                            <div className={styles.adminlink_con}>
                                <div className={styles.btn_con}>
                                    <Custombutton disabled={item.jdbanner === "N"} onClick={() => downloadBanner(item)} endIcon={<CloudDownloadIcon />} label="Banner" />

                                    <Custombutton style={{ backgroundColor: "#0069ff" }} onClick={() => copylink(item)} label="Copy Link" />
                                </div>
                                <div className={styles.btn_con2}>
                                    {isUserLogedIn && (
                                        <Custombutton disabled={email !== "jhandique1999@gmail.com"} onClick={() => handleTelegramSubmitHelper(item)(item)} endIcon={<SendIcon />} label="Telegram" />
                                    )}

                                    <Custombutton onClick={() => generateCaptionHelper(item)} label={isCopied ? "Copied" : " Caption (IG)"} />
                                    <Custombutton onClick={() => generateLinkedinCaption(item)} label={isCopied ? "Copied" : "Caption (Linkedin)"} />
                                    <Custombutton onClick={() => copyWhatsAppMessage(item)} endIcon={<WhatsAppIcon />} label="Message" />
                                </div>
                            </div>
                            <br />
                            {item._id === flag && <EditData data={item} />}

                            <CustomDivider count />
                        </div>
                    );
                })}
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpdateData;
