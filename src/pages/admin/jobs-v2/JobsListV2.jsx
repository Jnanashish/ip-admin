import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Camera,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Plus,
    X,
} from "lucide-react";

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
import { fetchCompanyV2 } from "api/v2/companies";
import { showErrorToast } from "Helpers/toast";
import { generateWhatsAppMessage } from "Helpers/JobListHelper";
import { cn } from "lib/utils";

import JobsFilters from "./components/JobsFilters";
import JobsTable from "./components/JobsTable";
import CaptionGeneratorSheet from "./components/CaptionGeneratorSheet";

const getJobId = (job) => job?._id ?? job?.id ?? "";

const SELECTED_JOBS_STORAGE_KEY = "selectedBannerJobs";

const readSelectedJobsFromStorage = () => {
    try {
        const raw = sessionStorage.getItem(SELECTED_JOBS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

const SCOPE_TABS = [
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "all", label: "All" },
];
const SCOPE_VALUES = SCOPE_TABS.map((t) => t.value);

const FILTER_KEYS = [
    "search",
    "scope",
    "employmentType",
    "batch",
    "companyId",
];

const readFilters = (params) => ({
    search: params.get("search") || "",
    scope: SCOPE_VALUES.includes(params.get("scope"))
        ? params.get("scope")
        : "active",
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
    // Tab scope → backend filter. Active hides archived (relies on backend
    // ?excludeArchived); Archived shows only archived; All sends neither.
    if (filters.scope === "archived") q.status = "archived";
    else if (filters.scope !== "all") q.excludeArchived = "true";
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
    const pages =
        typeof data.pages === "number"
            ? data.pages
            : typeof data.totalPages === "number"
              ? data.totalPages
              : null;
    return { jobs, total, pages };
};

const JobsListV2 = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = useMemo(() => readFilters(searchParams), [searchParams]);

    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ total: 0, pages: null });
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedJobs, setSelectedJobs] = useState(readSelectedJobsFromStorage);
    const [companyMap, setCompanyMap] = useState({});
    const companyMapRef = useRef(companyMap);
    useEffect(() => {
        companyMapRef.current = companyMap;
    }, [companyMap]);
    const [captionSheetOpen, setCaptionSheetOpen] = useState(false);

    useEffect(() => {
        if (!jobs.length) return;
        const ids = new Set();
        jobs.forEach((j) => {
            const id =
                typeof j?.company === "object"
                    ? j.company?._id || j.company?.id
                    : j?.company;
            if (id) ids.add(id);
        });
        const missing = [...ids].filter((id) => !companyMapRef.current[id]);
        if (missing.length === 0) return;

        let cancelled = false;
        Promise.all(missing.map((id) => fetchCompanyV2(id))).then(
            (results) => {
                if (cancelled) return;
                setCompanyMap((prev) => {
                    const next = { ...prev };
                    results.forEach((res, i) => {
                        if (res.status === 200 && res.data) {
                            const data = res.data?.data || res.data;
                            next[missing[i]] = data;
                        }
                    });
                    return next;
                });
            }
        );
        return () => {
            cancelled = true;
        };
    }, [jobs]);

    const selectedIds = useMemo(
        () => selectedJobs.map(getJobId).filter(Boolean),
        [selectedJobs]
    );

    useEffect(() => {
        try {
            sessionStorage.setItem(
                SELECTED_JOBS_STORAGE_KEY,
                JSON.stringify(selectedJobs)
            );
        } catch {
            /* sessionStorage unavailable / quota — ignore */
        }
    }, [selectedJobs]);

    const handleSelectJob = useCallback((id, job) => {
        if (!id) return;
        setSelectedJobs((prev) => {
            if (prev.some((j) => getJobId(j) === id)) return prev;
            return [...prev, job];
        });
    }, []);

    const handleToggleSelect = useCallback((id, job) => {
        if (!id) return;
        setSelectedJobs((prev) => {
            const exists = prev.some((j) => getJobId(j) === id);
            if (exists) return prev.filter((j) => getJobId(j) !== id);
            return [...prev, job];
        });
    }, []);

    const handleToggleSelectAll = useCallback(
        (checked, visibleIds) => {
            const ids = new Set(visibleIds);
            if (checked) {
                setSelectedJobs((prev) => {
                    const kept = prev.filter((j) => !ids.has(getJobId(j)));
                    const toAdd = jobs.filter((j) => ids.has(getJobId(j)));
                    return [...kept, ...toAdd];
                });
            } else {
                setSelectedJobs((prev) =>
                    prev.filter((j) => !ids.has(getJobId(j)))
                );
            }
        },
        [jobs]
    );

    const clearSelection = useCallback(() => setSelectedJobs([]), []);

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
                    (key !== "scope" && value === "all") ||
                    (key === "scope" && value === "active") ||
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
        // Keep the active tab; Clear only resets search/type/batch/company.
        if (filters.scope !== "active") {
            next.set("scope", filters.scope);
        }
        setSearchParams(next, { replace: true });
    }, [filters.limit, filters.scope, setSearchParams]);

    const totalPages = useMemo(() => {
        if (typeof meta.pages === "number" && meta.pages > 0) return meta.pages;
        if (meta.total <= 0) return 1;
        return Math.max(1, Math.ceil(meta.total / filters.limit));
    }, [meta.pages, meta.total, filters.limit]);

    const hasActiveFilter =
        !!filters.search ||
        filters.employmentType !== "all" ||
        filters.batch !== "all" ||
        filters.companyId !== "all";

    const showEmpty = !loading && jobs.length === 0;
    const emptyMessage = hasActiveFilter
        ? "No jobs match your filters"
        : filters.scope === "archived"
          ? "No archived jobs"
          : filters.scope === "all"
            ? "No jobs yet"
            : "No active jobs";

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

            <div className="flex w-fit items-center gap-1 rounded-md border border-border bg-muted p-0.5">
                {SCOPE_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        aria-pressed={filters.scope === tab.value}
                        onClick={() =>
                            updateParams({ scope: tab.value, page: 1 })
                        }
                        className={cn(
                            "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                            filters.scope === tab.value
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
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
                            {emptyMessage}
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
                <>
                    {selectedJobs.length > 0 && (
                        <Card>
                            <CardContent className="py-3 px-4 flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-sm font-medium">
                                    {selectedJobs.length} selected
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCaptionSheetOpen(true)
                                        }
                                    >
                                        <Camera className="h-3.5 w-3.5 mr-1.5" />
                                        IG caption
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            generateWhatsAppMessage(
                                                selectedJobs
                                            )
                                        }
                                    >
                                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                        WhatsApp msg
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            generateWhatsAppMessage(
                                                selectedJobs,
                                                true
                                            )
                                        }
                                    >
                                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                        WhatsApp (site link)
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelection}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1.5" />
                                        Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <JobsTable
                        jobs={jobs}
                        loading={loading}
                        onChanged={() => setReloadKey((k) => k + 1)}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onToggleSelectAll={handleToggleSelectAll}
                        onSelectJob={handleSelectJob}
                        companyMap={companyMap}
                    />
                    <CaptionGeneratorSheet
                        open={captionSheetOpen}
                        onOpenChange={setCaptionSheetOpen}
                        jobs={selectedJobs}
                    />
                </>
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
