import React, { useContext, useEffect, useState } from "react";
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
  Divider,
  InputAdornment,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Compressor from "compressorjs";

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
  "B.E / B.Tech / M.Tech / MCA / BCA",
  "B.E / B.Tech / M.Tech / MCA",
  "B.E / B.Tech / M.Tech",
  "B.E / B.Tech",
  "BBA / MBA",
  "Any Graduate",
  "Any Engineering graduate",
  "Any Bachelor's degree",
  "Diploma students",
  "Bachelor's degree in CS and IT",
  "Computer science degree",
];

const batchOptions = [
  "N",
  "2021 / 2020 / 2019",
  "2021 / 2020 ",
  "2022 / 2021 / 2020 / 2019 / 2018",
  "2022 / 2021 / 2020 / 2019",
  "2022 / 2021 / 2020",
  "2022 / 2021",
  "2022",
  "2023 / 2022 / 2021",
  "2023 / 2022",
  "2023",
  "2024 / 2023 / 2022",
  "2024 / 2023",
  "2024",
  "2025 / 2024 / 2023",
  "2025 / 2024",
  "Any graduate",
];

const expOptions = [
  "N",
  "Freshers",
  "0 - 1 years",
  "0 - 2 years",
  "0 - 3 years",
  "0 - 4 years",
  "1 - 2 years",
  "1 - 3 years",
  "0+ years",
  "College students",
  "1 years",
  "1+ years",
  "2+ years",
  "3+ years",
  "Final year student",
  "Any batch",
];

const locOptions = [
  "N",
  "Remote",
  "Work from home (remote)",
  "Bengaluru",
  "Gurgaon",
  "Chennai",
  "Pune",
  "Noida",
  "Hyderabad",
  "Mumbai",
  "Chandigarh",
  "Kolkata",
  "PAN India",
  "Delhi",
  "Hybrid",
  "Bengaluru (Hybrid)",
  "Gurgaon (Hybrid)",
  "Hyderabad (Hybrid)",
  "Noida (Hybrid)",
];

const companyTypeOptions = ["N", "product", "service"];
const jobTypeOptions = ["N", "Full time", "Internship", "Part time"];

const Addjobs = () => {
  ClassicEditor.defaultConfig = config;
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

  // useEffect(() => {
  //     if (link) {
  //         shortenLink();
  //     }
  // }, [link]);

  // if (!context.user?.email) {
  //     return <Navigate to="/" />;
  // }

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
          toast.error(
            "Image size should be less than 5kb (After compression), UPLOAD again"
          );
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
        toast.error(
          "Image size should be less than 150kb (Before compression), UPLOAD again"
        );
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

  var customStyle = {
    imgstyle: {
      height: imgsize,
      marginLeft: imgmleft,
      marginTop: paddingtop,
      marginBottom: paddingbottom,
    },
    imgContainerstyle: {},
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
          <TextField
            size="Normal"
            margin="normal"
            fullWidth
            label="Title of the job *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className={styles.flex_con}>
            <TextField
              size="Normal"
              sx={{ width: "20ch" }}
              label="Company Name"
              margin="normal"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setTitle(e.target.value + " " + igbannertitle);
              }}
            />
            <TextField
              size="Normal"
              margin="normal"
              fullWidth
              label="Title for Instagram banner"
              value={igbannertitle}
              onChange={(e) => {
                setIgbannertitle(e.target.value);
                setTitle(companyName + " is hiring " + e.target.value);
                setRole(e.target.value);
              }}
            />
          </div>
          <div className={styles.flex}>
            <TextField
              size="Normal"
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
              onClick={shortenLink}
            >
              <CloudDownloadIcon fontSize="inherit" />
            </IconButton>
          </div>
          <TextField
            select
            size="Normal"
            margin="normal"
            fullWidth
            label="Degree *"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          >
            {degreeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <div className={styles.flex_con}>
            <TextField
              select
              size="Normal"
              fullWidth
              margin="normal"
              label="Batch *"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            >
              {batchOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="Normal"
              fullWidth
              margin="normal"
              label="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
          </div>
          <div className={styles.flex_con}>
            <TextField
              size="Normal"
              fullWidth
              margin="normal"
              label="Experience needed *"
              value={experience}
              select
              onChange={(e) => setExperience(e.target.value)}
            >
              {expOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="Normal"
              fullWidth
              margin="normal"
              label="Location *"
              value={location}
              select
              onChange={(e) => setLocation(e.target.value)}
            >
              {locOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div style={{ marginTop: "20px" }} className={styles.flex_con}>
            <TextField
              size="Normal"
              fullWidth
              label="Type of the company"
              value={companytype}
              select
              onChange={(e) => setCompanytype(e.target.value)}
            >
              {companyTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            {/* <TextField
                            size="Normal"
                            fullWidth
                            label="Last data to Apply"
                            value={lastdate}
                            onChange={(e) => setLastdate(e.target.value)}
                        /> */}

            <TextField
              size="Normal"
              fullWidth
              label="Type of Job"
              value={jobtype}
              select
              onChange={(e) => setJobtype(e.target.value)}
            >
              {jobTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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

      <br />
      <br />
      <Divider />
      <br />
      <br />

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
            <TextField
              size="Normal"
              fullWidth
              margin="normal"
              label="Role of the Job"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <div className={styles.ck_grid}>
              <p className={styles.editor_label}>Job Description :-</p>
              <CKEditor
                className={styles.ck_input}
                editor={ClassicEditor}
                value={jobdesc}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setJobdesc(data);
                }}
              />

              <p className={styles.editor_label}>Eligibility Criteria :-</p>
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

              <p className={styles.editor_label}>Skills needed :-</p>
              <CKEditor
                className={styles.ck_input}
                editor={ClassicEditor}
                value={skills}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setSkills(data);
                }}
              />

              <p className={styles.editor_label}>About the company :-</p>
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
      </div>
      <br />
      <br />
      <Divider />
      <br />
      <br />
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
      <br />
      <br />
      <Divider />
      <br />
      <br />

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

      {/* ------------------------------  CANVAS -------------------------------------- */}
      <div id="htmlToCanvas" className={styles.canvas}>
        <div className={styles.upper}>
          <div className={styles.canvas_header}>
            <p className={styles.weblink}>
              Visit <span>careersat.tech</span>
            </p>
            <p className={styles.logoText}>
              careers@<span>tech</span>
            </p>
            {/* <img className={styles.logo} src={logo} alt="logo" /> */}
          </div>

          <div className={styles.companylogo}>
            {companyLogo && (
              <img
                style={customStyle.imgstyle}
                src={companyLogo}
                alt="company logo"
              ></img>
            )}
            {!companyLogo && <h1>{companyName}</h1>}
          </div>

          <div className={styles.canvas_title}>
            <h1>{"is hiring " + igbannertitle}</h1>
          </div>
        </div>
        <div className={styles.lower}>
          <div className={styles.canvas_details}>
            {degree !== "N" && (
              <p>
                <span className={styles.tag}>Degree</span> :{" "}
                <span>{degree}</span>
              </p>
            )}
            {batch !== "N" && (
              <p>
                <span className={styles.tag}>Batch</span> : <span>{batch}</span>
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
              <span style={{ color: "#0069ff" }}>
                Link in Bio (visit : careersat.tech)
              </span>
            </p>
          </div>

          <div className={styles.footer}>
            <img src={instagram} alt="instagram-logo" />
            <img src={telegram} alt="telegram-logo" />
            <img src={linkedin} alt="linkedin-logo" />
            <p>
              Follow <span>@carrersattech</span> to get regular Job updates.
            </p>
          </div>
        </div>
      </div>
      {/* ---------------------------------  END ---------------------------------- */}
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
