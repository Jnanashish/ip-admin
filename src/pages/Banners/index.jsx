import React, { useEffect, useState } from "react";

import Canvas from "../../Components/Canvas";
import Loader from "../../Components/Loader";
import { Button } from "Components/ui/button";
import { cn } from "lib/utils";

import { getCompanyDetailsHelper } from "../../Apis/Company";
import { getJobDetailsHelper } from "../../widgets/Addjobs/Helpers";

function Banners() {
    const [jobdetails, setJobdetails] = useState();
    const [companyDetails, setCompanyDetails] = useState();
    const [bannerType, setBannerType] = useState("careersattech");
    const [loading, setLoading] = useState(true);

    const getQueryparam = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");
        const companyname = urlParams.get("companyname");
        const companyid = urlParams.get("companyid");

        const hasJobParam = jobId && /^[a-f\d]{24}$/i.test(jobId);
        const hasCompanyParam = companyname || (companyid && /^[a-f\d]{24}$/i.test(companyid));

        if (!hasJobParam && !hasCompanyParam) {
            setLoading(false);
            return;
        }

        try {
            if (hasJobParam) {
                const jobdata = await getJobDetailsHelper({ key: "id", value: jobId });
                !!jobdata && jobdata?.data && setJobdetails(jobdata?.data);
            }

            if (hasCompanyParam) {
                const companyData = await getCompanyDetailsHelper(companyname, companyid);
                !!companyData && Array.isArray(companyData) && companyData[0] && setCompanyDetails(companyData[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getQueryparam();
    }, []);

    const bannerOptions = [
        { key: "careersattech", label: "CareersAtTech" },
        { key: "jobsattech", label: "JobsAtTech" },
        { key: "linkedinbanner", label: "LinkedIn" },
        { key: "carousel", label: "Carousel" },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Banner Generator</h2>
            <p className="text-sm text-muted-foreground mb-6">Generate social media banners for job postings</p>

            <div className="flex flex-wrap gap-1 mb-8 p-1 bg-muted rounded-lg w-fit">
                {bannerOptions.map((item) => (
                    <Button
                        key={item.key}
                        variant={bannerType === item.key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setBannerType(item.key)}
                        className={cn("capitalize", bannerType === item.key && "shadow-sm")}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader />
                </div>
            ) : !!jobdetails && !!companyDetails ? (
                <Canvas bannerType={bannerType} jobdetails={jobdetails} companyDetails={companyDetails} />
            ) : (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="max-w-md text-center border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold tracking-tight mb-2">No job selected</h3>
                        <p className="text-sm text-muted-foreground">
                            Open this page from a job listing, or append <span className="font-mono text-xs">?jobid=&lt;id&gt;&amp;companyname=&lt;name&gt;</span> to the URL to generate a banner.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Banners;
