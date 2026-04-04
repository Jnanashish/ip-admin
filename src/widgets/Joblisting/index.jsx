import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";

import Custombutton from "../../Components/Button/Custombutton";
import CustomDivider from "../../Components/Divider/Divider";

// icons
import { Send, MessageCircle, Search } from "lucide-react";

// shadcn
import { Checkbox } from "Components/ui/checkbox";
import { Switch } from "Components/ui/switch";
import { Input } from "Components/ui/input";
import { Card, CardContent } from "Components/ui/card";
import { Badge } from "Components/ui/badge";
import { Button } from "Components/ui/button";

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
        <Card key={item._id} className="mb-4">
            <CardContent className="pt-6">
                <Adminlinkcard item={item} />
                <div className="flex flex-row w-full justify-between flex-wrap gap-y-2.5 mt-3 max-lg:flex-col">
                    <div className="flex flex-row items-center gap-2.5 py-2.5 flex-wrap [&_button]:capitalize">
                        <Checkbox onCheckedChange={() => handleSelectJob(item)} />
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={item.jdbanner === "N"}
                            onClick={() => downloadBanner(item)}
                        >
                            Banner
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyApplyLink(item)}>
                            Copy Link
                        </Button>
                        <div className="flex items-center gap-2">
                            <Switch checked={!item?.isActive} onCheckedChange={() => handleExpireJob(item)} />
                            <span className="text-sm text-muted-foreground">Expired</span>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2.5 py-2.5 flex-wrap [&_button]:capitalize max-lg:flex-col max-lg:items-start max-lg:gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!context.isAdmin}
                            onClick={() => handleTelegramSubmitHelper(item)}
                        >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Telegram
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => genererateInstagramCaption(item)}>
                            Caption (IG)
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => generateLinkedinCaption(item)}>
                            Caption (LinkedIn)
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyWhatsAppMessage(item)}>
                            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                            Message
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    ), [context.isAdmin, handleExpireJob, handleSelectJob]);

    return (
        <div className="[&_button]:capitalize">
            {jobData?.length === 0 && isApiCalled ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Job Dashboard</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {jobCount} jobs available
                            </p>
                        </div>
                        {selectedJob.length > 0 && (
                            <Badge variant="secondary" className="text-sm">
                                {selectedJob.length} selected
                            </Badge>
                        )}
                    </div>

                    <Card className="mb-6">
                        <CardContent className="pt-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by company name or use 'id' prefix for job ID"
                                    value={companyName}
                                    onChange={(e) => {
                                        setCompanyName(e.target.value);
                                        handleCompanyNameBlur(e.target.value);
                                    }}
                                    className="pl-9"
                                    disabled={isApiCalled}
                                />
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={selectedJob.length === 0}
                                    onClick={() => generateWhatsAppMessage(selectedJob)}
                                >
                                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Message ({selectedJob.length})
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={selectedJob.length === 0}
                                    onClick={() => generateWhatsAppMessage(selectedJob, true)}
                                >
                                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Website Link ({selectedJob.length})
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        {filteredJobs?.map(renderJobCard)}
                    </div>

                    <Button
                        className="w-full mt-4"
                        size="lg"
                        onClick={() => setPageno(prev => prev + 1)}
                    >
                        Load more
                    </Button>
                </>
            )}
        </div>
    );
};

export default React.memo(JobListing);
