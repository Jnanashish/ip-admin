import React from "react";
import styles from "./canvas.module.scss";

function LinkedinBanner(props) {
    const { jobdetails, canvasCss, comapnyDetails } = props;
    const { batch, location, role } = jobdetails;
    const { largeLogo } = comapnyDetails;

    const customStyle = {
        imgstyle: {
            height: canvasCss.imgsize,
            marginLeft: canvasCss.marginLeft,
            marginTop: canvasCss.marginTop,
            marginBottom: canvasCss.marginBottom,
        },
        fontStyle: {
            fontSize: canvasCss.fontSize,
        },
    };

    return (
        <div id="linkedinbanner" className={styles.linkedinbanner}>
            <div className={styles.linkedinbanner_imagecontainer}>
                <img style={customStyle.imgstyle} src={largeLogo} />
            </div>
            <h3 contentEditable="true">is Hiring</h3>
            <p style={customStyle.fontStyle} contentEditable="true">
                {role} - {location} <br /> Batch : {batch}
            </p>
        </div>
    );
}

export default LinkedinBanner;
