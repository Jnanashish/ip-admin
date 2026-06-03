import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    ScanSearch,
    Trash2,
} from "lucide-react";

import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import { Card, CardContent } from "Components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "Components/ui/dialog";

import {
    verifyApplyLinksV2,
    getVerifyStatusV2,
    listFlaggedJobsV2,
    purgeFlaggedJobsV2,
} from "api/v2/jobs";
import {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarnToast,
} from "Helpers/toast";

import FlaggedJobsTable from "./components/FlaggedJobsTable";
import ScanSummaryCard from "./components/ScanSummaryCard";

const PAGE_LIMIT = 20;
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 10 * 60 * 1000; // stop auto-polling after ~10 minutes
const MAX_LIMIT = 5000;

const RESULT_TABS = [
    { value: "all", label: "All" },
    { value: "expired", label: "Expired" },
    { value: "inconclusive", label: "Inconclusive" },
];

const getJobId = (job) => job?._id ?? job?.id ?? "";

const apiErrorMessage = (res, fallback) =>
    (res?.error && (res.error.error || res.error.message)) || fallback;

const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
};

const JobLinkCleanup = () => {
    // ── Scan state ──────────────────────────────────────────────────────────
    const [limitInput, setLimitInput] = useState("");
    const [scanning, setScanning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [lastRun, setLastRun] = useState(null);
    const scanStartRef = useRef(0);
    const pollDeadlineRef = useRef(0);

    // ── Flagged list state ──────────────────────────────────────────────────
    const [result, setResult] = useState("all");
    const [page, setPage] = useState(1);
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);

    // ── Deletion state ──────────────────────────────────────────────────────
    // confirm: { type: "row" | "selected" | "all", ids?: string[], count: number, title?: string }
    const [confirm, setConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

    // Fetch flagged jobs whenever filter / page / reload changes.
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const query = { page, limit: PAGE_LIMIT };
        if (result !== "all") query.result = result;
        listFlaggedJobsV2(query).then((res) => {
            if (cancelled) return;
            if (res.status === 200 && res.data) {
                const tp = res.data.totalPages || 1;
                // Page may now be out of range (e.g. after a purge) — step back.
                if (page > tp && tp >= 1) {
                    setPage(tp);
                    return;
                }
                setJobs(res.data.jobs || []);
                setTotal(res.data.total || 0);
                setTotalPages(tp);
            } else {
                setJobs([]);
                setTotal(0);
                setTotalPages(1);
                if (res.status === 401) {
                    showErrorToast("Session expired — please sign in again.");
                } else {
                    showErrorToast(
                        apiErrorMessage(res, "Failed to load flagged jobs")
                    );
                }
            }
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [result, page, reloadKey]);

    // Tick the elapsed timer while a scan is running.
    useEffect(() => {
        if (!scanning) {
            setElapsed(0);
            return undefined;
        }
        const id = setInterval(() => {
            setElapsed(Math.floor((Date.now() - scanStartRef.current) / 1000));
        }, 1000);
        return () => clearInterval(id);
    }, [scanning]);

    // Poll scan status while running; finish, time out, or keep waiting.
    useEffect(() => {
        if (!scanning) return undefined;
        let cancelled = false;

        const finish = (run) => {
            if (cancelled) return;
            setScanning(false);
            if (run) {
                setLastRun(run);
                showSuccessToast(
                    `Scan complete · Checked ${run.totalChecked ?? 0} · archived ${run.expiredCount ?? 0} · inconclusive ${run.inconclusiveCount ?? 0}`
                );
            } else {
                // Backend restarted mid-scan (in-memory lastRun lost) — table is durable.
                showInfoToast("Scan finished. Refreshing flagged jobs.");
            }
            refetch();
        };

        const tick = async () => {
            const res = await getVerifyStatusV2();
            if (cancelled) return;
            if (res.status === 401) {
                setScanning(false);
                showErrorToast("Session expired — please sign in again.");
                return;
            }
            if (res.status === 200 && res.data) {
                if (!res.data.running) {
                    finish(res.data.lastRun || null);
                    return;
                }
            }
            // Still running (or a transient status error) — honor the cap.
            if (Date.now() >= pollDeadlineRef.current) {
                setScanning(false);
                showWarnToast(
                    "Scan still running — check back later. The flagged table stays up to date."
                );
            }
        };

        const id = setInterval(tick, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [scanning, refetch]);

    const beginScanning = useCallback((startedAt) => {
        const start = startedAt ? new Date(startedAt).getTime() : Date.now();
        scanStartRef.current = Number.isNaN(start) ? Date.now() : start;
        pollDeadlineRef.current = Date.now() + POLL_MAX_MS;
        setElapsed(0);
        setScanning(true);
    }, []);

    const handleScan = useCallback(async () => {
        if (scanning) return;
        const parsed = parseInt(limitInput, 10);
        let limit;
        if (!Number.isNaN(parsed) && parsed > 0) {
            limit = Math.min(parsed, MAX_LIMIT);
        }
        const res = await verifyApplyLinksV2(limit);
        if (res.status === 202) {
            beginScanning(res.data?.startedAt);
            showInfoToast("Verification scan started.");
            return;
        }
        if (res.status === 409) {
            // A scan is already running — attach to it.
            beginScanning(res.error?.startedAt);
            showInfoToast("A scan is already running — tracking it.");
            return;
        }
        if (res.status === 401) {
            showErrorToast("Session expired — please sign in again.");
            return;
        }
        showErrorToast(apiErrorMessage(res, "Could not start scan"));
    }, [scanning, limitInput, beginScanning]);

    // ── Selection ───────────────────────────────────────────────────────────
    const handleToggleSelect = useCallback((id) => {
        if (!id) return;
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const handleToggleSelectAll = useCallback((checked, visibleIds) => {
        setSelectedIds((prev) => {
            const set = new Set(visibleIds);
            if (checked) {
                const kept = prev.filter((id) => !set.has(id));
                return [...kept, ...visibleIds];
            }
            return prev.filter((id) => !set.has(id));
        });
    }, []);

    const changeResult = useCallback((value) => {
        setResult(value);
        setPage(1);
        setSelectedIds([]);
    }, []);

    const changePage = useCallback((next) => {
        setPage(next);
        setSelectedIds([]);
    }, []);

    // ── Deletion ────────────────────────────────────────────────────────────
    const handleConfirmDelete = useCallback(async () => {
        if (!confirm) return;
        setDeleting(true);
        const payload =
            confirm.type === "all" ? { all: true } : { ids: confirm.ids };
        const res = await purgeFlaggedJobsV2(payload);
        setDeleting(false);
        if (res.status === 200 && res.data) {
            const deleted = res.data.deleted ?? confirm.ids?.length ?? 0;
            showSuccessToast(`Deleted ${deleted} job${deleted === 1 ? "" : "s"}`);
            setConfirm(null);
            setSelectedIds([]);
            if (confirm.type === "all") setPage(1);
            refetch();
            return;
        }
        if (res.status === 401) {
            showErrorToast("Session expired — please sign in again.");
            return;
        }
        showErrorToast(apiErrorMessage(res, "Failed to delete jobs"));
    }, [confirm, refetch]);

    const confirmCopy = (() => {
        if (!confirm) return { title: "", body: "" };
        if (confirm.type === "row") {
            return {
                title: "Delete this job?",
                body: `"${confirm.title || "This job"}" will be soft-deleted (status archived). It drops out of all listings but can be restored.`,
            };
        }
        if (confirm.type === "selected") {
            return {
                title: "Delete selected jobs?",
                body: `Soft-delete ${confirm.count} selected job${confirm.count === 1 ? "" : "s"}? They drop out of all listings but can be restored.`,
            };
        }
        return {
            title: "Delete all flagged jobs?",
            body: `Soft-delete all ${confirm.count} flagged job${confirm.count === 1 ? "" : "s"}? They drop out of all listings but can be restored.`,
        };
    })();

    const showEmpty = !loading && jobs.length === 0;

    return (
        <div className="px-4 lg:px-6 pt-6 pb-10 max-w-7xl mx-auto space-y-6">
            {/* Header / scan bar */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Job Link Cleanup
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Scan published jobs for dead apply links, then review and
                        remove flagged postings.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={1}
                        max={MAX_LIMIT}
                        inputMode="numeric"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        placeholder="All"
                        aria-label="Max jobs to scan"
                        disabled={scanning}
                        className="w-24"
                    />
                    <Button onClick={handleScan} disabled={scanning}>
                        {scanning ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                Scanning… {formatElapsed(elapsed)}
                            </>
                        ) : (
                            <>
                                <ScanSearch className="h-4 w-4 mr-1.5" />
                                Scan apply links
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {lastRun && <ScanSummaryCard lastRun={lastRun} />}

            {/* Toolbar: result tabs + bulk actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex rounded-md border border-border p-0.5">
                        {RESULT_TABS.map((tab) => (
                            <Button
                                key={tab.value}
                                size="sm"
                                variant={
                                    result === tab.value ? "secondary" : "ghost"
                                }
                                className="h-8"
                                onClick={() => changeResult(tab.value)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {total} flagged
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                                setConfirm({
                                    type: "selected",
                                    ids: selectedIds,
                                    count: selectedIds.length,
                                })
                            }
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete selected ({selectedIds.length})
                        </Button>
                    )}
                    {result === "all" && total > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                                setConfirm({ type: "all", count: total })
                            }
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete all flagged
                        </Button>
                    )}
                </div>
            </div>

            {/* Table / empty state */}
            {showEmpty ? (
                <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-sm text-muted-foreground">
                            No flagged jobs. Run a scan to check apply links.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <FlaggedJobsTable
                    jobs={jobs}
                    loading={loading}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    onDeleteRow={(job) =>
                        setConfirm({
                            type: "row",
                            ids: [getJobId(job)],
                            count: 1,
                            title: job.title,
                        })
                    }
                />
            )}

            {/* Pagination */}
            {!showEmpty && (
                <div className="flex items-center justify-end gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading}
                            onClick={() => changePage(page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || loading}
                            onClick={() => changePage(page + 1)}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            <Dialog
                open={!!confirm}
                onOpenChange={(open) => {
                    if (!open && !deleting) setConfirm(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmCopy.title}</DialogTitle>
                        <DialogDescription>{confirmCopy.body}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirm(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JobLinkCleanup;
