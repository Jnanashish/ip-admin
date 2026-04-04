import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";

import { API } from "../../Backend";

const API_KEY = process.env.REACT_APP_API_KEY;

const AddLink = () => {
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");
    const [para, setPara] = useState("");

    const formData = new FormData();
    const addData = async (e) => {
        e.preventDefault();

        formData.append("link", link);
        formData.append("title", title);
        formData.append("para", para);
        const res = await fetch(`${API}/sda/link/add`, {
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
            const res = await fetch(`${API}/sda/link/get`, { method: "GET" });
            const data = await res.json();
            setData(data);
        } catch (error) {
        }
    };

    const deleteData = (id) => {
        fetch(`${API}/sda/link/delete/${id}`, {
            method: "DELETE",
            headers: { "x-api-key": API_KEY },
        })
            .then((res) => { toast("Deleted Successfully"); getData(); })
            .catch((err) => {
                toast.error("An error Occured");
            });
    };

    return (
        <div className="admin">
            <h2 className="adminpanel-title">Ad (Link Only)</h2>
            <div>
                <form>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Link : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={link} onChange={(e) => setLink(e.target.value)} type="text" placeholder="Link" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Title for ad : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Title" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <h3 className="justify-self-end text-base mt-2 text-foreground">Paragraph(If any) : </h3>
                        <input className="p-3 text-base w-[85%] mx-4 mb-[18px] rounded border-none max-lg:mx-0 max-lg:w-full" value={para} onChange={(e) => setPara(e.target.value)} type="text" placeholder="Paragraph" />
                    </div>
                    <div className="grid grid-cols-[25%_75%] max-lg:flex max-lg:flex-col max-lg:mx-5">
                        <div className="justify-self-end text-base mt-2 text-foreground"></div>
                        <button className="bg-header-blue border-none text-white w-[41%] my-2.5 mx-5 p-3 text-xl rounded hover:bg-header-blue cursor-pointer max-lg:mx-0" type="button" onClick={addData}>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            <hr />
            <br />
            <div className="update-data-container">
                <h3 className="adminpanel-title">Total Ads with Links count : {data.length}</h3>
                {data.map((item) => {
                    return (
                        <div key={item._id} className="bg-white p-4 w-4/5 mx-auto my-5 max-lg:w-full [&_h2]:text-xl [&_h2]:mb-2.5">
                            <h2>{item.title}</h2>
                            <h4>Total Click : {item.totalclick}</h4>

                            <button onClick={() => deleteData(item._id)} className="p-2 w-[100px] text-lg rounded bg-[#5050ff] cursor-pointer border-none my-4 mx-2.5 text-white hover:bg-red-500 hover:text-black">
                                Delete
                            </button>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <button className="p-2 w-[100px] text-lg rounded bg-[#5050ff] cursor-pointer border-none my-4 mx-2.5 text-white hover:bg-red-500 hover:text-black">Visit Link</button>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AddLink;
