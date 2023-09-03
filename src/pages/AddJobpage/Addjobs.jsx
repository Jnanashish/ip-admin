import React, { useContext, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import styles from "./addjobs.module.scss";

// custom components
import Canvas from "../../Components/Canvas/canvas";
import CustomTextField from "../../Components/Input/Textfield";
import CustomCKEditor from "../../Components/CkEditor/CkEditor";
import CustomDivider from "../../Components/Divider/Divider";

// mui import
import {
    TextField,
    Button,
    IconButton,
    FormGroup,
    Switch,
    FormControlLabel,
    Divider,
    InputAdornment,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Compressor from "compressorjs";


// import helpers
import { shortenurl } from "../../Helpers/utility";
import { API } from "../../Backend";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";

import { degreeOptions, batchOptions, expOptions, locOptions } from "./addjobdata";

const companyTypeOptions = ["N", "product", "service"];
const jobTypeOptions = ["N", "Full time", "Internship", "Part time"];

const Addjobs = () => {
    const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;

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

    const [companytype, setCompanytype] = useState("product");
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

    const navigate = useNavigate();
    const handleBack = () => {
        navigate("/admin");
    };

    const context = useContext(UserContext);

    useEffect(() => {
        generateLastDatetoApply();
    }, []);
    const formData = new FormData();

    if (!context.user?.email) {
      return <Navigate to="/" />;
    }

    // make the title bold for telegram
    const translate = (char) => {
        let diff;
        if (/[A-Z]/.test(char)) diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
        else diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
        return String.fromCodePoint(char.codePointAt(0) + diff);
    };
    const btitle = title.replace(/[A-Za-z]/g, translate);

    const handleDownloadImage = async () => {
        const element = document.getElementById("htmlToCanvas"),
            canvas = await html2canvas(element);

        var data = canvas.toDataURL("image/jpg");
        var link = document.createElement("a");

        link.href = data;
        link.download = companyName + ".jpg";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // get cloudinary link for telegram
    const handleTelegramImgInput = async (e) => {
        toast("Generating image url from cloudinary");
        const formData2 = new FormData();
        const file = e.target.files;
        formData2.append("photo", file[0]);

        const res = await fetch(`${API}/jd/getposterlink`, {
            method: "POST",
            body: formData2,
        });
        const data = await res.json();
        // console.log(data);
        if (res.status === 201) {
            toast("Successfully link generated");
        } else {
            toast.error("An error Occured");
        }
        setTelegrambanner(data.url);
    };

    const resizeImage = (file) => {
        new Compressor(file, {
            quality: 0.5,
            height: 200,
            width: 200,
            success(result) {
                setCompanyLogoSize(result.size / 1024);
                if (result.size > 5120) {
                    toast.error("Image size should be less than 5kb (After compression), UPLOAD again");
                } else {
                    setResizedImage(result);
                }
            },
            error(err) {
                toast.error("Error in compressing");
            },
        });
    };

    // handle company logo input for website
    const handleLogoInput = (e, compress) => {
        const file = e.target.files;
        setCompanyLogoSize(file[0].size / 1024);

        if (compress) {
            if (file[0].size > 150000) {
                toast.error("Image size should be less than 150kb (Before compression), UPLOAD again");
                return false;
            } else {
                resizeImage(file[0]);
            }
        } else {
            if (file[0].size > 5124) {
                toast.error("Image size should be less than 5kb, UPLOAD again");
                return false;
            } else {
                setResizedImage(file[0]);
            }
        }
    };

    const handleCompanyLogoInput = (e) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            console.log("reader.result", reader.result);
            setCompanyLogo(reader.result);
        });

        reader.readAsDataURL(e.target.files[0]);
    };

    // shorten link using bit.ly
    async function shortenLink() {
        const tempLink = await shortenurl(link);
        setLink(tempLink);
    }

    const sendTelegramMsg = (chanelName) => {
        const msg =
            btitle +
            "%0A%0ABatch%20%3A%20" +
            batch +
            "%0A%0ADegree%20%3A%20" +
            degree +
            "%0A%0AApply Link%20%3A%20" +
            link;

        return fetch(
            `https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${chanelName}&text=${msg}&disable_web_page_preview=true&disable_notification=true`,
            { method: "POST" }
        )
            .then((res) => {
                toast("Message sent");
            })
            .catch((err) => {
                toast.error("An error Occured");
            });
    };
    const sendTelegramMsgwithImage = (chanelName) => {
        const msg = btitle + "%0A%0AApply Link%20%3A%20" + link;

        return fetch(
            `https://api.telegram.org/bot${BOT_API_KEY}/sendPhoto?chat_id=${chanelName}&photo=${telegrambanner}&caption=${msg}&disable_web_page_preview=true&disable_notification=true`,
            {
                method: "POST",
            }
        )
            .then((res) => {
                console.log("SUCCESS");
                toast("Message sent");
            })
            .catch((err) => {
                console.log("ERROR", err);
                toast.error("An error Occured");
            });
    };

    // handle telegram submit
    const handleTelegramSubmit = () => {
        if (batch.includes("2022")) {
            const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2022;
            if (telegrambanner === "N") sendTelegramMsg(MY_CHANNEL_NAME);
            else sendTelegramMsgwithImage(MY_CHANNEL_NAME);
        }
        if (batch.includes("2023")) {
            const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2023;
            if (telegrambanner === "N") sendTelegramMsg(MY_CHANNEL_NAME);
            else sendTelegramMsgwithImage(MY_CHANNEL_NAME);
        }
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME;
        if (telegrambanner === "N") sendTelegramMsg(MY_CHANNEL_NAME);
        else sendTelegramMsgwithImage(MY_CHANNEL_NAME);
    };

    const addData = async (e) => {
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
        formData.append("jdbanner", telegrambanner);
        formData.append("companyName", companyName);
        formData.append("photo", resizedImage);

        const res = await fetch(`${API}/jd/add`, {
            method: "POST",
            body: formData,
        });

        if (res.status === 201) {
            toast("Job Data Added Successfully");
            navigate("/admin");
        } else {
            toast.error("An error Occured");
        }
    };

    const generateLastDatetoApply = () => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 30);

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        setLastdate(formattedDate);
    };

    return (
        <div className={styles.container}>
            <div
                onClick={handleBack}
                style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                }}
            >
                <img
                    style={{ width: "30px", marginRight: "10px" }}
                    src="https://img.icons8.com/ios-filled/100/null/circled-left-2.png"
                    alt="back button"
                />
                <h3>Back to dashboard</h3>
            </div>
            <br />
            <ToastContainer />
            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <CustomTextField
                        label="Title of the job *"
                        value={title}
                        onChange={(val) => setTitle(val)}
                        fullWidth
                    />

                    <div className={styles.flex_con}>
                        <CustomTextField
                            label="Company Name"
                            value={companyName}
                            onChange={(val) => {
                                setCompanyName(val);
                                setTitle(val + " " + igbannertitle);
                            }}
                            sx={{ width: "20ch" }}
                        />
                        <CustomTextField
                            fullWidth
                            label="Title for Instagram banner"
                            value={igbannertitle}
                            onChange={(val) => {
                                setIgbannertitle(val);
                                setTitle(companyName + " is hiring " + val);
                                setRole(val);
                            }}
                        />
                    </div>
                    <div className={styles.flex}>
                        <CustomTextField
                            label="Link for the job application *"
                            value={link}
                            onChange={(val) => setLink(val)}
                            fullWidth
                        />
                        <IconButton
                            sx={{ mt: 1 }}
                            color="secondary"
                            aria-label="delete"
                            size="large"
                            onClick={shortenLink}
                        >
                            <CloudDownloadIcon fontSize="inherit" />
                        </IconButton>
                    </div>

                    <CustomTextField
                        label="Degree *"
                        value={degree}
                        onChange={(val) => setDegree(val)}
                        fullWidth
                        type="select"
                        optionData={degreeOptions}
                    />

                    <div className={styles.flex_con}>
                        <CustomTextField
                            label="Batch *"
                            value={batch}
                            onChange={(val) => setBatch(val)}
                            fullWidth
                            type="select"
                            optionData={batchOptions}
                        />
                        <CustomTextField
                            label="Salary"
                            value={salary}
                            onChange={(val) => setSalary(val)}
                            fullWidth
                            optionData={batchOptions}
                            InputProps={{
                                endAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                        />
                    </div>

                    <div className={styles.commonCopiedText}>
                        <p>Based on glassdoor</p>
                    </div>

                    <div className={styles.flex_con}>
                        <CustomTextField
                            label="Experience needed *"
                            value={experience}
                            onChange={(val) => setExperience(val)}
                            fullWidth
                            type="select"
                            optionData={expOptions}
                        />
                        <CustomTextField
                            label="Location *"
                            value={location}
                            onChange={(val) => setLocation(val)}
                            fullWidth
                            type="select"
                            optionData={locOptions}
                        />
                    </div>
                    <div className={styles.flex_con}>
                        <CustomTextField
                            label="Type of the company"
                            value={companytype}
                            onChange={(val) => setCompanytype(val)}
                            fullWidth
                            type="select"
                            optionData={companyTypeOptions}
                        />
                        <CustomTextField
                            label="Type of Job"
                            value={jobtype}
                            onChange={(val) => setJobtype(val)}
                            fullWidth
                            type="select"
                            optionData={jobTypeOptions}
                        />
                    </div>

                    <div
                        style={{
                            marginTop: "30px",
                            alignItems: "start",
                            flexDirection: "column",
                        }}
                        className={styles.flex}
                    >
                        <label className={styles.lastDateLabel}>Last date to apply</label>
                        <input
                            className={styles.datePicker}
                            type="date"
                            value={lastdate}
                            min="2018-01-01"
                            max="2026-12-31"
                            onChange={(e) => setLastdate(e.target.value)}
                        />
                    </div>
                    <br />
                    <br />
                    <div style={{ display: "flex" }}>
                        <p style={{ paddingRight: "10px" }}>
                            {" "}
                            <b>
                                <b style={{ color: "red" }}>**</b> Upload Company logo
                            </b>{" "}
                            (150kb) :
                        </p>
                        <input type="file" onChange={(e) => handleLogoInput(e, true)} />
                        <p>File Size : {companyLogoSize}</p>
                    </div>
                    <br />
                    <br />
                    <div style={{ display: "flex" }}>
                        <p style={{ paddingRight: "10px" }}>
                            {" "}
                            <b>
                                <b style={{ color: "red" }}>*</b> Upload Company logo
                            </b>{" "}
                            (5kb) :
                        </p>
                        <input type="file" onChange={(e) => handleLogoInput(e, false)} />
                        <p>File Size : {companyLogoSize}</p>
                    </div>
                    <br />
                    <br />
                    <Divider />
                    <div
                        style={{
                            marginTop: "30px",
                            justifyContent: "flex-start",
                        }}
                        className={styles.flex}
                    >
                        <div className={styles.flex}>
                            <h4>* Company Logo for Banner : </h4>
                            <label htmlFor="contained-button-file">
                                <input
                                    accept="image/*"
                                    id="contained-button-file"
                                    multiple
                                    type="file"
                                    onChange={(e) => handleCompanyLogoInput(e)}
                                />
                            </label>
                        </div>
                        <IconButton
                            sx={{ mt: 1 }}
                            color="warning"
                            aria-label="delete"
                            size="large"
                            onClick={() => setCompanyLogo(null)}
                        >
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    </div>
                    <br />
                    <div className={styles.flex} style={{ width: "50%" }}>
                        <TextField
                            size="small"
                            sx={{ width: "10ch" }}
                            label="Img Size"
                            value={imgsize}
                            onChange={(e) => setImgsize(e.target.value)}
                        />
                        <TextField
                            size="small"
                            sx={{ width: "10ch" }}
                            label="Margin left"
                            value={imgmleft}
                            onChange={(e) => setiImgmleft(e.target.value)}
                        />
                        <TextField
                            size="small"
                            sx={{ width: "10ch" }}
                            label="Margin Top"
                            value={paddingtop}
                            onChange={(e) => setPaddingtop(e.target.value)}
                        />
                        <TextField
                            size="small"
                            sx={{ width: "10ch" }}
                            label="Margin Bottom"
                            value={paddingbottom}
                            onChange={(e) => setPaddingbottom(e.target.value)}
                        />
                    </div>
                    <div style={{ marginTop: "30px" }} className={styles.flex}>
                        <Button
                            style={{ textTransform: "capitalize" }}
                            onClick={handleDownloadImage}
                            variant="contained"
                            color="success"
                            endIcon={<CloudDownloadIcon />}
                        >
                            Download IG Banner
                        </Button>
                    </div>
                    <div>
                        <br />
                        <br />
                        <div style={{ display: "flex" }}>
                            <p style={{ paddingRight: "10px" }}>Upload JD banner : </p>
                            <input type="file" onChange={handleTelegramImgInput} />
                        </div>
                        <p style={{ fontSize: "10px" }}>Banner Link : {telegrambanner}</p>
                    </div>
                </div>
            </div>

            <CustomDivider/>

            <div>
                <FormGroup>
                    <FormControlLabel
                        onChange={() => setJdpage(!jdpage)}
                        control={<Switch />}
                        label="Add Job description fields (Optional)"
                    />
                </FormGroup>

                {jdpage && (
                    <div className={styles.editor_fields}>
                        <CustomTextField
                            label="Role of the Job"
                            value={role}
                            onChange={(val) => setRole(val)}
                            fullWidth
                        />

                        <div className={styles.ck_grid}>
                            <CustomCKEditor
                                label="Job Description : "
                                value={jobdesc}
                                onChange={(val) => setJobdesc(val)}
                            />
                            <CustomCKEditor
                                label="Eligibility Criteria : "
                                value={eligibility}
                                onChange={(val) => setEligibility(val)}
                            />
                            <CustomCKEditor
                                label="Responsibility of the job : "
                                value={responsibility}
                                onChange={(val) => setResponsibility(val)}
                            />
                            <CustomCKEditor
                                label="Skills needed : "
                                value={skills}
                                onChange={(val) => setSkills(val)}
                            />
                            <CustomCKEditor
                                label="About the company : "
                                value={aboutCompany}
                                onChange={(val) => setAboutCompany(val)}
                            />
                        </div>
                    </div>
                )}
            </div>
				<CustomDivider/>
            <div className={styles.submitbtn_zone}>
                <div className={styles.telegrambtn_zone}>
                    <Button
                        style={{ textTransform: "capitalize" }}
                        onClick={handleTelegramSubmit}
                        variant="contained"
                        color="primary"
                    >
                        Send to telegram
                    </Button>
                </div>
            </div>
            <CustomDivider/>

            <div className={styles.submitbtn_zone}>
                <br />
                <div>
                    <Button
                        style={{ textTransform: "capitalize" }}
                        className={styles.submitbtn}
                        onClick={addData}
                        disabled={link.length === 0}
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Submit Job details
                    </Button>
                </div>
            </div>
            <br />
            <br />

            <Canvas
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
            />

            <br />
            <div style={{ marginTop: "30px" }} className={styles.flex}>
                <Button
                    style={{ textTransform: "capitalize" }}
                    onClick={handleDownloadImage}
                    variant="contained"
                    color="success"
                    endIcon={<CloudDownloadIcon />}
                >
                    Download IG Banner
                </Button>
            </div>
            <br />
            <br />
        </div>
    );
};

export default Addjobs;
