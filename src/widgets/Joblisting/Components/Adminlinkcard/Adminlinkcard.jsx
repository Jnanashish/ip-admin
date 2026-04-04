import React, { useState, useContext } from "react";
import { Trash2 } from "lucide-react";

import EditData from "../Editdata/Editdata";

import { UserContext } from "../../../../Context/userContext";
import Custombutton from "../../../../Components/Button/Custombutton";
import { deleteData } from "../../../../Helpers/request";
import { apiEndpoint } from "../../../../Helpers/apiEndpoints";
import { generateDateFromISOString } from "../../../../Helpers/utility";
const LinkCard = ({ item, isPreview = false }) => {
    const [selectedJobId, setSelectedJobId] = useState("");
    const [deletedId, setDeletedId] = useState("");

    const { user } = useContext(UserContext);
    const isUserLoggedIn = !!user?.email;

    const handleUpdateClick = (id) => {
        setSelectedJobId((prevId) => (prevId !== "" ? "" : id));
    };

    const handleUpdateRedirectionClick = (id) => {
        window.location.href = `/addjob?jobid=${id}`;
    };

    // when delete button is clicked delete a particular job
    const deleteJobData = (id) => {
        if (id === item._id) {
            deleteData(`${apiEndpoint.deleteJob}/${id}`, "Job");
            setDeletedId(id);
        }
    };

    if (deletedId === item._id) {
        return null;
    }

    return (
        <div>
            <div
                className="flex flex-row items-center bg-white px-5 py-2.5 min-h-[90px] max-w-full mb-5 border border-text-secondary rounded-md font-ibm"
                style={{ opacity: item?.isActive ? "100%" : "40%" }}
            >
                {!isPreview && (
                    <img
                        className="h-[50px] w-[50px] mr-5 max-lg:h-10 max-lg:w-10 object-contain"
                        src={item.imagePath}
                        alt={`${item.title} logo`}
                    />
                )}
                <div className="flex flex-row justify-between items-center w-full">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <h2>{item.title}</h2>
                        <div className="flex flex-row items-center text-foreground mb-1">
                            <h5>Created At : </h5>
                            <h5>{generateDateFromISOString(item.createdAt)}</h5>
                        </div>

                        {item.lastdate !== "2022-11-00-" && !isPreview && (
                            <div className="flex flex-row items-center text-foreground mb-1">
                                <h5>Last date : </h5>
                                <h5 style={{ color: "red" }}>
                                    <b> {item.lastdate}</b>
                                </h5>
                            </div>
                        )}

                        <div className="flex flex-row items-center text-foreground mb-1">
                            <h5>Total Click : </h5>
                            <h5 className="text-red-500 mr-8">
                                <b>{item.totalclick}</b>
                            </h5>
                        </div>
                        {!!item?.jobId && (
                            <div className="flex flex-row items-center text-foreground mb-1">
                                <h5>Job Id : </h5>
                                <h5>{item?.jobId}</h5>
                            </div>
                        )}
                    </a>

                    {/* button section */}
                    <div className="flex flex-col justify-evenly items-start">
                        {!isPreview && (
                            <Custombutton
                                startIcon={<Trash2 size={16} />}
                                disableElevation
                                size="small"
                                onClick={() => deleteJobData(item._id)}
                                style={{ backgroundColor: "red" }}
                                label="Delete"
                                disabled={!isUserLoggedIn}
                            />
                        )}

                        <div className="flex flex-row gap-2.5 mt-2.5">
                            <Custombutton disabled={!isUserLoggedIn} disableElevation size="small" onClick={() => handleUpdateClick(item._id)} label="Update" />
                            <Custombutton disabled={!isUserLoggedIn} disableElevation size="small" onClick={() => handleUpdateRedirectionClick(item._id)} label="Update New" />
                        </div>
                    </div>
                </div>
            </div>
            {selectedJobId === item._id && <EditData data={item} setSeletedJobId={setSelectedJobId} />}
        </div>
    );
};

export default LinkCard;
