import React, { useState, useEffect } from "react";
import styles from "./canvas.module.scss";

// import images
import linkedin from "../../Static/Image/linkedin.png";
import instagram from "../../Static/Image/instagram.png";
import telegram from "../../Static/Image/telegram.png";

function Carousel(props) {
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
        setBannerTitle(formettedTitle);
    }, [igbannertitle, role]);

    return (
        <div>
            <div id="carousel1" className={`${styles.canvas} ${styles.carousel}`}>
                <div className={`${styles.canvas_header} ${styles.carousel_header}`}>
                    <p className={styles.weblink}>
                        Visit <span>careersat.tech</span>
                    </p>
                    <p className={styles.logoText}>
                        careers@<span>tech</span>
                    </p>
                </div>
                <div className={`${styles.companylogo} ${styles.carousel_companylogo}`}>
                    {!!largeLogo && <img style={customStyle.imgstyle} src={largeLogo} alt={`${companyName} logo`}></img>}
                    {!largeLogo && <h1>{companyName}</h1>}
                </div>
                <div className={styles.carousel_details}>
                    <h1 contentEditable="true" style={customStyle.fontStyle}>{bannerTitle}</h1>
                    <p contentEditable="true">Experience : Batch for 2022 graduates</p>
                </div>
                <div className={`${styles.footer} ${styles.carousel_footer}`}>
                    <span>
                        <img src={instagram} alt="instagram-logo" />
                        <img src={telegram} alt="telegram-logo" />
                        <img src={linkedin} alt="linkedin-logo" />
                        <span>@carrersattech</span>
                    </span>
                    <span className={styles.carousel_footer_swiper}>
                        <p>Swipe  ⬅️</p>
                    </span>
                </div>
            </div>
            <br />

            <div id="carousel2" className={`${styles.canvas} ${styles.carousel}`}>
                <div className={`${styles.canvas_header} ${styles.carousel_header}`}>
                    <p className={styles.weblink}>
                        Visit <span>careersat.tech</span>
                    </p>
                    <p className={styles.logoText}>
                        careers@<span>tech</span>
                    </p>
                </div>
                <div className={styles.carousel_jobdetails}>
                    <h2 contentEditable="true">Job details</h2>
                    <div contentEditable="true">
                        <p>Degree : {degree}</p>
                        <p>Batch : {batch}</p>
                        <p>Experience : {experience}</p>
                        <p>Salary : {salary}</p>
                        <p>Location : {location}</p>
                    </div>
                </div>
                <div className={`${styles.footer} ${styles.carousel_footer}`}>
                <span>
                        <img src={instagram} alt="instagram-logo" />
                        <img src={telegram} alt="telegram-logo" />
                        <img src={linkedin} alt="linkedin-logo" />
                        <span>@carrersattech</span>
                    </span>
                    <span className={styles.carousel_footer_swiper}>
                        <p>Swipe ⬅️</p>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Carousel;
