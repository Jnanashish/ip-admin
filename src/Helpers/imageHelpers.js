import Compressor from "compressorjs";
import * as htmlToImage from "html-to-image";

// helper methods
import { showErrorToast, showInfoToast, showWarnToast } from "./toast";
import { post, get } from "./request";
import { apiEndpoint } from "./apiEndpoints";

// -- resize the image to 200 * 200 px and reduce quality by 40%
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

// compress and resize image helper
const resizeImage = async (file) => {
    const compressedImage = await resizeImageHelper(file);
    const compressedImageSize = compressedImage.size;

    // if compressed image size is more then 10kb return null
    if (compressedImageSize > 10240) {
        showErrorToast("Image size should be less than 10kb (After compression)");
        return null;
    } else {
        compressedImageSize > 5120 && showWarnToast("Image size should be less than 5kb (After compression)");
        return compressedImage;
    }
};

// accept an file change event and return compressed file
export const handleImageInputHelper = async (event) => {
    const file = event.target.files[0];
    const fileSize = file.size;
    console.log("fileSize", fileSize);

    // if file size is more then 4kb then compress it
    if (fileSize > 4096) {
        // if file size is more then 50kb before compresion, don't accept it
        if (file.size > 51200) {
            showWarnToast("Image size should be less than 50kb (Before compression)");
            return null;
        } else {
            // compress and resize file
            return await resizeImage(file);
        }
    } else {
        return file;
    }
};

// -- upload image to cloudinary and return cdn url (accept event or blob)
export const generateImageCDNlinkHelper = async (event, blob) => {
    const file = !!event ? event.target.files[0] : blob;
    const formData = new FormData();
    formData.append("photo", file);

    showInfoToast("Generating image url from cloudinary");
    const res = await post(apiEndpoint.getImagecdnUrl, formData, "Generate URL from image");
    return res.url;
};

// upload any image to cdn return image url, accept event
export const generateLinkfromImage = async (event, compressImage = true) => {
    if (compressImage) {
        // get the compressed image
        const imageFile = await handleImageInputHelper(event);
        if (!!imageFile) {
            return imageFile;
            return await generateImageCDNlinkHelper(null, imageFile);
        }
        return null;
    }
    return await generateImageCDNlinkHelper(event);
};

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

        const blob = await fetch(dataUrl).then((res) => res.blob());
        if(generatelink){
            const bannerUrl = await generateImageCDNlinkHelper(null, blob);
            return bannerUrl;
        }

    } catch (error) {
        console.error("Error converting HTML to image:", error);
        return null;
    }
};

// -- convert and canvas to image and download it, get image cdn url
//export const downloadImagefromCanvasHelper = async (fileName, canvasId) => {
//    const element = document.getElementById(canvasId);
//    const canvas = await html2canvas(element);
//
//    var data = canvas.toDataURL("image/jpg");
//    var link = document.createElement("a");
//
//    link.href = data;
//    link.download = fileName + ".jpg";
//    document.body.appendChild(link);
//    link.click();
//    document.body.removeChild(link);
//
//    const blob = await new Promise(resolve => canvas.toBlob(resolve));
//    const bannerUrl = await generateImageCDNlinkHelper(null, blob);
//
//
//    return bannerUrl;
//};

// upload html canvas to cdn and return image link
export const uploadBannertoCDNHelper = async (canvasId) => {
    const element = document.getElementById(canvasId);

    try {
        const dataUrl = await htmlToImage.toBlob(element);
        const bannerUrl = await generateImageCDNlinkHelper(null, dataUrl);

        return bannerUrl;
    } catch (error) {
        console.error("Error converting HTML to image:", error);
        return null;
    }
};

// download an image from image link, accept image link and filename
export const generateImageFromLink = async (imagelink, fileName) => {
    const image = await fetch(imagelink);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
