import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "Components/ui/select";
import {
    COMPANY_STATUSES,
    INDUSTRIES,
    COMPANY_TYPES,
} from "validators/v2/companyFormSchema";

const titleCase = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    ...COMPANY_STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
];

const INDUSTRY_OPTIONS = [
    { value: "all", label: "All industries" },
    ...INDUSTRIES.map((i) => ({ value: i, label: i })),
];

const COMPANY_TYPE_OPTIONS = [
    { value: "all", label: "All types" },
    ...COMPANY_TYPES.map((t) => ({ value: t, label: titleCase(t) })),
];

const CompaniesFilters = ({ filters, onChange, onClear, hasActiveFilter }) => {
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const lastEmittedRef = useRef(filters.search || "");

    useEffect(() => {
        if (filters.search !== lastEmittedRef.current) {
            setSearchInput(filters.search || "");
            lastEmittedRef.current = filters.search || "";
        }
    }, [filters.search]);

    useEffect(() => {
        if (searchInput === lastEmittedRef.current) return;
        const timer = setTimeout(() => {
            lastEmittedRef.current = searchInput;
            onChange({ search: searchInput });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput, onChange]);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search companies"
                    className="pl-9"
                />
            </div>

            <Select
                value={filters.status || "all"}
                onValueChange={(v) => onChange({ status: v })}
            >
                <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.industry || "all"}
                onValueChange={(v) => onChange({ industry: v })}
            >
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.companyType || "all"}
                onValueChange={(v) => onChange({ companyType: v })}
            >
                <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {COMPANY_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilter && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4 mr-1.5" />
                    Clear filters
                </Button>
            )}
        </div>
    );
};

export default CompaniesFilters;
