import React, { useState, useEffect } from "react";

import { companyTypeOptions } from "../Addjobs/Helpers/staticdata";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { showErrorToast, showSuccessToast } from "../../Helpers/toast";
import { submitCompanyDetailsHelper, updateCompanyDetailsHelper } from "./helper";
import Custombutton from "../../Components/Button/Custombutton";
import CustomTextField from "../../Components/Input/Textfield";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";

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
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">{isCompanydetailPresent ? "Update" : "Add"} Company Details</h2>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <CustomTextField
                            label="Company name"
                            onBlur={(val) => handleCompanynameChange(val)}
                            value={comapnyDetails.companyName}
                            onChange={(val) => handleCompanyDetailChange("companyName", val)}
                            fullWidth
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Info</label>
                        <CustomTextField
                            multiline={true}
                            rows={4}
                            label="Company info"
                            value={comapnyDetails.companyInfo}
                            onChange={(val) => handleCompanyDetailChange("companyInfo", val)}
                            fullWidth
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Type</label>
                        <CustomTextField
                            label="Company type"
                            value={comapnyDetails.companyType}
                            onChange={(val) => handleCompanyDetailChange("companyType", val)}
                            fullWidth
                            type="select"
                            optionData={companyTypeOptions}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Career Page Link</label>
                        <CustomTextField
                            label="Careers page"
                            value={comapnyDetails.careersPageLink}
                            onChange={(val) => handleCompanyDetailChange("careersPageLink", val)}
                            fullWidth
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">LinkedIn Link</label>
                        <CustomTextField
                            label="Linkedin link"
                            value={comapnyDetails.linkedinPageLink}
                            onChange={(val) => handleCompanyDetailChange("linkedinPageLink", val)}
                            fullWidth
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">Company Logos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-sm font-medium">Small Logo</label>
                            <input
                                accept=".jpeg, .jpg, .png, .webp, .heic, .svg"
                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                onChange={(e) => handleCompanyLogoInput(e)}
                                name="image"
                                type="file"
                            />
                        </div>
                        {comapnyDetails.smallLogo && (
                            <img src={comapnyDetails.smallLogo} className="h-20 w-auto object-contain rounded border p-1" alt="Small logo" />
                        )}
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-sm font-medium">Large Logo</label>
                            <input
                                accept=".jpeg, .jpg, .png, .webp, .heic, .svg"
                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                onChange={(e) => handleCompanyLogoInput(e, false)}
                                name="image"
                                type="file"
                            />
                        </div>
                        {comapnyDetails.largeLogo && (
                            <img src={comapnyDetails.largeLogo} className="h-20 w-auto object-contain rounded border p-1" alt="Large logo" />
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 mb-10">
                <Custombutton
                    disabled={!comapnyDetails.companyName || !comapnyDetails.largeLogo || !comapnyDetails.smallLogo}
                    onClick={handleButtonClick}
                    label={isCompanydetailPresent ? "Update company details" : "Submit company details"}
                />
            </div>
        </div>
    );
};

export default CompanyDetails;
