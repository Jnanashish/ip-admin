import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";

import { Button } from "Components/ui/button";
import { Trash2, Send } from "lucide-react";

import { API } from "../../Backend";

const API_KEY = process.env.REACT_APP_API_KEY;

const AddBanner = () => {
    const [link, setLink] = useState("");

    const formData = new FormData();
    const handleimginp = (e) => {
        const file = e.target.files;
        formData.append("photo", file[0]);
    };

    const addData = async (e) => {
        e.preventDefault();
        formData.append("link", link);
        const res = await fetch(`${API}/sda/banner/add`, {
            method: "POST",
            headers: { "x-api-key": API_KEY },
            body: formData,
        });

        if (res.status === 201) {
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
            const res = await fetch(`${API}/sda/banner/get`, { method: "GET" });
            const data = await res.json();
            setData(data);
        } catch (error) {
            toast.error("An error Occured");
        }
    };

    const deleteData = (id) => {
        fetch(`${API}/sda/banner/delete/${id}`, {
            method: "DELETE",
            headers: { "x-api-key": API_KEY },
        })
            .then((res) => {
                toast("Data deleted Successfully");
                getData();
            })
            .catch((err) => {
                toast.error("Can not delete Data");
            });
    };

    return (
        <div className="admin">
            <h2 className="adminpanel-title">Ads with Banner</h2>
            <p className="text-center text-red-500 mb-1">* Add max 1 ad at one time</p>
            <div>
                <form>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Link to register : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={link} onChange={(e) => setLink(e.target.value)} type="text" placeholder="Link" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Ad Banner : </h3>
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
            <h2 className="adminpanel-title">Ad banner count : {data.length}</h2>
            {data.map((item) => {
                return (
                    <div key={item._id} className="p-5 w-[90%] mx-auto my-5 border border-foreground flex flex-row justify-between items-center">
                        <img className="w-[300px]" src={item.imagePath} alt="Ad-poster" />
                        <br />
                        <div className="flex flex-col gap-5">
                            <Button onClick={() => deleteData(item._id)} variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>

                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <Button>
                                    Visit Link
                                    <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                        <h2 className="[&_b]:text-red-500">
                            Total Click : <b>{item.totalclick}</b>
                        </h2>
                    </div>
                );
            })}
        </div>
    );
};

export default AddBanner;
