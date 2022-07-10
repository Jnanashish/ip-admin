import {useState} from "react";

// import css
import styles from "./editdata.module.scss"


// import ck editior
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { config } from "../../Config/editorConfig"

import {API} from "../../Backend"

// import react toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const EditData = (props) =>{
    ClassicEditor.defaultConfig = config
    // state to store all the links data
    const [title, setTitle] = useState(props.data.title);
    const [role, setRole] = useState(props.data.role);
    const [batch, setBatch] = useState(props.data.batch);
    const [jobtype, setJobtype] = useState(props.data.jobtype);
    const [degree, setDegree] = useState(props.data.degree);
    const [salary, setSalary] = useState(props.data.salary);
    const [link, setLink] = useState(props.data.link);
    const [jobdesc, setJobdesc] = useState(props.data.jobdesc);
    const [eligibility, setEligibility] = useState(props.data.eligibility);
    const [experience, setExperience] = useState(props.data.experience);
    const [lastdate, setLastdate] = useState(props.data.lastdate);
    const [skills, setSkills] = useState(props.data.skills);
    const [responsibility, setResponsibility] = useState(props.data.responsibility);
    const [aboutCompany, setAboutCompany] = useState(props.data.aboutCompany);
    const [location, setLocation] = useState(props.data.location);
    const [imagePath, setImagepath] = useState(props.data.imagePath);
    const id = props.data._id;
    const formData = new FormData();    

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
        formData.append("imagePath", imagePath)

        const res = await fetch(`${API}/jd/update/${id}`,{
            method : "PUT",
            body : formData
        })
        if(res.status === 200){
            toast('Data Updated Successfully')
        } else {
            toast.error("An error Occured")
        }
    }

    return(
        <div className="admin">
        <form method = "POST" >
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Title of the Job : </h3>
                <input className={styles.admin_input} value = {title} 
                    onChange = {(e) => setTitle(e.target.value)}
                    type="text" placeholder = "Title of the job"/>
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Link to register : </h3>
                <input className={styles.admin_input} value = {link} 
                    onChange = {(e) => setLink(e.target.value)}
                    type="text" placeholder = "Link"/>
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Batch : </h3>
                <input className={styles.admin_input} value = {batch} 
                    onChange = {(e) => setBatch(e.target.value)}
                    type="text" />
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Role for the job : </h3>
                <input className={styles.admin_input} value = {role} 
                    onChange = {(e) => setRole(e.target.value)}
                    type="text" />
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Job Type : </h3>
                <input className={styles.admin_input} value = {jobtype} 
                    onChange = {(e) => setJobtype(e.target.value)}
                    type="text" />
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Degree : </h3>
                <input className={styles.admin_input} value = {degree} 
                    onChange = {(e) => setDegree(e.target.value)}
                    type="text" />
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Salary : </h3>
                <input className={styles.admin_input} value = {salary} 
                    onChange = {(e) => setSalary(e.target.value)}
                    type="text" />
            </div>  
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Last application date : </h3>
                <input className={styles.admin_input} value = {lastdate} 
                    onChange = {(e) => setLastdate(e.target.value)}
                    type="text" />
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Experience needed : </h3>
                <input className={styles.admin_input} value = {experience} 
                    onChange = {(e) => setExperience(e.target.value)}
                    type="text" />
            </div>
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Location : </h3>
                <input className={styles.admin_input} value = {location} 
                    onChange = {(e) => setLocation(e.target.value)}
                    type="text" /> 
            </div>

            <div className={styles.ck_grid}>
                <h3 className={styles.admin_label}>Description of job : </h3>
                <CKEditor
                    className={styles.ck_input}
                    editor={ClassicEditor}
                    data = {jobdesc}
                    onChange={(event, editor) => {
                        const data = editor.getData()
                        setJobdesc(data)
                    }}
                />
            </div>

            <div className={styles.ck_grid}>
                <h3 className={styles.admin_label}>Eligibility Criteria : </h3>
                <CKEditor
                    className={styles.ck_input}
                    editor={ClassicEditor}
                    data = {eligibility}
                    onChange={(event, editor) => {
                        const data = editor.getData()
                        setEligibility(data)
                    }}
                />
            </div>

            <div className={styles.ck_grid}>
                <h3 className={styles.admin_label}>Responsibility of the job : </h3>
                <CKEditor
                    className={styles.ck_input}
                    editor={ClassicEditor}
                    data = {responsibility}
                    onChange={(event, editor) => {
                        const data = editor.getData()
                        setResponsibility(data)
                    }}
                />
            </div>

            <div className={styles.ck_grid}>
                <h3 className={styles.admin_label}>Skills needed : </h3>
                <CKEditor
                    className={styles.ck_input}
                    editor={ClassicEditor}
                    data = {skills}
                    onChange={(event, editor) => {
                        const data = editor.getData()
                        setSkills(data)
                    }}
                />
            </div>

            <div className={styles.ck_grid}>
                <h3 className={styles.admin_label}>About the company : </h3>
                <CKEditor
                    className={styles.ck_input}
                    editor={ClassicEditor}
                    data = {aboutCompany}
                    onChange={(event, editor) => {
                        const data = editor.getData()
                        setAboutCompany(data)
                    }}
                />
            </div>   
            <div className={styles.admin_grid}>
                <h3 className={styles.admin_label}>Image Path : </h3>
                <input className={styles.admin_input} value = {imagePath} 
                    onChange = {(e) => setImagepath(e.target.value)}
                    type="text" />
            </div>               
            <button className = {styles.admin_btn} type= "button" 
                onClick = {addData}
                >Update
            </button>
            <ToastContainer/>
        </form>
       </div> 
    )
}

export default EditData;