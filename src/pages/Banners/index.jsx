import React, { useEffect, useState } from "react";
import styles from "./banners.module.scss";

import Canvas from "../../Components/Canvas";
import Custombutton from "../../Components/Button/Custombutton";
import { CircularProgress } from "@mui/material";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { get } from "../../Helpers/request";
import { getCompanyDetailsHelper } from "../../widgets/Addjobs/Helpers";

function Banners() {
    const [jobdetails, setJobdetails] = useState();
    const [comapnyDetails, setComapnyDetails] = useState();
    const [bannerType, setBannerType] = useState("careersattech");
    
    const [ctaDetails, setCtaDetails] = useState({
        ctaTitle: "Apply Link : ",
        ctaLine: "Link in Bio (visit : careersat.tech)",
    });


    // get company details and job details
    const getQueryparam = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");
        const companyname = urlParams.get("companyname");
        if (!!jobId) {
            const jobdata = await get(`${apiEndpoint.getAllJobDetails}?id=${jobId}`);
            setJobdetails(jobdata);
        }
        if (!!companyname) {
            const companyData = await getCompanyDetailsHelper(companyname);
            setComapnyDetails(companyData);
        }
    };
    useEffect(() => {
        getQueryparam();
    }, []);

    return (
        <div className={styles.canvas}>
            <div className={styles.canvas_buttoncontainer}>
                <Custombutton variant={bannerType === "careersattech" ? "" : "outlined"} onClick={() => setBannerType("careersattech")} label="Careersattech banner" />
                <Custombutton variant={bannerType === "jobsattech" ? "" : "outlined"} onClick={() => setBannerType("jobsattech")} label="Jobsattech" />
                <Custombutton variant={bannerType === "linkedinbanner" ? "" : "outlined"} onClick={() => setBannerType("linkedinbanner")} label="Linkedin" />
                <Custombutton variant={bannerType === "carousel" ? "" : "outlined"} onClick={() => setBannerType("carousel")} label="Carousel" />
            </div>
            {!!jobdetails && !!comapnyDetails ? (
                <Canvas bannerType={bannerType} jobdetails={jobdetails} comapnyDetails={comapnyDetails} ctaDetails={ctaDetails} />
            ) : (
                <div className={styles.canvas_loader}>
                    <CircularProgress size={80} />
                </div>
            )}
        </div>
    );
}

export default Banners;
