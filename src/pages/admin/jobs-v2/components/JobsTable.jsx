import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Building2,
    MoreHorizontal,
    Info,
    ExternalLink,
    Image as ImageIcon,
    Trash2,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "Components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "Components/ui/avatar";
import { Skeleton } from "Components/ui/skeleton";
import { Button } from "Components/ui/button";
import { Checkbox } from "Components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "Components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "Components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "Components/ui/tooltip";

import { fetchJobV2, deleteJobV2 } from "api/v2/jobs";
import { mapJobResponseToFormValues } from "validators/v2/jobFormSchema";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
} from "Helpers/toast";
import { formatRelativeTime } from "Helpers/relativeTime";
import { copyApplyLink } from "Helpers/JobListHelper";

import StatusBadge from "./StatusBadge";

const FRONTEND_URL =
    process.env.REACT_APP_FRONTEND_URL || "https://careersat.tech";

const EMPLOYMENT_TYPE_LABELS = {
    FULL_TIME: "Full-time",
    INTERN: "Internship",
    PART_TIME: "Part-time",
    CONTRACTOR: "Contract",
    TEMPORARY: "Temporary",
};

const COLUMNS = [
    { key: "select", label: "", className: "w-[44px]" },
    { key: "title", label: "Title", className: "min-w-[200px]" },
    { key: "company", label: "Company", className: "min-w-[180px]" },
    { key: "status", label: "Status", className: "w-[60px]" },
    { key: "employmentType", label: "Employment", className: "min-w-[140px]" },
    { key: "posted", label: "Posted", className: "w-[140px]" },
    { key: "info", label: "", className: "w-[60px]" },
    { key: "actions", label: "", className: "w-[120px] text-right" },
];

const getJobId = (job) => job?._id ?? job?.id ?? "";

const getApplyLink = (job) => job?.applyLink || job?.link || "";

const formatEmploymentTypes = (types) => {
    if (!Array.isArray(types) || types.length === 0) return "—";
    return types.map((t) => EMPLOYMENT_TYPE_LABELS[t] || t).join(", ");
};

const formatBatch = (batch) => {
    if (!Array.isArray(batch) || batch.length === 0) return "—";
    return batch.join(", ");
};

const formatLocation = (locations) => {
    if (!Array.isArray(locations) || locations.length === 0) return "—";
    const first = locations[0];
    if (!first) return "—";
    const parts = [first.city, first.country].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
};

const SkeletonRow = () => (
    <TableRow>
        {COLUMNS.map((col) => (
            <TableCell key={col.key} className={col.className}>
                <Skeleton className="h-4 w-3/4" />
            </TableCell>
        ))}
    </TableRow>
);

const CompanyCell = ({ job, companyMap }) => {
    const companyId =
        typeof job?.company === "object"
            ? job.company?._id || job.company?.id || ""
            : job?.company || "";
    const mapped = companyId && companyMap ? companyMap[companyId] : null;
    const logo =
        mapped?.logo?.icon ||
        mapped?.logo?.banner ||
        job?.company?.logo?.icon ||
        job?.company?.logo?.banner ||
        job?.companyLogo ||
        "";
    const name =
        job?.companyName ||
        mapped?.companyName ||
        job?.company?.companyName ||
        job?.company?.name ||
        "—";
    return (
        <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6">
                {logo && <AvatarImage src={logo} alt={name} />}
                <AvatarFallback className="bg-muted">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
            <span className="truncate">{name}</span>
        </div>
    );
};

const JobsTable = ({
    jobs,
    loading,
    onChanged,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll,
    onSelectJob,
    companyMap = {},
}) => {
    const navigate = useNavigate();
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [archiving, setArchiving] = useState(false);

    const selectionEnabled = typeof onToggleSelect === "function";
    const selectedSet = new Set(selectedIds);
    const visibleIds = jobs.map(getJobId).filter(Boolean);
    const allSelected =
        visibleIds.length > 0 &&
        visibleIds.every((id) => selectedSet.has(id));
    const someSelected =
        visibleIds.some((id) => selectedSet.has(id)) && !allSelected;

    const handleViewOnSite = (job) => {
        if (!job.slug) return;
        const url = `${FRONTEND_URL}/jobs/${job.slug}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleCreateBanner = (job) => {
        const id = getJobId(job);
        if (!id) return;
        navigate(`/canvas?jobid=${encodeURIComponent(id)}`);
    };

    const handleBanner = (job) => {
        const id = getJobId(job);
        if (!id) return;
        if (typeof onSelectJob === "function") onSelectJob(id, job);
        const url = `/canvas?jobid=${encodeURIComponent(id)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleOpenApply = (job) => {
        const url = getApplyLink(job);
        if (!url) {
            showInfoToast("No apply link for this job");
            return;
        }
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        window.open(href, "_blank", "noopener,noreferrer");
    };

    const handleDuplicate = async (job) => {
        const id = getJobId(job);
        if (!id) return;
        showInfoToast("Loading job…");
        const res = await fetchJobV2(id);
        if (res.status !== 200 || !res.data) {
            showErrorToast(
                res.error?.message || "Could not load job for duplication"
            );
            return;
        }
        const mapped = mapJobResponseToFormValues(res.data);
        const {
            _id,
            id: _ignoreId,
            slug: _ignoreSlug,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            ...duplicated
        } = mapped;
        navigate("/admin/jobs/new", {
            state: { duplicateFrom: { ...duplicated, slug: "" } },
        });
    };

    const handleArchiveConfirm = async () => {
        if (!archiveTarget) return;
        const id = getJobId(archiveTarget);
        if (!id) return;
        setArchiving(true);
        const res = await deleteJobV2(id);
        setArchiving(false);
        if (res.status === 200 || res.status === 204) {
            showSuccessToast("Job archived");
            setArchiveTarget(null);
            if (typeof onChanged === "function") onChanged();
            return;
        }
        showErrorToast(res.error?.message || "Failed to archive job");
    };

    return (
        <>
            <div className="rounded-lg border border-border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {COLUMNS.map((col) => {
                                if (col.key === "select") {
                                    return (
                                        <TableHead
                                            key={col.key}
                                            className={col.className}
                                        >
                                            {selectionEnabled && (
                                                <Checkbox
                                                    aria-label="Select all jobs on this page"
                                                    checked={
                                                        allSelected
                                                            ? true
                                                            : someSelected
                                                              ? "indeterminate"
                                                              : false
                                                    }
                                                    onCheckedChange={(checked) =>
                                                        onToggleSelectAll &&
                                                        onToggleSelectAll(
                                                            !!checked,
                                                            visibleIds
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableHead>
                                    );
                                }
                                return (
                                    <TableHead
                                        key={col.key}
                                        className={col.className}
                                    >
                                        {col.label}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                  <SkeletonRow key={i} />
                              ))
                            : jobs.map((job) => {
                                  const id = getJobId(job);
                                  const isSelected =
                                      !!id && selectedSet.has(id);
                                  return (
                                      <TableRow
                                          key={id || job.title}
                                          data-state={
                                              isSelected ? "selected" : undefined
                                          }
                                      >
                                          <TableCell>
                                              {selectionEnabled && (
                                                  <Checkbox
                                                      aria-label={`Select ${job.title || "job"}`}
                                                      checked={isSelected}
                                                      onCheckedChange={() =>
                                                          id &&
                                                          onToggleSelect(id, job)
                                                      }
                                                      disabled={!id}
                                                  />
                                              )}
                                          </TableCell>
                                          <TableCell className="font-medium">
                                              <Link
                                                  to={`/admin/jobs/${id}/edit`}
                                                  className="hover:underline"
                                              >
                                                  {job.title || "Untitled"}
                                              </Link>
                                          </TableCell>
                                          <TableCell>
                                              <CompanyCell
                                                  job={job}
                                                  companyMap={companyMap}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <StatusBadge status={job.status} />
                                          </TableCell>
                                          <TableCell className="text-sm">
                                              {formatEmploymentTypes(
                                                  job.employmentType
                                              )}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                              {formatRelativeTime(
                                                  job.datePosted ||
                                                      job.createdAt
                                              )}
                                          </TableCell>
                                          <TableCell>
                                              <TooltipProvider
                                                  delayDuration={100}
                                              >
                                                  <Tooltip>
                                                      <TooltipTrigger asChild>
                                                          <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              aria-label="Job details"
                                                              className="h-8 w-8"
                                                          >
                                                              <Info className="h-4 w-4" />
                                                          </Button>
                                                      </TooltipTrigger>
                                                      <TooltipContent
                                                          side="left"
                                                          className="max-w-xs"
                                                      >
                                                          <div className="space-y-1.5">
                                                              <div>
                                                                  <span className="font-medium">
                                                                      Batch:
                                                                  </span>{" "}
                                                                  {formatBatch(
                                                                      job.batch
                                                                  )}
                                                              </div>
                                                              <div>
                                                                  <span className="font-medium">
                                                                      Location:
                                                                  </span>{" "}
                                                                  {formatLocation(
                                                                      job.jobLocation
                                                                  )}
                                                              </div>
                                                          </div>
                                                      </TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                          </TableCell>
                                          <TableCell className="text-right">
                                              <div className="flex items-center justify-end gap-0.5">
                                                  <TooltipProvider
                                                      delayDuration={100}
                                                  >
                                                      <Tooltip>
                                                          <TooltipTrigger asChild>
                                                              <Button
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  aria-label="Open apply link"
                                                                  className="h-8 w-8"
                                                                  disabled={
                                                                      !getApplyLink(
                                                                          job
                                                                      )
                                                                  }
                                                                  onClick={() =>
                                                                      handleOpenApply(
                                                                          job
                                                                      )
                                                                  }
                                                              >
                                                                  <ExternalLink className="h-4 w-4" />
                                                              </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent side="top">
                                                              Open apply link
                                                          </TooltipContent>
                                                      </Tooltip>
                                                      <Tooltip>
                                                          <TooltipTrigger asChild>
                                                              <Button
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  aria-label="Banner"
                                                                  className="h-8 w-8"
                                                                  onClick={() =>
                                                                      handleBanner(
                                                                          job
                                                                      )
                                                                  }
                                                              >
                                                                  <ImageIcon className="h-4 w-4" />
                                                              </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent side="top">
                                                              Banner
                                                          </TooltipContent>
                                                      </Tooltip>
                                                      <Tooltip>
                                                          <TooltipTrigger asChild>
                                                              <Button
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  aria-label="Delete job"
                                                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                                                  onClick={() =>
                                                                      setArchiveTarget(
                                                                          job
                                                                      )
                                                                  }
                                                              >
                                                                  <Trash2 className="h-4 w-4" />
                                                              </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent side="top">
                                                              Delete
                                                          </TooltipContent>
                                                      </Tooltip>
                                                  </TooltipProvider>
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              aria-label="Job actions"
                                                              className="h-8 w-8"
                                                          >
                                                              <MoreHorizontal className="h-4 w-4" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                          <DropdownMenuItem
                                                              onSelect={() =>
                                                                  navigate(
                                                                      `/admin/jobs/${id}/edit`
                                                                  )
                                                              }
                                                          >
                                                              Edit
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                              disabled={
                                                                  !job.applyLink &&
                                                                  !job.link
                                                              }
                                                              onSelect={() =>
                                                                  copyApplyLink(
                                                                      job
                                                                  )
                                                              }
                                                          >
                                                              Copy apply link
                                                          </DropdownMenuItem>
                                                          {job.status ===
                                                              "published" &&
                                                              job.slug && (
                                                                  <DropdownMenuItem
                                                                      onSelect={() =>
                                                                          handleViewOnSite(
                                                                              job
                                                                          )
                                                                      }
                                                                  >
                                                                      View on site
                                                                  </DropdownMenuItem>
                                                              )}
                                                          <DropdownMenuItem
                                                              onSelect={() =>
                                                                  handleDuplicate(
                                                                      job
                                                                  )
                                                              }
                                                          >
                                                              Duplicate
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                              onSelect={() =>
                                                                  handleCreateBanner(
                                                                      job
                                                                  )
                                                              }
                                                          >
                                                              Create banner
                                                          </DropdownMenuItem>
                                                          <DropdownMenuSeparator />
                                                          <DropdownMenuItem
                                                              className="text-destructive focus:text-destructive"
                                                              onSelect={() =>
                                                                  setArchiveTarget(
                                                                      job
                                                                  )
                                                              }
                                                          >
                                                              Archive
                                                          </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                              </div>
                                          </TableCell>
                                      </TableRow>
                                  );
                              })}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={!!archiveTarget}
                onOpenChange={(open) => {
                    if (!open && !archiving) setArchiveTarget(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive this job?</DialogTitle>
                        <DialogDescription>
                            "{archiveTarget?.title}" will be removed from the
                            listing. This is reversible from the database.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setArchiveTarget(null)}
                            disabled={archiving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleArchiveConfirm}
                            disabled={archiving}
                        >
                            {archiving ? "Archiving…" : "Archive"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default JobsTable;
