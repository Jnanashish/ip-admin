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
        canvas: {
            backgroundColor: "#f9fafe",
        },
        header: {
            span: {
                backgroundColor: "#002C9B",
            },
        },
        jobtite: {
            paddingBottom: "0px",
            justifyContent: "center",
            textAlign: "center",
        },
        canvasDetails: {
            backgroundColor: "#fff",
            padding: "0px 0px 0px 160px",
            width: "90%",
            margin: "0px auto 40px",
            height: "530px",
            borderRadius: "36px",
        },
        companyLogo: {
            justifyContent: "center",
        },
        footer: {
            justifyContent: "center",
            backgroundColor: "#002C9B",
        },
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
        <div id="jobsattech" className={styles.canvas} style={customStyle.canvas}>
            <div className={styles.upper}>
                <div className={styles.canvas_header} style={customStyle.header}>
                    <p className={styles.weblink}>
                        Visit <span style={{ color: "#002C9B" }}>jobsat.tech</span>
                    </p>
                    <p className={styles.logoText}>
                        Jobs@<span style={{ backgroundColor: "#002C9B" }}>tech</span>
                    </p>
                </div>

                <div className={styles.companylogo} style={customStyle.companyLogo}>
                    {largeLogo && <img style={customStyle.imgstyle} src={largeLogo} alt={`${companyName} logo`}></img>}
                    {!largeLogo && <h1>{companyName}</h1>}
                </div>

                <div className={styles.canvas_title} style={customStyle.jobtite}>
                    <h1>{`${bannerTitle?.length > 30 ? "" : "is hiring "}` + bannerTitle}</h1>
                </div>
            </div>

            <div className={styles.lower}>
                <div className={styles.canvas_details} style={customStyle.canvasDetails}>
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

                <div className={styles.footer} style={customStyle.footer}>
                    <p>👉 Visit Link in Bio for IT / Software Jobs Links</p>
                </div>
            </div>
        </div>
    );
};

export default JobsattechBanner;
