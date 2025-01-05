import React, { useState, useContext, useEffect } from "react";
import styles from "./joblinks.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import CustomDivider from "../../Components/Divider/Divider";

// mui imports
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Switch, FormControlLabel, CircularProgress, Checkbox, Button } from "@mui/material";

// import components
import Adminlinkcard from "./Components/Adminlinkcard/Adminlinkcard";
import { UserContext } from "../../Context/userContext";
import CustomTextField from "../../Components/Input/Textfield";

// helpers
import { handleTelegramSubmitHelper } from "../../Helpers/socialhandler";
import { copyWhatsAppMessage, generateCaptionHelper, generateLinkedinCaption, generateCombinedWhatsAppMessage, copyApplyLink } from "./Helpers";
import { showErrorToast } from "../../Helpers/toast";
import { generateImageFromLink } from "../../Helpers/imageHelpers";
import { get } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { updateJobDetails } from "../Addjobs/Helpers";
import { getJobDetailsHelper } from "../../Apis/Jobs";

const JobListing = () => {
    const [jobData, setJobData] = useState([]);
    const [isApiCalled, setIsApiCalled] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [filterdData, setFilterdData] = useState([]);
    const [selectedJob, setSelectedJob] = useState([]);
    const [pageno, setPageno] = useState(1);
    const [jobCount, setJobCount] = useState(0);

    const context = useContext(UserContext);

    // fetch job details
    const getJobDetailsData = async () => {
        setIsApiCalled(true);
        try {
            const params = {
                key: "filterData",
                value: "false",
            };
            const data = await getJobDetailsHelper(params, pageno);
            setIsApiCalled(false);
            setJobData((jobData) => [...jobData, ...data?.data]);
            setFilterdData((jobData) => [...jobData, ...data?.data]);
            setJobCount(data?.totalCount);
        } catch (error) {
            setIsApiCalled(false);
            showErrorToast("An error occured in fetching job details");
        }
    };

    // open new tab with banners (can select banner of multiple format)
    const downloadBanner = async (item) => {
        // window.location.href = `/canvas?jobid=${item._id}&companyname=${item.companyName}`;
        window.open(`/canvas?jobid=${item._id}&companyname=${item.companyName}`, "_blank");
    };

    // when focus out in input field filter the job data list
    const handleInputBlur = (searchedText) => {
        const filteredJobData = jobData.filter((item) => {
            return item.title.toLowerCase().includes(searchedText.toLowerCase());
        });
        setFilterdData(filteredJobData);
    };

    // select multiple jobs to generate message, caption
    const handleSelectJob = (item) => {
        setSelectedJob((prevSelectedJob) => {
            if (prevSelectedJob.some((job) => job._id === item._id)) {
                return prevSelectedJob.filter((job) => job._id !== item._id);
            } else {
                return [...prevSelectedJob, item];
            }
        });
    };

    const handleExpireJob = (jobdata) => {
        const updatedJobData = { ...jobdata, isActive: !jobdata?.isActive };
        setFilterdData(
            filterdData.map((item) => {
                if (item._id === jobdata._id) {
                    return { ...item, isActive: !jobdata?.isActive };
                }
                return item;
            })
        );
        updateJobDetails(updatedJobData, updatedJobData?._id);
    };

    // fetch job details on mount
    useEffect(() => {
        !isApiCalled && getJobDetailsData();
    }, [pageno]);

    function debounce(func, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }

    const handleLoadMore = () => {};

    // when input field is blured call api with company name field
    const handleCompanyNameBlur = debounce(async (companyName) => {
        if (companyName.trim() !== "") {
            setIsApiCalled(true);
            const params = { key: "companyname", value: companyName };
            const jobDetails = await getJobDetailsHelper(params);
            if (jobDetails) {
                setIsApiCalled(false);
                setFilterdData(jobDetails.data);
            }
        }
    }, 500);



    return (
        <div className={styles.update_data_container}>
            {jobData?.length === 0 && isApiCalled ? (
                <div className={styles.loaderCon}>
                    <CircularProgress size={80} />
                </div>
            ) : (
                <>
                    {/* header part  */}
                    <div className={styles.headerContainer}>
                        <h2 className={styles.adminpanel_title}>List of available Jobs - {jobCount}</h2>
                    </div>

                    <CustomTextField
                        onBlur={(val) => handleCompanyNameBlur(val)}
                        label="Company name"
                        value={companyName}
                        onChange={(val) => setCompanyName(val)}
                        fullWidth
                        className={styles.companyNameInput}
                    />
                    <div className={styles.captionButton_container}>
                        <Custombutton
                            disabled={selectedJob.length === 0}
                            onClick={() => generateCombinedWhatsAppMessage(selectedJob)}
                            label={`Message (${selectedJob.length})`}
                            endIcon={<WhatsAppIcon />}
                        />
                    </div>

                    <div>
                        {filterdData?.map((item) => {
                            return (
                                <div key={item._id} className={styles.updatedata_con}>
                                    <Adminlinkcard item={item} />

                                    {/* button section  */}
                                    <div className={styles.adminlink_con}>
                                        <div className={styles.btn_con}>
                                            <Checkbox onChange={() => handleSelectJob(item)} />
                                            <Custombutton style={{ backgroundColor: "green" }} disabled={item.jdbanner === "N"} onClick={() => downloadBanner(item)} label="Banner" />
                                            <Custombutton onClick={() => copyApplyLink(item)} label="Copy Link" />
                                            <FormControlLabel checked={!item?.isActive} onChange={() => handleExpireJob(item)} control={<Switch />} label="Job expired" />


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
                    <Custombutton style={{ backgroundColor: "green" }} size="large" fullWidth onClick={() => setPageno(pageno + 1)} label="Load more" />
                </>
            )}
        </div>
    );
};

export default JobListing;
