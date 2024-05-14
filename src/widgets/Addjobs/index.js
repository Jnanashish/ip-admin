import React, { useContext, useEffect, useState } from "react";
import styles from "./addjobs.module.scss";

// custom components
import Canvas from "../../Components/Canvas";

import CustomTextField from "../../Components/Input/Textfield";
import CustomCKEditor from "../../Components/CkEditor/CkEditor";
import CustomDivider from "../../Components/Divider/Divider";

// mui import
import { Button, IconButton, FormGroup, Switch, FormControlLabel, CircularProgress, Chip, Stack } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// import helpers
import { shortenurl } from "../../Helpers/utility";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";

import { degreeOptions, batchOptions, expOptions, locOptions, jobTypeOptions, companyTypeOptions, categorytags } from "./Helpers/staticdata";
import { downloadImagefromCanvasHelper, generateLinkfromImageHelper, handleImageInputHelper, uploadBannertoCDNHelper } from "../../Helpers/imageHelpers";
import { generateLastDatetoApplyHelper, getCompanyDetailsHelper, addJobDataHelper, mapExperiencetoBatch } from "./Helpers";

import { copyToClipBoard } from "../../Helpers/utility";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { submitCompanyDetailsHelper } from "../CompanyDetails/helper";
import { showErrorToast } from "../../Helpers/toast";

const AddjobsComponent = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [igbannertitle, setIgbannertitle] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [companyLogoSize, setCompanyLogoSize] = useState(0);
    const [isCompaneydetailsPresent, setIsCompaneydetailsPresent] = useState(false);

    const [comapnyDetails, setComapnyDetails] = useState({
        name: "",
        info: "",
        linkedinLink: "",
        careersPageLink: "",
        companyType: "",
        smallLogo: "",
        largeLogo: "",
    });

    const [jobdetails, setJobdetails] = useState({
        degree: "B.E / B.Tech / M.Tech / MCA",
        batch: "2022 / 2021 / 2020",
        experience: "0 - 2 years",
        location: "Bengaluru",
        salary: "₹0LPA",
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
        categoryTags: [],
        skilltags: [],
    });

    const context = useContext(UserContext);
    const canvasId = context?.isAdmin ? "careersattech" : "jobsattech";
    const navigate = useNavigate();

    // handle job details input change
    const handleJobdetailsChange = (key, value) => {
        setJobdetails((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    // handle company details input change
    const handleCompanyDetailChange = (key, value) => {
        setComapnyDetails((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleCategoryTagClick = (tag) => {
        if (jobdetails.categoryTags.includes(tag)) {
            setJobdetails((prevState) => ({
                ...prevState,
                categoryTags: prevState.categoryTags.filter((item) => item !== tag),
            }));
        } else {
            setJobdetails((prevState) => ({
                ...prevState,
                categoryTags: [...prevState.categoryTags, tag],
            }));
        }
    };

    // generate the last date to apply based on current date
    const generateLastDatetoApply = () => {
        const formattedDate = generateLastDatetoApplyHelper();
        if (!!formattedDate) handleJobdetailsChange("lastdate", formattedDate);
    };

    // upload image to cloudinary and return cdn url
    const generateImageCDNlink = async (e, blob) => {
        const imageUrl = await generateLinkfromImageHelper(e, blob);
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
        // clear all the logo field
        handleCompanyDetailChange("largeLogo", "");
        handleCompanyDetailChange("smallLogo", "");
        handleJobdetailsChange("imagePath", "");

        if (!!jobdetails.companyName) {
            const data = await getCompanyDetailsHelper(jobdetails.companyName);
            if (!!data[0]?.largeLogo) handleCompanyDetailChange("largeLogo", data[0]?.largeLogo);
            if (!!data[0]?.smallLogo) {
                setIsCompaneydetailsPresent(true);
                handleCompanyDetailChange("smallLogo", data[0]?.smallLogo);
                handleJobdetailsChange("imagePath", data[0]?.smallLogo);
            }
        }
    };

    // Handle company logo change, submit set cdn url
    const handleCompanyLogoInput = async (e, compressImage = true) => {
        const file = e.target.files;
        const fileSize = file[0].size;
        let link;

        if (compressImage) {
            setCompanyLogoSize(fileSize / 1024);
            const imageFile = await handleImageInputHelper(e);
            if(!!imageFile){
                link = await generateLinkfromImageHelper(null, imageFile);
                setCompanyLogoSize(Math.round(imageFile?.size / 1080));

            }

            if (!!link) {
                handleCompanyDetailChange("smallLogo", link);
                handleJobdetailsChange("imagePath", link);
            }
        } else {
            // TODO: Need to compress big images also
            if (fileSize < 500000) {
                link = await generateLinkfromImage(e, false);
                handleCompanyDetailChange("largeLogo", link);
            } else {
                showErrorToast("Image size should be less than 500kb");
            }
        }
    };

    // add form data
    const addJobDetails = async (e) => {
        e.preventDefault();
        setShowLoader(true);

        // if company details not present add company details before adding job details
        if (!isCompaneydetailsPresent) {
            submitCompanyDetailsHelper(comapnyDetails);
        }

        // upload banner to cdn if banner link is not present
        const bannerlink = await uploadBannertoCDN();

        const res = await addJobDataHelper(jobdetails, bannerlink);
        if (res.status === 200 || res.status === 201) navigate("/jobs");
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
        handleCompanyDetailChange("name", value);
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
            <h3>Add job details : </h3>

            {/* circular overlay loader  */}
            {!!showLoader && (
                <div className={styles.overlayContainer}>
                    <CircularProgress size={90} color="primary" />
                </div>
            )}

            {/* main job details input section  */}
            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <div className={styles.flex_con}>
                        <CustomTextField label="Company name *" value={jobdetails.companyName} onChange={(val) => handleCompanyNameChange(val)} onBlur={getCompanyDetails} sx={{ width: "22ch" }} />
                        <CustomTextField label="Role of the job *" value={jobdetails.role} onChange={(val) => handleJobRoleChange(val)} fullWidth />
                    </div>
                    <Stack direction="row" spacing={1}>
                        {categorytags.map((item) => (
                            <Chip label={item} variant={jobdetails.categoryTags.includes(item) ? "" : "outlined"} color="primary" onClick={() => handleCategoryTagClick(item)} />
                        ))}
                    </Stack>

                    <CustomTextField
                        fullWidth
                        label={igbannertitle?.length > 30 ? "Max length is 30" : "Banner title of the job (for instagram or linkedin)"}
                        value={igbannertitle}
                        onChange={(val) => setIgbannertitle(val)}
                        error={igbannertitle?.length > 26}
                    />

                    <CustomTextField label="Link for the job application *" value={jobdetails.link} onBlur={shortenLink} onChange={(val) => handleJobdetailsChange("link", val)} fullWidth />
                    <CustomTextField label="Degree required*" value={jobdetails.degree} onChange={(val) => handleJobdetailsChange("degree", val)} fullWidth type="select" optionData={degreeOptions} />

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
                    <div className={styles.flex_con}>
                        <CustomTextField label="Batch eligible*" value={jobdetails.batch} onChange={(val) => handleJobdetailsChange("batch", val)} fullWidth type="select" optionData={batchOptions} />
                        <CustomTextField label="Expected salary" value={jobdetails.salary} onChange={(val) => handleJobdetailsChange("salary", val)} fullWidth optionData={batchOptions} />
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
                </div>
            </div>

            <CustomDivider />
            <div>
                {/* company logo upload section  */}
                <div style={{ display: "flex" }}>
                    <p style={{ paddingRight: "10px", fontWeight: "600" }}>
                        <span>**</span> Upload Company logo (Max Size 20kb) :
                    </p>

                    <input type="file" onChange={(e) => handleCompanyLogoInput(e)} />
                    <p>File Size : {companyLogoSize}</p>
                </div>
                {companyLogoSize > 5 && <p className={styles.errorMessage}>Image size should be less then 10 kb after compression</p>}

                {comapnyDetails.smallLogo && (
                    <div style={{ display: "flex", marginTop: "10px", alignItems: "center" }}>
                        <p style={{ paddingRight: "10px" }}>Logo uploaded :</p>
                        <img src={comapnyDetails.smallLogo} width="50" height="50" alt="logo" />
                    </div>
                )}
                <div style={{ justifyContent: "flex-start", marginTop: "40px" }} className={styles.flex}>
                    <div className={styles.flex}>
                        <h4>* Company Logo for Banner : </h4>
                        <label htmlFor="contained-button-file">
                            <input accept="image/*" id="contained-button-file" multiple type="file" onChange={(e) => handleCompanyLogoInput(e, false)} />
                        </label>
                    </div>
                </div>

                {comapnyDetails.largeLogo && (
                    <div style={{ display: "flex", marginTop: "10px", alignItems: "center" }}>
                        <p style={{ paddingRight: "10px" }}>Logo uploaded :</p>
                        <img src={comapnyDetails.largeLogo} width="200" height="60" alt="logo" />
                    </div>
                )}

                <CustomDivider />

                <div className={styles.flex}>
                    <Button style={{ textTransform: "capitalize" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                        Download IG Banner
                    </Button>
                </div>
                <br/>

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

            {/* job description section  */}
            <div>
                <FormGroup>
                    <FormControlLabel onChange={() => handleJobdetailsChange("jdpage", !jobdetails.jdpage)} control={<Switch />} label="Add Job description fields*" />
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

            {/* instagram banner */}
            <Canvas jobdetails={jobdetails} comapnyDetails={comapnyDetails} igbannertitle={igbannertitle} />
        </div>
    );
};

export default AddjobsComponent;
