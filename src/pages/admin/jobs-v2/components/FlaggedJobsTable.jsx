import React from "react";
import { Link } from "react-router-dom";
import { Building2, ExternalLink, Trash2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "Components/ui/table";
import { Badge } from "Components/ui/badge";
import { Button } from "Components/ui/button";
import { Checkbox } from "Components/ui/checkbox";
import { Skeleton } from "Components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "Components/ui/tooltip";

import { formatRelativeTime } from "Helpers/relativeTime";
import {
    humanizeReason,
    reasonDetail,
    resultMeta,
} from "Helpers/verificationReason";

const getJobId = (job) => job?._id ?? job?.id ?? "";

// Prefer the explicit check result; fall back to status (archived ⇒ expired).
const getResult = (job) =>
    job?.verification?.lastCheckResult ||
    (job?.status === "archived" ? "expired" : "inconclusive");

const COLUMNS = [
    { key: "select", className: "w-[44px]" },
    { key: "title", className: "min-w-[200px]" },
    { key: "company", className: "min-w-[160px]" },
    { key: "result", className: "w-[120px]" },
    { key: "reason", className: "min-w-[160px]" },
    { key: "apply", className: "w-[80px]" },
    { key: "checked", className: "w-[140px]" },
    { key: "actions", className: "w-[60px] text-right" },
];

const SkeletonRow = () => (
    <TableRow>
        {COLUMNS.map((col) => (
            <TableCell key={col.key} className={col.className}>
                <Skeleton className="h-4 w-3/4" />
            </TableCell>
        ))}
    </TableRow>
);

const ApplyLinkCell = ({ link }) => {
    if (!link) return <span className="text-muted-foreground">—</span>;
    const href = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open apply link in new tab"
                        className="h-8 w-8"
                        asChild
                    >
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs break-all">
                    <span className="font-mono text-xs">{link}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const FlaggedJobsTable = ({
    jobs,
    loading,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll,
    onDeleteRow,
}) => {
    const selectedSet = new Set(selectedIds);
    const visibleIds = jobs.map(getJobId).filter(Boolean);
    const allSelected =
        visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
    const someSelected =
        visibleIds.some((id) => selectedSet.has(id)) && !allSelected;

    return (
        <div className="rounded-lg border border-border bg-background">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[44px]">
                            <Checkbox
                                aria-label="Select all flagged jobs on this page"
                                checked={
                                    allSelected
                                        ? true
                                        : someSelected
                                          ? "indeterminate"
                                          : false
                                }
                                disabled={visibleIds.length === 0}
                                onCheckedChange={(checked) =>
                                    onToggleSelectAll &&
                                    onToggleSelectAll(!!checked, visibleIds)
                                }
                            />
                        </TableHead>
                        <TableHead className="min-w-[200px]">Title</TableHead>
                        <TableHead className="min-w-[160px]">Company</TableHead>
                        <TableHead className="w-[120px]">Result</TableHead>
                        <TableHead className="min-w-[160px]">Reason</TableHead>
                        <TableHead className="w-[80px]">Apply</TableHead>
                        <TableHead className="w-[140px]">Checked</TableHead>
                        <TableHead className="w-[60px] text-right" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                              <SkeletonRow key={i} />
                          ))
                        : jobs.map((job) => {
                              const id = getJobId(job);
                              const isSelected = !!id && selectedSet.has(id);
                              const result = getResult(job);
                              const meta = resultMeta(result);
                              const rawReason = job?.verification?.lastCheckReason;
                              const detail = reasonDetail(rawReason);
                              const checkedAt = job?.verification?.lastCheckedAt;
                              return (
                                  <TableRow
                                      key={id || job.slug || job.title}
                                      data-state={
                                          isSelected ? "selected" : undefined
                                      }
                                  >
                                      <TableCell>
                                          <Checkbox
                                              aria-label={`Select ${job.title || "job"}`}
                                              checked={isSelected}
                                              disabled={!id}
                                              onCheckedChange={() =>
                                                  id &&
                                                  onToggleSelect &&
                                                  onToggleSelect(id)
                                              }
                                          />
                                      </TableCell>
                                      <TableCell className="font-medium">
                                          {id ? (
                                              <Link
                                                  to={`/admin/jobs/${id}/edit`}
                                                  className="hover:underline"
                                              >
                                                  {job.title || "Untitled"}
                                              </Link>
                                          ) : (
                                              job.title || "Untitled"
                                          )}
                                      </TableCell>
                                      <TableCell>
                                          <div className="flex items-center gap-2 min-w-0">
                                              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                              <span className="truncate">
                                                  {job.companyName || "—"}
                                              </span>
                                          </div>
                                      </TableCell>
                                      <TableCell>
                                          <Badge
                                              variant="outline"
                                              className={meta.className}
                                          >
                                              {meta.label}
                                          </Badge>
                                      </TableCell>
                                      <TableCell
                                          className="text-sm"
                                          title={detail || rawReason || ""}
                                      >
                                          {humanizeReason(rawReason)}
                                      </TableCell>
                                      <TableCell>
                                          <ApplyLinkCell link={job.applyLink} />
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                          {formatRelativeTime(checkedAt) || "—"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label={`Delete ${job.title || "job"}`}
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                              onClick={() =>
                                                  onDeleteRow && onDeleteRow(job)
                                              }
                                          >
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              );
                          })}
                </TableBody>
            </Table>
        </div>
    );
};

export default FlaggedJobsTable;
