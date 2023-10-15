import Compressor from "compressorjs";
import html2canvas from "html2canvas";

// helper methods
import { API } from "../Backend"
import { ShowErrorToast, ShowInfoToast, ShowWarnToast } from "./toast";
import { post, get } from "./request";
import { apiEndpoint } from "./apiEndpoints";


// -- resize the image to 200 * 200 px and reduce quality by 40%
export const resizeImageHelper = (file) =>{
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
                ShowErrorToast("Error in resizing image");
            },
        });
    });
}

// -- upload image to cloudinary and return cdn url
export const generateImageCDNlinkHelper = async (event, blob) => {
    const file = !!event ? event.target.files[0] : blob;
    const formData = new FormData();
    formData.append("photo", file);

    ShowInfoToast("Generating image url from cloudinary");
    const res = await post(apiEndpoint.getImagecdnUrl, formData, "Generate URL from image");
    return res.url
};


// -- convert and canvas to image and download it, get image cdn url
export const downloadImagefromCanvasHelper = async (fileName, canvasId) => {
    const element = document.getElementById(canvasId);
    const canvas = await html2canvas(element);

    var data = canvas.toDataURL("image/jpg");
    var link = document.createElement("a");

    link.href = data;
    link.download = fileName + ".jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    const bannerUrl = await generateImageCDNlinkHelper(null, blob);


    return bannerUrl;
};


export const uploadBannertoCDNHelper = async(canvasId) => {
    const element = document.getElementById(canvasId);
    const canvas = await html2canvas(element);

    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    const bannerUrl = await generateImageCDNlinkHelper(null, blob);

    return bannerUrl;
}



const resizeImage = async (file) => {
    const compressedImage = await resizeImageHelper(file);
    const compressedImageSize = compressedImage.size;

    if (compressedImageSize > 5120) {
        ShowWarnToast("Image size should be less than 5kb (After compression)");
        return null;
    } else {
        return compressedImage;
    }
};

// return image 
export const handleImageInputHelper = async (event) => {
    const file = event.target.files[0];
    const fileSize = file.size;

    if (fileSize > 4096) {
        if (file.size > 51200) {
            ShowWarnToast("Image size should be less than 150kb (Before compression)");
            return null;
        } else {
            return await resizeImage(file);
        }
    } else {
        return file;
    }
}