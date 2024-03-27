import React, { useState, useContext, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./adminlinkcard.module.scss";
import EditData from "../Editdata/Editdata";

import { UserContext } from "../../../../Context/userContext";
import { getLinkClickCount } from "../../../../Helpers/utility";
import Custombutton from "../../../../Components/Button/Custombutton";
import { deleteData } from "../../../../Helpers/request";
import { apiEndpoint } from "../../../../Helpers/apiEndpoints";
import { generateDateFromISOString } from "../../../../Helpers/utility";

const LinkCard = ({ item, showBitlyClick }) => {
    const [seletedJobId, setSeletedJobId] = useState("");
    const [deletedId, setDeletedId] = useState("");
    const [linkClickCount, setLinkClickCount] = useState(null);

    const handleUpdateClick = (id) => {
        seletedJobId !== "" ? setSeletedJobId("") : setSeletedJobId(id);
    };

    // when delete button is clicked delete a particular job
    const deleteJobData = (id) => {
        if (id === item._id) {
            deleteData(`${apiEndpoint.deleteJob}/${id}`, "Job")
            setDeletedId(id)
        }
    };

    const context = useContext(UserContext);
    const isUserLogedIn = context.user?.email || true;

    // get bit.ly link count
    const getBitlyShortClick = async () => {
        const data = await getLinkClickCount(item.link);
        setLinkClickCount(data?.link_clicks[0]?.clicks);
    };

    // when show bit.ly is clicke
    useEffect(() => {
        if (showBitlyClick) {
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
                                <h5>{generateDateFromISOString(item.createdAt)}</h5>
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

                                {!!showBitlyClick && (
                                    <>
                                        <h5>Bit.ly Click : </h5>
                                        <h5 className={styles.jd_date}>
                                            <b>{linkClickCount}</b>
                                        </h5>
                                    </>
                                )}
                            </div>
                        </a>

                        {/* button section  */}
                        {isUserLogedIn && (
                            <>
                            <div className={styles.buttonContainer}>
                                <Custombutton
                                    startIcon={<DeleteIcon />}
                                    disableElevation
                                    size="small"
                                    onClick={() => deleteJobData(item._id)}
                                    style={{ backgroundColor: "red" }}
                                    label="Delete"
                                    className={styles.btn}
                                />

                                <Custombutton disableElevation size="small" onClick={() => handleUpdateClick(item._id)} label="Update" className={styles.btn} />
                            </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {seletedJobId === item._id && <EditData data={item} setSeletedJobId={setSeletedJobId} />}
        </div>
    );
};

export default LinkCard;
