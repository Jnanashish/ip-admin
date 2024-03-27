import React, { useState } from "react";
import styles from "./companydetails.module.scss";

import { companyTypeOptions } from "../Addjobs/Helpers/staticdata";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { showErrorToast, showSuccessToast } from "../../Helpers/toast";
import { submitCompanyDetailsHelper } from "./helper";
import Custombutton from "../../Components/Button/Custombutton";
import CustomTextField from "../../Components/Input/Textfield";

const CompanyDetails = () => {
    const [comapnyDetails, setComapnyDetails] = useState({
        name: "",
        info: "",
        linkedinLink: "",
        careersPageLink: "",
        companyType: "",
        smallLogo: "",
        largeLogo: "",
    });

    // handle company logo submit set cdn url
    const handleCompanyLogoInput = async (e, compressImage = true) => {
        const file = e.target.files;
        const fileSize = file[0].size;

        if (compressImage) {
            const link = await generateLinkfromImage(e);
            handleCompanyDetailChange("smallLogo", link);
        } else {
            if (fileSize < 1000000) {
                const link = await generateLinkfromImage(e, false);
                handleCompanyDetailChange("largeLogo", link);
            } else {
                showErrorToast("Image size should be less than 1mb");
            }
        }
    };

    // submit company details
    const submitCompanyDetails = async () => {
        const res = await submitCompanyDetailsHelper(comapnyDetails);
        if (!!res?.status === 200) {
            setComapnyDetails({
                name: "",
                info: "",
                linkedinLink: "",
                careersPageLink: "",
                companyType: "",
                smallLogo: "",
                largeLogo: "",
            });
        }
    };

    // handle company detail input change
    const handleCompanyDetailChange = (key, value) => {
        setComapnyDetails({ ...comapnyDetails, [key]: value });
    };

    return (
        <div className={styles.container}>
            <div className={styles.text_input}>
                <h3 className={styles.admin_label}>Company name : </h3>
                <CustomTextField label="Title" value={comapnyDetails.name} onChange={(val) => handleCompanyDetailChange("name", val)} sx={{ width: "80%" }} />
            </div>
            <div className={styles.text_input}>
                <h3 className={styles.admin_label}>Company info : </h3>
                <CustomTextField multiline={true} rows={4} label="Comapny info" value={comapnyDetails.info} onChange={(val) => handleCompanyDetailChange("info", val)} sx={{ width: "80%" }} />
            </div>
            <div className={styles.text_input}>
                <h3 className={styles.admin_label}>Company type : </h3>
                <CustomTextField
                    label="Comapny type"
                    value={comapnyDetails.companyType}
                    onChange={(val) => handleCompanyDetailChange("companyType", val)}
                    sx={{ width: "80%" }}
                    type="select"
                    optionData={companyTypeOptions}
                />
            </div>
            <div className={styles.text_input}>
                <h3 className={styles.admin_label}>Career page link : </h3>
                <CustomTextField label="Careers page" value={comapnyDetails.careersPageLink} onChange={(val) => handleCompanyDetailChange("careersPageLink", val)} sx={{ width: "80%" }} />
            </div>
            <div className={styles.text_input}>
                <h3 className={styles.admin_label}>Linkedin link : </h3>
                <CustomTextField label="Linkedin link" value={comapnyDetails.linkedinLink} onChange={(val) => handleCompanyDetailChange("linkedinLink", val)} sx={{ width: "80%" }} />
            </div>
            <br />

            <div className={`${styles.admin_grid} ${styles.imgWrap}`}>
                <h3 className={styles.admin_label}>Company small logo : </h3>
                <input accept=".jpeg, .jpg, .png, .webp, .heic, .svg" className={styles.admin_input} onChange={(e) => handleCompanyLogoInput(e)} name="image" type="file" />
                <img src={comapnyDetails.smallLogo} />
            </div>

            <div className={`${styles.admin_grid} ${styles.imgWrap}`}>
                <h3 className={styles.admin_label}>Company BIG logo : </h3>
                <input accept=".jpeg, .jpg, .png, .webp, .heic, .svg" className={styles.admin_input} onChange={(e) => handleCompanyLogoInput(e, false)} name="image" type="file" />
                <img src={comapnyDetails.largeLogo} />
            </div>

            <Custombutton disabled={!comapnyDetails.name || !comapnyDetails.largeLogo || !comapnyDetails.smallLogo} onClick={submitCompanyDetails} label="Submit job details" />
            <br />
            <br />
        </div>
    );
};

export default CompanyDetails;
