import React, { useState } from "react";
import styles from "./companylogo.module.scss";
import { API } from "../../Backend";

// import react toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Compressor from "compressorjs";
import { Button } from "@mui/material";

const CompanyLogo = () => {
    const [companySmallLogoSize, setCompanySmallLogoSize] = useState(0);
    const [companySmallLogo, setCompanySmallLogo] = useState(null);
    const [companyBigLogo, setCompanyBigLogo] = useState(null);

    const [companyName, setCompanyName] = useState("")
    const [companyBigLogoUrl, setCompanyBigLogoUrl] = useState(null)
    const [companySmallLogoUrl, setCompanySmallLogoUrl] = useState(null)


    const resizeImage = (file, e) => {
        new Compressor(file, {
            quality: 0.5,
            height: 200,
            width: 200,
            success(result) {
                setCompanySmallLogoSize(result.size / 1024);
                if (result.size > 5120) {
                    toast.error("Image size should be less than 5kb (After compression), UPLOAD again");
                } else {
                    generateImageCDNlink(file, setCompanySmallLogoUrl)
                    setCompanySmallLogo(result);
                    handleCompanyLogoInput(e, setCompanySmallLogo);
                }
            },
            error(err) {
                toast.error("Error in compressing");
            },
        });
    };

    const handleCompanyLogoInput = (e, func) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            func(reader.result);
        });

        reader.readAsDataURL(e.target.files[0]);
    };

    const handleimginp = (e) => {
        const file = e.target.files;
        setCompanySmallLogoSize(file[0].size / 1024);
        const fileSize = file[0].size;

        if (fileSize > 4096) {
            if (file[0].size > 51200) {
                toast.error("Image size should be less than 150kb (Before compression), UPLOAD again");
            } else {
                resizeImage(file[0], e);
            }
        } else {
            setCompanySmallLogo(file[0]);
            handleCompanyLogoInput(e, setCompanySmallLogo);
            generateImageCDNlink(e, setCompanySmallLogoUrl)
        }
    };

    const handleBigLogoinp = (e) => {
        const file = e.target.files;
        const fileSize = file[0].size;
        if (fileSize < 1000000) {
            generateImageCDNlink(e, setCompanyBigLogoUrl)
            handleCompanyLogoInput(e, setCompanyBigLogo);
        } else {
            toast.error("Image size should be less than 1mb");
        }
    };

    const generateImageCDNlink = async (e, func) => {
        const formData = new FormData();
        const file = e.target.files;
        formData.append("photo", file[0]);

        toast("Generating image url from cloudinary");

        const res = await fetch(`${API}/jd/getposterlink`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (res.status === 201) {
            toast("Successfully link generated");
        } else {
            toast.error("An error Occured");
        }
        func(data.url)
    };

    const handleLogoSubmit = async () => {
        const formData = new FormData();
        formData.append("companyName", companyName);
        formData.append("largeLogo", companyBigLogoUrl);
        formData.append("smallLogo", companySmallLogoUrl);

        const res = await fetch(`${API}/companylogo/add`, {
            method: "POST",
            body: formData,
        });

        if (res.status === 201) {
            toast("Company logo added Successfully");
            setCompanyName("")
            setCompanyBigLogoUrl(null)
            setCompanySmallLogoUrl(null)
        } else {
            toast.error("An error Occured");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.text_input}>
                <h3 className={styles.admin_label}>Title for the ad : </h3>
                <input
                    className={styles.admin_input}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    type="text"
                    placeholder="Title"
                />
            </div>
            <div className={`${styles.admin_grid} ${styles.imgWrap}`}>
                <h3 className={styles.admin_label}>Company small logo : </h3>
                <input
                    accept=".jpeg, .jpg, .png, .webp, .heic"
                    className={styles.admin_input}
                    onChange={handleimginp}
                    name="image"
                    type="file"
                />
                <span>
                    <img src={companySmallLogo} />
                    {!!companySmallLogoSize && <b>{companySmallLogoSize} kb</b>}
                </span>
            </div>
            <div className={`${styles.admin_grid} ${styles.imgWrap}`}>
                <h3 className={styles.admin_label}>Company BIG logo : </h3>
                <input
                    accept=".jpeg, .jpg, .png, .webp, .heic"
                    className={styles.admin_input}
                    onChange={handleBigLogoinp}
                    name="image"
                    type="file"
                />
                <img src={companyBigLogo} />
            </div>
            <Button
                style={{ textTransform: "capitalize" }}
                onClick={() => handleLogoSubmit(true)}
                variant="contained"
                color="success"
                disabled={!companyName && !companyBigLogoUrl && !companySmallLogoUrl}
            >
                Download IG Banner
            </Button>
            <ToastContainer />
        </div>
    );
};

export default CompanyLogo;
