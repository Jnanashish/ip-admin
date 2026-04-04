import React, { useState, useEffect } from "react";

import { companyTypeOptions } from "../Addjobs/Helpers/staticdata";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { showErrorToast, showSuccessToast } from "../../Helpers/toast";
import { submitCompanyDetailsHelper, updateCompanyDetailsHelper } from "./helper";
import Custombutton from "../../Components/Button/Custombutton";
import CustomTextField from "../../Components/Input/Textfield";

import { get } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { safeUrl } from "../../Helpers/sanitize";

const CompanyDetails = () => {
    const [comapnyDetails, setComapnyDetails] = useState({
        companyName: "",
        companyInfo: "",
        linkedinPageLink: "",
        careersPageLink: "",
        companyType: "",
        smallLogo: "",
        largeLogo: "",
    });
    const [isCompanydetailPresent, setIsCompanydetailPresent] = useState(false);
    const [comapnyId, setCompanyId] = useState();

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

    const submitCompanyDetails = async () => {
        const res = await submitCompanyDetailsHelper(comapnyDetails);
        if (!!res) {
            setComapnyDetails({
                companyName: "",
                companyInfo: "",
                linkedinPageLink: "",
                careersPageLink: "",
                companyType: "",
                smallLogo: "",
                largeLogo: "",
            });
        }
    };

    const updateCompanyDetails = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const companyid = urlParams.get("companyid") || comapnyId;
        const res = await updateCompanyDetailsHelper(comapnyDetails, companyid);

        if (!!res) {
            window.location.href = "/companys";
            setComapnyDetails({
                companyName: "",
                companyInfo: "",
                linkedinPageLink: "",
                careersPageLink: "",
                companyType: "",
                smallLogo: "",
                largeLogo: "",
            });
        }
    };

    const handleButtonClick = () => {
        if (isCompanydetailPresent) {
            updateCompanyDetails();
        } else {
            submitCompanyDetails();
        }
    };

    const handleCompanyDetailChange = (key, value) => {
        setComapnyDetails({ ...comapnyDetails, [key]: value });
    };

    const handleCompanynameChange = async (value) => {
        if (!!value) {
            const res = await get(`${apiEndpoint.get_company_details}?companyname=${value}`);
            const data = res[0];
            setCompanyId(data?._id);
            if (!!data?.companyName && !!data?.smallLogo) {
                setIsCompanydetailPresent(true);
                setComapnyDetails({
                    companyName: data?.companyName || "",
                    companyInfo: data?.companyInfo || "",
                    linkedinPageLink: data?.linkedinPageLink || "",
                    careersPageLink: data?.careerPageLink || "",
                    companyType: data?.companyType || "",
                    smallLogo: data?.smallLogo || "",
                    largeLogo: data?.largeLogo || "",
                });
            }
        }
    };

    const getQueryparam = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const companyid = urlParams.get("companyid");

        // Validate ObjectId format (24-character hex string)
        if (companyid && /^[a-f\d]{24}$/i.test(companyid)) {
            setCompanyId(companyid);

            const res = await get(`${apiEndpoint.get_company_details}?id=${companyid}`);
            const data = res[0];
            if (!!data) {
                setIsCompanydetailPresent(true);
                setComapnyDetails({
                    companyName: data?.companyName,
                    companyInfo: data?.companyInfo,
                    linkedinPageLink: safeUrl(data?.linkedinPageLink || "#"),
                    careersPageLink: safeUrl(data?.careerPageLink || "#"),
                    companyType: data?.companyType,
                    smallLogo: data?.smallLogo,
                    largeLogo: data?.largeLogo,
                });
            }
        }
    };

    useEffect(() => {
        getQueryparam();
    }, []);

    return (
        <div className="flex items-center justify-center w-full flex-col mt-5 [&_button]:capitalize">
            <div className="flex w-[60%] items-center justify-between">
                <h3 className="justify-self-end text-base text-foreground">Company name : </h3>
                <CustomTextField label="Title" onBlur={(val) => handleCompanynameChange(val)} value={comapnyDetails.companyName} onChange={(val) => handleCompanyDetailChange("companyName", val)} sx={{ width: "80%" }} />
            </div>
            <div className="flex w-[60%] items-center justify-between">
                <h3 className="justify-self-end text-base text-foreground">Company info : </h3>
                <CustomTextField multiline={true} rows={4} label="Company info" value={comapnyDetails.companyInfo} onChange={(val) => handleCompanyDetailChange("companyInfo", val)} sx={{ width: "80%" }} />
            </div>
            <div className="flex w-[60%] items-center justify-between">
                <h3 className="justify-self-end text-base text-foreground">Company type : </h3>
                <CustomTextField
                    label="Company type"
                    value={comapnyDetails.companyType}
                    onChange={(val) => handleCompanyDetailChange("companyType", val)}
                    sx={{ width: "80%" }}
                    type="select"
                    optionData={companyTypeOptions}
                />
            </div>
            <div className="flex w-[60%] items-center justify-between">
                <h3 className="justify-self-end text-base text-foreground">Career page link : </h3>
                <CustomTextField label="Careers page" value={comapnyDetails.careersPageLink} onChange={(val) => handleCompanyDetailChange("careersPageLink", val)} sx={{ width: "80%" }} />
            </div>
            <div className="flex w-[60%] items-center justify-between">
                <h3 className="justify-self-end text-base text-foreground">Linkedin link : </h3>
                <CustomTextField label="Linkedin link" value={comapnyDetails.linkedinPageLink} onChange={(val) => handleCompanyDetailChange("linkedinPageLink", val)} sx={{ width: "80%" }} />
            </div>
            <br />

            <div className="grid grid-cols-[20%_30%_50%] items-center max-lg:flex max-lg:flex-col max-lg:mx-5 border border-text-secondary w-4/5 h-[200px] mb-5 rounded-md [&_img]:h-[120px] [&_img]:w-auto [&_img]:max-w-[90%] [&_b]:text-center [&_b]:text-red-500 [&_b]:ml-8 [&_b]:text-xl">
                <h3 className="justify-self-end text-base text-foreground">Company small logo : </h3>
                <input accept=".jpeg, .jpg, .png, .webp, .heic, .svg" className="p-3 text-base w-3/4 rounded border-none max-lg:my-2.5 max-lg:w-full" onChange={(e) => handleCompanyLogoInput(e)} name="image" type="file" />
                <img src={comapnyDetails.smallLogo} />
            </div>

            <div className="grid grid-cols-[20%_30%_50%] items-center max-lg:flex max-lg:flex-col max-lg:mx-5 border border-text-secondary w-4/5 h-[200px] mb-5 rounded-md [&_img]:h-[120px] [&_img]:w-auto [&_img]:max-w-[90%] [&_b]:text-center [&_b]:text-red-500 [&_b]:ml-8 [&_b]:text-xl">
                <h3 className="justify-self-end text-base text-foreground">Company BIG logo : </h3>
                <input accept=".jpeg, .jpg, .png, .webp, .heic, .svg" className="p-3 text-base w-3/4 rounded border-none max-lg:my-2.5 max-lg:w-full" onChange={(e) => handleCompanyLogoInput(e, false)} name="image" type="file" />
                <img src={comapnyDetails.largeLogo} />
            </div>

            <Custombutton disabled={!comapnyDetails.companyName || !comapnyDetails.largeLogo || !comapnyDetails.smallLogo} onClick={handleButtonClick} label={isCompanydetailPresent ? `Update job details` : `Submit job details`} />
            <br />
            <br />
        </div>
    );
};

export default CompanyDetails;
