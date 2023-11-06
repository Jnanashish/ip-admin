import React, { useContext, useEffect, useState } from "react";
import styles from "./addjobs.module.scss";

// custom components
import Canvas from "../../Components/Canvas/canvas";
import CustomTextField from "../../Components/Input/Textfield";
import CustomCKEditor from "../../Components/CkEditor/CkEditor";
import CustomDivider from "../../Components/Divider/Divider";
import Backtodashboard from "./Components/Backtodashboard";
import JobsattechBanner from "../../Components/Canvas/jobsattechBanner";

// mui import
import { TextField, Button, IconButton, FormGroup, Switch, FormControlLabel, InputAdornment } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

// import helpers
import { shortenurl } from "../../Helpers/utility";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";

import { degreeOptions, batchOptions, expOptions, locOptions, jobTypeOptions, companyTypeOptions } from "./Helpers/staticdata";
import { downloadImagefromCanvasHelper, generateImageCDNlinkHelper, handleImageInputHelper, uploadBannertoCDNHelper } from "../../Helpers/imageHelpers";
import { generateLastDatetoApplyHelper, getCompanyLogoHelper, addJobDataHelper } from "./Helpers";
import { copyToClipBoard, uploadCompanyLogoHelper } from "../../Helpers/utility";

const AddjobsComponent = () => {
    const [isAdmin, setIsAdmin] = useState(false)

    const [igbannertitle, setIgbannertitle] = useState("");
    const [link, setLink] = useState("");

    const [degree, setDegree] = useState("B.E / B.Tech / M.Tech");
    const [batch, setBatch] = useState("2022 / 2021 / 2020");
    const [experience, setExperience] = useState("0 - 2 years");
    const [location, setLocation] = useState("Bengaluru");
    const [salary, setSalary] = useState("N");
    const [jdpage, setJdpage] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [title, setTitle] = useState("");

    const [companytype, setCompanytype] = useState(isAdmin ? "product" : "jobs");
    const [lastdate, setLastdate] = useState(null);
    const [role, setRole] = useState("N");

    const [jobtype, setJobtype] = useState("Full time");
    const [jobdesc, setJobdesc] = useState("N");
    const [eligibility, setEligibility] = useState("N");
    const [responsibility, setResponsibility] = useState("N");
    const [skills, setSkills] = useState("N");
    const [aboutCompany, setAboutCompany] = useState("N");

    const [telegrambanner, setTelegrambanner] = useState("N");
    const [companyLogo, setCompanyLogo] = useState(null);

    const [imgsize, setImgsize] = useState("60%");
    const [imgmleft, setiImgmleft] = useState("0px");
    const [paddingtop, setPaddingtop] = useState("0px");
    const [paddingbottom, setPaddingbottom] = useState("0px");
    const [companyLogoSize, setCompanyLogoSize] = useState(0);
    const [resizedImage, setResizedImage] = useState(null);

    const [imagePath, setImagePath] = useState(null);
    const [companyLogoBanner, setCompanyLogoBanner] = useState(null);

    const [companyBigLogoUrl, setCompanyBigLogoUrl] = useState(null);
    const [companySmallLogoUrl, setCompanySmallLogoUrl] = useState(null);

    const context = useContext(UserContext);
    const formData = new FormData();
    const canvasId = isAdmin ? "htmlToCanvas" : "jobsattechCanvas";
    const navigate = useNavigate();

    const generateLastDatetoApply = () => {
        const formattedDate = generateLastDatetoApplyHelper();
        if (formattedDate) setLastdate(formattedDate);
    };

    useEffect(() => {
        generateLastDatetoApply();
    }, []);

    useEffect(() => {
        if(context.isAdmin){
            setIsAdmin(true)
        }
    }, [context.isAdmin]);

    if (!context.user?.email) {
        return <Navigate to="/"/>;
    }
    

    // upload image to cloudinary and return cdn url
    const generateImageCDNlink = async (e, setter, blob) => {
        const imageUrl = await generateImageCDNlinkHelper(e, blob);
        if (imageUrl) setter(imageUrl);
    };

    // download the banner for social media
    const handleDownloadBanner = async () => {
        const bannerUrl = await downloadImagefromCanvasHelper(companyName, canvasId);
        if (bannerUrl) setTelegrambanner(bannerUrl);
    };

    const uploadBannertoCDN = async () =>{
        if(!telegrambanner || telegrambanner === "" || telegrambanner === "N"){
            const bannerUrl = await uploadBannertoCDNHelper(canvasId);
            if (bannerUrl) setTelegrambanner(bannerUrl);    
            return bannerUrl;
        }    
    }

    // upload the company logo url before submitting
    const handleCompanyLogoSubmit = async () => {
        const data = await uploadCompanyLogoHelper(companyName, companyBigLogoUrl, companySmallLogoUrl); 
    };

    // handle company logo (small) input for website
    const handleCompanySmallLogoInput = async (e) => {
        const file = e.target.files[0];
        setCompanyLogoSize(file.size / 1024);
        const image = await handleImageInputHelper(e);
        
        if (image) {
            setCompanyLogoSize(image.size / 1024);
            generateImageCDNlink(e, setCompanySmallLogoUrl);
            setResizedImage(image);
        } 
    };

    // handle company logo (small) input for website and prepare for display
    const handleCompanyBigLogoInput = (e) => {
        // generateImageCDNlink(e, setCompanyBigLogoUrl);
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setCompanyLogo(reader.result);
        });
        reader.readAsDataURL(e.target.files[0]);
    };

    // shorten link using bit.ly
    const shortenLink = async () => {
        if(link.length > 10){
            const tempLink = await shortenurl(link);
            if (tempLink) setLink(tempLink);
        }
    };

    // get logo of entered company on blur company input
    const getCompanyLogo = async () => {
        if (companyName) {
            const data = await getCompanyLogoHelper(companyName);
            // if(data?.data[0]?.largeLogo != "null") setCompanyLogoBanner(data?.data[0]?.largeLogo);
            if(data?.data[0]?.smallLogo != "null") setImagePath(data?.data[0]?.smallLogo);
        }
    };

    const handleJobTitleChange = (val) =>{
        setIgbannertitle(val);
        setTitle(companyName + " is hiring " + val);
        setRole(val);

        if(val.toLowerCase().includes("intern")){
            setBatch("2025 / 2024 / 2023")
            setExperience("College students")
            setJobtype("Internship")
        }
    }

    // add form data
    const addJobDetails = async (e) => {
        if(companySmallLogoUrl){
            handleCompanyLogoSubmit();
        }
        e.preventDefault();

        formData.append("title", title);
        formData.append("link", link);
        formData.append("batch", batch);
        formData.append("role", role);
        formData.append("jobtype", jobtype);
        formData.append("degree", degree);
        formData.append("salary", salary);
        formData.append("jobdesc", jobdesc);
        formData.append("eligibility", eligibility);
        formData.append("experience", experience);
        formData.append("lastdate", lastdate);
        formData.append("skills", skills);
        formData.append("responsibility", responsibility);
        formData.append("aboutCompany", aboutCompany);
        formData.append("location", location);
        formData.append("jdpage", jdpage);
        formData.append("companytype", companytype);
        if(telegrambanner !== "N") formData.append("jdbanner", telegrambanner);
        formData.append("companyName", companyName);
        formData.append("photo", resizedImage);
        if (imagePath) formData.append("imagePath", imagePath);
        
        const bannerlink = await uploadBannertoCDN()
        console.log("bannerlink", bannerlink)
        if(telegrambanner === "N") formData.append("jdbanner", bannerlink);

        const res = addJobDataHelper(formData);
        if(res.status === 200) navigate("/admin")
    };

    

    return (
        <div className={styles.container}>
            <Backtodashboard/>

            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <CustomTextField label="Title of the job *" value={title} onChange={(val) => setTitle(val)} fullWidth />

                    <div className={styles.flex_con}>
                        <CustomTextField
                            label="Company Name"
                            value={companyName}
                            onChange={(val) => {
                                setCompanyName(val);
                                setTitle(val + " is hiring " + igbannertitle);
                            }}
                            onBlur={getCompanyLogo}
                            sx={{ width: "20ch" }}
                        />
                        <CustomTextField
                            fullWidth
                            label={igbannertitle?.length > 26 ? "Max length is 26" : "Title for Instagram banner"}
                            value={igbannertitle}
                            onChange={(val) => {handleJobTitleChange(val)}}
                            error={igbannertitle?.length > 26}
                        />
                    </div>
                    <div className={styles.flex}>
                        <CustomTextField label="Link for the job application *" value={link} onBlur={shortenLink} onChange={(val) => setLink(val)} fullWidth />
                        {isAdmin && <IconButton sx={{ mt: 1 }} color="secondary" aria-label="delete" size="large" onClick={shortenLink}>
                            <CloudDownloadIcon fontSize="inherit" />
                        </IconButton>}
                    </div>

                    <CustomTextField label="Degree *" value={degree} onChange={(val) => setDegree(val)} fullWidth type="select" optionData={degreeOptions} />

                    <div className={styles.flex_con}>
                        <CustomTextField label="Batch *" value={batch} onChange={(val) => setBatch(val)} fullWidth type="select" optionData={batchOptions} />
                        <CustomTextField
                            label="Salary"
                            value={salary}
                            onChange={(val) => setSalary(val)}
                            fullWidth
                            optionData={batchOptions}
                        />
                    </div>

                    <div className={styles.flex_con}>
                        <CustomTextField label="Experience needed *" value={experience} onChange={(val) => setExperience(val)} fullWidth type="select" optionData={expOptions} />
                        <CustomTextField label="Location *" value={location} onChange={(val) => setLocation(val)} fullWidth type="select" optionData={locOptions} />
                    </div>
                    <div className={styles.flex_con}>
                        <CustomTextField disabled={!isAdmin} label="Type of the company" value={companytype} onChange={(val) => setCompanytype(val)} fullWidth type="select" optionData={companyTypeOptions} />
                        <CustomTextField label="Type of Job" value={jobtype} onChange={(val) => setJobtype(val)} fullWidth type="select" optionData={jobTypeOptions} />
                    </div>

                    <div
                        style={{
                            marginTop: "10px",
                            alignItems: "start",
                            flexDirection: "column",
                        }}
                        className={styles.flex}
                    >
                        <label className={styles.lastDateLabel}>Last date to apply</label>
                        <input className={styles.datePicker} type="date" value={lastdate} min="2018-01-01" max="2026-12-31" onChange={(e) => setLastdate(e.target.value)} />
                    </div>

                    <div style={{ display: "flex", marginTop: "40px" }}>
                        <p style={{ paddingRight: "10px" }}>
                            <b>
                                <span style={{ color: "red" }}>**</span> Upload Company logo
                            </b>
                            (50kb) :
                        </p>
                        <input type="file" onChange={(e) => handleCompanySmallLogoInput(e, true)} />
                        <p>File Size : {companyLogoSize}</p>
                    </div>
                    {imagePath && (
                        <div style={{ display: "flex", marginTop: "40px" }}>
                            <p style={{ paddingRight: "10px" }}>Logo uploaded :</p>
                            <img src={imagePath} width="50" height="50" />
                        </div>
                    )}

                    <CustomDivider />

                    <div style={{ justifyContent: "flex-start" }} className={styles.flex}>
                        <div className={styles.flex}>
                            <h4>* Company Logo for Banner : </h4>
                            <label htmlFor="contained-button-file">
                                <input accept="image/*" id="contained-button-file" multiple type="file" onChange={(e) => handleCompanyBigLogoInput(e)} />
                            </label>
                        </div>
    
                    </div>
                    <div className={styles.flex} style={{ width: "50%", marginTop: "30px" }}>
                        <TextField size="small" sx={{ width: "10ch" }} label="Img Size" value={imgsize} onChange={(e) => setImgsize(e.target.value)} />
                        <TextField size="small" sx={{ width: "10ch" }} label="Margin left" value={imgmleft} onChange={(e) => setiImgmleft(e.target.value)} />
                        <TextField size="small" sx={{ width: "10ch" }} label="Margin Top" value={paddingtop} onChange={(e) => setPaddingtop(e.target.value)} />
                        <TextField size="small" sx={{ width: "10ch" }} label="Margin Bottom" value={paddingbottom} onChange={(e) => setPaddingbottom(e.target.value)} />
                    </div>
                    <div style={{ marginTop: "30px" }} className={styles.flex}>
                        <Button style={{ textTransform: "capitalize" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                            Download IG Banner
                        </Button>
                    </div>
                    <div style={{ marginTop: "30px" }}>
                        <div style={{ display: "flex" }}>
                            <p style={{ paddingRight: "10px" }}>Upload JD banner : </p>
                            <input type="file" onChange={(e) => generateImageCDNlink(e, setTelegrambanner)} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <p style={{ fontSize: "10px" }}>Banner Link : {telegrambanner}</p>
                            <IconButton color="secondary" aria-label="delete" size="small" onClick={() => copyToClipBoard(telegrambanner)}>
                                <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>

            <CustomDivider />

            <div>
                <FormGroup>
                    <FormControlLabel onChange={() => setJdpage(!jdpage)} control={<Switch />} label="Add Job description fields (Optional)" />
                </FormGroup>

                {jdpage && (
                    <div className={styles.editor_fields}>
                        <CustomTextField disabled label="Role of the Job" value={role} onChange={(val) => setRole(val)} fullWidth />

                        <div className={styles.ck_grid}>
                            <CustomCKEditor label="Job Description : " value={jobdesc} onChange={(val) => setJobdesc(val)} />
                            <CustomCKEditor label="Eligibility Criteria : " value={eligibility} onChange={(val) => setEligibility(val)} />
                            <CustomCKEditor label="Responsibility of the job : " value={responsibility} onChange={(val) => setResponsibility(val)} />
                            <CustomCKEditor label="Skills needed : " value={skills} onChange={(val) => setSkills(val)} />
                            <CustomCKEditor label="About the company : " value={aboutCompany} onChange={(val) => setAboutCompany(val)} />
                        </div>
                    </div>
                )}
            </div>

            <CustomDivider />
            <div className={styles.submitbtn_zone}>
                <Button style={{ textTransform: "capitalize" }} className={styles.submitbtn} onClick={addJobDetails} disabled={link.length === 0} variant="contained" color="primary" size="large">
                    Submit Job details
                </Button>
            </div>
            
            {isAdmin ? <Canvas
                companyName={companyName}
                companyLogo={companyLogo}
                igbannertitle={igbannertitle}
                degree={degree}
                batch={batch}
                experience={experience}
                salary={salary}
                location={location}
                imgsize={imgsize}
                imgmleft={imgmleft}
                paddingtop={paddingtop}
                paddingbottom={paddingbottom}
                companyLogoBanner={companyLogoBanner}
            />
             : <JobsattechBanner
                companyName={companyName}
                companyLogo={companyLogo}
                igbannertitle={igbannertitle}
                degree={degree}
                batch={batch}
                experience={experience}
                salary={salary}
                location={location}
                imgsize={imgsize}
                imgmleft={imgmleft}
                paddingtop={paddingtop}
                paddingbottom={paddingbottom}
                companyLogoBanner={companyLogoBanner}
            />}

            <div style={{ marginTop: "30px", marginBottom: "50px" }} className={styles.flex}>
                <Button style={{ textTransform: "capitalize" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                    Download IG Banner
                </Button>
            </div>
        </div>
    );
};

export default AddjobsComponent;
