import React, { useState, useContext, useEffect } from "react";
import styles from "./joblinks.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import CustomDivider from "../../Components/Divider/Divider";

import SendIcon from "@mui/icons-material/Send";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { Switch, FormControlLabel, CircularProgress, Checkbox } from "@mui/material";

// import components
import Adminlinkcard from "./Adminlinkcard";
import { UserContext } from "../../Context/userContext";
import CustomTextField from "../../Components/Input/Textfield";

import { handleTelegramSubmitHelper } from "../../Helpers/socialhandler";
import { copyWhatsAppMessage, generateCaptionHelper, generateLinkedinCaption } from "./Helpers";
import { showErrorToast, showSuccessToast } from "../../Helpers/toast";

import { copyToClipBoard } from "../../Helpers/utility";
import { generateImageFromLink } from "../../Helpers/imageHelpers";
import { get } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { generateCombinedWhatsAppMessage } from "./Helpers";

const UpdateData = () => {
    const [jobData, setJobData] = useState([]);
    const [isApiCalled, setIsApiCalled] = useState(false);
    const [showBitlyClick, setShowBitlyClick] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [filterdData, setFilterdData] = useState([]);
    const [selectedJob, setSelectedJob] = useState([]);

    const context = useContext(UserContext);

    // copy job apply link
    const copylink = (item) => {
        const applyLink = item.companyName + " apply link : " + item.link;
        copyToClipBoard(applyLink);
        showSuccessToast("Copied");
    };

    // fetch job details
    const getJobDetailsData = async () => {
        setIsApiCalled(true);
        try {
            const data = await get(apiEndpoint.getAllJobDetails);
            setIsApiCalled(false);
            setJobData(data);
            setFilterdData(data);
        } catch (error) {
            setIsApiCalled(false);
            showErrorToast("An error loading occured");
        }
    };

    // download job details banner 
    const downloadBanner = async (item) => {
        generateImageFromLink(item.jdbanner, item.companyName);
    };

    // when focus out in input field filter the job data list 
    const handleInputBlur = (searchedText) => {
        const filteredJobData = jobData.filter((item) => {
            return item.title.toLowerCase().includes(searchedText.toLowerCase())
        })
        setFilterdData(filteredJobData);
    }

    const handleSelectJob = (item) => {
        setSelectedJob(prevSelectedJob => {
            if (prevSelectedJob.some(job => job._id === item._id)) {
                return prevSelectedJob.filter(job => job._id !== item._id);
            } else {
                return [...prevSelectedJob, item];
            }
        });
    }

    // fetch job details on mount
    useEffect(() => {
        !isApiCalled && getJobDetailsData();
    }, []);

    return (
        <div className={styles.update_data_container}>
            {/* header part  */}
            <div className={styles.headerContainer}>
                <h2 className={styles.adminpanel_title}>List of available Jobs - {jobData.length}</h2>
                {isApiCalled && (
                    <div className={styles.loaderCon}>
                        <CircularProgress size={80} />
                    </div>
                )}
                <FormControlLabel onChange={() => setShowBitlyClick(!showBitlyClick)} control={<Switch />} label="Show Bit.ly click count" />
            </div>

            <CustomTextField onBlur={(val) => handleInputBlur(val)} label="Company name" value={companyName} onChange={(val) => setCompanyName(val)} fullWidth className={styles.companyNameInput} />
            <div className={styles.captionButton_container}>
                <Custombutton onClick={()=>generateCombinedWhatsAppMessage(selectedJob)} label="Message" endIcon={<WhatsAppIcon />}/>
                {/* <Custombutton label="Instagram caption" />
                <Custombutton label="Linkedin caption" /> */}
            </div>

            <div>
                {filterdData?.map((item) => {
                    return (
                        <div key={item._id} className={styles.updatedata_con}>
                            <Adminlinkcard showBitlyClick={showBitlyClick} item={item} />

                            {/* button section  */}
                            <div className={styles.adminlink_con}>
                                <div className={styles.btn_con}>
                                    <Checkbox onChange={()=>handleSelectJob(item)}/>
                                    <Custombutton disabled={item.jdbanner === "N"} onClick={() => downloadBanner(item)} endIcon={<CloudDownloadIcon />} label="Banner" />
                                    <Custombutton style={{ backgroundColor: "#0069ff" }} onClick={() => copylink(item)} label="Copy Link" />
                                </div>
                                <div className={styles.btn_con2}>
                                    <Custombutton disabled={!context.isAdmin} onClick={() => handleTelegramSubmitHelper(item)} endIcon={<SendIcon />} label="Telegram" />
                                    <Custombutton onClick={() => generateCaptionHelper(item)} label="Caption (IG)" />
                                    <Custombutton onClick={() => generateLinkedinCaption(item)} label="Caption (Linkedin)" />
                                    <Custombutton onClick={() => copyWhatsAppMessage(item)} endIcon={<WhatsAppIcon />} label="Message" />
                                </div>
                            </div>
                            <CustomDivider count />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpdateData;
