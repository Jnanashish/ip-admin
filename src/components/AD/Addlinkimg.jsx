import React, {useState, useEffect} from 'react'

// import react toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API } from "../../Backend"
import {Button} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';


import styles from "./style.module.scss"

const AddLinkImg = () => {
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [para, setPara] = useState('');

    const formData = new FormData();  
    const handleimginp = (e) =>{
        const file = e.target.files ;
        formData.append('photo', file[0]);
    }
    const addData = async (e) =>{
        e.preventDefault();
        formData.append("link", link)
        formData.append("title", title)
        formData.append("para", para)

        const res = await fetch(`${API}/sda/linkimg/add`,{
            method : "POST",
            body : formData
        })
        if(res.status === 201){
            getData()
            toast('Data Added Successfully')
        } else {
            toast.error("An error Occured")
        }
    }

    // load the already existed data if any
    useEffect(() => {
        getData();
    }, [])

    // store the ad data from website 
    const [data, setData] = useState([]);
    const getData = async() =>{
        try {
            const res = await fetch(`${API}/sda/linkimg/get`, { method : "GET"});
            const data = await res.json();  
            setData(data);
        } catch (error) {
            toast.error("An error Occured")
            console.log(error);
        }
    }

    // delete the particular ad with id
    const deleteData = (id) =>{
        fetch(`${API}/sda/linkimg/delete/${id}`, { method: 'DELETE' })
        .then((res) => {
            getData()
            toast('Data Deleted Successfully')
        }) 
        .catch((err) => {
            console.log(err);
            toast.error("An error Occured")
        })        
    }    


    return (
        <div className="admin">
            <h2 className={styles.adminpanel_title}>Ad Manager</h2>
            <p className={styles.note}>* Add max 4 ads at one time</p>
            <br/>
            <div>
                <form> 
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Link to register : </h3>
                        <input className={styles.admin_input} value = {link} 
                             onChange = {(e) => setLink(e.target.value)}
                             type="text" placeholder = "Link"/>
                    </div>
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Title for the ad : </h3>
                        <input className={styles.admin_input} value = {title} 
                             onChange = {(e) => setTitle(e.target.value)}
                             type="text" placeholder = "Title"/>
                    </div> 
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Paragraph(If any) : </h3>
                        <input className={styles.admin_input} value = {para} 
                            onChange = {(e) => setPara(e.target.value)}
                            type="text" placeholder = "Paragraph"/> 
                    </div> 
                    <div className={styles.admin_grid}> 
                        <h3 className={styles.admin_label}>Image for ad  : </h3> 
                        <input className={styles.admin_input} onChange = {handleimginp} name="image" type="file"/>    
                    </div>
                    <div className={styles.admin_grid}>  
                        <div></div>             
                        <button 
                            className = {styles.adminlinkcard_btn} 
                            type= "button" 
                            onClick = {addData}>Submit</button>
                        </div>
                </form>
            </div> 
            
    
            <hr />
            <br />

            <div className = {styles.adimg_con}>   
                <h2 className="adminpanel-title">Ad Link with image count : <b>{data.length}</b></h2> 
                {data.map(item => { 
                return(
                    <div>
                    <h3>{item.title}</h3>
                    <div className={styles.adlinkimg_con}>
                        <img className="adpanel-ad-img" src={item.imagePath} alt="" />
                        <br />
                        
                        <Button onClick={() => deleteData(item._id)} variant="contained" startIcon= {<DeleteIcon />}>
                                Delete
                        </Button>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <Button variant="contained" endIcon={<SendIcon />}> Visit Link </Button>    
                        </a>
                        <ToastContainer /> 
                        <h3 className={styles.t_click}>Total Click <b>{item.totalclick}</b></h3>
                    </div>
                    </div>
                )
                })}
            </div>
         </div>
    )
}

export default AddLinkImg;