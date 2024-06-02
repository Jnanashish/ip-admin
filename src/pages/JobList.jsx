import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";

import JobListing from "../widgets/Joblisting";

function JobList() {
    const context = useContext(UserContext);

    // if user is not logedin redirect to homepage
    if (!context.user?.email) {
        return <Navigate to="/" />;
    }

    return (
        <>
            <JobListing />
        </>
    );
}

export default JobList;