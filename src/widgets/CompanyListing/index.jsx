import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Custombutton from "../../Components/Button/Custombutton";
import Adminlinkcard from "../Joblisting/Components/Adminlinkcard/Adminlinkcard";
import Loader from "../../Components/Loader/index";
import { getCompanyList, deleteCompany } from "../../Apis/Company";
import { showErrorToast } from "../../Helpers/toast";

function CompanyListing() {
    const navigate = useNavigate();
    const [companyData, setCompanyData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const filteredCompanies = useMemo(() => {
        if (!companyData) return null;

        if (!searchTerm.trim()) return companyData;

        return companyData.filter((company) => company.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
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
                setCompanyData((prevData) => prevData.filter((company) => company._id !== item._id));
            }
        } catch (err) {
            console.error("Failed to delete company:", err);
            showErrorToast("Failed to delete company. Please try again.");
        }
    }, []);

    const handleCompanyUpdate = useCallback((item) => {
        navigate(`/addcompany?companyid=${encodeURIComponent(item._id)}`);
    }, [navigate]);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        fetchCompanyDetails();
    }, [fetchCompanyDetails]);

    const renderCompanyCard = useCallback(
        (company, index) => (
            <div className="border border-foreground mt-5 px-10 py-5 rounded-md transition-shadow hover:shadow-md max-md:px-4" key={company._id || index}>
                <div className="bg-background mb-5 flex items-center justify-between gap-8 p-4 rounded max-md:flex-col max-md:items-start [&_h2]:text-xl [&_h2]:font-semibold [&_img]:h-[50px] [&_img]:object-contain [&_img]:rounded [&_button]:capitalize">
                    <span>
                        <h3>{company?.companyName} : </h3>
                        {company?.smallLogo && <img src={company.smallLogo} alt="Small logo" />}
                        {company?.largeLogo && <img src={company.largeLogo} alt="Large logo" />}
                    </span>
                    <span>
                        <Custombutton disableElevation label="Update" onClick={() => handleCompanyUpdate(company)} />
                        <Custombutton style={{ backgroundColor: "red" }} onClick={() => handleCompanyDelete(company)} disableElevation label="Delete" />
                    </span>
                </div>

                <div className="border-t border-text-secondary pt-2.5 [&_p]:mt-3 [&_p]:text-sm">
                    <p>About company : {company?.companyInfo !== "N" ? "Company info Present" : "Not present"}</p>
                    <p>Listed Job : {company?.listedJobs?.length || 0}</p>
                    <br />
                    {company?.listedJobs?.length > 0 && company.listedJobs.map((item, idx) => <Adminlinkcard key={item._id || idx} item={item} isPreview={true} />)}
                </div>
            </div>
        ),
        [handleCompanyDelete, handleCompanyUpdate]
    );

    return (
        <div className="px-10 py-5 max-md:px-4">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-4 max-md:flex-col max-md:items-start">
                <h2>List of available companies : {filteredCompanies?.length || 0}</h2>
                <div className="w-[300px] max-w-full relative max-md:w-full">
                    <input
                        type="text"
                        placeholder="Search company by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        aria-label="Search companies"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center h-[60vh] w-full">
                    <Loader />
                </div>
            )}

            {error && <div className="text-center p-10 text-base rounded mt-5 text-red-800 bg-red-100 border border-red-300">{error}</div>}

            {!isLoading && !error && (
                <>
                    {filteredCompanies?.length > 0 ? (
                        filteredCompanies.map(renderCompanyCard)
                    ) : (
                        <div className="text-center p-10 text-base rounded mt-5 text-gray-500 bg-[#f9f9f9]">
                            {searchTerm ? "No companies found matching your search." : "No companies available."}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CompanyListing;
