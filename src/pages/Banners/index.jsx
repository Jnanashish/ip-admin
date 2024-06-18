import React, { useEffect, useState } from "react";
import styles from "./banners.module.scss";

import Canvas from "../../Components/Canvas";
import Custombutton from "../../Components/Button/Custombutton";
import Loader from "../../Components/Loader";

import Backtodashboard from "../../widgets/Addjobs/Components/Backtodashboard";
import { getCompanyDetailsHelper } from "../../Apis/Company";
import { getJobDetailsHelper } from "../../Apis/Jobs";

function Banners() {
    const [jobdetails, setJobdetails] = useState();
    const [comapnyDetails, setComapnyDetails] = useState();
    const [bannerType, setBannerType] = useState("careersattech");

    // get company details and job details based on jobId and company name
    const getQueryparam = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");
        const companyname = urlParams.get("companyname");
        const companyid = urlParams.get("companyid");

        if (!!jobId) {
            const params = {
                key: "id",
                value: jobId,
            };

            const jobdata = await getJobDetailsHelper(params);
            !!jobdata && jobdata?.data && setJobdetails(jobdata?.data);
        }
        
        if (!!companyname || !!companyid) {
            const companyData = await getCompanyDetailsHelper(companyname, companyid);
            !!companyData && Array.isArray(companyData) && setComapnyDetails(companyData[0]);
        }
    };

    // check for query params in url
    useEffect(() => {
        getQueryparam();
    }, []);

    return (
        <div className={styles.canvas}>
            <Backtodashboard />
            <br /><br />

            <div className={styles.canvas_buttoncontainer}>
                <Custombutton variant={bannerType === "careersattech" ? "" : "outlined"} onClick={() => setBannerType("careersattech")} label="Careersattech banner" />
                <Custombutton variant={bannerType === "jobsattech" ? "" : "outlined"} onClick={() => setBannerType("jobsattech")} label="Jobsattech" />
                <Custombutton variant={bannerType === "linkedinbanner" ? "" : "outlined"} onClick={() => setBannerType("linkedinbanner")} label="Linkedin" />
                <Custombutton variant={bannerType === "carousel" ? "" : "outlined"} onClick={() => setBannerType("carousel")} label="Carousel" />
            </div>

            {/* show loader when job details are fetcing */}
            {!!jobdetails && !!comapnyDetails ? (
                <Canvas bannerType={bannerType} jobdetails={jobdetails} comapnyDetails={comapnyDetails} />
            ) : (
                <div className={styles.canvas_loader}>
                   <Loader/>
                </div>
            )}
        </div>
    );
}

export default Banners;
