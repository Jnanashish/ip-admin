import React, { useEffect, useState } from "react";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { deleteData, get } from "../../Helpers/request";
import styles from "./companylist.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import { CircularProgress } from "@mui/material";

function CompanyList() {
    const [comapnyData, setCompanyData] = useState(null);

    // fetch company details
    const fetchCompanyDetails = async () => {
        const data = await get(`${apiEndpoint.get_company_details}`);
        setCompanyData(data);
    };

    // when delete button is clicked
    const handleCompanyDelete = async (item) => {
        const res = await deleteData(`${apiEndpoint.delete_company_details}/${item._id}`);
        // filter the company data with id
        if (!!res) {
            setCompanyData(comapnyData.filter((company) => company._id !== item._id));
        }
    };

    // move to company detail edit section with the company id as query param
    const handleCompanyUpdate = (item) => {
        window.location.href = `/addcompanydetails?companyid=${item._id}`;
    };

    useEffect(() => {
        fetchCompanyDetails();
    }, []);

    return (
        <div className={styles.companylist}>
            {!!comapnyData &&
                comapnyData.map((company) => {
                    return (
                        <div>
                            <div className={styles.companycard}>
                                <span>
                                    <h2>{company.companyName} : </h2>
                                    <img src={company.smallLogo} />
                                    <img src={company.largeLogo} />
                                </span>
                                <span>
                                    <Custombutton disableElevation label="Update" onClick={() => handleCompanyUpdate(company)} className={styles.btn} />
                                    <Custombutton style={{ backgroundColor: "red" }} onClick={() => handleCompanyDelete(company)} disableElevation label="Delete" className={styles.btn} />
                                </span>
                            </div>
                        </div>
                    );
                })}
            {!comapnyData && (
                <div className={styles.companylist_loader}>
                    <CircularProgress size={80} />
                </div>
            )}
        </div>
    );
}

export default CompanyList;
