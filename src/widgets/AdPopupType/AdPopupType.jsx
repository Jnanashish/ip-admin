import React, { useState } from "react";

import { Button } from "Components/ui/button";

import { updateData } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";

function AdPopupType() {
    const [adtype, setAdtype] = useState("none");

    const updateAdPopupType = async (type) => {
        setAdtype(type);
        const formData = new FormData();
        formData.append("adpoptype", type);
        await updateData(
            `${apiEndpoint.updateAdPopupType}/${process.env.REACT_APP_AD_POP_TYPE_ID}`,
            formData,
            `Ad type change to ${type}`
        );
    };

    return (
        <div className="flex justify-center items-center w-full h-[50vh] gap-2.5">
            <Button className="bg-green-600 hover:bg-green-700 text-white w-[10ch] capitalize" onClick={() => updateAdPopupType("ad")}>
                AD
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-[10ch] capitalize" onClick={() => updateAdPopupType("email")}>
                Email
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-[10ch] capitalize" onClick={() => updateAdPopupType("none")}>
                None
            </Button>
        </div>
    );
}

export default AdPopupType;
