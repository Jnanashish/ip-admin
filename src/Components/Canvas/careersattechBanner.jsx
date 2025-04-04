import React, { useState, useEffect } from "react";
import styles from "./canvas.module.scss";

// import images
import linkedin from "../../Static/Image/linkedin.png";
import instagram from "../../Static/Image/instagram.png";
import telegram from "../../Static/Image/telegram.png";

const CareersattechBanner = (props) => {
    const { ctaDetails, canvasCss, comapnyDetails, igbannertitle, jobinfo } = props;
    const { companyName, degree, batch, experience, salary, location, role } = jobinfo;
    const { largeLogo } = comapnyDetails;
    const [bannerTitle, setBannerTitle] = useState(null);

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

    useEffect(() => {
        const title = !!igbannertitle ? igbannertitle : role;
        const formettedTitle = title?.length < 30 ? `${title}` : title;
        setBannerTitle(formettedTitle);
    }, [igbannertitle, role]);

    return (
        <div>
            <div id="careersattech" className={styles.canvas}>
                <div className={styles.upper}>
                    <div className={styles.canvas_header}>
                        <p contentEditable="true" className={styles.weblink}>
                            Visit <span>careersat.tech</span>
                        </p>
                        <p contentEditable="true" className={styles.logoText}>
                            careers@<span>tech</span>
                        </p>
                    </div>

                    <div className={styles.companylogo}>
                        {!!largeLogo && <img style={customStyle.imgstyle} src={largeLogo} alt={`${companyName} logo`}></img>}
                        {!largeLogo && <h1>{companyName}</h1>}
                    </div>
                    <div className={styles.canvas_title}>
                        <h1 contentEditable="true" style={customStyle.fontStyle}>
                            {bannerTitle}
                        </h1>
                    </div>
                </div>

                <div className={styles.lower}>
                    <div className={styles.canvas_details}>
                        {degree !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Degree</span> : <span>{degree}</span>
                            </p>
                        )}
                        {batch !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Batch</span> : <span>{batch}</span>
                            </p>
                        )}
                        {experience !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Experience</span> : <span>{experience}</span>
                            </p>
                        )}
                        {!!salary && salary !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Salary</span> : <span>{salary}</span>
                            </p>
                        )}
                        {location !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Location</span> : <span contentEditable="true">{location}</span>
                            </p>
                        )}
                        <p contentEditable="true">
                            <span className={styles.tag}>{ctaDetails?.ctaTitle}</span>
                            <span className={styles.tag} style={{ color: "#0050ff" }}>
                                {ctaDetails?.ctaLine}
                            </span>
                        </p>
                    </div>

                    <div className={styles.footer}>
                        <img src={instagram} alt="instagram-logo" />
                        <img src={telegram} alt="telegram-logo" />
                        <img src={linkedin} alt="linkedin-logo" />
                        <p contentEditable="true">
                            Follow <span>@carrersattech</span> to get regular Job updates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareersattechBanner;
