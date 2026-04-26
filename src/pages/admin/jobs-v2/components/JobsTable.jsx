import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, MoreHorizontal } from "lucide-react";

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

import { fetchJobV2, deleteJobV2 } from "api/v2/jobs";
import { mapJobResponseToFormValues } from "validators/v2/jobFormSchema";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
} from "Helpers/toast";
import { formatRelativeTime } from "Helpers/relativeTime";

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
    { key: "title", label: "Title", className: "min-w-[200px]" },
    { key: "company", label: "Company", className: "min-w-[180px]" },
    { key: "status", label: "Status", className: "w-[120px]" },
    { key: "employmentType", label: "Employment", className: "min-w-[140px]" },
    { key: "batch", label: "Batch", className: "min-w-[100px]" },
    { key: "location", label: "Location", className: "min-w-[160px]" },
    { key: "posted", label: "Posted", className: "w-[140px]" },
    { key: "actions", label: "", className: "w-[60px] text-right" },
];

const getJobId = (job) => job?._id ?? job?.id ?? "";

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

const CompanyCell = ({ job }) => {
    const logo = job?.company?.logo?.icon || job?.companyLogo || "";
    const name = job?.companyName || job?.company?.name || "—";
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

const JobsTable = ({ jobs, loading, onChanged }) => {
    const navigate = useNavigate();
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [archiving, setArchiving] = useState(false);

    const handleViewOnSite = (job) => {
        if (!job.slug) return;
        const url = `${FRONTEND_URL}/jobs/${job.slug}`;
        window.open(url, "_blank", "noopener,noreferrer");
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
                            {COLUMNS.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={col.className}
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                  <SkeletonRow key={i} />
                              ))
                            : jobs.map((job) => {
                                  const id = getJobId(job);
                                  return (
                                      <TableRow key={id || job.title}>
                                          <TableCell className="font-medium">
                                              <Link
                                                  to={`/admin/jobs/${id}/edit`}
                                                  className="hover:underline"
                                              >
                                                  {job.title || "Untitled"}
                                              </Link>
                                          </TableCell>
                                          <TableCell>
                                              <CompanyCell job={job} />
                                          </TableCell>
                                          <TableCell>
                                              <StatusBadge status={job.status} />
                                          </TableCell>
                                          <TableCell className="text-sm">
                                              {formatEmploymentTypes(
                                                  job.employmentType
                                              )}
                                          </TableCell>
                                          <TableCell className="text-sm">
                                              {formatBatch(job.batch)}
                                          </TableCell>
                                          <TableCell className="text-sm">
                                              {formatLocation(job.jobLocation)}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                              {formatRelativeTime(
                                                  job.datePosted ||
                                                      job.createdAt
                                              )}
                                          </TableCell>
                                          <TableCell className="text-right">
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
