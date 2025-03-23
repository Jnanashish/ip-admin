import React, { useState, useContext, useEffect, useMemo } from "react";
import { TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
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

// CTA options component
const CTASelector = ({ selectedCTA, availableCTAs, handleCTAChange, ctaDetails, setCtaDetails }) => (
    <div style={{ marginBottom: "15px" }}>
        <FormControl fullWidth sx={{ width: "60%", marginBottom: "15px" }}>
            <InputLabel id="cta-select-label">Select CTA</InputLabel>
            <Select 
                labelId="cta-select-label" 
                id="cta-select" 
                value={selectedCTA} 
                label="Select CTA" 
                onChange={handleCTAChange} 
                size="small"
            >
                {availableCTAs.map((cta) => (
                    <MenuItem key={cta.id} value={cta.id}>
                        {cta.title ? `${cta.title} - ${cta.line}` : cta.line}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
        <div style={{ display: "flex", gap: "10px", width: "60%" }}>
            <CustomTextField 
                label="CTA Title" 
                sx={{ width: "30%" }} 
                value={ctaDetails.ctaTitle} 
                onChange={(val) => setCtaDetails({ ...ctaDetails, ctaTitle: val })} 
                fullWidth 
            />
            <CustomTextField 
                label="CTA Line" 
                sx={{ width: "70%" }} 
                value={ctaDetails.ctaLine} 
                onChange={(val) => setCtaDetails({ ...ctaDetails, ctaLine: val })} 
                fullWidth 
            />
        </div>
    </div>
);

// Canvas design controls component
const CanvasDesignControls = ({ canvasCss, handleCanvasCssChange }) => (
    <div className={`${styles.flex} ${styles.canvasdesign_container}`} style={{ width: "50%", marginTop: "30px" }}>
        <TextField 
            size="small" 
            sx={{ width: "12ch" }} 
            label="Font size" 
            value={canvasCss.fontSize} 
            onChange={(e) => handleCanvasCssChange("fontSize", e.target.value)} 
        />
        <TextField 
            size="small" 
            sx={{ width: "12ch" }} 
            label="Img Size" 
            value={canvasCss.imgsize} 
            onChange={(e) => handleCanvasCssChange("imgsize", e.target.value)} 
        />
        <TextField 
            size="small" 
            sx={{ width: "12ch" }} 
            label="Margin left" 
            value={canvasCss.marginLeft} 
            onChange={(e) => handleCanvasCssChange("marginLeft", e.target.value)} 
        />
        <TextField 
            size="small" 
            sx={{ width: "12ch" }} 
            label="Margin Top" 
            value={canvasCss.marginTop} 
            onChange={(e) => handleCanvasCssChange("marginTop", e.target.value)} 
        />
        <TextField 
            size="small" 
            sx={{ width: "12ch" }} 
            label="Margin Bottom" 
            value={canvasCss.marginBottom} 
            onChange={(e) => handleCanvasCssChange("marginBottom", e.target.value)} 
        />
    </div>
);

// Main Canvas component
function Canvas(props) {
    const { bannerType, jobdetails } = props;
    const context = useContext(UserContext);

    // Define available CTAs - moved to useMemo for optimization
    const availableCTAs = useMemo(() => [
        {
            id: 1,
            title: "Apply Link : ",
            line: "Link in Bio (visit : careersat.tech)",
        },
        {
            id: 2,
            title: "Apply Here : ",
            line: "Check our website for more details",
        },
        {
            id: 3,
            title: null,
            line: "Join instagram channel for apply link 👇",
        },
        {
            id: 4,
            title: null,
            line: "Comment YES for the apply link",
        },
    ], []);

    // State management
    const [canvasId, setCanvasId] = useState();
    const [canvas, setCanvas] = useState("careersattech");
    const [canvasCss, setCanvasCss] = useState({
        imgsize: bannerType === "linkedinbanner" ? "100%" : "60%",
        marginLeft: "0px",
        marginTop: "0px",
        marginBottom: "0px",
        fontSize: bannerType === "linkedinbanner" ? "30px" : "96px",
    });
    const [selectedCTA, setSelectedCTA] = useState(1);
    const [ctaDetails, setCtaDetails] = useState({
        ctaTitle: availableCTAs[0].title || "",
        ctaLine: availableCTAs[0].line,
    });
    const [jobinfo, setJobinfo] = useState({
        degree: jobdetails?.degree,
        batch: jobdetails?.batch,
        experience: jobdetails?.experience,
        salary: jobdetails?.salary,
        location: jobdetails?.location,
        role: jobdetails?.role,
        companyName: jobdetails?.companyName,
    });

    // Event handlers
    const handleCanvasCssChange = (key, value) => {
        setCanvasCss({ ...canvasCss, [key]: value });
    };

    const handleCTAChange = (event) => {
        const selectedId = event.target.value;
        setSelectedCTA(selectedId);

        const selected = availableCTAs.find((cta) => cta.id === selectedId);
        if (selected) {
            setCtaDetails({
                ctaTitle: selected.title || "",
                ctaLine: selected.line,
            });
        }
    };

    const handleDownloadBanner = async () => {
        if (bannerType !== "carousel") {
            const bannername = jobdetails.companyName + "_" + bannerType;
            downloadImagefromCanvasHelper(bannername, "careersattech", false);
        } else {
            const bannername = jobdetails.companyName + "_" + "carousel1";
            downloadImagefromCanvasHelper(bannername, "carousel1", false);

            const bannername2 = jobdetails.companyName + "_" + "carousel2";
            downloadImagefromCanvasHelper(bannername2, "carousel2", false);
        }
    };

    // Effects
    useEffect(() => {
        // Set canvas CSS based on banner type
        if (bannerType === "linkedinbanner") {
            setCanvasCss({
                ...canvasCss,
                imgsize: "100%",
                fontSize: "28px",
            });
        } else {
            setCanvasCss({
                ...canvasCss,
                imgsize: "60%",
                fontSize: "96px",
            });
        }

        // Set canvas ID
        if (!!bannerType) {
            setCanvas(bannerType);
            setCanvasId(bannerType);
        } else {
            setCanvasId(context?.isAdmin ? "careersattech" : "jobsattech");
        }
    }, [bannerType, context?.isAdmin]);

    useEffect(() => {
        // Update job info when job details change
        setJobinfo({
            degree: jobdetails?.degree,
            batch: jobdetails?.batch,
            experience: jobdetails?.experience,
            salary: jobdetails?.salary,
            location: jobdetails?.location,
            role: jobdetails?.role,
            companyName: jobdetails?.companyName,
        });
    }, [jobdetails]);

    // Memoize banner props to prevent unnecessary re-renders
    const bannerProps = useMemo(() => ({
        ...props,
        jobinfo,
        ctaDetails,
        canvasCss
    }), [props, jobinfo, ctaDetails, canvasCss]);

    return (
        <div>
            {/* Canvas design controls */}
            <CanvasDesignControls 
                canvasCss={canvasCss} 
                handleCanvasCssChange={handleCanvasCssChange} 
            />

            {/* CTA details selection for admin */}
            {canvas === "careersattech" && (
                <div>
                    <CustomDivider />
                    <CTASelector 
                        selectedCTA={selectedCTA}
                        availableCTAs={availableCTAs}
                        handleCTAChange={handleCTAChange}
                        ctaDetails={ctaDetails}
                        setCtaDetails={setCtaDetails}
                    />
                    <CustomDivider />
                </div>
            )}

            <br />

            {/* Render appropriate banner based on canvas type */}
            {canvas === "careersattech" && <CareersattechBanner {...bannerProps} />}
            {canvas === "jobsattech" && <JobsattechBanner {...bannerProps} />}
            {canvas === "linkedinbanner" && <LinkedinBanner {...bannerProps} />}
            {canvas === "carousel" && <Carousel {...bannerProps} />}

            {/* Download button */}
            <div className={styles.flex}>
                <Button 
                    style={{ textTransform: "capitalize", marginTop: "30px" }} 
                    onClick={handleDownloadBanner} 
                    variant="contained" 
                    color="success" 
                    endIcon={<CloudDownloadIcon />}
                >
                    Download Banner
                </Button>
            </div>
        </div>
    );
}

export default Canvas;
