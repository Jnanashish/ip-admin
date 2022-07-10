import React,{useState} from 'react'
import {API} from "../../Backend"

import styles from "./adpoptype.module.scss"
import { Button } from '@mui/material';

// import react toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Adpoptype() {
    const [adtype, setAdtype] = useState('none')
    const AddadShowPop = async (e) =>{
        setAdtype(e);
        const formData = new FormData();
        formData.append("adpoptype", adtype)
        const res = await fetch(`${API}/showadpop/update/61b56f22afa325ec398b2770`,{
            method : "PUT",
            body : formData
        })
        if(res.status === 200){
            toast(`Ad type changed to ${e}`)
        } else {
            toast.error("An error Occured")
        }
    }

    return (
        <div className={styles.adtype_panel}>
            <Button sx={{ width: '10ch' }} onClick={()=>{AddadShowPop('ad')}} variant="contained" color="success">
                AD
            </Button>
            <Button sx={{ width: '10ch' }} onClick={()=>{AddadShowPop('email')}} variant="contained" color="success">
                Email
            </Button>
            <Button sx={{ width: '10ch' }} onClick={()=>{AddadShowPop('none')}} variant="contained" color="success">
                None
            </Button>    
            <ToastContainer />          
        </div>
    )
}

export default Adpoptype