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

    const getQueryparam = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");
        const companyname = urlParams.get("companyname");
        const companyid = urlParams.get("companyid");

        if (jobId && /^[a-f\d]{24}$/i.test(jobId)) {
            const params = {
                key: "id",
                value: jobId,
            };

            const jobdata = await getJobDetailsHelper(params);
            !!jobdata && jobdata?.data && setJobdetails(jobdata?.data);
        }

        if ((companyname || (companyid && /^[a-f\d]{24}$/i.test(companyid)))) {
            const companyData = await getCompanyDetailsHelper(companyname, companyid);
            !!companyData && Array.isArray(companyData) && setCompanyDetails(companyData[0]);
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

            {!!jobdetails && !!companyDetails ? (
                <Canvas bannerType={bannerType} jobdetails={jobdetails} companyDetails={companyDetails} />
            ) : (
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader />
                </div>
            )}
        </div>
    );
}

export default Banners;
