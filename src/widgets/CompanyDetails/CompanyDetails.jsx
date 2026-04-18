import React, { useState, useEffect } from "react";

import { companyTypeOptions } from "../Addjobs/Helpers/staticdata";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { showErrorToast } from "../../Helpers/toast";
import { submitCompanyDetailsHelper, updateCompanyDetailsHelper } from "./helper";
import CustomButton from "../../Components/Button/CustomButton";
import CustomTextField from "../../Components/Input/Textfield";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";

import { get } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { safeUrl } from "../../Helpers/sanitize";

const CompanyDetails = () => {
    const [companyDetails, setCompanyDetails] = useState({
        companyName: "",
        companyInfo: "",
        linkedinPageLink: "",
        careersPageLink: "",
        companyType: "",
        smallLogo: "",
        largeLogo: "",
    });
    const [isCompanydetailPresent, setIsCompanydetailPresent] = useState(false);
    const [companyId, setCompanyId] = useState();

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const handleCompanyLogoInput = async (e, compressImage = true) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showErrorToast("Only JPEG, PNG, and WebP images are allowed");
            e.target.value = "";
            return;
        }

        if (compressImage) {
            const link = await generateLinkfromImage(e);
            handleCompanyDetailChange("smallLogo", link);
        } else {
            if (file.size < 1000000) {
                const link = await generateLinkfromImage(e, false);
                handleCompanyDetailChange("largeLogo", link);
            } else {
                showErrorToast("Image size should be less than 1mb");
            }
        }
    };

    const submitCompanyDetails = async () => {
        const res = await submitCompanyDetailsHelper(companyDetails);
        if (!!res) {
            setCompanyDetails({
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
        const companyid = urlParams.get("companyid") || companyId;
        const res = await updateCompanyDetailsHelper(companyDetails, companyid);

        if (!!res) {
            window.location.href = "/companys";
            setCompanyDetails({
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
        setCompanyDetails({ ...companyDetails, [key]: value });
    };

    const handleCompanynameChange = async (value) => {
        if (!!value) {
            const res = await get(`${apiEndpoint.getCompanyDetails}?companyname=${value}`);
            const data = res[0];
            setCompanyId(data?._id);
            if (!!data?.companyName && !!data?.smallLogo) {
                setIsCompanydetailPresent(true);
                setCompanyDetails({
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

            const res = await get(`${apiEndpoint.getCompanyDetails}?id=${companyid}`);
            const data = res[0];
            if (!!data) {
                setIsCompanydetailPresent(true);
                setCompanyDetails({
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
            <h2 className="text-2xl font-bold tracking-tight mb-6">{isCompanydetailPresent ? "Update" : "Add"} Company Details</h2>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <CustomTextField
                            label="Company name"
                            onBlur={(val) => handleCompanynameChange(val)}
                            value={companyDetails.companyName}
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
                            value={companyDetails.companyInfo}
                            onChange={(val) => handleCompanyDetailChange("companyInfo", val)}
                            fullWidth
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Type</label>
                        <CustomTextField
                            label="Company type"
                            value={companyDetails.companyType}
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
                            value={companyDetails.careersPageLink}
                            onChange={(val) => handleCompanyDetailChange("careersPageLink", val)}
                            fullWidth
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">LinkedIn Link</label>
                        <CustomTextField
                            label="Linkedin link"
                            value={companyDetails.linkedinPageLink}
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
                        <div className="flex-1 min-w-[200px] border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <label className="text-sm font-medium block mb-2">Small Logo</label>
                            <input
                                accept=".jpeg, .jpg, .png, .webp, .heic, .svg"
                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                onChange={(e) => handleCompanyLogoInput(e)}
                                name="image"
                                type="file"
                            />
                        </div>
                        {companyDetails.smallLogo && (
                            <img src={companyDetails.smallLogo} className="h-20 w-auto object-contain rounded border p-1" alt="Small logo" />
                        )}
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex-1 min-w-[200px] border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <label className="text-sm font-medium block mb-2">Large Logo</label>
                            <input
                                accept=".jpeg, .jpg, .png, .webp, .heic, .svg"
                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                onChange={(e) => handleCompanyLogoInput(e, false)}
                                name="image"
                                type="file"
                            />
                        </div>
                        {companyDetails.largeLogo && (
                            <img src={companyDetails.largeLogo} className="h-20 w-auto object-contain rounded border p-1" alt="Large logo" />
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 mb-10">
                <CustomButton
                    disabled={!companyDetails.companyName || !companyDetails.largeLogo || !companyDetails.smallLogo}
                    onClick={handleButtonClick}
                    label={isCompanydetailPresent ? "Update company details" : "Submit company details"}
                />
            </div>
        </div>
    );
};

export default CompanyDetails;
