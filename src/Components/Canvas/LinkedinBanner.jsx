import React from "react";
import styles from "./canvas.module.scss";

// import images
import linkedin from "../../Static/Image/linkedin.png";
import instagram from "../../Static/Image/instagram.png";
import telegram from "../../Static/Image/telegram.png";

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
            <p className={styles.linkedinbanner_title} style={customStyle.fontStyle} contentEditable="true">
                {role}
            </p>
            <p className={styles.linkedinbanner_details} style={customStyle.fontStyle} contentEditable="true">
                {location}, Batch : {batch}
            </p>
            <div className={styles.linkedinbanner_footer}>
                <img src={instagram} alt="instagram-logo" />
                <img src={telegram} alt="telegram-logo" />
                <img src={linkedin} alt="linkedin-logo" />
                <p contentEditable="true">
                    Follow <span>@carrersattech</span> to get regular Job updates.
                </p>
            </div>
        </div>
    );
}

export default LinkedinBanner;
