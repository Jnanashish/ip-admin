import React, { useState, useEffect } from "react";

import { Button } from "Components/ui/button";
import { Trash2, Send } from "lucide-react";

import { post, get, deleteData } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { safeUrl } from "../../Helpers/sanitize";

const AddLinkImage = () => {
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");
    const [para, setPara] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [data, setData] = useState([]);

    const handleImageInput = (e) => {
        setSelectedFile(e.target.files?.[0] || null);
    };

    const addData = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (selectedFile) formData.append("photo", selectedFile);
        formData.append("link", link);
        formData.append("title", title);
        formData.append("para", para);

        const res = await post(apiEndpoint.addAdLinkImage, formData, "Add ad link image");
        if (res) {
            setLink("");
            setTitle("");
            setPara("");
            setSelectedFile(null);
            getData();
        }
    };

    const getData = async () => {
        const res = await get(apiEndpoint.getAdLinkImages);
        if (res) setData(res);
    };

    const deleteLinkImage = async (id) => {
        const res = await deleteData(`${apiEndpoint.deleteAdLinkImage}/${id}`, "Delete ad link image");
        if (res) getData();
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="admin">
            <h2 className="adminpanel-title">Ad Manager</h2>
            <p className="text-center text-red-500 mb-1">* Add max 4 ads at one time</p>
            <br />
            <div>
                <form>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Link to register : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={link} onChange={(e) => setLink(e.target.value)} type="text" placeholder="Link" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Title for the ad : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Title" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Paragraph(If any) : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={para} onChange={(e) => setPara(e.target.value)} type="text" placeholder="Paragraph" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Image for ad : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" onChange={handleImageInput} name="image" type="file" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <div></div>
                        <Button type="button" onClick={addData}>
                            Submit
                        </Button>
                    </div>
                </form>
            </div>

            <hr />
            <br />

            <div className="w-full p-5">
                <h2 className="adminpanel-title">
                    Ad Link with image count : <b>{data.length}</b>
                </h2>
                {data.map((item) => {
                    return (
                        <div key={item._id}>
                            <h3>{item.title}</h3>
                            <div className="border border-foreground w-full p-2.5 flex flex-row justify-around items-center my-5 [&_img]:w-[100px]">
                                <img className="w-[300px]" src={item.imagePath} alt="" loading="lazy" />
                                <br />

                                <Button onClick={() => deleteLinkImage(item._id)} variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                                <a href={safeUrl(item.link)} target="_blank" rel="noopener noreferrer">
                                    <Button>
                                        Visit Link
                                        <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </a>
                                <h3 className="[&_b]:text-red-500">
                                    Total Click <b>{item.totalclick}</b>
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AddLinkImage;
