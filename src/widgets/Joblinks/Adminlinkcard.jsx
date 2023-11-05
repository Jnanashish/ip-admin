import React, { useState, useContext, useEffect } from "react";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./adminlinkcard.module.scss";
import EditData from "./Editdata";
import { ToastContainer, toast } from "react-toastify";

import { API } from "../../Backend";
import { UserContext } from "../../Context/userContext";
import { getLinkClickCount } from "../../Helpers/utility";

const LinkCard = ({ item, showBitlyClick }) => {
    const [flag, setFlag] = useState("");
    const [deletedId, setDeletedId] = useState("");
    const [linkClickCount, setLinkClickCount] = useState(null);

    var date = "";
    if (item.createdAt) {
        date = new Date(item.createdAt);
        date = date.toISOString().substring(0, 10);
    }
    const handleClick = (id) => {
        if (flag !== "") {
            setFlag("");
        } else {
            setFlag(id);
        }
    };

    const deleteData = (id) => {
        if (id === item._id) {
            fetch(`${API}/jd/delete/${id}`, { method: "DELETE" })
                .then((res) => setDeletedId(id), toast("Job deleted Successfully"))
                .catch((err) => {
                    toast.error("An error Occured");
                    console.log(err);
                });
        }
    };

    const context = useContext(UserContext);
    const isUserLogedIn = context.user?.email || true;

    const getBitlyShortClick = async () => {
        const data = await getLinkClickCount(item.link);
        setLinkClickCount(data?.link_clicks[0]?.clicks);
    };

    useEffect(() => {
        if (item.link.includes("bit.ly") && showBitlyClick) {
            getBitlyShortClick();
        }
    }, [item.link, showBitlyClick]);

    return (
        <div>
            {deletedId !== item._id && (
                <div className={styles.adminlinkcard_con}>
                    <img className={styles.companyLogo} src={item.imagePath} />
                    <div className={styles.adminlinkWrapper}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <h2>{item.title}</h2>
                            <div className={styles.adminlink_item}>
                                <h5>Created At : </h5>
                                <h5> {date}</h5>
                            </div>
                            {item.lastdate !== "2022-11-00-" && (
                                <div className={styles.adminlink_item}>
                                    <h5>Last date : </h5>
                                    <h5 style={{ color: "red" }}>
                                        <b> {item.lastdate}</b>
                                    </h5>
                                </div>
                            )}
                            <div className={styles.adminlink_item}>
                                <h5>Total Click : </h5>
                                <h5 className={styles.jd_date}>
                                    <b>{item.totalclick}</b>
                                </h5>

                                {showBitlyClick && (
                                    <>
                                        <h5>Bit.ly Click : </h5>
                                        <h5 className={styles.jd_date}>
                                            <b>{linkClickCount}</b>
                                        </h5>
                                    </>
                                )}
                            </div>
                        </a>
                        {isUserLogedIn && (
                            <div className={styles.buttonContainer}>
                                <Button
                                    size="small"
                                    disableElevation
                                    style={{ backgroundColor: "red" }}
                                    className={styles.btn}
                                    fullWidth
                                    onClick={() => deleteData(item._id)}
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                >
                                    Delete
                                </Button>

                                <Button
                                    size="small"
                                    disableElevation
                                    className={styles.btn}
                                    onClick={() => handleClick(item._id)}
                                    fullWidth
                                    variant="contained"
                                >
                                    Update
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {flag === item._id && <EditData data={item} />}
            {deletedId === item._id && <ToastContainer />}
        </div>
    );
};

export default LinkCard;
