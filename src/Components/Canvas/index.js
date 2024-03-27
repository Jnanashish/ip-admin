import React, { useState } from "react";
import { TextField } from "@mui/material";
import styles from "./canvas.module.scss";
import { downloadImagefromCanvasHelper } from "../../Helpers/imageHelpers";

import LinkedinBanner from "./LinkedinBanner";
import CareersattechBanner from "../../Components/Canvas/careersattechBanner";
import JobsattechBanner from "../../Components/Canvas/jobsattechBanner";

import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { Button } from "@mui/material";

function Canvas(props) {
    const { bannerType, jobdetails } = props;
    const canvasId = bannerType || "careersattech";

    const [canvasCss, setCanvasCss] = useState({
        imgsize: "60%",
        marginLeft: "0px",
        marginTop: "0px",
        marginBottom: "0px",
        fontSize: "96px",
    });

    // handle canvas css input change
    const handleCanvasCssChange = (key, value) => {
        setCanvasCss({ ...canvasCss, [key]: value });
    };

    const handleDownloadBanner = async () => {
        const bannername = jobdetails.companyName + "_" + bannerType;
        downloadImagefromCanvasHelper(bannername, canvasId, false);
    };

    return (
        <div>
            <div className={`${styles.flex} ${styles.canvasdesign_container}`} style={{ width: "50%", marginTop: "30px" }}>
                <TextField size="small" sx={{ width: "12ch" }} label="Font size" value={canvasCss.fontSize} onChange={(e) => handleCanvasCssChange("fontSize", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Img Size" value={canvasCss.imgsize} onChange={(e) => handleCanvasCssChange("imgsize", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Margin left" value={canvasCss.marginLeft} onChange={(e) => handleCanvasCssChange("marginLeft", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Margin Top" value={canvasCss.marginTop} onChange={(e) => handleCanvasCssChange("marginTop", e.target.value)} />
                <TextField size="small" sx={{ width: "12ch" }} label="Margin Bottom" value={canvasCss.marginBottom} onChange={(e) => handleCanvasCssChange("marginBottom", e.target.value)} />
            </div>

            {(bannerType === "careersattech" || !bannerType) && <CareersattechBanner {...props} canvasCss={canvasCss} />}
            {bannerType === "jobsattech" && <JobsattechBanner {...props} canvasCss={canvasCss} />}
            {bannerType === "linkedinbanner" && <LinkedinBanner {...props} canvasCss={canvasCss} />}

            <div className={styles.flex}>
                <Button style={{ textTransform: "capitalize", marginTop : "30px" }} onClick={() => handleDownloadBanner()} variant="contained" color="success" endIcon={<CloudDownloadIcon />}>
                    Download Banner
                </Button>
            </div>
        </div>
    );
}

export default Canvas;
