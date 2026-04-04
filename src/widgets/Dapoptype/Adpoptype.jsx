import React, { useState } from "react";
import { API } from "../../Backend";

import { Button } from "Components/ui/button";

import { toast } from "react-toastify";

const API_KEY = process.env.REACT_APP_API_KEY;

function Adpoptype() {
    const [adtype, setAdtype] = useState("none");
    const AddadShowPop = async (e) => {
        setAdtype(e);
        const formData = new FormData();
        formData.append("adpoptype", e);
        const res = await fetch(`${API}/showadpop/update/${process.env.REACT_APP_AD_POP_TYPE_ID}`, {
            method: "PUT",
            headers: { "x-api-key": API_KEY },
            body: formData,
        });
        if (res.status === 200) {
            toast(`Ad type changed to ${e}`);
        } else {
            toast.error("An error Occured");
        }
    };

    return (
        <div className="flex justify-center items-center w-full h-[50vh] gap-2.5">
            <Button className="bg-green-600 hover:bg-green-700 text-white w-[10ch] capitalize" onClick={() => AddadShowPop("ad")}>
                AD
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-[10ch] capitalize" onClick={() => AddadShowPop("email")}>
                Email
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-[10ch] capitalize" onClick={() => AddadShowPop("none")}>
                None
            </Button>
        </div>
    );
}

export default Adpoptype;
