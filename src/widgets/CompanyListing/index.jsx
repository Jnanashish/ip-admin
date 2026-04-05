import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import { Card, CardContent } from "Components/ui/card";
import { Badge } from "Components/ui/badge";
import Adminlinkcard from "../Joblisting/Components/Adminlinkcard/Adminlinkcard";
import Loader from "../../Components/Loader/index";
import { getCompanyList, deleteCompany } from "../../Apis/Company";
import { showErrorToast } from "../../Helpers/toast";
import { Search, Pencil, Trash2 } from "lucide-react";

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
            <Card className="mb-4 transition-all duration-200 hover:shadow-md" key={company._id || index}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            {company?.smallLogo && (
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-muted">
                                    <img src={company.smallLogo} alt="Logo" className="h-10 w-10 object-contain rounded" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-base">{company?.companyName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary">
                                        {company?.listedJobs?.length || 0} jobs
                                    </Badge>
                                    {company?.companyInfo !== "N" && (
                                        <Badge variant="outline">Info present</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCompanyUpdate(company)}>
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Update
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleCompanyDelete(company)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {company?.largeLogo && (
                        <img src={company.largeLogo} alt="Large logo" className="h-12 object-contain rounded mb-4" />
                    )}

                    {company?.listedJobs?.length > 0 && (
                        <div className="border-t pt-4 space-y-2">
                            <p className="text-sm text-muted-foreground font-medium">Listed Jobs:</p>
                            {company.listedJobs.map((item, idx) => (
                                <Adminlinkcard key={item._id || idx} item={item} isPreview={true} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        ),
        [handleCompanyDelete, handleCompanyUpdate]
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Company List</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredCompanies?.length || 0} companies available
                    </p>
                </div>
                <div className="relative w-[300px] max-w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search company by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-9"
                        aria-label="Search companies"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center h-[60vh] w-full">
                    <Loader />
                </div>
            )}

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6 text-center text-destructive">{error}</CardContent>
                </Card>
            )}

            {!isLoading && !error && (
                <>
                    {filteredCompanies?.length > 0 ? (
                        filteredCompanies.map(renderCompanyCard)
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                {searchTerm ? "No companies found matching your search." : "No companies available."}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default CompanyListing;
