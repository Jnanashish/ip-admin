import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "Components/ui/button";
import { Card, CardContent } from "Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "Components/ui/select";

import { listJobsV2 } from "api/v2/jobs";
import { showErrorToast } from "Helpers/toast";

import JobsFilters from "./components/JobsFilters";
import JobsTable from "./components/JobsTable";

const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

const FILTER_KEYS = [
    "search",
    "status",
    "employmentType",
    "batch",
    "companyId",
];

const readFilters = (params) => ({
    search: params.get("search") || "",
    status: params.get("status") || "all",
    employmentType: params.get("employmentType") || "all",
    batch: params.get("batch") || "all",
    companyId: params.get("companyId") || "all",
    page: Math.max(1, parseInt(params.get("page") || "1", 10) || 1),
    limit: (() => {
        const raw = parseInt(params.get("limit") || "", 10);
        return PAGE_SIZE_OPTIONS.includes(raw) ? raw : DEFAULT_PAGE_SIZE;
    })(),
});

const buildApiQuery = (filters) => {
    const q = { page: filters.page, limit: filters.limit };
    if (filters.search) q.search = filters.search;
    if (filters.status && filters.status !== "all") q.status = filters.status;
    if (filters.employmentType && filters.employmentType !== "all")
        q.employmentType = filters.employmentType;
    if (filters.batch && filters.batch !== "all") q.batch = filters.batch;
    if (filters.companyId && filters.companyId !== "all")
        q.companyId = filters.companyId;
    return q;
};

const parseJobsResponse = (data) => {
    if (Array.isArray(data)) {
        return { jobs: data, total: data.length, pages: null };
    }
    if (!data || typeof data !== "object") {
        return { jobs: [], total: 0, pages: null };
    }
    const jobs = Array.isArray(data.jobs)
        ? data.jobs
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.data)
            ? data.data
            : [];
    const total =
        typeof data.total === "number"
            ? data.total
            : typeof data.totalCount === "number"
              ? data.totalCount
              : jobs.length;
    const pages = typeof data.pages === "number" ? data.pages : null;
    return { jobs, total, pages };
};

const JobsListV2 = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = useMemo(() => readFilters(searchParams), [searchParams]);

    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ total: 0, pages: null });
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        listJobsV2(buildApiQuery(filters)).then((res) => {
            if (cancelled) return;
            if (res.status === 200) {
                const parsed = parseJobsResponse(res.data);
                setJobs(parsed.jobs);
                setMeta({ total: parsed.total, pages: parsed.pages });
            } else {
                setJobs([]);
                setMeta({ total: 0, pages: null });
                showErrorToast(res.error?.message || "Failed to load jobs");
            }
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [filters, reloadKey]);

    const updateParams = useCallback(
        (patch, options = {}) => {
            const next = new URLSearchParams(searchParams);
            const filterChanged = Object.keys(patch).some((k) =>
                FILTER_KEYS.includes(k)
            );
            Object.entries(patch).forEach(([key, value]) => {
                if (
                    value === undefined ||
                    value === null ||
                    value === "" ||
                    value === "all" ||
                    (key === "page" && value === 1) ||
                    (key === "limit" && value === DEFAULT_PAGE_SIZE)
                ) {
                    next.delete(key);
                } else {
                    next.set(key, String(value));
                }
            });
            if (filterChanged && !("page" in patch)) {
                next.delete("page");
            }
            setSearchParams(next, { replace: !!options.replace });
        },
        [searchParams, setSearchParams]
    );

    const handleFilterChange = useCallback(
        (patch) => updateParams(patch, { replace: true }),
        [updateParams]
    );

    const handleClearFilters = useCallback(() => {
        const next = new URLSearchParams();
        if (filters.limit !== DEFAULT_PAGE_SIZE) {
            next.set("limit", String(filters.limit));
        }
        setSearchParams(next, { replace: true });
    }, [filters.limit, setSearchParams]);

    const totalPages = useMemo(() => {
        if (typeof meta.pages === "number" && meta.pages > 0) return meta.pages;
        if (meta.total <= 0) return 1;
        return Math.max(1, Math.ceil(meta.total / filters.limit));
    }, [meta.pages, meta.total, filters.limit]);

    const hasActiveFilter =
        !!filters.search ||
        filters.status !== "all" ||
        filters.employmentType !== "all" ||
        filters.batch !== "all" ||
        filters.companyId !== "all";

    const showEmpty = !loading && jobs.length === 0;

    return (
        <div className="px-4 lg:px-6 pt-6 pb-10 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
                <Button asChild>
                    <Link to="/admin/jobs/new">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Create new job
                    </Link>
                </Button>
            </div>

            <JobsFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
                hasActiveFilter={hasActiveFilter}
            />

            {showEmpty ? (
                <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                        <p className="text-sm text-muted-foreground">
                            No jobs match your filters
                        </p>
                        {hasActiveFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                            >
                                Clear filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <JobsTable
                    jobs={jobs}
                    loading={loading}
                    onChanged={() => setReloadKey((k) => k + 1)}
                />
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                        value={String(filters.limit)}
                        onValueChange={(v) =>
                            updateParams({ limit: parseInt(v, 10), page: 1 })
                        }
                    >
                        <SelectTrigger className="w-20 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        Page {filters.page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={filters.page <= 1 || loading}
                            onClick={() =>
                                updateParams({ page: filters.page - 1 })
                            }
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={filters.page >= totalPages || loading}
                            onClick={() =>
                                updateParams({ page: filters.page + 1 })
                            }
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsListV2;
