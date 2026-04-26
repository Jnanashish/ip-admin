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
import CompanyFilterSelect from "./CompanyFilterSelect";

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "paused", label: "Paused" },
    { value: "expired", label: "Expired" },
    { value: "archived", label: "Archived" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
    { value: "all", label: "All types" },
    { value: "FULL_TIME", label: "Full-time" },
    { value: "INTERN", label: "Internship" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACTOR", label: "Contract" },
    { value: "TEMPORARY", label: "Temporary" },
];

const BATCH_OPTIONS = [
    { value: "all", label: "All batches" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
];

const JobsFilters = ({ filters, onChange, onClear, hasActiveFilter }) => {
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
                    placeholder="Search jobs"
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
                value={filters.employmentType || "all"}
                onValueChange={(v) => onChange({ employmentType: v })}
            >
                <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.batch || "all"}
                onValueChange={(v) => onChange({ batch: v })}
            >
                <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {BATCH_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <CompanyFilterSelect
                value={filters.companyId || "all"}
                onChange={(v) => onChange({ companyId: v })}
            />

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

export default JobsFilters;
