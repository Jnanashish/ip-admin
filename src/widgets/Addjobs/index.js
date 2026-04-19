import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";

// custom components
import Canvas from "../../Components/Canvas";
import CustomTextField from "../../Components/Input/Textfield";
import CustomCKEditor from "../../Components/CkEditor/CkEditor";
import CustomDivider from "../../Components/Divider/Divider";
import SearchBar from "../../Components/Searchbar";

// shadcn components
import { Button } from "Components/ui/button";
import { Badge } from "Components/ui/badge";
import { Switch } from "Components/ui/switch";
import { Label } from "Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";

// lucide icons
import { CloudDownload, Copy, X } from "lucide-react";

// import helpers
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { get } from "../../Helpers/request";

import { degreeOptions, batchOptions, expOptions, locOptions, jobTypeOptions, companyTypeOptions, categorytags, workmodeOptions, platformOptions, companyTypeOption } from "./Helpers/staticdata";
import { downloadImagefromCanvasHelper, generateLinkfromImageHelper, handleImageInputHelper } from "../../Helpers/imageHelpers";
import { generateLastDatetoApplyHelper, addJobDataHelper, updateJobDetails, mapExperiencetoBatch, generateTagsfromRole } from "./Helpers";
import { getCompanyDetailsHelper } from "../../Apis/Company";

import { copyToClipBoard } from "../../Helpers/utility";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { safeUrl } from "../../Helpers/sanitize";
import { submitCompanyDetailsHelper, updateCompanyDetailsHelper } from "../CompanyDetails/helper";
import { showErrorToast } from "../../Helpers/toast";
import { getJobDetailsHelper } from "./Helpers";

const AddjobsComponent = () => {
    const [igbannertitle, setIgbannertitle] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [companyLogoSize, setCompanyLogoSize] = useState(0);
    const [companyListData, setCompanyListData] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [jobAlreadyExist, setJobAlreadyExist] = useState(false);
    const [savedJobId, setSavedJobId] = useState(null);

    const [jobdataInfo, setJobdataInfo] = useState(null);

    const [companyDetails, setCompanyDetails] = useState({
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
        return categorytags.map((item) => (
            <Badge
                key={item}
                variant={jobdetails.tags.includes(item) ? "default" : "outline"}
                onClick={() => handleCategoryTagClick(item)}
                className="cursor-pointer"
            >
                {item}
            </Badge>
        ));
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
            <Badge
                key={item}
                variant={jobdetails.skilltags.includes(item) ? "default" : "outline"}
                onClick={() => handleSkillTagClick(item)}
                className="cursor-pointer"
            >
                {item}
            </Badge>
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

        if (!jobdetails.skilltags.includes(customSkillTag.trim())) {
            setJobdetails((prevState) => ({
                ...prevState,
                skilltags: [...prevState.skilltags, customSkillTag.trim()],
            }));
            setCustomSkillTag("");
        } else {
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
        if (typeof key === "object" && key !== null) {
            setStateFunction((prevState) => ({
                ...prevState,
                ...key,
            }));
        } else if (typeof key === "string") {
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
        handleInputChange(setCompanyDetails, { smallLogo: "", largeLogo: "" });
        handleInputChange(setJobdetails, "imagePath", "");

        const data = await getCompanyDetailsHelper(null, jobdetails._id);
        if (!!data && !!data[0]) {
            handleInputChange(setJobdetails, data[0]);
            handleInputChange(setCompanyDetails, data[0]);
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
                handleInputChange(setCompanyDetails, "smallLogo", link);
                handleInputChange(setJobdetails, "imagePath", link);
            }
        } else {
            if (fileSize < 500000) {
                link = await generateLinkfromImage(e, false);
                handleInputChange(setCompanyDetails, "largeLogo", link);
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

        if (!!selectedCompany && !!selectedCompany?._id) {
            updateCompanyDetailsHelper(companyDetails, selectedCompany?._id);
            jobDetailsforAPI = { ...jobdetails, companyId: selectedCompany?._id };
        } else {
            let companyId = await submitCompanyDetailsHelper(companyDetails);
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
        handleInputChange(setCompanyDetails, "companyName", companyName);
        handleInputChange(setJobdetails, { companyName, title: jobTitle });
    };

    // handle company job title change
    const handleJobRoleChange = (role) => {
        const jobTitle = generateJobTitle(jobdetails?.companyName || "", role);
        handleInputChange(setJobdetails, { role, title: jobTitle });

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
            filterJobBasedonName(companyListData, companyName);
            setSavedJobId(jobData?._id);
            setJobAlreadyExist(true);
            const normalizedJob = { ...jobData, jdpage: jobData?.jdpage === true || jobData?.jdpage === "true" };
            handleInputChange(setJobdetails, normalizedJob);
            handleInputChange(setCompanyDetails, jobData);
        }
    };

    // update both company and job details when companyinfo change
    const handleCompanyInfoChange = (val) => {
        handleInputChange(setJobdetails, "aboutCompany", val);
        handleInputChange(setCompanyDetails, "companyInfo", val);
    };

    const filterJobBasedonName = (companyList, companyNameToFind) => {
        if (!companyList || !Array.isArray(companyList) || companyList.length === 0) {
            return;
        }

        const nameToFind = companyNameToFind || companyDetails?.companyName || companyName;
        if (!nameToFind) return;

        const normalizedNameToFind = nameToFind.toLowerCase().trim();
        const companyData = companyList.find((item) => {
            if (!item?.companyName) return false;
            const normalizedCompanyName = item.companyName.toLowerCase().trim();
            return normalizedCompanyName === normalizedNameToFind || normalizedCompanyName.includes(normalizedNameToFind);
        });

        if (companyData) {
            setSelectedCompany(companyData);
        }
    };

    // fetch list of available companies
    const getCompanyList = async () => {
        const data = await get(`${apiEndpoint.getCompanyDetails}`);
        filterJobBasedonName(data);
        setCompanyListData(data);
    };

    // check query param for job id
    const checkQueryParam = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");

        if (jobId && /^[a-f\d]{24}$/i.test(jobId)) {
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

            const jobDetailsUpdates = {};
            const companyDetailsUpdates = {};
            const blockedFields = new Set(["_id", "companyId", "isActive", "priority"]);

            Object.keys(parsedData).forEach((key) => {
                if (blockedFields.has(key)) return;

                if (key in jobdetails) {
                    if ((key === "tags" || key === "skilltags") && Array.isArray(parsedData[key])) {
                        jobDetailsUpdates[key] = [...parsedData[key]];
                    } else if (key === "link" && typeof parsedData[key] === "string") {
                        jobDetailsUpdates[key] = safeUrl(parsedData[key]);
                    } else if (typeof parsedData[key] === "string" && parsedData[key].length < 10000) {
                        jobDetailsUpdates[key] = parsedData[key];
                    } else if (typeof parsedData[key] !== "string") {
                        jobDetailsUpdates[key] = parsedData[key];
                    }
                }
                if (key in companyDetails) {
                    if (typeof companyDetails[key] === "string" && parsedData[key]?.length > 10000) {
                        return;
                    }
                    companyDetailsUpdates[key] = parsedData[key];
                }
            });

            if (Object.keys(jobDetailsUpdates).length > 0) {
                handleInputChange(setJobdetails, jobDetailsUpdates);
            }

            if (Object.keys(companyDetailsUpdates).length > 0) {
                handleInputChange(setCompanyDetails, companyDetailsUpdates);
            }

            if (parsedData.companyName) {
                handleCompanyNameChange(parsedData.companyName);
                if (companyListData && companyListData.length > 0) {
                    filterJobBasedonName(companyListData, parsedData.companyName);
                }
            }

            if (parsedData.role) {
                handleJobRoleChange(parsedData.role);
            }
        } catch (error) {
            console.error("Error parsing JSON data:", error.message);
        }
    };

    // Textarea change handler
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
        <div className="max-w-full overflow-x-hidden">
            <h2 className="text-2xl font-bold tracking-tight mb-6">{jobAlreadyExist ? "Update" : "Add"} Job Details</h2>

            {/* circular overlay loader */}
            {!!showLoader && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="h-[90px] w-[90px] animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            )}

            {/* JSON Paste Section */}
            <Card className="mb-6 border-dashed bg-muted/30">
                <CardContent className="pt-6">
                    <textarea
                        className="w-full h-[120px] p-4 rounded-md border border-input bg-background text-sm resize-y outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                        placeholder="Paste job details JSON here"
                        value={jobdataInfo || ""}
                        onChange={handleTextareaChange}
                        aria-label="Job details JSON input"
                    />
                </CardContent>
            </Card>

            {/* Main job details section */}
            <div className="flex justify-between gap-6 w-full max-xl:flex-col">
                <div className="w-[70%] max-xl:w-full space-y-8">
                    {/* Company & Role */}
                    <Card className="shadow-md border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Company & Role</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center gap-4 max-lg:flex-col max-lg:items-start max-lg:w-full">
                                <SearchBar
                                    handleCompanyNameChange={handleCompanyNameChange}
                                    width="400px"
                                    searchSuggestionList={companyListData}
                                    selectedCompany={selectedCompany}
                                    setSelectedCompany={setSelectedCompany}
                                />
                                <CustomTextField label="Role of the job *" value={jobdetails?.role || ""} onChange={(val) => handleJobRoleChange(val)} fullWidth />
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-2">Select tags* :</p>
                                <div className="flex flex-wrap gap-1.5">{categoriesWithTags}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Skills Required</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 max-sm:flex-col max-sm:items-stretch">
                                <Button
                                    variant="default"
                                    onClick={handleAddSkillTag}
                                    disabled={!customSkillTag.trim()}
                                    className="h-10 min-w-[120px] capitalize"
                                >
                                    Add Skill
                                </Button>
                                <CustomTextField label="Add skill" value={customSkillTag} onChange={(val) => setCustomSkillTag(val)} fullWidth placeholder="Type a skill and click Add" />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Common skills (click to add):</p>
                                <div className="flex flex-wrap gap-1.5">{skillTagsWithChips}</div>
                            </div>

                            {jobdetails.skilltags.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Selected skills:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jobdetails.skilltags.map((skill) => (
                                            <Badge key={skill} className="transition-all hover:-translate-y-0.5">
                                                {skill}
                                                <button onClick={() => handleRemoveSkillTag(skill)}>
                                                    <X className="ml-1 h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Job Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CustomTextField
                                fullWidth
                                label={igbannertitle?.length > 30 ? "Max length is 30" : "Banner title (for IG/LinkedIn)"}
                                value={igbannertitle}
                                onChange={(val) => setIgbannertitle(val)}
                                error={igbannertitle?.length > 26}
                            />

                            <CustomTextField label="Link for the job application *" value={jobdetails?.link || ""} onChange={(val) => handleInputChange(setJobdetails, "link", val)} fullWidth />

                            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
                                <CustomTextField
                                    label="Job Id (Official page)"
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

                            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
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

                            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
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

                            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
                                <CustomTextField
                                    label="Expected salary"
                                    value={jobdetails.salary}
                                    onChange={(val) => handleInputChange(setJobdetails, "salary", val)}
                                    fullWidth
                                />
                                <CustomTextField
                                    label="Type of Job"
                                    value={jobdetails.jobtype}
                                    onChange={(val) => handleInputChange(setJobdetails, "jobtype", val)}
                                    fullWidth
                                    type="select"
                                    optionData={jobTypeOptions}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
                                <CustomTextField
                                    label="Type of the company"
                                    value={jobdetails.companytype}
                                    onChange={(val) => handleInputChange(setJobdetails, "companytype", val)}
                                    fullWidth
                                    type="select"
                                    optionData={companyTypeOptions}
                                />
                                <CustomTextField
                                    label="Redirection platform"
                                    value={jobdetails.platform}
                                    onChange={(val) => handleInputChange(setJobdetails, "platform", val)}
                                    fullWidth
                                    type="select"
                                    optionData={platformOptions}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last date to apply</label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        type="date"
                                        value={jobdetails.lastdate}
                                        min="2018-01-01"
                                        max="2026-12-31"
                                        onChange={(e) => handleInputChange(setJobdetails, "lastdate", e.target.value)}
                                    />
                                </div>
                                <CustomTextField label="Priority" value={jobdetails.priority} onChange={(val) => handleInputChange(setJobdetails, "priority", val)} fullWidth />
                            </div>
                        </CardContent>
                    </Card>

                    {!!jobAlreadyExist && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">Job expired:</span>
                                    <Switch
                                        checked={jobdetails.isActive}
                                        onCheckedChange={() => handleInputChange(setJobdetails, "isActive", !jobdetails.isActive)}
                                    />
                                    <Label className="text-muted-foreground">Turn off if expired</Label>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Company Logos Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">Company Logos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Small Logo (Max 20kb)</p>
                            <input type="file" className="text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-secondary file:text-secondary-foreground cursor-pointer" onChange={(e) => handleCompanyLogoInput(e)} />
                        </div>
                        <p className="text-sm text-muted-foreground">Size: {companyLogoSize}kb</p>
                        {companyDetails.smallLogo && <img src={companyDetails.smallLogo} width="50" height="50" alt="logo" className="rounded" />}
                    </div>
                    {companyLogoSize > 10 && <p className="text-destructive text-sm">Image size should be less than 10kb after compression</p>}

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Banner Logo</p>
                            <input accept="image/*" type="file" className="text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-secondary file:text-secondary-foreground cursor-pointer" onChange={(e) => handleCompanyLogoInput(e, false)} />
                        </div>
                        {companyDetails.largeLogo && <img src={companyDetails.largeLogo} width="200" height="60" alt="logo" className="rounded" />}
                    </div>
                </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CustomTextField fullWidth label="Company careers page" value={companyDetails.careerPageLink} onChange={(val) => handleInputChange(setCompanyDetails, "careerPageLink", val)} />
                    <CustomTextField fullWidth label="LinkedIn page link" value={companyDetails.linkedinPageLink} onChange={(val) => handleInputChange(setCompanyDetails, "linkedinPageLink", val)} />
                    <CustomTextField
                        fullWidth
                        label="Type of the company"
                        value={companyDetails.companyType}
                        onChange={(val) => handleInputChange(setCompanyDetails, "companyType", val)}
                        type="select"
                        optionData={companyTypeOption}
                    />
                    <CustomCKEditor label="About the company" value={companyDetails.companyInfo} onChange={(val) => handleCompanyInfoChange(val)} />
                </CardContent>
            </Card>

            {/* Banner Download */}
            <div className="my-6">
                <Button
                    onClick={() => downloadImagefromCanvasHelper(jobdetails?.companyName, canvasId, false)}
                    variant="outline"
                    className="capitalize"
                >
                    Download IG Banner
                    <CloudDownload className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {/* Job Description Section */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={jobdetails.jdpage}
                            onCheckedChange={() => handleInputChange(setJobdetails, "jdpage", !jobdetails.jdpage)}
                        />
                        <CardTitle className="text-lg">Job Description Fields</CardTitle>
                    </div>
                </CardHeader>
                {!!jobdetails.jdpage && (
                    <CardContent className="space-y-6">
                        <CustomCKEditor label="Job Description" value={jobdetails.jobdesc} onChange={(val) => handleInputChange(setJobdetails, "jobdesc", val)} />
                        <CustomCKEditor label="Eligibility Criteria" value={jobdetails.eligibility} onChange={(val) => handleInputChange(setJobdetails, "eligibility", val)} />
                        <CustomCKEditor label="Responsibility" value={jobdetails.responsibility} onChange={(val) => handleInputChange(setJobdetails, "responsibility", val)} />
                        <CustomCKEditor label="Benefits" value={jobdetails.benifits} onChange={(val) => handleInputChange(setJobdetails, "benifits", val)} />
                        <CustomCKEditor label="Skills needed" value={jobdetails.skills} onChange={(val) => handleInputChange(setJobdetails, "skills", val)} />
                    </CardContent>
                )}
            </Card>

            {/* JD Banner Upload */}
            <Card className="mb-6">
                <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-medium">Upload JD banner:</p>
                        <input type="file" className="text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-secondary file:text-secondary-foreground cursor-pointer" onChange={(e) => generateImageCDNlink(e)} />
                    </div>
                    {jobdetails.jdBanner !== "N" && (
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground break-all">{jobdetails.jdBanner}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipBoard(jobdetails.jdBanner)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="w-[70%] mb-10 max-xl:w-full">
                <Button
                    className="w-full py-3 text-base capitalize font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={addJobDetails}
                    disabled={showLoader || jobdetails?.link?.length === 0 || jobdetails?.tags?.length === 0}
                    size="lg"
                >
                    {showLoader ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        `${jobAlreadyExist ? "Update" : "Submit"} Job details`
                    )}
                </Button>
            </div>

            <CustomDivider />

            {/* Canvas - DO NOT MODIFY */}
            <Canvas jobdetails={jobdetails} companyDetails={companyDetails} igbannertitle={igbannertitle} />
        </div>
    );
};

export default AddjobsComponent;
