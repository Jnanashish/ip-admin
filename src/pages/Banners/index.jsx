import React, { useEffect, useState } from "react";

import Canvas from "../../Components/Canvas";
import Custombutton from "../../Components/Button/Custombutton";
import Loader from "../../Components/Loader";

import { getCompanyDetailsHelper } from "../../Apis/Company";
import { getJobDetailsHelper } from "../../widgets/Addjobs/Helpers";

function Banners() {
    const [jobdetails, setJobdetails] = useState();
    const [comapnyDetails, setComapnyDetails] = useState();
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
            !!companyData && Array.isArray(companyData) && setComapnyDetails(companyData[0]);
        }
    };

    useEffect(() => {
        getQueryparam();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Banner Generator</h2>

            <div className="flex flex-wrap gap-3 mb-6">
                <Custombutton variant={bannerType === "careersattech" ? "" : "outlined"} onClick={() => setBannerType("careersattech")} label="Careersattech banner" fullWidth={false} />
                <Custombutton variant={bannerType === "jobsattech" ? "" : "outlined"} onClick={() => setBannerType("jobsattech")} label="Jobsattech" fullWidth={false} />
                <Custombutton variant={bannerType === "linkedinbanner" ? "" : "outlined"} onClick={() => setBannerType("linkedinbanner")} label="Linkedin" fullWidth={false} />
                <Custombutton variant={bannerType === "carousel" ? "" : "outlined"} onClick={() => setBannerType("carousel")} label="Carousel" fullWidth={false} />
            </div>

            {!!jobdetails && !!comapnyDetails ? (
                <Canvas bannerType={bannerType} jobdetails={jobdetails} comapnyDetails={comapnyDetails} />
            ) : (
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader />
                </div>
            )}
        </div>
    );
}

export default Banners;
