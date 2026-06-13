import React, { useState, useEffect } from "react";
import styles from "./canvas.module.scss";

// import images
import linkedin from "../../Static/Image/linkedin.png";
import instagram from "../../Static/Image/instagram.png";
import telegram from "../../Static/Image/telegram.png";

// Hard-coded degree + batch shown on every CareersAtTech banner.
// Edit the strings below to change the defaults (slash-separated, space on both sides).
const HARDCODED_DEGREE = "B.Tech / B.E. / M.Tech / BCA / MCA";
const HARDCODED_BATCH = "2024 / 2025 / 2026 / 2027";

const CareersAtTechBanner = (props) => {
    const { ctaDetails, canvasCss, companyDetails, igbannertitle, jobinfo, instaChannelCTA } = props;
    const { companyName, experience, salary, location, role } = jobinfo;
    const { largeLogo } = companyDetails;
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
        const formettedTitle = `${title || ""}`.trim();
        setBannerTitle(formettedTitle);
    }, [igbannertitle, role]);

    return (
        <div>
            <div id="careersattech" className={styles.canvas}>
                <div className={styles.upper}>
                    <div className={styles.canvas_header}>
                        <p contentEditable="true" className={styles.weblink}>
                            Visit :<span> careersat.tech</span>
                        </p>
                        {/* <p contentEditable="true" className={styles.logoText}>
                            careers <span className={styles.at}>at</span><span> tech</span>
                        </p> */}
                    </div>

                    <div className={styles.companylogo}>
                        {!!largeLogo && <img style={customStyle.imgstyle} src={largeLogo} alt={`${companyName} logo`}></img>}
                        {!largeLogo && <h1 className={styles.textLogo}>{companyName}</h1>}
                    </div>
                    <div className={styles.canvas_title}>
                        <h1 contentEditable="true" style={customStyle.fontStyle}>
                            is hiring <span>{bannerTitle}</span>
                        </h1>
                    </div>
                </div>

                <div className={`${styles.lower}${instaChannelCTA ? ` ${styles.lower_reordered}` : ""}`}>
                    <div className={styles.canvas_details}>
                        <p contentEditable="true">
                            <span className={styles.tag}>Degree</span> : <span>{HARDCODED_DEGREE}</span>
                        </p>
                        <p contentEditable="true">
                            <span className={styles.tag}>Batch</span> : <span>{HARDCODED_BATCH}</span>
                        </p>
                        {experience && experience !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Experience</span> : <span>{experience}</span>
                            </p>
                        )}
                        {!!salary && salary !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Salary</span> : <span>{salary}</span>
                            </p>
                        )}
                        {location && location !== "N" && (
                            <p contentEditable="true">
                                <span className={styles.tag}>Location</span> : <span contentEditable="true">{location}</span>
                            </p>
                        )}
                        {!instaChannelCTA && (
                            <p contentEditable="true">
                                <span className={styles.tag}>{ctaDetails?.ctaTitle}</span>
                                <span className={styles.tag} style={{ color: "#0050ff" }}>
                                    {ctaDetails?.ctaLine}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <img src={instagram} alt="instagram-logo" />
                        <img src={telegram} alt="telegram-logo" />
                        <img src={linkedin} alt="linkedin-logo" />
                        <p contentEditable="true">
                            Follow <span>@careersattech</span> to get regular Job updates.
                        </p>
                    </div>

                    {/* Instagram-channel CTA only: comment line drops below the footer
                        so its 👇 points down to the apply-link sticker. */}
                    {instaChannelCTA && (
                        <div className={styles.cta_strip}>
                            <p contentEditable="true">
                                <span className={styles.tag}>{ctaDetails?.ctaTitle}</span>
                                <span className={styles.tag} style={{ color: "#0050ff" }}>
                                    {ctaDetails?.ctaLine}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareersAtTechBanner;
