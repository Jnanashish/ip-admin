import React, { useEffect, useState } from "react";
import styles from "./companylist.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import Adminlinkcard from "../Joblisting/Components/Adminlinkcard/Adminlinkcard";
import Loader from "../../Components/Loader/index";
import { getCompanyList, deleteCompany } from "../../Apis/Company";

function CompanyListing() {
    const [comapnyData, setCompanyData] = useState(null);

    // fetch company details
    const fetchCompanyDetails = async () => {
        const data = await getCompanyList();
        setCompanyData(data);
    };

    // when delete button is clicked
    const handleCompanyDelete = async (item) => {
        const res = await deleteCompany(item?._id);
        // filter the company data with id
        if (!!res) {
            setCompanyData(comapnyData.filter((company) => company._id !== item._id));
        }
    };

    // move to company detail edit section with the company id as query param
    const handleCompanyUpdate = (item) => {
        window.location.href = `/addcompany?companyid=${item._id}`;
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
                                    <h3>{company?.companyName} : </h3>
                                    <img src={company?.smallLogo} />
                                    <img src={company?.largeLogo} />
                                </span>
                                <span>
                                    <Custombutton disableElevation label="Update" onClick={() => handleCompanyUpdate(company)} className={styles.btn} />
                                    <Custombutton style={{ backgroundColor: "red" }} onClick={() => handleCompanyDelete(company)} disableElevation label="Delete" className={styles.btn} />
                                </span>
                            </div>

                            <div className={styles.jobdetails}>
                                <p>Abount company : {company?.companyInfo !== "N" ? "Company info Present" : "Not present"}</p>
                                <p>Listed Job : {company?.listedJobs?.length}</p>
                                <br />
                                {!!company?.listedJobs &&
                                    company?.listedJobs?.map((item, index) => {
                                        return <Adminlinkcard item={item} isPreview={true} />;
                                    })}
                            </div>
                        </div>
                    );
                })}
            {!comapnyData && <Loader />}
        </div>
    );
}

export default CompanyListing;
