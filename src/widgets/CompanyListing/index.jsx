import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./companylist.module.scss";

import Custombutton from "../../Components/Button/Custombutton";
import Adminlinkcard from "../Joblisting/Components/Adminlinkcard/Adminlinkcard";
import Loader from "../../Components/Loader/index";
import { getCompanyList, deleteCompany } from "../../Apis/Company";

function CompanyListing() {
    const [companyData, setCompanyData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const filteredCompanies = useMemo(() => {
        if (!companyData) return null;
        
        if (!searchTerm.trim()) return companyData;
        
        return companyData.filter(company => 
            company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [companyData, searchTerm]);

    const fetchCompanyDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCompanyList();
            setCompanyData(data);
        } catch (err) {
            console.error("Failed to fetch company data:", err);
            setError("Failed to load company data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCompanyDelete = useCallback(async (item) => {
        try {
            const res = await deleteCompany(item?._id);
            if (res) {
                setCompanyData(prevData => 
                    prevData.filter(company => company._id !== item._id)
                );
            }
        } catch (err) {
            console.error("Failed to delete company:", err);
            alert("Failed to delete company. Please try again.");
        }
    }, []);

    const handleCompanyUpdate = useCallback((item) => {
        window.location.href = `/addcompany?companyid=${item._id}`;
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        fetchCompanyDetails();
    }, [fetchCompanyDetails]);

    const renderCompanyCard = useCallback((company, index) => (
        <div className={styles.cardcontainer} key={company._id || index}>
            <div className={styles.companycard}>
                <span>
                    <h3>{company?.companyName} : </h3>
                    {company?.smallLogo && <img src={company.smallLogo} alt="Small logo" />}
                    {company?.largeLogo && <img src={company.largeLogo} alt="Large logo" />}
                </span>
                <span>
                    <Custombutton 
                        disableElevation 
                        label="Update" 
                        onClick={() => handleCompanyUpdate(company)} 
                        className={styles.btn} 
                    />
                    <Custombutton 
                        style={{ backgroundColor: "red" }} 
                        onClick={() => handleCompanyDelete(company)} 
                        disableElevation 
                        label="Delete" 
                        className={styles.btn} 
                    />
                </span>
            </div>

            <div className={styles.jobdetails}>
                <p>About company : {company?.companyInfo !== "N" ? "Company info Present" : "Not present"}</p>
                <p>Listed Job : {company?.listedJobs?.length || 0}</p>
                <br />
                {company?.listedJobs?.length > 0 && company.listedJobs.map((item, idx) => (
                    <Adminlinkcard key={item._id || idx} item={item} isPreview={true} />
                ))}
            </div>
        </div>
    ), [handleCompanyDelete, handleCompanyUpdate]);

    return (
        <div className={styles.companylist}>
            <div className={styles.header}>
                <h2>List of available companies : {filteredCompanies?.length || 0}</h2>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search company by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                        aria-label="Search companies"
                    />
                </div>
            </div>
            
            {isLoading && <Loader />}
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            {!isLoading && !error && (
                <>
                    {filteredCompanies?.length > 0 ? (
                        filteredCompanies.map(renderCompanyCard)
                    ) : (
                        <div className={styles.noResults}>
                            {searchTerm ? "No companies found matching your search." : "No companies available."}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CompanyListing;
