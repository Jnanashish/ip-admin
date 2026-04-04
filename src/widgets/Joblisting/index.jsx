import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";

import Custombutton from "../../Components/Button/Custombutton";
import CustomDivider from "../../Components/Divider/Divider";

// icons
import { Send } from "lucide-react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// shadcn
import { Checkbox } from "Components/ui/checkbox";
import { Switch } from "Components/ui/switch";

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
        <div key={item._id}>
            <Adminlinkcard item={item} />
            <div className="flex flex-row w-full justify-between flex-wrap gap-y-2.5 mb-5 max-lg:flex-col">
                <div className="flex flex-row justify-between gap-2.5 py-2.5 [&_button]:px-4 [&_button]:py-1.5 [&_button]:capitalize">
                    <Checkbox onCheckedChange={() => handleSelectJob(item)} />
                    <Custombutton
                        style={{ backgroundColor: "green" }}
                        disabled={item.jdbanner === "N"}
                        onClick={() => downloadBanner(item)}
                        label="Banner"
                    />
                    <Custombutton onClick={() => copyApplyLink(item)} label="Copy Link" />
                    <div className="flex items-center gap-2">
                        <Switch checked={!item?.isActive} onCheckedChange={() => handleExpireJob(item)} />
                        <span>Job expired</span>
                    </div>
                </div>
                <div className="flex flex-row justify-between gap-2.5 py-2.5 [&_button]:px-4 [&_button]:py-1.5 [&_button]:capitalize max-lg:flex-col max-lg:gap-2.5">
                    <Custombutton
                        disabled={!context.isAdmin}
                        onClick={() => handleTelegramSubmitHelper(item)}
                        endIcon={<Send size={16} />}
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
        <div className="px-[50px] py-10 [&_button]:capitalize max-lg:px-5">
            {jobData?.length === 0 && isApiCalled ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : (
                <>
                    <div className="flex justify-between max-lg:block">
                        <h2 className="mb-5 text-blue-600 text-xl max-lg:px-4">List of available Jobs - {jobCount}</h2>
                    </div>

                    <CustomTextField
                        onBlur={(val) => handleCompanyNameBlur(val)}
                        label="Search by company name or use 'id' prefix for job ID (e.g., idABC123)"
                        value={companyName}
                        onChange={(val) => setCompanyName(val)}
                        fullWidth
                        className="bg-white rounded mb-5"
                        placeholder="Enter company name or 'id' followed by job ID"
                        disabled={isApiCalled}
                    />

                    <div className="flex gap-5 mb-5">
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
