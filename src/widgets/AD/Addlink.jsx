import React,{useEffect, useState}  from 'react'

// import react toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API } from "../../Backend"

// import css
import styles from "./style.module.scss"


const AddLink = () => {
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [para, setPara] = useState('');

    const formData = new FormData();    
    const addData = async (e) =>{
        e.preventDefault();

        formData.append("link", link)
        formData.append("title", title)
        formData.append("para", para)
        const res = await fetch(`${API}/sda/link/add`,{
            method : "POST",
            body : formData
        })

        if(res.status === 201){
            toast('Data Added Successfully')
        } else {
            toast.error("An error Occured")
        }
    }

    useEffect(() => {
        getData();
    }, [])

    const [data, setData] = useState([]);
    const getData = async() =>{
        try {
            const res = await fetch(`${API}/sda/link/get`, { method : "GET" });
            const data = await res.json();  
            setData(data);
        } catch (error) {
            console.log("Some error happend");
            console.log(error);
        }
    }

    const deleteData = (id) =>{
        fetch(`${API}/sda/link/delete/${id}`, { method: 'DELETE' })
        .then((res) => 
            toast('Deleted Successfully'),
            getData()
        ) 
        .catch((err) => {
            toast.error("An error Occured")
            console.log(err);
        })        
    }  

    return (
        <div className="admin">
            <h2 className={styles.adminpanel_title}>Ad (Link Only)</h2>
            <div>
                <form> 
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Link : </h3>
                        <input className={styles.admin_input} value = {link} 
                            onChange = {(e) => setLink(e.target.value)}
                            type="text" placeholder = "Link"/>
                    </div>
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Title for ad : </h3>
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
                        <div className={styles.admin_label}></div>
                        <button className = {styles.admin_btn} type= "button" onClick = {addData}>Submit</button>
                    </div>                 
                    
                </form>
            </div> 
            <hr />
            <br />
            <div className = "update-data-container">   
                <h3 className={styles.adminpanel_title}>
                    Total Ads with Links count : {data.length}
                </h3> 
                {data.map(item => { 
                return(
                    <div className={styles.adlink_con}>
                        <h2>{item.title}</h2>
                        <h4>Total Click : {item.totalclick}</h4>
                        
                        <button onClick={() => deleteData(item._id)} className = {styles.adminlinkcard_btn}>Delete</button>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <button className = {styles.adminlinkcard_btn}>
                                Visit Link
                            </button>
                        </a>
                        <ToastContainer /> 
                        
                    </div>
                )
                })}
            </div>
        </div>
    )
}

export default AddLink;