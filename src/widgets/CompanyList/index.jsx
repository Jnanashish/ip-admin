import React, { useEffect, useState } from "react";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { deleteData, get } from "../../Helpers/request";
import styles from "./companylist.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import { CircularProgress } from "@mui/material";
import Adminlinkcard from "../Joblisting/Components/Adminlinkcard/Adminlinkcard";

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
            <h2>List of available companies : {comapnyData?.length}</h2>
            {!!comapnyData &&
                comapnyData.map((company) => {
                    return (
                        <div className={styles.cardcontainer}>
                            <div className={styles.companycard}>
                                <span>
                                    <h3>{company.companyName} : </h3>
                                    <img src={company.smallLogo} />
                                    <img src={company.largeLogo} />
                                </span>
                                <span>
                                    <Custombutton disableElevation label="Update" onClick={() => handleCompanyUpdate(company)} className={styles.btn} />
                                    <Custombutton style={{ backgroundColor: "red" }} onClick={() => handleCompanyDelete(company)} disableElevation label="Delete" className={styles.btn} />
                                </span>
                            </div>
                            <div className={styles.jobdetails}>
                                {company?.companyInfo && <p>Abount company : {company?.companyInfo}</p>}
                                <p>Listed Job : {company?.listedJobs?.length}</p>
                                <br/>
                                {
                                    !!company?.listedJobs && company?.listedJobs?.map((item, index) => {
                                        return (
                                            <Adminlinkcard item={item} isPreview={true}/>
                                        )
                                    })
                                }
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
