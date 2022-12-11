import React from "react";

// import css
import styles from "./adminlinkcard.module.scss";

const LinkCard = (props) => {
    var date = "";
    if (props.time) {
        date = new Date(props.time);
        date = date.toISOString().substring(0, 10);
    }
    return (
        <div className={styles.adminlinkcard_con}>
            <a href={props.link} target="_blank" rel="noopener noreferrer">
                <h2>{props.title}</h2>
                <div className={styles.adminlink_item}>
                    <h5>Created At : </h5>
                    <h5> {date}</h5>
                </div>
                {props.lastdate !== "2022-11-00-" && (
                    <div className={styles.adminlink_item}>
                        <h5>Last date : </h5>
                        <h5 style={{ color: "red" }}>
                            <b> {props.lastdate}</b>
                        </h5>
                    </div>
                )}
                <div className={styles.adminlink_item}>
                    <h5>Total Click : </h5>
                    <h5 className={styles.jd_date}>
                        {" "}
                        <b>{props.totalclick}</b>
                    </h5>
                </div>
            </a>
        </div>
    );
};

export default LinkCard;
