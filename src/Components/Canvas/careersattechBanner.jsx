import React, { useState, useEffect } from "react";
import styles from "./canvas.module.scss";

// import images
import linkedin from "../../Static/Image/linkedin.png";
import instagram from "../../Static/Image/instagram.png";
import telegram from "../../Static/Image/telegram.png";

const CareersattechBanner = (props) => {
    const { jobdetails, ctaDetails, canvasCss, comapnyDetails, igbannertitle } = props;
    const { companyName, degree, batch, experience, salary, location, role } = jobdetails;
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
        const formettedTitle = title?.length < 30 ? `is hiring ${title}` : title;
        setBannerTitle(formettedTitle)
    }, [igbannertitle, role]);

    return (
        <div>
            <div id="careersattech" className={styles.canvas}>
                <div className={styles.upper}>
                    <div className={styles.canvas_header}>
                        <p className={styles.weblink}>
                            Visit <span>careersat.tech</span>
                        </p>
                        <p className={styles.logoText}>
                            careers@<span>tech</span>
                        </p>
                    </div>

                    <div className={styles.companylogo}>
                        {!!largeLogo && <img style={customStyle.imgstyle} src={largeLogo} alt={`${companyName} logo`}></img>}
                        {!largeLogo && <h1>{companyName}</h1>}
                    </div>
                    <div style={customStyle.fontStyle} className={styles.canvas_title}>
                        <h1 style={role?.length > 27 ? { fontSize : "88px"} : {}}>{bannerTitle}</h1>
                    </div>
                </div>

                <div className={styles.lower}>
                    <div className={styles.canvas_details}>
                        {degree !== "N" && (
                            <p>
                                <span className={styles.tag}>Degree</span> : <span>{degree}</span>
                            </p>
                        )}
                        {batch !== "N" && (
                            <p>
                                <span className={styles.tag}>Batch</span> : <span>{batch}</span>
                            </p>
                        )}
                        {experience !== "N" && (
                            <p>
                                <span className={styles.tag}>Experience</span> : <span>{experience}</span>
                            </p>
                        )}
                        {salary !== "N" && salary !== "₹0LPA" && (
                            <p>
                                <span className={styles.tag}>Salary</span> : <span>{salary}</span>
                            </p>
                        )}
                        {location !== "N" && (
                            <p>
                                <span className={styles.tag}>Location</span> : <span>{location}</span>
                            </p>
                        )}
                        <p>
                            <span className={styles.tag}>{ctaDetails?.ctaTitle}</span>
                            <span className={styles.tag} style={{ color: "#0069ff" }}>
                                {ctaDetails?.ctaLine}
                            </span>
                        </p>
                    </div>

                    <div className={styles.footer}>
                        <img src={instagram} alt="instagram-logo" />
                        <img src={telegram} alt="telegram-logo" />
                        <img src={linkedin} alt="linkedin-logo" />
                        <p>
                            Follow <span>@carrersattech</span> to get regular Job updates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareersattechBanner;
