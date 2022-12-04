import React, { useContext, useState } from "react";
import html2canvas from "html2canvas";
import styles from "./addjobs.module.scss";

// mui import
import {
    TextField,
    Button,
    IconButton,
    FormGroup,
    Switch,
    FormControlLabel,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import MenuItem from "@mui/material/MenuItem";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import images
import logo from "../../Image/logo.svg";
import linkedin from "../../Image/linkedin.png";
import instagram from "../../Image/instagram.png";
import telegram from "../../Image/telegram.png";

// import ck editior
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { config } from "../../Config/editorConfig";

// import helpers
import { shortenurl } from "../../Helpers/utility";
import { API } from "../../Backend";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";

const degreeOptions = [
    "B.E / B.Tech / M.Tech",
    "B.E / B.Tech",
    "B.E / B.Tech / M.Tech / MCA",
    "B.E / B.Tech / M.Tech / MCA / BCA",
    "Any graduate",
    "Any engineering graduate",
    "Any bachelor's degree",
];

const batchOptions = [
    "2022 / 2021 /2020 / 2019",
    "2022 / 2021 /2020",
    "2023 / 2024",
    "2023 / 2022 / 2021",
    "2022 / 2021 /2020 / 2019 / 2018",
    "Any graduate",
];

const expOptions = [
    "N",
    "0 - 2 years",
    "Freshers",
    "0 - 3 years",
    "0 - 4 years",
    "0 - 1 years",
];

const locOptions = [
    "N",
    "Bengaluru",
    "Gurgaon",
    "Chennai",
    "Pune",
    "Noida",
    "Hyderabad",
    "PAN India",
];

const companyTypeOptions = ["N", "product", "service"];
const jobTypeOptions = ["N", "Full time", "Internship", "Part time"];

const Addjobs = () => {
    ClassicEditor.defaultConfig = config;
    const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY;

    const [igbannertitle, setIgbannertitle] = useState("is hiring ");
    const [link, setLink] = useState("");
    const [degree, setDegree] = useState("B.E / B.Tech / M.Tech");
    const [batch, setBatch] = useState("2022 / 2021 / 2020");
    const [experience, setExperience] = useState("N");
    const [location, setLocation] = useState("N");
    const [salary, setSalary] = useState("N");
    const [jdpage, setJdpage] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [title, setTitle] = useState("");

    const [companytype, setCompanytype] = useState("N");
    const [lastdate, setLastdate] = useState("2022-11-00-");
    const [role, setRole] = useState("N");

    const [jobtype, setJobtype] = useState("N");
    const [jobdesc, setJobdesc] = useState("N");
    const [eligibility, setEligibility] = useState("N");
    const [responsibility, setResponsibility] = useState("N");
    const [skills, setSkills] = useState("N");
    const [aboutCompany, setAboutCompany] = useState("N");

    const [telegrambanner, setTelegrambanner] = useState("N");

    const navigate = useNavigate();
    const handleBack = () => {
        navigate("/admin");
    };

    const context = useContext(UserContext);

    if (!context.user?.email) {
        return <Navigate to="/" />;
    }

    const formData = new FormData();

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
            // setTimeout(refreshPage(), 2000)
        } else {
            toast.error("An error Occured");
        }
        setTelegrambanner(data.url);
    };

    // handle company logo input for website
    const handleLogoInput = (e) => {
        const file = e.target.files;
        formData.append("photo", file[0]);
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

        const res = await fetch(`${API}/jd/add`, {
            method: "POST",
            body: formData,
        });

        if (res.status === 201) {
            toast("Job Data Added Successfully");
        } else {
            toast.error("An error Occured");
        }
    };

    return (
        <div className={styles.container}>
            <div
                onClick={handleBack}
                style={{ display: "flex", alignItems: "center" }}>
                <img
                    style={{ width: "30px", marginRight: "10px" }}
                    src="https://img.icons8.com/ios-filled/100/null/circled-left-2.png"
                    alt="back button"
                />
                <h3>Back</h3>
            </div>
            <ToastContainer />
            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <TextField
                        size="small"
                        margin="normal"
                        fullWidth
                        label="Title of the job *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className={styles.flex_con}>
                        <TextField
                            size="small"
                            sx={{ width: "20ch" }}
                            label="Company Name"
                            margin="normal"
                            value={companyName}
                            onChange={(e) => {
                                setCompanyName(e.target.value);
                                setTitle(e.target.value);
                            }}
                        />
                        <TextField
                            size="small"
                            margin="normal"
                            fullWidth
                            label="Title for Instagram banner"
                            value={igbannertitle}
                            onChange={(e) => {
                                setIgbannertitle(e.target.value);
                                setTitle(companyName + " " + e.target.value);
                            }}
                        />
                    </div>
                    <div className={styles.flex}>
                        <TextField
                            size="small"
                            margin="normal"
                            fullWidth
                            label="Link for the job application *"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                        <IconButton
                            sx={{ mt: 1 }}
                            color="secondary"
                            aria-label="delete"
                            size="large"
                            onClick={shortenLink}>
                            <CloudDownloadIcon fontSize="inherit" />
                        </IconButton>
                    </div>
                    <TextField
                        select
                        size="small"
                        margin="normal"
                        fullWidth
                        label="Degree *"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}>
                        {degreeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <div className={styles.flex_con}>
                        <TextField
                            select
                            size="small"
                            fullWidth
                            margin="normal"
                            label="Batch *"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}>
                            {batchOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            size="small"
                            fullWidth
                            margin="normal"
                            label="Salary"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                        />
                    </div>
                    <div className={styles.flex_con}>
                        <TextField
                            size="small"
                            fullWidth
                            margin="normal"
                            label="Experience needed *"
                            value={experience}
                            select
                            onChange={(e) => setExperience(e.target.value)}>
                            {expOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            size="small"
                            fullWidth
                            margin="normal"
                            label="Location *"
                            value={location}
                            select
                            onChange={(e) => setLocation(e.target.value)}>
                            {locOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div
                        style={{ marginTop: "20px" }}
                        className={styles.flex_con}>
                        <TextField
                            size="small"
                            fullWidth
                            label="Type of the company"
                            value={companytype}
                            select
                            onChange={(e) => setCompanytype(e.target.value)}>
                            {companyTypeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            size="small"
                            fullWidth
                            label="Last data to Apply"
                            value={lastdate}
                            onChange={(e) => setLastdate(e.target.value)}
                        />
                        <TextField
                            size="small"
                            fullWidth
                            label="Type of Job"
                            value={jobtype}
                            select
                            onChange={(e) => setJobtype(e.target.value)}>
                            {jobTypeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div style={{ marginTop: "30px" }} className={styles.flex}>
                        <Button
                            style={{ textTransform: "capitalize" }}
                            onClick={handleDownloadImage}
                            variant="contained"
                            color="success"
                            endIcon={<CloudDownloadIcon />}>
                            Download Banner
                        </Button>
                    </div>
                </div>
            </div>

            <br />
            <hr />
            <br />
            <div>
                <FormGroup>
                    <FormControlLabel
                        onChange={() => setJdpage(!jdpage)}
                        control={<Switch />}
                        label="Show Job description"
                    />
                </FormGroup>
                <br />

                {jdpage && (
                    <div className={styles.editor_fields}>
                        <TextField
                            size="small"
                            fullWidth
                            margin="normal"
                            label="Role of the Job"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <div className={styles.ck_grid}>
                            <p className={styles.editor_label}>
                                Job Description :-
                            </p>
                            <CKEditor
                                className={styles.ck_input}
                                editor={ClassicEditor}
                                value={jobdesc}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setJobdesc(data);
                                }}
                            />

                            <p className={styles.editor_label}>
                                Eligibility Criteria :-
                            </p>
                            <CKEditor
                                className={styles.ck_input}
                                editor={ClassicEditor}
                                value={eligibility}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setEligibility(data);
                                }}
                            />

                            <p className={styles.editor_label}>
                                Responsibility of the job :-
                            </p>
                            <CKEditor
                                className={styles.ck_input}
                                editor={ClassicEditor}
                                value={responsibility}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setResponsibility(data);
                                }}
                            />

                            <p className={styles.editor_label}>
                                Skills needed :-
                            </p>
                            <CKEditor
                                className={styles.ck_input}
                                editor={ClassicEditor}
                                value={skills}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setSkills(data);
                                }}
                            />

                            <p className={styles.editor_label}>
                                About the company :-
                            </p>
                            <CKEditor
                                className={styles.ck_input}
                                editor={ClassicEditor}
                                value={aboutCompany}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    setAboutCompany(data);
                                }}
                            />
                        </div>
                    </div>
                )}
                <p style={{ fontSize: "8px" }}>*{telegrambanner}</p>
                <br />
            </div>
            {/* 
            <div id="htmlToCanvas" className={styles.canvas}>
                <div className={styles.gridBox} id="div1">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div2">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div3"></div>
                <div className={styles.gridBox} id="div4">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div5">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div6"></div>
                <div className={styles.gridBox} id="div7">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div8">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div9">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div10">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div11">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div12">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div13">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div14">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div15">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div16">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div17">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div18">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div19">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div20">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div21">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div22"></div>
                <div className={styles.gridBox} id="div23">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div24">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div25">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div26">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div27">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div28">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div29">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div30">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div31">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div32">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div33">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div34">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div35">
                    {" "}
                </div>
                <div className={styles.gridBox} id="div36">
                    {" "}
                </div>
            </div> */}

            <br />
            <div className={styles.submitbtn_zone}>
                <div className={styles.telegrambtn_zone}>
                    <input type="file" onChange={handleTelegramImgInput} />
                    <br />
                    <Button
                        style={{ textTransform: "capitalize" }}
                        onClick={handleTelegramSubmit}
                        variant="contained"
                        color="primary">
                        {" "}
                        Send to telegram
                    </Button>
                </div>
            </div>

            <br />
            <hr />
            <br />

            <div className={styles.submitbtn_zone}>
                <br />
                <div>
                    <input type="file" onChange={handleLogoInput} />
                    <br />
                    <br />
                    <Button
                        style={{ textTransform: "capitalize" }}
                        className={styles.submitbtn}
                        onClick={addData}
                        variant="contained"
                        color="primary"
                        size="large">
                        Submit
                    </Button>
                </div>
            </div>
            <br />

            <div id="htmlToCanvas" className={styles.canvas}>
                <div className={styles.canvas_header}>
                    <p className={styles.weblink}>
                        visit - <span> careersat.tech</span>
                    </p>
                    <img className={styles.logo} src={logo} alt="logo" />
                </div>

                <div className={styles.companylogo_con}>
                    <h1>{companyName}</h1>
                </div>

                <div className={styles.canvas_title}>
                    <h1>{igbannertitle}</h1>
                </div>

                <div className={styles.canvas_details}>
                    {degree !== "N" && (
                        <p>
                            <span className={styles.tag}>Degree</span> :{" "}
                            <span>{degree}</span>
                        </p>
                    )}
                    {batch !== "N" && (
                        <p>
                            <span className={styles.tag}>Batch</span> :{" "}
                            <span>{batch}</span>
                        </p>
                    )}
                    {experience !== "N" && (
                        <p>
                            <span className={styles.tag}>Experience</span> :{" "}
                            <span>{experience}</span>
                        </p>
                    )}
                    {experience === "N" && salary !== "N" && (
                        <p>
                            <span className={styles.tag}>Salary</span> :{" "}
                            <span>₹{salary}</span>
                        </p>
                    )}
                    {location !== "N" && (
                        <p>
                            <span className={styles.tag}>Location</span> :{" "}
                            <span>{location}</span>
                        </p>
                    )}
                    {location === "N" && salary !== "N" && (
                        <p>
                            <span className={styles.tag}>Salary</span> :{" "}
                            <span>₹{salary}</span>
                        </p>
                    )}
                    <p>
                        <span className={styles.tag}>Apply Link</span> :{" "}
                        <span>Link in Bio (visit : careersat.tech)</span>
                    </p>
                </div>

                <div className={styles.footer}>
                    <img src={instagram} alt="instagram-logo" />
                    <img src={telegram} alt="telegram-logo" />
                    <img src={linkedin} alt="linkedin-logo" />
                    <p>
                        Follow <span>@carrersattech</span> to get regular Job
                        updates.
                    </p>
                </div>
            </div>
            <br />
            <br />
            {/* <hr /> */}

            <br />
        </div>
    );
};

export default Addjobs;
