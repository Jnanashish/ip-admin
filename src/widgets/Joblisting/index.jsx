import React, { useState, useContext, useEffect, useCallback, useRef } from "react";

import CustomButton from "../../Components/Button/CustomButton";
import CustomDivider from "../../Components/Divider/Divider";

// icons
import { Send, MessageCircle, Search, Loader2, RefreshCw } from "lucide-react";

// shadcn
import { Checkbox } from "Components/ui/checkbox";
import { Switch } from "Components/ui/switch";
import { Input } from "Components/ui/input";
import { Card, CardContent } from "Components/ui/card";
import { Badge } from "Components/ui/badge";
import { Button } from "Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "Components/ui/dialog";

// import components
import AdminLinkCard from "./Components/AdminLinkCard/AdminLinkCard";
import { UserContext } from "../../Context/userContext";
import CustomTextField from "../../Components/Input/Textfield";

// helpers
import { handleTelegramSubmitHelper } from "../../Helpers/Telegram/telegramMessage";
import { copyWhatsAppMessage, generateInstagramCaption, generateLinkedinCaption, generateWhatsAppMessage, copyApplyLink } from "../../Helpers/JobListHelper";
import { showErrorToast, showSuccessToast } from "../../Helpers/toast";
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

    // Backfill jdpage state
    const [showBackfillConfirm, setShowBackfillConfirm] = useState(false);
    const [backfillLoading, setBackfillLoading] = useState(false);
    const [backfillProgress, setBackfillProgress] = useState({ done: 0, total: 0, failed: 0 });

    const context = useContext(UserContext);

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
            showErrorToast("An error occurred in fetching job details");
        }
    }, [pageno, isApiCalled]);

    // open new tab with banners (can select banner of multiple format)
    const downloadBanner = async (item) => {
        window.open(`/canvas?jobid=${encodeURIComponent(item._id)}&companyname=${encodeURIComponent(item.companyName)}`, "_blank");
    };

    // when focus out in input field filter the job data list
    const handleInputBlur = (searchedText) => {
        const filteredJobData = jobData.filter((item) => {
            return item?.title?.toLowerCase()?.includes(searchedText.toLowerCase());
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

    // Backfill jdpage="true" on the latest 80 jobs
    const handleBackfillJdpage = useCallback(async () => {
        setBackfillLoading(true);
        setBackfillProgress({ done: 0, total: 0, failed: 0 });
        try {
            const res = await getJobDetailsHelper({ key: "filterData", value: "false" }, 1, 80);
            const jobs = res?.data || [];
            if (!jobs.length) {
                showErrorToast("No jobs found to backfill");
                return;
            }
            setBackfillProgress({ done: 0, total: jobs.length, failed: 0 });
            let done = 0;
            let failed = 0;
            for (const job of jobs) {
                const result = await updateJobDetails({ jdpage: true }, job._id);
                if (result?.status === 200) done += 1;
                else failed += 1;
                setBackfillProgress({ done, total: jobs.length, failed });
            }
            showSuccessToast(`Backfill complete: ${done} updated${failed ? `, ${failed} failed` : ""}`);
        } catch (err) {
            showErrorToast("Backfill failed. Check console for details.");
            console.error("Backfill jdpage failed:", err);
        } finally {
            setBackfillLoading(false);
            setShowBackfillConfirm(false);
        }
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

    // Debounced company name search handler
    const debounceTimerRef = useRef(null);
    const handleCompanyNameBlur = useCallback((searchText) => {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(async () => {
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
            }
        }, 500);
    }, []);

    // fetch job details on mount and page change
    useEffect(() => {
        getJobDetailsData();
    }, [pageno]);

    // Memoized job card render function
    const renderJobCard = useCallback((item) => (
        <Card key={item._id} className="mb-4 transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
                <AdminLinkCard item={item} />
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
                            variant="default"
                            size="sm"
                            disabled={!context.isAdmin}
                            onClick={() => handleTelegramSubmitHelper(item)}
                        >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Telegram
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => generateInstagramCaption(item)}>
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
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Job Dashboard</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {jobCount} jobs available
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedJob.length > 0 && (
                                <Badge variant="secondary" className="text-sm">
                                    {selectedJob.length} selected
                                </Badge>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBackfillConfirm(true)}
                                disabled={backfillLoading}
                            >
                                {backfillLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Backfill jdpage (last 80)
                            </Button>
                        </div>
                    </div>

                    <Card className="mb-8 border-dashed">
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
                        {filteredData?.map(renderJobCard)}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full mt-6"
                        size="lg"
                        onClick={() => setPageno(prev => prev + 1)}
                    >
                        Load more
                    </Button>
                </>
            )}

            <Dialog open={showBackfillConfirm} onOpenChange={(open) => { if (!backfillLoading) setShowBackfillConfirm(open); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backfill jdpage</DialogTitle>
                        <DialogDescription>
                            This will set <span className="font-mono">jdpage="true"</span> on the 80 most recent jobs, fixing the JD page redirect for scraped jobs that were saved with a null/false value.
                        </DialogDescription>
                    </DialogHeader>
                    {backfillLoading && backfillProgress.total > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Updated {backfillProgress.done}/{backfillProgress.total}
                            {backfillProgress.failed > 0 && ` — ${backfillProgress.failed} failed`}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBackfillConfirm(false)} disabled={backfillLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleBackfillJdpage} disabled={backfillLoading}>
                            {backfillLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Run Backfill
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default React.memo(JobListing);
