import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, MoreHorizontal } from "lucide-react";

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

import { deleteCompanyV2 } from "api/v2/companies";
import { showErrorToast, showSuccessToast } from "Helpers/toast";
import { formatRelativeTime } from "Helpers/relativeTime";

import CompanyStatusBadge from "./CompanyStatusBadge";

const FRONTEND_URL =
    process.env.REACT_APP_FRONTEND_URL || "https://careersat.tech";

const COLUMNS = [
    { key: "company", label: "Company", className: "min-w-[220px]" },
    { key: "industry", label: "Industry", className: "min-w-[140px]" },
    { key: "companyType", label: "Type", className: "w-[120px]" },
    { key: "openJobs", label: "Open jobs", className: "w-[110px]" },
    { key: "status", label: "Status", className: "w-[120px]" },
    { key: "verified", label: "Verified", className: "w-[100px]" },
    { key: "createdAt", label: "Created", className: "w-[140px]" },
    { key: "actions", label: "", className: "w-[60px] text-right" },
];

const getCompanyId = (c) => c?._id ?? c?.id ?? "";

const errorMessage = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    return err.message || "";
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

const CompanyCell = ({ company, id }) => {
    const logo = company?.logo?.icon || "";
    const name = company?.companyName || "—";
    return (
        <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6">
                {logo && <AvatarImage src={logo} alt={name} />}
                <AvatarFallback className="bg-muted">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
            <Link
                to={`/admin/companies/${id}/edit`}
                className="truncate font-medium hover:underline"
            >
                {name}
            </Link>
        </div>
    );
};

const CompaniesTable = ({ companies, loading, onChanged }) => {
    const navigate = useNavigate();
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [archiving, setArchiving] = useState(false);
    const [conflict, setConflict] = useState(null);

    const handleViewPublic = (company) => {
        if (!company?.slug) return;
        const url = `${FRONTEND_URL}/companies/${company.slug}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const closeDialog = () => {
        if (archiving) return;
        setArchiveTarget(null);
        setConflict(null);
    };

    const handleArchiveConfirm = async () => {
        if (!archiveTarget) return;
        const id = getCompanyId(archiveTarget);
        if (!id) return;
        setArchiving(true);
        const res = await deleteCompanyV2(id);
        setArchiving(false);

        if (res.status === 200 || res.status === 204) {
            showSuccessToast("Company archived");
            setArchiveTarget(null);
            setConflict(null);
            if (typeof onChanged === "function") onChanged();
            return;
        }

        if (res.status === 409) {
            setConflict({
                message:
                    errorMessage(res.error) ||
                    "This company has active jobs or other dependencies. Resolve them before archiving.",
            });
            return;
        }

        showErrorToast(errorMessage(res.error) || "Failed to archive company");
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
                            : companies.map((company) => {
                                  const id = getCompanyId(company);
                                  const canViewPublic =
                                      company.status === "active" &&
                                      !!company.slug;
                                  return (
                                      <TableRow
                                          key={id || company.companyName}
                                      >
                                          <TableCell>
                                              <CompanyCell
                                                  company={company}
                                                  id={id}
                                              />
                                          </TableCell>
                                          <TableCell className="text-sm">
                                              {company.industry || "—"}
                                          </TableCell>
                                          <TableCell className="text-sm capitalize">
                                              {company.companyType || "—"}
                                          </TableCell>
                                          <TableCell className="text-sm">
                                              {typeof company.openJobsCount ===
                                              "number"
                                                  ? company.openJobsCount
                                                  : "—"}
                                          </TableCell>
                                          <TableCell>
                                              <CompanyStatusBadge
                                                  status={company.status}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              {company.isVerified ? (
                                                  <CheckCircle2
                                                      className="h-4 w-4 text-green-600"
                                                      aria-label="Verified"
                                                  />
                                              ) : (
                                                  <span className="text-sm text-muted-foreground">
                                                      —
                                                  </span>
                                              )}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                              {formatRelativeTime(
                                                  company.createdAt
                                              )}
                                          </TableCell>
                                          <TableCell className="text-right">
                                              <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                      <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          aria-label="Company actions"
                                                          className="h-8 w-8"
                                                      >
                                                          <MoreHorizontal className="h-4 w-4" />
                                                      </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                      <DropdownMenuItem
                                                          onSelect={() =>
                                                              navigate(
                                                                  `/admin/companies/${id}/edit`
                                                              )
                                                          }
                                                      >
                                                          Edit
                                                      </DropdownMenuItem>
                                                      {canViewPublic && (
                                                          <DropdownMenuItem
                                                              onSelect={() =>
                                                                  handleViewPublic(
                                                                      company
                                                                  )
                                                              }
                                                          >
                                                              View public page
                                                          </DropdownMenuItem>
                                                      )}
                                                      <DropdownMenuSeparator />
                                                      <DropdownMenuItem
                                                          className="text-destructive focus:text-destructive"
                                                          onSelect={() => {
                                                              setConflict(null);
                                                              setArchiveTarget(
                                                                  company
                                                              );
                                                          }}
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
                    if (!open) closeDialog();
                }}
            >
                <DialogContent>
                    {conflict ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Cannot archive{" "}
                                    {archiveTarget?.companyName || "company"}
                                </DialogTitle>
                                <DialogDescription>
                                    {conflict.message}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={closeDialog}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Archive{" "}
                                    {archiveTarget?.companyName || "this company"}?
                                </DialogTitle>
                                <DialogDescription>
                                    The company will be removed from the listing.
                                    This is reversible from the database.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={closeDialog}
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
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CompaniesTable;
