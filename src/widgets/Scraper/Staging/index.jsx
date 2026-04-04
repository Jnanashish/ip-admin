import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Check,
    X,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Inbox,
    ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Badge } from "Components/ui/badge";
import { Input } from "Components/ui/input";
import { Checkbox } from "Components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "Components/ui/dialog";
import { fetchStagingJobs, approveJob, rejectJob, bulkApproveJobs, deleteStagingJob } from "./Helpers";
import { showInfoToast, showErrorToast } from "Helpers/toast";

const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const StagingQueue = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "pending", source: "", page: 1, size: 20 });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const totalPages = Math.ceil(totalCount / filters.size);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchStagingJobs(filters);
            if (res) {
                setJobs(res.data || []);
                setTotalCount(res.totalCount || 0);
            }
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
        setSelectedIds(new Set());
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === jobs.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(jobs.map((j) => j._id)));
        }
    };

    const handleQuickApprove = async (id) => {
        setActionLoading(id);
        const res = await approveJob(id);
        if (res) {
            setJobs((prev) => prev.filter((j) => j._id !== id));
            setTotalCount((prev) => prev - 1);
        }
        setActionLoading(null);
    };

    const handleQuickReject = async (id) => {
        setActionLoading(id);
        const res = await rejectJob(id);
        if (res) {
            setJobs((prev) => prev.filter((j) => j._id !== id));
            setTotalCount((prev) => prev - 1);
        }
        setActionLoading(null);
    };

    const handleQuickDelete = async (id) => {
        setActionLoading(id);
        const res = await deleteStagingJob(id);
        if (res) {
            setJobs((prev) => prev.filter((j) => j._id !== id));
            setTotalCount((prev) => prev - 1);
        }
        setActionLoading(null);
    };

    const handleBulkApprove = async () => {
        setBulkLoading(true);
        const res = await bulkApproveJobs([...selectedIds]);
        if (res) {
            const msg = `${res.approved || 0} approved${res.failed ? `, ${res.failed} failed` : ""}`;
            showInfoToast(msg);
            if (res.errors?.length) {
                res.errors.forEach((e) => showErrorToast(`Failed: ${e.id} — ${e.error}`));
            }
            setSelectedIds(new Set());
            fetchJobs();
        }
        setBulkLoading(false);
        setShowBulkConfirm(false);
    };

    const filteredJobs = searchQuery
        ? jobs.filter(
              (j) =>
                  j.jobData?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  j.jobData?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : jobs;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Staging Queue</h1>
                <Badge variant="secondary">{totalCount} total</Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Select
                    value={filters.status}
                    onValueChange={(v) => handleFilterChange("status", v)}
                >
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Select all */}
            {filteredJobs.length > 0 && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={selectedIds.size === jobs.length && jobs.length > 0}
                        onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                        Select all ({selectedIds.size} selected)
                    </span>
                </div>
            )}

            {/* Job cards */}
            <div className="space-y-3">
                {filteredJobs.map((job) => {
                    const jd = job.jobData || {};
                    const isLoading = actionLoading === job._id;
                    const isEstimated = jd.salary?.includes("(estimated)");

                    return (
                        <Card key={job._id} className="relative">
                            <CardContent className="pt-4">
                                <div className="flex gap-3">
                                    <div className="pt-1">
                                        <Checkbox
                                            checked={selectedIds.has(job._id)}
                                            onCheckedChange={() => toggleSelect(job._id)}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => navigate(`/admin/scraper/staging/${job._id}`)}
                                            >
                                                <h3 className="font-semibold text-base leading-tight hover:underline">
                                                    {jd.title || "Untitled"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {[jd.companyName, jd.location, jd.jobtype]
                                                        .filter(Boolean)
                                                        .join("  •  ")}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                    {jd.salary && (
                                                        <Badge variant={isEstimated ? "outline" : "secondary"}>
                                                            {jd.salary}
                                                            {isEstimated && (
                                                                <span className="ml-1 text-yellow-600 text-[10px]">est.</span>
                                                            )}
                                                        </Badge>
                                                    )}
                                                    {jd.batch && (
                                                        <Badge variant="secondary">{jd.batch} batch</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleQuickApprove(job._id)}
                                                    disabled={isLoading}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleQuickReject(job._id)}
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-muted-foreground"
                                                    onClick={() => handleQuickDelete(job._id)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                                            <span>Source: {job.source}</span>
                                            <span>Scraped: {timeAgo(job.scrapedAt)}</span>
                                            <span>AI: {job.aiProvider}</span>
                                            {job.sourceUrl && (
                                                <a
                                                    href={job.sourceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-0.5 hover:underline text-primary"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Source <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredJobs.length === 0 && !loading && (
                <div className="text-center py-16">
                    <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                        No {filters.status !== "all" ? filters.status : ""} jobs in staging.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Click "Scrape Now" on the dashboard to fetch new listings.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page <= 1}
                        onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {filters.page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page >= totalPages}
                        onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex items-center justify-between z-50 shadow-lg">
                    <span className="text-sm font-medium">{selectedIds.size} jobs selected</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                            Clear
                        </Button>
                        <Button size="sm" onClick={() => setShowBulkConfirm(true)}>
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Approve {selectedIds.size} Jobs
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Approve</DialogTitle>
                        <DialogDescription>
                            Approve {selectedIds.size} jobs and publish them to the site?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkApprove} disabled={bulkLoading}>
                            {bulkLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Approve All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StagingQueue;
