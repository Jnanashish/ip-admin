import React, { useState, useEffect } from "react";
import styles from "./canvas.module.scss";

const JobsattechBanner = (props) => {
    const { jobdetails, ctaDetails, canvasCss, comapnyDetails, igbannertitle } = props;
    const { companyName, degree, batch, experience, salary, location, role } = jobdetails;
    const { largeLogo, smallLogo } = comapnyDetails;
    const [bannerTitle, setBannerTitle] = useState(null);

    useEffect(() => {
        const title = !!igbannertitle ? igbannertitle : role;
        const formettedTitle = title?.length < 30 ? `is hiring ${title}` : title;
        setBannerTitle(formettedTitle);
    }, [igbannertitle, role]);

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
        <div id="jobsattech" className={`${styles.canvas} ${styles.jobsattechcanvas}`}>
            <div className={`${styles.upper} ${styles.jobsattechcanvas_upper}`}>
                <div className={`${styles.canvas_header} ${styles.jobsattechcanvas_header}`}>
                    <p className={styles.weblink}>
                        Visit <span style={{ color: "#002C9B" }}>jobsat.tech</span>
                    </p>
                    <p className={styles.logoText}>
                        Jobs@<span style={{ backgroundColor: "#002C9B" }}>tech</span>
                    </p>
                </div>

                <div className={`${styles.companylogo} ${styles.jobsattechcanvas_companylogo}`}>
                    {largeLogo && <img style={customStyle.imgstyle} src={largeLogo} alt={`${companyName} logo`}></img>}
                    {!largeLogo && <h1>{companyName}</h1>}
                </div>

                <div  className={`${styles.canvas_title} ${styles.jobsattechcanvas_jobtitle}`} style={customStyle.jobtite}>
                    <h1 style={customStyle.fontStyle}>{`${bannerTitle?.length > 30 ? "" : "is hiring "}` + bannerTitle}</h1>
                </div>
            </div>

            <div className={styles.lower}>
                <div className={`${styles.canvas_details} ${styles.jobsattechcanvas_details}`}>
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
                    {salary !== "N" && (
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
                        <span className={styles.tag}>Apply Link : </span>
                        <span style={{ color: "#002C9B" }}>
                            <b>Link in Bio</b>
                        </span>
                    </p>
                </div>

                <div className={`${styles.footer} ${styles.jobsattechcanvas_footer}`}>
                    <p>👉 Visit Link in Bio for IT / Software Jobs Links</p>
                </div>
            </div>
        </div>
    );
};

export default JobsattechBanner;
