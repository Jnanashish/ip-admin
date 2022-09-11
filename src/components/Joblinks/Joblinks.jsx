import React, { useState, useEffect } from "react";

//import css
import styles from "./joblinks.module.scss";

// copy text to device
import useClipboard from "react-use-clipboard";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

import { API } from "../../Backend";

// import components
import Adminlinkcard from "./Adminlinkcard";
import EditData from "./Editdata";

const UpdateData = () => {
    const [data, setData] = useState([]);
    const [flag, setFlag] = useState("");
    const [caption, setCaption] = useState("");
    const [isCopied, setCopied] = useClipboard(caption);

    const [captionline, setCaptionline] = useState([
        "Follow 👉 @careersattech to get regular Job and Internship updates.",
        "👉 Join interviewPrep in Telegram to get free resources for interview preparation.",
    ]);

    const [hashtags, setHashtags] = useState([
        "#offcampusdrive #placementdrive #jobupdates #jobsforfreshers #offcampus #softwaredeveloper #hiring #freshers",
        "#codinginterview #jobsforfreshers #engineerjobs #freshersjobs #hiring #campusplacements #computerscienceengineering #jobseekers #placementdrive",
        "#offcampusdrive #freshers #offcampus #hiring #softwaredeveloper #campusplacements #placementdrive #jobupdates #engineerjobs ",
    ]);
    const date = new Date();
    const weeknum = date.getDay();
    const line = captionline[weeknum % 2];
    const hash = hashtags[weeknum % 3];

    useEffect(() => {
        getData();
    }, []);

    const deleteData = (id) => {
        fetch(`${API}/jd/delete/${id}`, { method: "DELETE" })
            .then((res) => getData(), toast("Job deleted Successfully"))
            .catch((err) => {
                toast.error("An error Occured");
                console.log(err);
            });
    };

    const getData = async () => {
        try {
            const res = await fetch(`${API}/jd/get/all`, {
                method: "GET",
            });
            const data = await res.json();
            setData(data);
        } catch (error) {
            console.log(error);
        }
    };

    const generateCaption = (id) => {
        const res = data.filter((item) => item._id === id);
        const temp =
            "📢 " +
            res[0].title +
            ". Visit Link in Bio to apply. 🔝" +
            "\n\nBatch : " +
            res[0].batch +
            "\nDegree : " +
            res[0].degree +
            "\n\nApply Link 👉 " +
            res[0].link +
            "\nLink in Bio" +
            "\n\n" +
            line +
            "\n.\n.\n.\n" +
            hash;

        navigator.clipboard.writeText(temp);
    };

    const handleClick = (id) => {
        if (flag) {
            setFlag("");
        } else {
            setFlag(id);
        }
    };

    return (
        <div className={styles.update_data_container}>
            <h2 className={styles.adminpanel_title}>
                List of available Jobs - {data.length}
            </h2>
            {data.map((item) => {
                return (
                    <div key={item._id} className={styles.updatedata_con}>
                        <Adminlinkcard
                            key={item._id}
                            title={item.title}
                            lastdate={item.lastdate}
                            totalclick={item.totalclick}
                        />
                        <div className={styles.adminlink_con}>
                            <Button
                                onClick={() => deleteData(item._id)}
                                variant="contained"
                                startIcon={<DeleteIcon />}>
                                Delete
                            </Button>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Button
                                    variant="contained"
                                    endIcon={<SendIcon />}>
                                    {" "}
                                    Visit Link{" "}
                                </Button>
                            </a>
                            <Button
                                onClick={() => handleClick(item._id)}
                                variant="contained"
                                color="success">
                                Update
                            </Button>
                            <Button
                                onClick={() => generateCaption(item._id)}
                                variant="contained"
                                color="success">
                                {isCopied ? "Copied" : " Copy caption"}
                            </Button>
                        </div>
                        <br />
                        {item._id === flag && <EditData data={item} />}

                        {/* <Update item = {item}/>*/}
                        <hr className={styles.line} />
                    </div>
                );
            })}
            <ToastContainer />
        </div>
    );
};

export default UpdateData;
