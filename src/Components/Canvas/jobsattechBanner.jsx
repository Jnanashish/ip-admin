import React from "react";
import styles from "./canvas.module.scss";

// import images
import linkedin from "../../Static/Image/linkedin.png"
import instagram from "../../Static/Image/instagram.png";
import telegram from "../../Static/Image/telegram.png";

const JobsattechBanner = (props) => {
    const {
        companyName,
        companyLogo,
        igbannertitle,
        degree,
        batch,
        experience,
        salary,
        location,
        imgsize,
        imgmleft,
        paddingtop,
        paddingbottom,
        companyLogoBanner,
    } = props;

    var customStyle = {
        imgstyle: {
            height: imgsize,
            marginLeft: imgmleft,
            marginTop: paddingtop,
            marginBottom: paddingbottom,
        },
        canvas:{
            backgroundColor : "#f9fafe",
        },
        header : {
            span : {
                backgroundColor : "#002C9B",
            }
        },
        imgContainerstyle: {},
        jobtite : {
            paddingBottom: "0px",
            justifyContent : "center",
            textAlign:"center",
        },
        canvasDetails : {
            backgroundColor : "#fff",
            padding:"0px 0px 0px 160px",
            width: "90%",
            margin : "0px auto 40px",
            height : "530px",
            borderRadius: "36px",

        },
        companyLogo:{
            justifyContent : "center"
        },
        footer:{
            justifyContent : "center",
            backgroundColor : "#002C9B",
        }
    };

    return (
        <div id="jobsattechCanvas" className={styles.canvas} style={customStyle.canvas}>
            <div className={styles.upper} >
                <div className={styles.canvas_header} style={customStyle.header}>
                    <p className={styles.weblink}>
                        Visit <span style={{ color: "#002C9B" }}>jobs.tech</span>
                    </p>
                    <p className={styles.logoText}>
                        Jobs@<span style={{ backgroundColor: "#002C9B" }}>tech</span>
                    </p>
                </div>

                <div className={styles.companylogo} style={customStyle.companyLogo}>
                    {companyLogo && companyLogo != null && <img style={customStyle.imgstyle} src={companyLogo} alt={`${companyName} logo`}></img>}
                    {companyLogoBanner && <img style={customStyle.imgstyle} src={companyLogoBanner} alt={`${companyName} logo`}></img>}
                    {!companyLogo && !companyLogoBanner && <h1>{companyName}</h1>}
                </div>

                <div className={styles.canvas_title} style={customStyle.jobtite}>
                    <h1>{`${igbannertitle.length > 30 ? "":"is hiring "}` + igbannertitle}</h1>
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
                            <span className={styles.tag}>Salary</span> : <span>₹{salary}</span>
                        </p>
                    )}
                    {location !== "N" && (
                        <p>
                            <span className={styles.tag}>Location</span> : <span>{location}</span>
                        </p>
                    )}
                    <p>
                        <span className={styles.tag}>Apply Link : </span>
                        <span style={{ color: "#002C9B" }}><b>Link in Bio</b></span>
                    </p>
                </div>

                <div className={styles.footer} style={customStyle.footer}>
                    {/* <img src={instagram} alt="instagram-logo" />
                    <img src={telegram} alt="telegram-logo" />
                    <img src={linkedin} alt="linkedin-logo" /> */}
                    <p>
                        👉 Visit Link in Bio for IT/Software Jobs links
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JobsattechBanner;
