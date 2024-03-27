import React, { useEffect, useState } from "react";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { deleteData, get } from "../../Helpers/request";
import styles from "./companylist.module.scss";

import Custombutton from "../../Components/Button/Custombutton";

function CompanyList() {
    const [comapnyData, setCompanyData] = useState(null);

    const fetchCompanyDetails = async () => {
        const data = await get(`${apiEndpoint.get_company_details}`);
        setCompanyData(data);
    };

    const handleCompanyDelete = async (item) => {
        const res = await deleteData(`${apiEndpoint.delete_company_details}/${item._id}`);
        setCompanyData("res", res);
    };

    const handleCompanyUpdate = (item) => {
        window.location.href = `/addcompanydetails?companyid=${item._id}`;
    }

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
                                    <Custombutton disableElevation label="Update" onClick={()=>handleCompanyUpdate(company)} className={styles.btn} />
                                    <Custombutton style={{ backgroundColor: "red" }} onClick={()=>handleCompanyDelete(company)} disableElevation label="Delete" className={styles.btn} />
                                </span>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default CompanyList;
