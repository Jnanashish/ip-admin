import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";

import CompanyDetails from "../widgets/CompanyDetails/CompanyDetails";

function AddCompanydetails() {
    const context = useContext(UserContext);

    // if user is not logedin redirect to homepage
    if (!context.user?.email) {
        return <Navigate to="/" />;
    }

    return (
        <>
            <CompanyDetails />
        </>
    );
}

export default AddCompanydetails;
