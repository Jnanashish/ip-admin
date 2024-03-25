import React, { useContext, useEffect, useState } from "react";
import styles from "./addjobs.module.scss";

// custom components
import Canvas from "../../Components/Canvas";

import CustomTextField from "../../Components/Input/Textfield";
import CustomCKEditor from "../../Components/CkEditor/CkEditor";
import CustomDivider from "../../Components/Divider/Divider";
import Backtodashboard from "./Components/Backtodashboard";

// mui import
import { TextField, Button, IconButton, FormGroup, Switch, FormControlLabel } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CircularProgress from "@mui/material/CircularProgress";

// import helpers
import { shortenurl } from "../../Helpers/utility";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";

import { degreeOptions, batchOptions, expOptions, locOptions, jobTypeOptions, companyTypeOptions } from "./Helpers/staticdata";
import { downloadImagefromCanvasHelper, generateImageCDNlinkHelper, uploadBannertoCDNHelper } from "../../Helpers/imageHelpers";
import { generateLastDatetoApplyHelper, getCompanyDetailsHelper, addJobDataHelper, mapExperiencetoBatch } from "./Helpers";
import { copyToClipBoard, uploadCompanyLogoHelper } from "../../Helpers/utility";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";

import { showErrorToast } from "../../Helpers/toast";

const AddjobsComponent = () => {
    const [isAdmin, setIsAdmin] = useState(true);
    const [igbannertitle, setIgbannertitle] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [companyLogoSize, setCompanyLogoSize] = useState(0);

    const [comapnyDetails, setComapnyDetails] = useState({
        name: "",
        info: "",
        linkedinLink: "",
        careersPageLink: "",
        companyType: "",
        smallLogoUrl: "",
        bigLogoUrl: "",
    });

    useEffect(() => {
        console.log("comapnyDetails", comapnyDetails);
    }, [comapnyDetails]);

    const [jobdetails, setJobdetails] = useState({
        degree: "B.E / B.Tech / M.Tech",
        batch: "2022 / 2021 / 2020",
        experience: "0 - 2 years",
        location: "Bengaluru",
        salary: "N",
        jdpage: false,
        companyName: "",
        title: "",
        companytype: isAdmin ? "product" : "service",
        lastdate: null,
        role: "",
        jobtype: "Full time",
        jobdesc: "N",
        eligibility: "N",
        responsibility: "N",
        skills: "N",
        aboutCompany: "N",
        jdBanner: "N",
        link: "",
        imagePath: "",
    });

    const [canvasCss, setCanvasCss] = useState({
        imgsize: "60%",
        imgleft: "0px",
        paddingtop: "0px",
        paddingbottom: "0px",
    });

    const [ctaDetails, setCtaDetails] = useState({
        ctaTitle: "Apply Link : ",
        ctaLine: "Link in Bio (visit : careersat.tech)",
    });

    const context = useContext(UserContext);
    const canvasId = isAdmin ? "htmlToCanvas" : "jobsattechCanvas";
    const navigate = useNavigate();

    // handle job details input change
    const handleJobdetailsChange = (key, value) => {
        setJobdetails((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    useEffect(() => {
        console.log("jobdetails", jobdetails);
    }, [jobdetails]);

    // handle company details input change
    const handleCompanyDetailChange = (key, value) => {
        console.log("KEYYYY", key, value);

        setComapnyDetails((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    // handle canvas css input change
    const handleCanvasCssChange = (key, value) => {
        setCanvasCss({ ...canvasCss, [key]: value });
    };

    // generate the last date to apply based on current date
    const generateLastDatetoApply = () => {
        const formattedDate = generateLastDatetoApplyHelper();
        if (!!formattedDate) handleJobdetailsChange("lastdate", formattedDate);
    };

    // upload image to cloudinary and return cdn url
    const generateImageCDNlink = async (e, blob) => {
        const imageUrl = await generateImageCDNlinkHelper(e, blob);
        if (!!imageUrl) handleJobdetailsChange("jdBanner", imageUrl);
    };

    // download the banner for social media
    const handleDownloadBanner = async () => {
        const bannerUrl = await downloadImagefromCanvasHelper(jobdetails.companyName, canvasId);
        if (!!bannerUrl) handleJobdetailsChange("jdBanner", bannerUrl);
    };

    // upload banner to cdn and get link (accept html canvas id)
    const uploadBannertoCDN = async () => {
        if (!jobdetails.jdBanner || jobdetails.jdBanner === "" || jobdetails.jdBanner === "N") {
            const bannerUrl = await uploadBannertoCDNHelper(canvasId);
            if (bannerUrl) handleJobdetailsChange("jdBanner", bannerUrl);
            return bannerUrl;
        }
        return null;
    };

    // shorten link using bit.ly if link length is greater then 10
    const shortenLink = async () => {
        if (jobdetails.link.length > 10) {
            const tempLink = await shortenurl(jobdetails.link);
            if (!!tempLink) handleJobdetailsChange("link", tempLink);
        }
    };

    // get details of entered company on blur company input
    const getCompanyDetails = async () => {
        if (jobdetails.companyName) {
            const data = await getCompanyDetailsHelper(jobdetails.companyName);
            if (!!data?.largeLogo) handleCompanyDetailChange("bigLogoUrl", data?.largeLogo);
            if (!!data?.smallLogo) {
                handleCompanyDetailChange("smallLogoUrl", data?.smallLogo);
                handleJobdetailsChange("imagePath", data?.smallLogo)
            }
        }
    };

    // handle company logo submit set cdn url
    const handleCompanyLogoInput = async (e, compressImage = true) => {
        const file = e.target.files;
        const fileSize = file[0].size;

        if (compressImage) {
            setCompanyLogoSize(fileSize / 1024);
            const link = await generateLinkfromImage(e);
            if (!!link){
                handleCompanyDetailChange("smallLogoUrl", link);
                handleJobdetailsChange("imagePath", link)
            }
        } else {
            if (fileSize < 1000000) {
                const link = await generateLinkfromImage(e, false);
                handleCompanyDetailChange("bigLogoUrl", link);
            } else {
                showErrorToast("Image size should be less than 1mb");
            }
        }
    };

    // add form data
    const addJobDetails = async (e) => {
        e.preventDefault();
        setShowLoader(true);
        // TODO: addCompanyDetails();

        // upload banner to cdn if banner link is not present
        const bannerlink = await uploadBannertoCDN();

        const res = await addJobDataHelper(jobdetails, bannerlink);
        if (res.status === 200 || res.status === 201) navigate("/admin");
    };

    // handle company job title change
    const handleJobRoleChange = (val) => {
        setIgbannertitle(val);
        handleJobdetailsChange("title", jobdetails.companyName + " is hiring " + val);
        handleJobdetailsChange("role", val);

        if (val.toLowerCase().includes("intern")) {
            handleJobdetailsChange("batch", "2025 / 2024 / 2023");
            handleJobdetailsChange("experience", "College students");
            handleJobdetailsChange("jobtype", "Internship");
        }
    };

    // handle company name change
    const handleCompanyNameChange = (value) => {
        handleJobdetailsChange("companyName", value);
        handleJobdetailsChange("title", value + " is hiring " + jobdetails.role);
    };

    useEffect(() => {
        generateLastDatetoApply();
    }, []);

    useEffect(() => {
        if (context.isAdmin) {
            setIsAdmin(true);
        }
    }, [context.isAdmin]);

    // map the experience to relevant batch
    useEffect(() => {
        const mappedBatch = mapExperiencetoBatch(jobdetails.experience);
        handleJobdetailsChange("batch", mappedBatch);
    }, [jobdetails.experience]);

    return (
        <div className={styles.container}>
            {/* circular loader  */}
            {!!showLoader && (
                <div className={styles.overlayContainer}>
                    <CircularProgress size={90} color="primary" />
                </div>
            )}

            {/* back to dashboard header  */}
            <Backtodashboard />

            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <div className={styles.flex_con}>
                        <CustomTextField label="Company name *" value={jobdetails.companyName} onChange={(val) => handleCompanyNameChange(val)} onBlur={getCompanyDetails} sx={{ width: "22ch" }} />
                        <CustomTextField label="Role of the Job" value={jobdetails.role} onChange={(val) => handleJobRoleChange(val)} fullWidth />
                    </div>
                    <CustomTextField
                        fullWidth
                        label={igbannertitle?.length > 30 ? "Max length is 30" : "Banner title of the job"}
                        value={igbannertitle}
                        onChange={(val) => setIgbannertitle(val)}
                        error={igbannertitle?.length > 26}
                    />

                    <CustomTextField label="Link for the job application *" value={jobdetails.link} onBlur={shortenLink} onChange={(val) => handleJobdetailsChange("link", val)} fullWidth />
                    <CustomTextField label="Degree *" value={jobdetails.degree} onChange={(val) => handleJobdetailsChange("degree", val)} fullWidth type="select" optionData={degreeOptions} />

                    <div className={styles.flex_con}>
                        <CustomTextField
                            label="Experience needed *"
                            value={jobdetails.experience}
                            onChange={(val) => handleJobdetailsChange("experience", val)}
                            fullWidth
                            type="select"
                            optionData={expOptions}
                        />
                        <CustomTextField label="Location *" value={jobdetails.location} onChange={(val) => handleJobdetailsChange("location", val)} fullWidth type="select" optionData={locOptions} />
                    </div>
                    <br />
                    <div className={styles.flex_con}>
                        <CustomTextField label="Batch *" value={jobdetails.batch} onChange={(val) => handleJobdetailsChange("batch", val)} fullWidth type="select" optionData={batchOptions} />
                        <CustomTextField label="Salary" value={jobdetails.salary} onChange={(val) => handleJobdetailsChange("salary", val)} fullWidth optionData={batchOptions} />
                    </div>
                    <div className={styles.flex_con}>
                        <CustomTextField
                            disabled={!isAdmin}
                            label="Type of the company"
                            value={jobdetails.companytype}
                            onChange={(val) => handleJobdetailsChange("companytype", val)}
                            sx={{ width: "50%" }}
                            type="select"
                            optionData={companyTypeOptions}
                        />
                        <CustomTextField
                            label="Type of Job"
                            sx={{ width: "50%" }}
                            value={jobdetails.jobtype}
                            onChange={(val) => handleJobdetailsChange("jobtype", val)}
                            type="select"
                            optionData={jobTypeOptions}
                        />
                    </div>

                    <div className={`${styles.flex} ${styles.lastDateContainer}`}>
                        <label className={styles.lastDateLabel}>Last date to apply</label>
                        <input
                            className={styles.datePicker}
                            type="date"
                            value={jobdetails.lastdate}
                            min="2018-01-01"
                            max="2026-12-31"
                            onChange={(e) => handleJobdetailsChange("lastdate", e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", marginTop: "40px" }}>
                        <p style={{ paddingRight: "10px", fontWeight: "600" }}>
                            <span style={{ color: "red" }}>**</span> Upload Company logo (50kb) :
                        </p>

                        <input type="file" onChange={(e) => handleCompanyLogoInput(e)} />
                        <p>File Size : {companyLogoSize}</p>
                    </div>

                    {comapnyDetails.smallLogoUrl && (
                        <div style={{ display: "flex", marginTop: "40px" }}>
                            <p style={{ paddingRight: "10px" }}>Logo uploaded :</p>
                            <img src={comapnyDetails.smallLogoUrl} width="50" height="50" alt="logo" />
                        </div>
                    )}

                    <CustomDivider />
                    <div style={{ display: "flex", marginBottom: "10px", gap: "10px" }}>
                        <CustomTextField label="CTA Title" sx={{ width: "30%" }} value={ctaDetails.ctaTitle} onChange={(val) => setCtaDetails({ ...ctaDetails, ctaTitle: val })} fullWidth />
                        <CustomTextField label="CTA Line" sx={{ width: "70%" }} value={ctaDetails.ctaLine} onChange={(val) => setCtaDetails({ ...ctaDetails, ctaLine: val })} fullWidth />
                    </div>
                    <p>Join instagram channel for apply link 👇</p>
                    <br />
                    <p>Comment YES for the apply link</p>
                    <CustomDivider />

                    <div style={{ justifyContent: "flex-start" }} className={styles.flex}>
                        <div className={styles.flex}>
                            <h4>* Company Logo for Banner : </h4>
                            <label htmlFor="contained-button-file">
                                <input accept="image/*" id="contained-button-file" multiple type="file" onChange={(e) => handleCompanyLogoInput(e, false)} />
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: "30px" }} className={styles.flex}>
                        <Button style={{ textTransform: "capitalize" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                            Download IG Banner
                        </Button>
                    </div>

                    {!!isAdmin && (
                        <div style={{ marginTop: "30px" }}>
                            <div style={{ display: "flex" }}>
                                <p style={{ paddingRight: "10px" }}>Upload JD banner : </p>
                                <input type="file" onChange={(e) => generateImageCDNlink(e)} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <p style={{ fontSize: "10px" }}>Banner Link : {jobdetails.jdBanner}</p>
                                <IconButton color="secondary" aria-label="delete" size="small" onClick={() => copyToClipBoard(jobdetails.jdBanner)}>
                                    <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CustomDivider />

            <div>
                <FormGroup>
                    <FormControlLabel onChange={() => handleJobdetailsChange("jdpage", !jobdetails.jdpage)} control={<Switch />} label="Add Job description fields (Optional)" />
                </FormGroup>

                {jobdetails.jdpage && (
                    <div className={styles.editor_fields}>
                        <div className={styles.ck_grid}>
                            <CustomCKEditor label="Job Description : " value={jobdetails.jobdesc} onChange={(val) => handleJobdetailsChange("jobdesc", val)} />
                            <CustomCKEditor label="Eligibility Criteria : " value={jobdetails.eligibility} onChange={(val) => handleJobdetailsChange("eligibility", val)} />
                            <CustomCKEditor label="Responsibility of the job : " value={jobdetails.responsibility} onChange={(val) => handleJobdetailsChange("responsibility", val)} />
                            <CustomCKEditor label="Skills needed : " value={jobdetails.skills} onChange={(val) => handleJobdetailsChange("skills", val)} />
                            <CustomCKEditor label="About the company : " value={jobdetails.aboutCompany} onChange={(val) => handleJobdetailsChange("aboutCompany", val)} />
                        </div>
                    </div>
                )}
                <CustomDivider />
            </div>

            <div className={styles.submitbtn_zone}>
                <Button
                    style={{ textTransform: "capitalize" }}
                    className={styles.submitbtn}
                    onClick={addJobDetails}
                    disabled={jobdetails.link.length === 0}
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    Submit Job details
                </Button>
            </div>

            <Canvas jobdetails={jobdetails} ctaDetails={ctaDetails} comapnyDetails={comapnyDetails} igbannertitle={igbannertitle} />

            <div style={{ marginTop: "30px", marginBottom: "50px" }} className={styles.flex}>
                <Button style={{ textTransform: "capitalize" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                    Download IG Banner
                </Button>
            </div>
        </div>
    );
};

export default AddjobsComponent;
