import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import styles from "./joblinks.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import CustomDivider from "../../Components/Divider/Divider";

// mui imports
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Switch, FormControlLabel, CircularProgress, Checkbox } from "@mui/material";

// import components
import Adminlinkcard from "./Components/Adminlinkcard/Adminlinkcard";
import { UserContext } from "../../Context/userContext";
import CustomTextField from "../../Components/Input/Textfield";

// helpers
import { handleTelegramSubmitHelper } from "../../Helpers/Telegram/telegramMessage";
import { copyWhatsAppMessage, genererateInstagramCaption, generateLinkedinCaption, generateWhatsAppMessage, copyApplyLink } from "../../Helpers/JobListHelper";
import { showErrorToast } from "../../Helpers/toast";
import { updateJobDetails } from "../Addjobs/Helpers";
import { getJobDetailsHelper } from "../Addjobs/Helpers";

const JobListing = () => {
    // Data states
    const [jobData, setJobData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [jobCount, setJobCount] = useState(0);

    // UI states
    const [isApiCalled, setIsApiCalled] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [pageno, setPageno] = useState(1);

    // Selection state
    const [selectedJob, setSelectedJob] = useState([]);

    const context = useContext(UserContext);

    // Memoized job filtering
    const filteredJobs = useMemo(() => {
        return filteredData;
    }, [filteredData]);

    // fetch job details
    const getJobDetailsData = useCallback(async () => {
        if (isApiCalled) return;
        
        setIsApiCalled(true);
        try {
            const params = {
                key: "filterData",
                value: "false",
            };
            const data = await getJobDetailsHelper(params, pageno);
            setJobData(prev => [...prev, ...data?.data]);
            setFilteredData(prev => [...prev, ...data?.data]);
            setJobCount(data?.totalCount);
            setIsApiCalled(false);
        } catch (error) {
            setIsApiCalled(false);
            showErrorToast("An error occured in fetching job details");
        }
    }, [pageno, isApiCalled]);

    // open new tab with banners (can select banner of multiple format)
    const downloadBanner = async (item) => {
        window.open(`/canvas?jobid=${item._id}&companyname=${item.companyName}`, "_blank");
    };

    // when focus out in input field filter the job data list
    const handleInputBlur = (searchedText) => {
        const filteredJobData = jobData.filter((item) => {
            return item.title.toLowerCase().includes(searchedText.toLowerCase());
        });
        setFilteredData(filteredJobData);
    };

    // select multiple jobs to generate message, caption
    const handleSelectJob = useCallback((item) => {
        setSelectedJob(prev => 
            prev.some(job => job._id === item._id)
                ? prev.filter(job => job._id !== item._id)
                : [...prev, item]
        );
    }, []);

    // Memoized job expiration handler
    const handleExpireJob = useCallback((jobdata) => {
        const updatedJobData = { ...jobdata, isActive: !jobdata?.isActive };
        setFilteredData(prev => 
            prev.map(item => 
                item._id === jobdata._id 
                    ? { ...item, isActive: !jobdata?.isActive }
                    : item
            )
        );
        updateJobDetails(updatedJobData, updatedJobData?._id);
    }, []);

    // Memoized company name search handler
    const handleCompanyNameBlur = useCallback(
        debounce(async (searchText) => {
            if (searchText.trim() !== "") {
                setIsApiCalled(true);
                try {
                    let params;
                    if (searchText.trim().toLowerCase().startsWith("id")) {
                        const jobId = searchText.slice(2).trim();
                        if (jobId) {
                            params = { key: "jobId", value: jobId };
                        } else {
                            showErrorToast("Please enter a job ID after 'id:'");
                            setIsApiCalled(false);
                            return;
                        }
                    } else {
                        params = { key: "companyname", value: searchText };
                    }

                    const jobDetails = await getJobDetailsHelper(params);
                    if (jobDetails) {
                        setJobData(jobDetails.data);
                        setFilteredData(jobDetails.data);
                        setJobCount(jobDetails.totalCount || 0);
                        setIsApiCalled(false);
                    }
                } catch (error) {
                    setIsApiCalled(false);
                    showErrorToast("An error occurred while searching jobs");
                }
            } else {
                setJobData([]);
                setFilteredData([]);
                setPageno(1);
                setIsApiCalled(false);
                getJobDetailsData();
            }
        }, 500),
        []
    );

    // fetch job details on mount and page change
    useEffect(() => {
        getJobDetailsData();
    }, [pageno]); // Only depend on pageno changes

    function debounce(func, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }

    // Memoized job card render function
    const renderJobCard = useCallback((item) => (
        <div key={item._id} className={styles.updatedata_con}>
            <Adminlinkcard item={item} />
            <div className={styles.adminlink_con}>
                <div className={styles.btn_con}>
                    <Checkbox onChange={() => handleSelectJob(item)} />
                    <Custombutton 
                        style={{ backgroundColor: "green" }} 
                        disabled={item.jdbanner === "N"} 
                        onClick={() => downloadBanner(item)} 
                        label="Banner" 
                    />
                    <Custombutton onClick={() => copyApplyLink(item)} label="Copy Link" />
                    <FormControlLabel 
                        checked={!item?.isActive} 
                        onChange={() => handleExpireJob(item)} 
                        control={<Switch />} 
                        label="Job expired" 
                    />
                </div>
                <div className={styles.btn_con2}>
                    <Custombutton 
                        disabled={!context.isAdmin} 
                        onClick={() => handleTelegramSubmitHelper(item)} 
                        endIcon={<SendIcon />} 
                        label="Telegram" 
                    />
                    <Custombutton onClick={() => genererateInstagramCaption(item)} label="Caption (IG)" />
                    <Custombutton onClick={() => generateLinkedinCaption(item)} label="Caption (Linkedin)" />
                    <Custombutton onClick={() => copyWhatsAppMessage(item)} endIcon={<WhatsAppIcon />} label="Message" />
                </div>
            </div>
            <CustomDivider count />
        </div>
    ), [context.isAdmin, handleExpireJob, handleSelectJob]);

    return (
        <div className={styles.update_data_container}>
            {jobData?.length === 0 && isApiCalled ? (
                <div className={styles.loaderCon}>
                    <CircularProgress size={80} />
                </div>
            ) : (
                <>
                    <div className={styles.headerContainer}>
                        <h2 className={styles.adminpanel_title}>List of available Jobs - {jobCount}</h2>
                    </div>

                    <CustomTextField
                        onBlur={(val) => handleCompanyNameBlur(val)}
                        label="Search by company name or use 'id' prefix for job ID (e.g., idABC123)"
                        value={companyName}
                        onChange={(val) => setCompanyName(val)}
                        fullWidth
                        className={styles.companyNameInput}
                        placeholder="Enter company name or 'id' followed by job ID"
                        disabled={isApiCalled}
                    />

                    <div className={styles.captionButton_container}>
                        <Custombutton 
                            disabled={selectedJob.length === 0} 
                            onClick={() => generateWhatsAppMessage(selectedJob)} 
                            label={`Message (${selectedJob.length})`} 
                            endIcon={<WhatsAppIcon />} 
                        />
                        <Custombutton
                            disabled={selectedJob.length === 0}
                            onClick={() => generateWhatsAppMessage(selectedJob, true)}
                            label={`Website link Message (${selectedJob.length})`}
                            endIcon={<WhatsAppIcon />}
                        />
                    </div>

                    <div>
                        {filteredJobs?.map(renderJobCard)}
                    </div>
                    
                    <Custombutton 
                        style={{ backgroundColor: "green" }} 
                        size="large" 
                        fullWidth 
                        onClick={() => setPageno(prev => prev + 1)} 
                        label="Load more" 
                    />
                </>
            )}
        </div>
    );
};

export default React.memo(JobListing);
