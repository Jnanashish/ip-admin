import React, { useState, useContext, useEffect } from "react";
import { TextField } from "@mui/material";
import styles from "./canvas.module.scss";
import { downloadImagefromCanvasHelper } from "../../Helpers/imageHelpers";

import LinkedinBanner from "./LinkedinBanner";
import CareersattechBanner from "../../Components/Canvas/careersattechBanner";
import JobsattechBanner from "../../Components/Canvas/jobsattechBanner";
import CustomTextField from "../../Components/Input/Textfield";
import CustomDivider from "../Divider/Divider";
import Carousel from "./Carousel";
import { UserContext } from "../../Context/userContext";

import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { Button } from "@mui/material";

function Canvas(props) {
    const { bannerType, jobdetails } = props;
    const context = useContext(UserContext);
    const canvasId = bannerType ||  context?.isAdmin ? "careersattech" : "jobsattech";

    const [isAdmin, setIsAdmin] = useState(false);
    const [canvas, setCanvas] = useState(context?.isAdmin ? "careersattech" : "jobsattech")
    const [canvasCss, setCanvasCss] = useState({
        imgsize: bannerType === "linkedinbanner" ? "100%" : "60%",
        marginLeft: "0px",
        marginTop: "0px",
        marginBottom: "0px",
        fontSize: bannerType === "linkedinbanner" ? "30px" : "96px",
    });

    const [ctaDetails, setCtaDetails] = useState({
        ctaTitle: "Apply Link : ",
        ctaLine: "Link in Bio (visit : careersat.tech)",
    });

    // handle canvas css input change
    const handleCanvasCssChange = (key, value) => {
        setCanvasCss({ ...canvasCss, [key]: value });
    };

    const handleDownloadBanner = async () => {
        if (bannerType !== "carousel") {
            const bannername = jobdetails.companyName + "_" + bannerType;
            downloadImagefromCanvasHelper(bannername, canvasId, false);
        } else {
            const bannername = jobdetails.companyName + "_" + "carousel1";
            downloadImagefromCanvasHelper(bannername, "carousel1", false);

            const bannername2 = jobdetails.companyName + "_" + "carousel2";
            downloadImagefromCanvasHelper(bannername2, "carousel2", false);
        }
    };

    useEffect(() => {
        if (context.isAdmin) {
            setIsAdmin(true);
        }
    }, [context.isAdmin]);

    useEffect(() => {
        if(!!bannerType){
            setCanvas(bannerType)
        }
    }, [bannerType]);

    return (
        <div>
            <div className={`${styles.flex} ${styles.canvasdesign_container}`} style={{ width: "50%", marginTop: "30px" }}>
                <TextField size="small" sx={{ width: "12ch" }} label="Font size" value={canvasCss.fontSize} onChange={(e) => handleCanvasCssChange("fontSize", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Img Size" value={canvasCss.imgsize} onChange={(e) => handleCanvasCssChange("imgsize", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Margin left" value={canvasCss.marginLeft} onChange={(e) => handleCanvasCssChange("marginLeft", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Margin Top" value={canvasCss.marginTop} onChange={(e) => handleCanvasCssChange("marginTop", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Margin Bottom" value={canvasCss.marginBottom} onChange={(e) => handleCanvasCssChange("marginBottom", e.target.value)} />
            </div>
            {!!isAdmin && <div>
                <div style={{ display: "flex", marginBottom: "10px", gap: "10px", width: "60%" }}>
                    <CustomTextField label="CTA Title" sx={{ width: "30%" }} value={ctaDetails.ctaTitle} onChange={(val) => setCtaDetails({ ...ctaDetails, ctaTitle: val })} fullWidth />
                    <CustomTextField label="CTA Line" sx={{ width: "70%" }} value={ctaDetails.ctaLine} onChange={(val) => setCtaDetails({ ...ctaDetails, ctaLine: val })} fullWidth />
                </div>
                <p>Join instagram channel for apply link 👇</p>
                <br />
                <p>Comment YES for the apply link</p>
                <CustomDivider />
            </div>}

            {canvas === "careersattech" && <CareersattechBanner {...props} ctaDetails={ctaDetails} canvasCss={canvasCss} />}
            {canvas === "jobsattech" && <JobsattechBanner {...props} ctaDetails={ctaDetails} canvasCss={canvasCss} />}
            {canvas === "linkedinbanner" && <LinkedinBanner {...props} canvasCss={canvasCss} />}
            {canvas === "carousel" && <Carousel {...props} canvasCss={canvasCss} />}

            <div className={styles.flex}>
                <Button style={{ textTransform: "capitalize", marginTop: "30px" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                    Download Banner
                </Button>
            </div>
        </div>
    );
}

export default Canvas;
