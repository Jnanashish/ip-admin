import React from 'react'

// import css
import styles from "./adminlinkcard.module.scss"

function LinkCard(props) {
    return ( 
        <div className = {styles.adminlinkcard_con}>
            <h2>{props.title}</h2>
            <div className = {styles.adminlink_item}>
                <h5>Last date : </h5>
                <h5> {props.lastdate}</h5>
            </div>
            <div className = {styles.adminlink_item}>
                <h5>Total Click : </h5>
                <h5 className={styles.jd_date}> <b>{props.totalclick}</b></h5>
            </div>
        </div>
        
    )
}

export default LinkCard;