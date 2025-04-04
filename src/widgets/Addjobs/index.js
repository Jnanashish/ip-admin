import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import styles from "./addjobs.module.scss";

// custom components
import Canvas from "../../Components/Canvas";
import CustomTextField from "../../Components/Input/Textfield";
import CustomCKEditor from "../../Components/CkEditor/CkEditor";
import CustomDivider from "../../Components/Divider/Divider";
import SearchBar from "../../Components/Searchbar";

// mui import
import { Button, IconButton, FormGroup, Switch, FormControlLabel, CircularProgress, Chip, Stack } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// import helpers
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { get } from "../../Helpers/request";

import { degreeOptions, batchOptions, expOptions, locOptions, jobTypeOptions, companyTypeOptions, categorytags, workmodeOptions, platformOptions, comapnyTypeOption } from "./Helpers/staticdata";
import { downloadImagefromCanvasHelper, generateLinkfromImageHelper, handleImageInputHelper } from "../../Helpers/imageHelpers";
import { generateLastDatetoApplyHelper, getCompanyDetailsHelper, addJobDataHelper, updateJobDetails, mapExperiencetoBatch, generateTagsfromRole } from "./Helpers";

import { copyToClipBoard } from "../../Helpers/utility";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { submitCompanyDetailsHelper, updateCompanyDetailsHelper } from "../CompanyDetails/helper";
import { showErrorToast } from "../../Helpers/toast";
import { getJobDetailsHelper } from "./Helpers";

const AddjobsComponent = () => {
    const [igbannertitle, setIgbannertitle] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [companyLogoSize, setCompanyLogoSize] = useState(0);
    const [comapnyListData, setCompanyListData] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [jobAlreadyExist, setJobAlreadyExist] = useState(false);
    const [savedJobId, setSavedJobId] = useState(null);

    const [jobdataInfo, setJobdataInfo] = useState(null);

    const [comapnyDetails, setComapnyDetails] = useState({
        companyName: "",
        companyInfo: "N",
        linkedinPageLink: "",
        careerPageLink: "",
        companyType: "Product based",
        smallLogo: "",
        largeLogo: "",
    });

    const [jobdetails, setJobdetails] = useState({
        degree: "B.E / B.Tech / M.Tech / MCA",
        batch: "2022 / 2021 / 2020",
        experience: "0 - 2 years",
        location: "Bengaluru",
        salary: "₹0LPA",
        jdpage: true,
        companyName: "",
        title: "",
        companytype: "product",
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
        imagePath: "", // company small logo
        tags: [],
        skilltags: [],
        jobId: "",
        workMode: "onsite",
        platform: "careerspage",
        benifits: "N",
        companyId: "",
        isActive: true,
        priority: 1,

        // company info
        companyInfo: "",
        linkedinPageLink: "",
        careerPageLink: "",
        companyType: "",
        smallLogo: "",
        largeLogo: "",
    });

    const context = useContext(UserContext);
    const canvasId = "careersattech";
    const navigate = useNavigate();
    let companyName = "";

    // Memoize expensive operations
    const categoriesWithTags = useMemo(() => {
        return categorytags.map((item) => <Chip key={item} label={item} variant={jobdetails.tags.includes(item) ? "" : "outlined"} color="primary" onClick={() => handleCategoryTagClick(item)} />);
    }, [jobdetails.tags]);

    // Define common skill tags for the job
    const skillTagOptions = useMemo(
        () => [
            "JavaScript",
            "React",
            "Node.js",
            "Python",
            "Java",
            "C++",
            "AWS",
            "Azure",
            "DevOps",
            "Docker",
            "Kubernetes",
            "SQL",
            "NoSQL",
            "MongoDB",
            "PostgreSQL",
            "Machine Learning",
            "AI",
            "Data Science",
            "UI/UX",
            "Frontend",
            "Backend",
            "Full Stack",
        ],
        []
    );

    // Memoize skill tags rendering
    const skillTagsWithChips = useMemo(() => {
        return skillTagOptions.map((item) => (
            <Chip key={item} label={item} variant={jobdetails.skilltags.includes(item) ? "" : "outlined"} color="secondary" onClick={() => handleSkillTagClick(item)} />
        ));
    }, [jobdetails.skilltags, skillTagOptions]);

    // Convert handler to useCallback for better performance
    const handleCategoryTagClick = useCallback((tag) => {
        setJobdetails((prevState) => ({
            ...prevState,
            tags: prevState.tags.includes(tag) ? prevState.tags.filter((item) => item !== tag) : [...prevState.tags, tag],
        }));
    }, []);

    // Handler for skill tag clicks
    const handleSkillTagClick = useCallback((tag) => {
        setJobdetails((prevState) => ({
            ...prevState,
            skilltags: prevState.skilltags.includes(tag) ? prevState.skilltags.filter((item) => item !== tag) : [...prevState.skilltags, tag],
        }));
    }, []);

    // Custom skill tag input handler
    const [customSkillTag, setCustomSkillTag] = useState("");

    // Handle adding a new skill tag
    const handleAddSkillTag = useCallback(() => {
        if (customSkillTag.trim() === "") return;

        // Add the custom tag if it doesn't already exist
        if (!jobdetails.skilltags.includes(customSkillTag.trim())) {
            setJobdetails((prevState) => ({
                ...prevState,
                skilltags: [...prevState.skilltags, customSkillTag.trim()],
            }));

            // Clear the input
            setCustomSkillTag("");
        } else {
            // If skill already exists, just clear the input
            setCustomSkillTag("");
        }
    }, [customSkillTag, jobdetails.skilltags]);

    // Handle removing a skill tag
    const handleRemoveSkillTag = (skillToRemove) => {
        setJobdetails((prevState) => ({
            ...prevState,
            skilltags: prevState.skilltags.filter((skill) => skill !== skillToRemove),
        }));
    };

    // when any input filed value change
    const handleInputChange = (setStateFunction, key, value) => {
        // If key is an object, we're doing a batch update
        if (typeof key === "object" && key !== null) {
            setStateFunction((prevState) => ({
                ...prevState,
                ...key,
            }));
        } else if (typeof key === "string") {
            // Single key update
            setStateFunction((prevState) => ({
                ...prevState,
                [key]: value,
            }));
        } else {
            console.error("Invalid key type in handleInputChange:", typeof key);
        }
    };

    // generate the last date to apply based on current date
    const generateLastDatetoApply = () => {
        const formattedDate = generateLastDatetoApplyHelper();
        if (!!formattedDate) handleInputChange(setJobdetails, "lastdate", formattedDate);
    };

    // upload image to cloudinary and return cdn url
    const generateImageCDNlink = async (e, blob) => {
        const imageUrl = await generateLinkfromImageHelper(e, blob);
        if (!!imageUrl) handleInputChange(setJobdetails, "jdBanner", imageUrl);
    };

    // [COMPANY DATA] get details of entered company on company input change
    const getCompanyDetails = async (jobdetails) => {
        // clear all the logo field
        handleInputChange(setComapnyDetails, { smallLogo: "", largeLogo: "" });
        handleInputChange(setJobdetails, "imagePath", "");

        const data = await getCompanyDetailsHelper(null, jobdetails._id);
        if (!!data && !!data[0]) {
            handleInputChange(setJobdetails, data[0]);
            handleInputChange(setComapnyDetails, data[0]);
            handleInputChange(setJobdetails, "imagePath", data[0]?.smallLogo);
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
            if (!!imageFile) {
                link = await generateLinkfromImageHelper(null, imageFile);
                setCompanyLogoSize(Math.round(imageFile?.size / 1080));
            }

            if (!!link) {
                handleInputChange(setComapnyDetails, "smallLogo", link);
                handleInputChange(setJobdetails, "imagePath", link);
            }
        } else {
            // TODO: Need to compress big images also
            if (fileSize < 500000) {
                link = await generateLinkfromImage(e, false);
                handleInputChange(setComapnyDetails, "largeLogo", link);
            } else {
                showErrorToast("Image size should be less than 500kb");
            }
        }
    };

    // [ADD JOB POST] add form data
    const addJobDetails = async (e) => {
        e.preventDefault();
        setShowLoader(true);
        let jobDetailsforAPI = {};

        // update already existing company details
        if (!!selectedCompany && !!selectedCompany?._id) {
            updateCompanyDetailsHelper(comapnyDetails, selectedCompany?._id);
            jobDetailsforAPI = { ...jobdetails, companyId: selectedCompany?._id };
        } else {
            // if company details not present add company details before adding job details
            let companyId = await submitCompanyDetailsHelper(comapnyDetails);
            jobDetailsforAPI = { ...jobdetails, companyId: companyId?.id };
        }

        let res = {};
        if (!!jobAlreadyExist) {
            res = await updateJobDetails(jobDetailsforAPI, savedJobId);
        } else {
            res = await addJobDataHelper(jobDetailsforAPI);
        }

        if (res?.status === 200 || res?.status === 201) navigate("/jobs");
        setShowLoader(false);
    };

    // generate job title from company name and role
    const generateJobTitle = (companyName, role) => {
        let jobTitle = "";
        if (!!role || !!jobdetails?.role) {
            jobTitle = " is hiring " + (role ? role : jobdetails?.role || "");
        } else {
            jobTitle = " is hiring ";
        }

        setIgbannertitle(jobTitle);
        return jobTitle;
    };

    // handle company name input change
    const handleCompanyNameChange = (companyName) => {
        const jobTitle = generateJobTitle(companyName);
        handleInputChange(setComapnyDetails, "companyName", companyName);
        handleInputChange(setJobdetails, { companyName, title: jobTitle });
    };

    // handle company job title change
    const handleJobRoleChange = (role) => {
        const jobTitle = generateJobTitle(jobdetails?.companyName || "", role);

        // Update role and title without affecting tags
        handleInputChange(setJobdetails, { role, title: jobTitle });

        // Special handling for intern roles
        if (role?.toLowerCase()?.includes("intern")) {
            handleInputChange(setJobdetails, {
                jobtype: "Internship",
                experience: "College students",
                batch: "2025 / 2024 / 2023",
            });
        }
    };

    // get job details with id or official jobId
    const fetchJobDetails = async (id) => {
        const paramsData = {
            key: !!jobdetails?.jobId ? "jobId" : "id",
            value: !!jobdetails?.jobId ? jobdetails?.jobId : id,
        };

        const res = await getJobDetailsHelper(paramsData);
        const jobData = Array.isArray(res?.data) && res?.data[0] ? res?.data[0] : res?.data;

        if (!!jobData && !!jobData?.companyName) {
            companyName = jobData?.companyName;
            filterJobBasedonName(comapnyListData, companyName);
            setSavedJobId(jobData?._id);
            setJobAlreadyExist(true);
            handleInputChange(setJobdetails, jobData);
            handleInputChange(setComapnyDetails, jobData);
        }
    };

    // update both company and job details when companyinfo change
    const handleCompanyInfoChange = (val) => {
        handleInputChange(setJobdetails, "aboutCompany", val);
        handleInputChange(setComapnyDetails, "companyInfo", val);
    };

    const filterJobBasedonName = (companyList, companyNameToFind) => {
        // Early return if no company list or no company name to find
        if (!companyList || !Array.isArray(companyList) || companyList.length === 0) {
            return;
        }

        // Determine which company name to use, prioritizing the passed parameter
        const nameToFind = companyNameToFind || comapnyDetails?.companyName || companyName;

        if (!nameToFind) {
            return;
        }

        // Normalize the name for case-insensitive comparison
        const normalizedNameToFind = nameToFind.toLowerCase().trim();

        // Find the company in the list
        const companyData = companyList.find((item) => {
            if (!item?.companyName) return false;

            const normalizedCompanyName = item.companyName.toLowerCase().trim();
            return normalizedCompanyName === normalizedNameToFind || normalizedCompanyName.includes(normalizedNameToFind);
        });

        // Set the selected company if found
        if (companyData) {
            setSelectedCompany(companyData);
        }
    };

    // fetch list of available companies
    const getCompanyList = async () => {
        const data = await get(`${apiEndpoint.get_company_details}`);
        filterJobBasedonName(data);
        setCompanyListData(data);
    };

    // check query param for job id
    const checkQueryParam = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");

        if (!!jobId) {
            setSavedJobId(jobId);
            fetchJobDetails(jobId);
        }
    };

    // extract job data from the pasted job details
    const extractJobData = (jobdataInfo) => {
        if (!jobdataInfo) return;

        try {
            const parsedData = JSON.parse(jobdataInfo);
            if (typeof parsedData !== "object" || parsedData === null) {
                console.error("Invalid JSON format: Not an object");
                return;
            }

            // Batch state updates for better performance
            const jobDetailsUpdates = {};
            const companyDetailsUpdates = {};

            // Process all fields first
            Object.keys(parsedData).forEach((key) => {
                if (key in jobdetails) {
                    // Special handling for tags and skilltags arrays to ensure they're properly processed
                    if ((key === "tags" || key === "skilltags") && Array.isArray(parsedData[key])) {
                        jobDetailsUpdates[key] = [...parsedData[key]]; // Create a copy of the array
                    } else {
                        jobDetailsUpdates[key] = parsedData[key];
                    }
                }
                if (key in comapnyDetails) {
                    companyDetailsUpdates[key] = parsedData[key];
                }
            });

            // Apply batch updates
            if (Object.keys(jobDetailsUpdates).length > 0) {
                handleInputChange(setJobdetails, jobDetailsUpdates);
            }

            if (Object.keys(companyDetailsUpdates).length > 0) {
                handleInputChange(setComapnyDetails, companyDetailsUpdates);
            }

            // Handle special fields that need additional processing
            if (parsedData.companyName) {
                handleCompanyNameChange(parsedData.companyName);

                // Find and set the selected company if company list is available
                if (comapnyListData && comapnyListData.length > 0) {
                    filterJobBasedonName(comapnyListData, parsedData.companyName);
                }
            }

            // Handle role separately to trigger title generation
            // Note: We're not generating tags from role here anymore since we want to preserve
            // any tags that came from the JSON data
            if (parsedData.role) {
                handleJobRoleChange(parsedData.role);
            }
        } catch (error) {
            console.error("Error parsing JSON data:", error.message);
        }
    };

    // Textarea change handler - separated for clarity
    const handleTextareaChange = (e) => {
        const newValue = e.target.value;
        setJobdataInfo(newValue);
        if (newValue) {
            extractJobData(newValue);
        }
    };

    // map the experience to relevant batch
    useEffect(() => {
        if (!jobAlreadyExist) {
            const mappedBatch = mapExperiencetoBatch(jobdetails.experience);
            handleInputChange(setJobdetails, "batch", mappedBatch);
        }
    }, [jobdetails.experience]);

    // when any company is selected
    useEffect(() => {
        if (!!selectedCompany && selectedCompany?._id) {
            getCompanyDetails(selectedCompany);
            handleInputChange(setJobdetails, "companyId", selectedCompany?._id);
            handleCompanyNameChange(selectedCompany?.companyName);
        }
    }, [selectedCompany]);

    useEffect(() => {
        generateLastDatetoApply();
        getCompanyList();
        checkQueryParam();
    }, []);

    return (
        <div className={styles.container}>
            <textarea className={styles.textarea} placeholder="Paste job details JSON here" value={jobdataInfo || ""} onChange={handleTextareaChange} aria-label="Job details JSON input" />

            <h2>{jobAlreadyExist ? "Update" : "Add"} job details : </h2>

            {/* circular overlay loader  */}
            {!!showLoader && (
                <div className={styles.overlayContainer}>
                    <CircularProgress size={90} color="primary" />
                </div>
            )}

            {/* main job details input section  */}
            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <div className={styles.inputcontainer_flex}>
                        <p></p>
                        <SearchBar
                            handleCompanyNameChange={handleCompanyNameChange}
                            width="400px"
                            searchSuggestionList={comapnyListData}
                            selectedCompany={selectedCompany}
                            setSelectedCompany={setSelectedCompany}
                        />
                        <CustomTextField label="Role of the job *" value={jobdetails?.role || ""} onChange={(val) => handleJobRoleChange(val)} fullWidth />
                    </div>
                    <div className={styles.tagscontainer}>
                        <p>Select tags* : </p>
                        <Stack direction="row" spacing={1}>
                            {categoriesWithTags}
                        </Stack>
                    </div>

                    {/* Skill Tags Input Section */}
                    <div className={styles.skillTagsSection}>
                        <h3>Skills Required</h3>
                        <div className={styles.skillInputContainer}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAddSkillTag}
                                    disabled={!customSkillTag.trim()}
                                    className={styles.addSkillBtn}
                                    style={{ textTransform: "capitalize" }}
                                     size="small"
                                >
                                    Add Skill
                                </Button>
                            <CustomTextField label="Add skill" value={customSkillTag} onChange={(val) => setCustomSkillTag(val)} fullWidth placeholder="Type a skill and press Enter to add" />
                        </div>

                        {/* Common skill tags for quick selection */}
                        <div className={styles.commonSkillTags}>
                            <p>Common skills (click to add):</p>
                            <div className={styles.skillChipsContainer}>{skillTagsWithChips}</div>
                        </div>

                        {/* Display selected skill tags */}
                        {jobdetails.skilltags.length > 0 && (
                            <div className={styles.selectedSkills}>
                                <p>Skills required for this job:</p>
                                <div className={styles.skillChipsContainer}>
                                    {jobdetails.skilltags.map((skill) => (
                                        <Chip key={skill} label={skill} color="secondary" onDelete={() => handleRemoveSkillTag(skill)} className={styles.skillChip} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <CustomTextField
                        fullWidth
                        label={igbannertitle?.length > 30 ? "Max length is 30" : "Banner title of the job (for instagram or linkedin)"}
                        value={igbannertitle}
                        onChange={(val) => setIgbannertitle(val)}
                        error={igbannertitle?.length > 26}
                    />

                    <CustomTextField label="Link for the job application *" value={jobdetails?.link || ""} onChange={(val) => handleInputChange(setJobdetails, "link", val)} fullWidth />

                    <div className={styles.inputcontainer_flex}>
                        <CustomTextField
                            label="Job Id (Mentioned in official page)"
                            value={jobdetails.jobId}
                            onBlur={fetchJobDetails}
                            onChange={(val) => handleInputChange(setJobdetails, "jobId", val)}
                            fullWidth
                        />
                        <CustomTextField
                            label="Degree required*"
                            value={jobdetails.degree}
                            onChange={(val) => handleInputChange(setJobdetails, "degree", val)}
                            fullWidth
                            type="select"
                            optionData={degreeOptions}
                        />
                    </div>

                    <div className={styles.inputcontainer_flex}>
                        <CustomTextField
                            label="Experience needed *"
                            value={jobdetails.experience}
                            onChange={(val) => handleInputChange(setJobdetails, "experience", val)}
                            fullWidth
                            type="select"
                            optionData={expOptions}
                        />

                        <CustomTextField
                            label="Batch eligible*"
                            value={jobdetails.batch}
                            onChange={(val) => handleInputChange(setJobdetails, "batch", val)}
                            fullWidth
                            type="select"
                            optionData={batchOptions}
                        />
                    </div>
                    <div className={styles.inputcontainer_flex}>
                        <CustomTextField
                            label="Location *"
                            value={jobdetails.location}
                            onChange={(val) => handleInputChange(setJobdetails, "location", val)}
                            fullWidth
                            type="select"
                            optionData={locOptions}
                        />
                        <CustomTextField
                            label="Work Mode *"
                            value={jobdetails.workMode}
                            onChange={(val) => handleInputChange(setJobdetails, "workMode", val)}
                            fullWidth
                            type="select"
                            optionData={workmodeOptions}
                        />
                    </div>
                    <div className={styles.inputcontainer_flex}>
                        <CustomTextField
                            label="Expected salary"
                            sx={{ width: "50%" }}
                            value={jobdetails.salary}
                            onChange={(val) => handleInputChange(setJobdetails, "salary", val)}
                            optionData={batchOptions}
                        />
                        <CustomTextField
                            label="Type of Job"
                            sx={{ width: "50%" }}
                            value={jobdetails.jobtype}
                            onChange={(val) => handleInputChange(setJobdetails, "jobtype", val)}
                            type="select"
                            optionData={jobTypeOptions}
                        />
                    </div>
                    <div className={styles.inputcontainer_flex}>
                        <CustomTextField
                            label="Type of the company"
                            value={jobdetails.companytype}
                            onChange={(val) => handleInputChange(setJobdetails, "companytype", val)}
                            sx={{ width: "50%" }}
                            type="select"
                            optionData={companyTypeOptions}
                        />
                        <CustomTextField
                            label="Redirection platform"
                            value={jobdetails.platform}
                            onChange={(val) => handleInputChange(setJobdetails, "platform", val)}
                            sx={{ width: "50%" }}
                            type="select"
                            optionData={platformOptions}
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
                            onChange={(e) => handleInputChange(setJobdetails, "lastdate", e.target.value)}
                        />
                    </div>
                    <CustomTextField label="Priority" value={jobdetails.priority} onChange={(val) => handleInputChange(setJobdetails, "priority", val)} sx={{ width: "50%" }} />
                </div>
            </div>
            {!!jobAlreadyExist && (
                <>
                    <CustomDivider />
                    <h3>
                        Is job expired :
                        <FormControlLabel
                            checked={jobdetails.isActive}
                            onChange={() => handleInputChange(setJobdetails, "isActive", !jobdetails.isActive)}
                            control={<Switch />}
                            label="Turn off if the job is expired"
                        />
                    </h3>
                </>
            )}

            <CustomDivider />
            <div>
                <>
                    {/* company logo upload section  */}
                    <div style={{ display: "flex" }}>
                        <p style={{ paddingRight: "10px", fontWeight: "600" }}>
                            <span>**</span> Upload Company logo (Max Size 20kb) :
                        </p>

                        <input type="file" onChange={(e) => handleCompanyLogoInput(e)} />
                        <p>File Size : {companyLogoSize}</p>
                    </div>
                    {companyLogoSize > 10 && <p className={styles.errorMessage}>Image size should be less then 10 kb after compression</p>}

                    {!!comapnyDetails.smallLogo && (
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

                    {!!comapnyDetails.largeLogo && (
                        <div style={{ display: "flex", marginTop: "10px", alignItems: "center" }}>
                            <p style={{ paddingRight: "10px" }}>Logo uploaded :</p>
                            <img src={comapnyDetails.largeLogo} width="200" height="60" alt="logo" />
                        </div>
                    )}
                </>

                <CustomDivider />
                <div>
                    <h3>Enter company Informations : </h3>
                    <CustomTextField fullWidth label="Company careers page" value={comapnyDetails.careerPageLink} onChange={(val) => handleInputChange(setComapnyDetails, "careerPageLink", val)} />

                    <CustomTextField fullWidth label="Linkeding page link" value={comapnyDetails.linkedinPageLink} onChange={(val) => handleInputChange(setComapnyDetails, "linkedinPageLink", val)} />
                    <CustomTextField
                        fullWidth
                        label="Type of the company"
                        value={comapnyDetails.companyType}
                        onChange={(val) => handleInputChange(setComapnyDetails, "companyType", val)}
                        type="select"
                        optionData={comapnyTypeOption}
                    />
                    <CustomCKEditor label="About the company : " value={comapnyDetails.companyInfo} onChange={(val) => handleCompanyInfoChange(val)} />
                    <CustomDivider />
                </div>

                <div className={styles.flex}>
                    <Button
                        style={{ textTransform: "capitalize" }}
                        onClick={() => downloadImagefromCanvasHelper(jobdetails?.companyName, canvasId, false)}
                        variant="contained"
                        color="success"
                        endIcon={<CloudDownloadIcon />}
                    >
                        Download IG Banner
                    </Button>
                </div>
                <br />
            </div>

            {/* job description section  */}
            <div>
                <FormGroup>
                    <FormControlLabel onChange={() => handleInputChange(setJobdetails, "jdpage", !jobdetails.jdpage)} control={<Switch />} label="Add Job description fields*" />
                </FormGroup>

                {!!jobdetails.jdpage && (
                    <div className={styles.editor_fields}>
                        <div className={styles.ck_grid}>
                            <CustomCKEditor label="Job Description : " value={jobdetails.jobdesc} onChange={(val) => handleInputChange(setJobdetails, "jobdesc", val)} />
                            <CustomCKEditor label="Eligibility Criteria : " value={jobdetails.eligibility} onChange={(val) => handleInputChange(setJobdetails, "eligibility", val)} />
                            <CustomCKEditor label="Responsibility of the job : " value={jobdetails.responsibility} onChange={(val) => handleInputChange(setJobdetails, "responsibility", val)} />
                            <CustomCKEditor label="Benifits : " value={jobdetails.benifits} onChange={(val) => handleInputChange(setJobdetails, "benifits", val)} />
                            <CustomCKEditor label="Skills needed : " value={jobdetails.skills} onChange={(val) => handleInputChange(setJobdetails, "skills", val)} />
                        </div>
                    </div>
                )}
                <CustomDivider />
            </div>

            <div className={styles.uploadbanner_section}>
                <div>
                    <p>Upload JD banner : </p>
                    <input type="file" onChange={(e) => generateImageCDNlink(e)} />
                </div>
                <div>
                    <p>Banner Link : </p>
                    <p className={styles.copyText} style={{ wordBreak: "break-all", maxWidth: "100%" }}>
                        {jobdetails.jdBanner}
                        <IconButton color="secondary" aria-label="copy" size="small" onClick={() => copyToClipBoard(jobdetails.jdBanner)}>
                            <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                    </p>
                </div>
                <CustomDivider />
            </div>

            <div className={styles.submitbtn_zone}>
                <Button
                    style={{ textTransform: "capitalize" }}
                    className={styles.submitbtn}
                    onClick={addJobDetails}
                    disabled={showLoader || jobdetails?.link?.length === 0 || jobdetails?.tags?.length === 0}
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    {showLoader ? <CircularProgress size={24} color="inherit" /> : `${jobAlreadyExist ? "Update" : "Submit"} Job details`}
                </Button>
            </div>
            <CustomDivider />

            {/* instagram banner */}
            <Canvas jobdetails={jobdetails} comapnyDetails={comapnyDetails} igbannertitle={igbannertitle} />
        </div>
    );
};

export default AddjobsComponent;
