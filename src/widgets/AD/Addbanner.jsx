import React, { useState, useEffect } from "react";

//import css
import styles from "./style.module.scss";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

import { API } from "../../Backend";

const AddBanner = () => {
    const [link, setLink] = useState("");

    const formData = new FormData();
    const handleimginp = (e) => {
        const file = e.target.files;
        formData.append("photo", file[0]);
    };

    // add data to backend via API
    const addData = async (e) => {
        e.preventDefault();
        formData.append("link", link);
        const res = await fetch(`${API}/sda/banner/add`, {
            method: "POST",
            body: formData,
        });

        if (res.status === 201) {
            toast("Data Added Successfully");
        } else {
            toast.error("An error Occured");
        }
    };

    // load the already existed data if any
    useEffect(() => {
        getData();
    }, []);

    // store the ad data from website
    const [data, setData] = useState([]);
    const getData = async () => {
        try {
            const res = await fetch(`${API}/sda/banner/get`, { method: "GET" });
            const data = await res.json();
            setData(data);
        } catch (error) {
            console.log(error);
            toast.error("An error Occured");
        }
    };

    // delete the particular ad with id
    const deleteData = (id) => {
        fetch(`${API}/sda/banner/delete/${id}`, { method: "DELETE" })
            .then((res) => {
                toast("Data deleted Successfully");
                getData();
            })
            .catch((err) => {
                toast.error("Can not delete Data");
                console.log(err);
            });
    };

    return (
        <div className="admin">
            <h2 className={styles.adminpanel_title}>Ads with Banner</h2>
            <p className={styles.note}>* Add max 1 ad at one time</p>
            <div>
                <form>
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Link to register : </h3>
                        <input className={styles.admin_input} value={link} onChange={(e) => setLink(e.target.value)} type="text" placeholder="Link" />
                    </div>
                    <div className={styles.admin_grid}>
                        <h3 className={styles.admin_label}>Ad Banner : </h3>
                        <input className={styles.admin_input} onChange={handleimginp} name="image" type="file" />
                    </div>
                    <div className={styles.admin_grid}>
                        <div></div>
                        <button className={styles.adminlinkcard_btn} type="button" onClick={addData}>
                            Submit
                        </button>
                    </div>
                </form>
            </div>

            <hr />
            <br />
            <h2 className={styles.adminpanel_title}>Ad banner count : {data.length}</h2>
            {data.map((item) => {
                return (
                    <div className={styles.banner_con}>
                        <img className={styles.adimage} src={item.imagePath} alt="Ad-poster" />
                        <br />
                        <div className={styles.banner_btn_con}>
                            <Button onClick={() => deleteData(item._id)} variant="contained" startIcon={<DeleteIcon />}>
                                Delete
                            </Button>

                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <Button variant="contained" endIcon={<SendIcon />}>
                                    Visit Link
                                </Button>
                            </a>
                            <ToastContainer />
                        </div>
                        <h2 className={styles.t_click}>
                            Total Click : <b>{item.totalclick}</b>
                        </h2>
                    </div>
                );
            })}
        </div>
    );
};

export default AddBanner;
