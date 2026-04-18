import Compressor from "compressorjs";
import * as htmlToImage from "html-to-image";

import { showErrorToast, showInfoToast, showWarnToast } from "./toast";
import { post } from "./request";
import { apiEndpoint } from "./apiEndpoints";

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PRE_COMPRESSION_MAX_BYTES = 51200;  // 50kb
const PRE_COMPRESSION_MIN_BYTES = 5120;   // 5kb
const POST_COMPRESSION_MAX_BYTES = 10240; // 10kb

// Resize the image to 200 * 200 px and reduce quality by 40%
// Return the compressed image
export const resizeImageHelper = (file) => {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.6,
            height: 200,
            width: 200,
            success(result) {
                resolve(result);
            },
            error(err) {
                reject(err);
                showErrorToast("Error in resizing image");
            },
        });
    });
};

// Compress and resize image helper
// Return the compressed image
const resizeImage = async (file) => {
    const compressedImage = await resizeImageHelper(file);

    if (compressedImage.size > POST_COMPRESSION_MAX_BYTES) {
        showErrorToast("Image size should be less than 10kb (After compression)");
        return null;
    }
    return compressedImage;
};

// accept an file change event and return compressed file or null
export const handleImageInputHelper = async (event) => {
    const file = event.target.files[0];
    if (!file) return null;

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
        showErrorToast("Invalid image format. Use JPG, PNG, WEBP, or GIF.");
        return null;
    }

    if (file.size > PRE_COMPRESSION_MAX_BYTES) {
        showWarnToast("Image size should be less than 50kb (Before compression)");
        return null;
    }

    if (file.size > PRE_COMPRESSION_MIN_BYTES) {
        return await resizeImage(file);
    }
    return file;
};

// -- upload image to cloudinary and return cdn url (accept event or blob)
export const generateLinkfromImageHelper = async (event, blob) => {
    const file = !!event ? event.target.files[0] : blob;
    const formData = new FormData();
    formData.append("photo", file);

    showInfoToast("Generating image url from cloudinary");
    const res = await post(apiEndpoint.getImagecdnUrl, formData);
    return res.url;
};

// upload any image to cdn return image url and compressed image , accept input event
export const generateLinkfromImage = async (event, compressImage = true) => {
    if (compressImage) {
        const imageFile = await handleImageInputHelper(event);
        if (!!imageFile) {
            return await generateLinkfromImageHelper(null, imageFile);
        }
        return null;
    }
    return await generateLinkfromImageHelper(event);
};

// -------------------------------------------------------------------------------------

export const downloadImagefromCanvasHelper = async (fileName, canvasId, generatelink = true) => {
    const element = document.getElementById(canvasId);

    try {
        const dataUrl = await htmlToImage.toJpeg(element);
        const link = document.createElement("a");

        link.href = dataUrl;
        link.download = fileName + ".jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (generatelink) {
            const blob = await fetch(dataUrl).then((res) => res.blob());
            const bannerUrl = await generateLinkfromImageHelper(null, blob);
            return bannerUrl;
        }
    } catch (error) {
        console.error("Error converting HTML to image:", error);
        return null;
    }
};

// upload html canvas to cdn and return image link
export const uploadBannertoCDNHelper = async (canvasId) => {
    const element = document.getElementById(canvasId);

    try {
        const dataUrl = await htmlToImage.toBlob(element);
        const bannerUrl = await generateLinkfromImageHelper(null, dataUrl);

        return bannerUrl;
    } catch (error) {
        console.error("Error converting HTML to image:", error);
        return null;
    }
};

// download an image from image link, accept image link and filename
export const generateImageFromLink = async (imagelink, fileName) => {
    const image = await fetch(imagelink);
    const imageBlob = await image.blob();
    const imageURL = URL.createObjectURL(imageBlob);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Release the blob URL to avoid a memory leak
    URL.revokeObjectURL(imageURL);
};
