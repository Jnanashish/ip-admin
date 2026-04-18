import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import EditData from "../EditData/EditData";

import { UserContext } from "../../../../Context/userContext";
import CustomButton from "../../../../Components/Button/CustomButton";
import { deleteData } from "../../../../Helpers/request";
import { apiEndpoint } from "../../../../Helpers/apiEndpoints";
import { generateDateFromISOString } from "../../../../Helpers/utility";
import { safeUrl } from "../../../../Helpers/sanitize";
import { cn } from "lib/utils";
const LinkCard = ({ item, isPreview = false }) => {
    const navigate = useNavigate();
    const [selectedJobId, setSelectedJobId] = useState("");
    const [deletedId, setDeletedId] = useState("");

    const { user } = useContext(UserContext);
    const isUserLoggedIn = !!user?.email;

    const handleUpdateClick = (id) => {
        setSelectedJobId((prevId) => (prevId !== "" ? "" : id));
    };

    const handleUpdateRedirectionClick = (id) => {
        navigate(`/addjob?jobid=${encodeURIComponent(id)}`);
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
                className={cn(
                    "flex flex-row items-center bg-card text-card-foreground px-5 py-3 min-h-[90px] max-w-full mb-3 border rounded-lg font-ibm transition-all duration-200 hover:shadow-md hover:border-primary/20 border-l-2",
                    item?.isActive ? "border-l-primary" : "border-l-muted opacity-40"
                )}
            >
                {!isPreview && (
                    <img
                        className="h-[50px] w-[50px] mr-5 max-lg:h-10 max-lg:w-10 object-contain rounded-md bg-muted/50 p-1"
                        src={item.imagePath}
                        alt={`${item.title} logo`}
                    />
                )}
                <div className="flex flex-row justify-between items-center w-full">
                    <a href={safeUrl(item.link)} target="_blank" rel="noopener noreferrer">
                        <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                        <div className="flex flex-row items-center mb-1">
                            <span className="text-sm text-muted-foreground">Created At :&nbsp;</span>
                            <span className="text-sm text-muted-foreground">{generateDateFromISOString(item.createdAt)}</span>
                        </div>

                        {item.lastdate !== "2022-11-00-" && !isPreview && (
                            <div className="flex flex-row items-center mb-1">
                                <span className="text-sm text-muted-foreground">Last date :&nbsp;</span>
                                <span className="text-sm font-semibold text-destructive">{item.lastdate}</span>
                            </div>
                        )}

                        <div className="flex flex-row items-center mb-1">
                            <span className="text-sm text-muted-foreground">Total Click :&nbsp;</span>
                            <span className="text-sm font-semibold text-destructive mr-8">{item.totalclick}</span>
                        </div>
                        {!!item?.jobId && (
                            <div className="flex flex-row items-center mb-1">
                                <span className="text-sm text-muted-foreground">Job Id :&nbsp;</span>
                                <span className="text-sm text-muted-foreground">{item?.jobId}</span>
                            </div>
                        )}
                    </a>

                    {/* button section */}
                    <div className="flex flex-col justify-evenly items-start">
                        {!isPreview && (
                            <CustomButton
                                startIcon={<Trash2 size={16} />}
                                disableElevation
                                size="small"
                                onClick={() => deleteJobData(item._id)}
                                variant="destructive"
                                label="Delete"
                                disabled={!isUserLoggedIn}
                            />
                        )}

                        <div className="flex flex-row gap-2.5 mt-2.5">
                            <CustomButton disabled={!isUserLoggedIn} disableElevation size="small" onClick={() => handleUpdateClick(item._id)} label="Update" />
                            <CustomButton disabled={!isUserLoggedIn} disableElevation size="small" onClick={() => handleUpdateRedirectionClick(item._id)} label="Update New" />
                        </div>
                    </div>
                </div>
            </div>
            {selectedJobId === item._id && <EditData data={item} setSeletedJobId={setSelectedJobId} />}
        </div>
    );
};

export default LinkCard;
