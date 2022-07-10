import React, {useState} from 'react'
import html2canvas from "html2canvas";

import styles from "./addjobs.module.scss"

// mui import
import {TextField, Button, IconButton, FormGroup, Switch, FormControlLabel} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

// import react toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import images
import logo from "../../Image/logo.svg";
import linkedin from "../../Image/linkedin.png";
import instagram from "../../Image/instagram.png";
import telegram from "../../Image/telegram.png";

// import ck editior
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { config } from "../../Config/editorConfig"

import { shortenurl } from "../../Helpers/utility"

import {API} from "../../Backend"

const Addjobs = () => {
    ClassicEditor.defaultConfig = config;
    const BOT_API_KEY = process.env.REACT_APP_BOT_API_KEY

    const [title, setTitle] = useState('');
    const [igbannertitle, setIgbannertitle] = useState('is hiring ');
    const [link, setLink] = useState('');
    const [degree, setDegree] = useState('B.E / B.Tech / M.Tech');
    const [batch, setBatch] = useState('2022');
    const [experience, setExperience] = useState('N');
    const [location, setLocation] = useState('N');
    const [imgData, setImgData] = useState(null); 
    const [salary, setSalary] = useState('N');
    const [jdpage, setJdpage] = useState(false);    

    const [companytype, setCompanytype] = useState('product / service')
    const [lastdate, setLastdate] = useState('23/7/2022');
    const [role, setRole] = useState('N');

    const [jobtype, setJobtype] = useState('Intern');
    const [jobdesc, setJobdesc] = useState('N');
    const [eligibility, setEligibility] = useState('N');
    const [responsibility, setResponsibility] = useState('N');
    const [skills, setSkills] = useState('N');
    const [aboutCompany, setAboutCompany] = useState('N');

    const [imgsize, setImgsize] = useState('60%');
    const [imgmleft, setiImgmleft] = useState('0px');
    const [paddingtop, setPaddingtop] = useState('0px');

    const formData = new FormData();  

    const translate = (char) => {
        let diff;
        if (/[A-Z]/.test (char)) diff = "𝗔".codePointAt (0) - "A".codePointAt (0);
        else diff = "𝗮".codePointAt (0) - "a".codePointAt (0);
        return String.fromCodePoint (char.codePointAt (0) + diff);
    }
    const btitle = title.replace (/[A-Za-z]/g, translate);

    const handleDownloadImage = async () => {
        const element = document.getElementById('htmlToCanvasVis'),
        canvas = await html2canvas(element);

        var data = canvas.toDataURL('image/jpg');
        var link = document.createElement('a');
    
        link.href = data;
        link.download = 'igposter.jpg';
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };    

    const handleimgInput = (e) =>{
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImgData(reader.result);
        });

        reader.readAsDataURL(e.target.files[0]);
    }

    // handle company logo input for website
    const handleLogoInput = (e) =>{
        const file = e.target.files ;
        formData.append('photo', file[0]);
    }

    // shorten link using bit.ly
    async function shortenLink(){
        const tempLink = await shortenurl(link);
        setLink(tempLink)
    }

    const sendTelegramMsg = (chanelName) => {
        const msg = btitle + "%0A%0ABatch%20%3A%20" + batch + "%0A%0ADegree%20%3A%20" + degree + "%0A%0AApply Link%20%3A%20" + link;

        return fetch(`https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${chanelName}&text=${msg}&disable_web_page_preview=true&disable_notification=true`,{  
            method : "POST", 
        })
        .then(res => {
            console.log("SUCCESS");
            toast('Message sent')
        })
        .catch(err => {
            console.log("ERROR");
            toast.error("An error Occured")
        });
    }

    // handle telegram submit
    const handleTelegramSubmit = () =>{
        if(batch.includes("2022")){
            const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2022
            sendTelegramMsg(MY_CHANNEL_NAME)
        }
        if(batch.includes("2023")){
            const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME_2023
            sendTelegramMsg(MY_CHANNEL_NAME)
        }        
        const MY_CHANNEL_NAME = process.env.REACT_APP_MY_CHANNEL_NAME
        sendTelegramMsg(MY_CHANNEL_NAME)        
    }

    const addData = async (e) =>{
        e.preventDefault();

        formData.append("title", title)
        formData.append("link", link)
        formData.append("batch", batch)
        formData.append("role", role)
        formData.append("jobtype", jobtype)
        formData.append("degree", degree)
        formData.append("salary", salary)
        formData.append("jobdesc", jobdesc)
        formData.append("eligibility", eligibility)
        formData.append("experience", experience)
        formData.append("lastdate", lastdate)
        formData.append("skills", skills)
        formData.append("responsibility", responsibility)
        formData.append("aboutCompany", aboutCompany)
        formData.append("location", location)
        formData.append("jdpage", jdpage)
        formData.append("companytype", companytype)

        
        const res = await fetch(`${API}/jd/add`,{
            method : "POST",
            body : formData
        })

        if(res.status === 201){
            toast('Job Data Added Successfully');
            setTimeout(refreshPage(), 2000)
        } else {
            toast.error("An error Occured")
        }
    }

    const refreshPage = () => {
        window.location.reload(false);
    }

    var style = {
        imgstyle : { height: imgsize, marginLeft:imgmleft },
        imgstyle2 : {  paddingTop: paddingtop }
    }


    return (
        <div className={styles.container}>
            <ToastContainer/>
            <div className={styles.maininput_con}>
                <div className={styles.input_fields}>
                    <TextField 
                        size="small" margin="normal" fullWidth  
                        label="Title of the job" value={title}
                        onChange = {(e) => setTitle(e.target.value)}
                    />
                    <TextField 
                        size="small" margin="normal" fullWidth  
                        label="Title for Instagram banner" value={igbannertitle}
                        onChange = {(e) => setIgbannertitle(e.target.value)}
                    />
                    <div className={styles.flex}>
                        <TextField 
                            size="small" margin="normal" fullWidth                  
                            label="Link for the job application" value={link}
                            onChange = {(e) => setLink(e.target.value)}
                        />
                        <IconButton sx={{ mt: 1 }} color="secondary" aria-label="delete" size="large">
                            <CloudDownloadIcon onClick={shortenLink} fontSize="inherit" />
                        </IconButton>
                    </div>
                    <TextField 
                        size="small" margin="normal" fullWidth                  
                        label="Degree" value={degree}
                        onChange = {(e) => setDegree(e.target.value)}
                    />
                    <div className={styles.flex}>
                        <TextField 
                            size="small" margin="normal"                   
                            label="Batch" value={batch}
                            onChange = {(e) => setBatch(e.target.value)}
                        />
                        <TextField 
                            size="small" margin="normal"                   
                            label="Salary" value={salary}
                            onChange = {(e) => setSalary(e.target.value)}
                        />
                    </div>
                    <div className={styles.flex}>
                        <TextField 
                            size="small" margin="normal"                  
                            label="Experience needed" value={experience}
                            onChange = {(e) => setExperience(e.target.value)}
                        />
                        <TextField 
                            size="small" margin="normal"                                   
                            label="Location" value={location}
                            onChange = {(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <div style={{marginTop: "10px"}} className={styles.flex}>
                        <label htmlFor="contained-button-file">
                            <input 
                                style={{display:"none"}} accept="image/*" 
                                id="contained-button-file" multiple type="file"  
                                onChange = {handleimgInput}                             
                            />
                            <IconButton color="primary" aria-label="upload picture" component="span">
                                    <PhotoCamera  />
                            </IconButton>
                        </label>

                        <TextField 
                            size="small"  sx={{ width: '10ch' }}                 
                            label="Img Size" value={imgsize}
                            onChange = {(e) => setImgsize(e.target.value)}
                        />
                        <TextField 
                            size="small" sx={{ width: '10ch' }}                 
                            label="Margin left"
                            value={imgmleft}
                            onChange = {(e) => setiImgmleft(e.target.value)}
                        />
                        <TextField 
                            size="small"  sx={{ width: '10ch' }}                 
                            label="Padding Top" value={paddingtop}
                            onChange = {(e) => setPaddingtop(e.target.value)}
                        />
                        <IconButton aria-label="delete">
                            <DeleteIcon onClick={() => setImgData("")} />
                        </IconButton>
                        <Button 
                            onClick={handleDownloadImage} 
                            variant="contained" color="success"
                        >
                            Banner
                        </Button>
                    </div>
                </div>

                <div id="htmlToCanvasViss" className={styles.canvas}>
                    <div className={styles.canvas_header}>
                        <p className={styles.weblink}>
                            visit - <span> careersat.tech</span>
                        </p>
                        <img className={styles.logo} src={logo} alt="logo"/>
                    </div>

                    <div className={styles.companylogo_con} style={style.imgstyle2}>
                        {imgData && <img style={style.imgstyle} src={imgData} alt="Company logo"/>}
                    </div>
                    <div className={styles.canvas_title}>
                        <h2>{igbannertitle}</h2>
                    </div>

                    <div className={styles.canvas_details}>
                        {degree !== "N" && <p>Degree : <span>{degree}</span></p>}
                        {batch !== "N" && <p>Batch : <span>{batch}</span></p>}
                        {experience !== "N" && <p>Experience : <span>{experience}</span></p>}
                        {experience === "N" && salary !== "N" && <p>Salary : <span>₹{salary}</span></p>}
                        {location !== "N" && <p>Location : <span>{location}</span></p>}
                        {location === "N" && salary !== "N" && <p>Salary : <span>₹{salary}</span></p>}
                        <p>Apply Link : <span>Link in Bio (visit : careersat.tech)</span></p>
                    </div>
                    
                    <div className={styles.footer}>
                        <img src={instagram} alt="instagram-logo"/>
                        <img src={telegram} alt="telegram-logo"/>
                        <img src={linkedin} alt="linkedin-logo"/>
                        <p>Follow <span>@carrersattech</span> to get regular Job updates.</p>
                    </div>
                </div>
            </div>

            <br />
            <hr />
            <div>
                <FormGroup>
                    <FormControlLabel onChange={()=>setJdpage(!jdpage)} control={<Switch/>} label="Show Job description" />
                </FormGroup>
                <br />

                {jdpage && <div className={styles.editor_fields}>
                    <div className={styles.flex}>
                        <TextField 
                            size="small" fullWidth                 
                            label="Type of the company" value={companytype}
                            onChange = {(e) => setCompanytype(e.target.value)}
                        />  
                        <TextField 
                            size="small"  fullWidth                
                            label="Last data to Apply" value={lastdate}
                            onChange = {(e) => setLastdate(e.target.value)}
                        /> 
                        <TextField 
                            size="small"  fullWidth                
                            label="Type of Job" value={jobtype}
                            onChange = {(e) => setJobtype(e.target.value)}
                        />  
                    </div>  
                    <TextField 
                        size="small"  fullWidth
                        margin='normal'                
                        label="Role of the Job" value={role}
                        onChange = {(e) => setRole(e.target.value)}
                    />   
                    <div className={styles.ck_grid}>

                    <p className={styles.editor_label}>Job Description :-</p>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        value = {jobdesc}
                        onChange={(event, editor) => {
                            const data = editor.getData()
                            setJobdesc(data)
                        }}
                    />

                    <p className={styles.editor_label}>Eligibility Criteria :-</p>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        value = {eligibility}
                        onChange={(event, editor) => {
                            const data = editor.getData()
                            setEligibility(data)
                        }}
                    />

                    <p className={styles.editor_label}>Responsibility of the job :-</p>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        value = {responsibility}
                        onChange={(event, editor) => {
                            const data = editor.getData()
                            setResponsibility(data)
                        }}
                    />

                    <p className={styles.editor_label}>Skills needed :-</p>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        value = {skills}
                        onChange={(event, editor) => {
                            const data = editor.getData()
                            setSkills(data)
                        }}
                    />

                    <p className={styles.editor_label}>About the company :-</p>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        value = {aboutCompany}
                        onChange={(event, editor) => {
                            const data = editor.getData()
                            setAboutCompany(data)
                        }}
                    />

                    </div>           
                </div>}

                <br />   
                <div className={styles.submitbtn_zone}>
                    <div className={styles.flex}>
                        {/* <input type="file" onChange = {handleTelegramImgInput}/> */}
                        <Button onClick={handleTelegramSubmit} 
                            variant="contained" color="primary"
                        > Send to telegram 
                        </Button>
                    </div>
                    <br />
                    <div className={styles.flex}>
                        <input type="file" onChange={handleLogoInput}/>
                        <Button className={styles.submitbtn} onClick={addData} variant="contained" color="primary"
                        > Submit
                    </Button>
                    </div>
                </div>
            </div>

            <div id="htmlToCanvasVis" className={styles.canvasbig}>
                <div className={styles.canvas_header}>
                    <p className={styles.weblinkbig}>
                        visit - <span> careersat.tech</span>
                    </p>
                    <img className={styles.logobig} src={logo} alt="logo"/>
                </div>
                
                <div className={styles.companylogo_con} style={style.imgstyle2}>
                    {imgData && <img style={style.imgstyle} src={imgData} alt="Company logo"/>}
                </div>

                <div className={styles.canvas_title_big}>
                    <h2>{igbannertitle}</h2>
                </div>

                <div className={styles.canvas_details_big}>
                    {degree !== "N" && <p>Degree : <span>{degree}</span></p>}
                    {batch !== "N" && <p>Batch : <span>{batch}</span></p>}
                    {experience !== "N" && <p>Experience : <span>{experience}</span></p>}
                    {experience === "N" && salary !== "N" && <p>Salary : <span>₹{salary}</span></p>}
                    {location !== "N" && <p>Location : <span>{location}</span></p>}
                    <p>Apply Link : <span>Link in Bio (visit : careersat.tech)</span></p>
                </div>
                
                <div className={styles.footerbig}>
                    <img src={instagram} alt="instagram-logo"/>
                    <img src={telegram} alt="telegram-logo"/>
                    <img src={linkedin} alt="linkedin-logo"/>
                    <p>Follow <span>@carrersattech</span> to get regular Job updates.</p>
                </div>
            </div>    
        </div>
    )
}

export default Addjobs;
