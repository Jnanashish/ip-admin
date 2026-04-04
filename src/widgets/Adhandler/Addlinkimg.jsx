import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";

import { API } from "../../Backend";
import { Button } from "Components/ui/button";
import { Trash2, Send } from "lucide-react";
import { safeUrl } from "../../Helpers/sanitize";

const API_KEY = process.env.REACT_APP_API_KEY;

const AddLinkImg = () => {
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");
    const [para, setPara] = useState("");

    const formData = new FormData();
    const handleimginp = (e) => {
        const file = e.target.files;
        formData.append("photo", file[0]);
    };
    const addData = async (e) => {
        e.preventDefault();
        formData.append("link", link);
        formData.append("title", title);
        formData.append("para", para);

        const res = await fetch(`${API}/sda/linkimg/add`, {
            method: "POST",
            headers: { "x-api-key": API_KEY },
            body: formData,
        });
        if (res.status === 201) {
            getData();
            toast("Data Added Successfully");
        } else {
            toast.error("An error Occured");
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const [data, setData] = useState([]);
    const getData = async () => {
        try {
            const res = await fetch(`${API}/sda/linkimg/get`, { method: "GET" });
            const data = await res.json();
            setData(data);
        } catch (error) {
            toast.error("An error Occured");
        }
    };

    const deleteData = (id) => {
        fetch(`${API}/sda/linkimg/delete/${id}`, {
            method: "DELETE",
            headers: { "x-api-key": API_KEY },
        })
            .then((res) => {
                getData();
                toast("Data Deleted Successfully");
            })
            .catch((err) => {
                toast.error("An error Occured");
            });
    };

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
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" onChange={handleimginp} name="image" type="file" />
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
                                <img className="w-[300px]" src={item.imagePath} alt="" />
                                <br />

                                <Button onClick={() => deleteData(item._id)} variant="destructive">
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

export default AddLinkImg;
