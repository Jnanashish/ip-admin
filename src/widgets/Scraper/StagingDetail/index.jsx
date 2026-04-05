import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import {
    Loader2,
    Check,
    X,
    Trash2,
    ExternalLink,
    Pencil,
    ArrowLeft,
    Keyboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Badge } from "Components/ui/badge";
import { Input } from "Components/ui/input";
import { Textarea } from "Components/ui/textarea";
import { Label } from "Components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "Components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "Components/ui/dialog";
import { fetchStagingJob, approveJob, rejectJob, deleteStagingJob } from "../Staging/Helpers";
import { useKeyboardShortcuts } from "hooks/useKeyboardShortcuts";
import { showInfoToast } from "Helpers/toast";

const HtmlPreview = ({ html, title }) => {
    if (!html) return null;
    const clean = DOMPurify.sanitize(html);
    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: clean }}
            />
        </div>
    );
};

const EditableField = ({ label, value, fieldKey, overrides, onSave, multiline = false }) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(overrides[fieldKey] ?? value ?? "");

    const currentValue = overrides[fieldKey] ?? value;
    const isOverridden = fieldKey in overrides;

    const handleSave = () => {
        const trimmed = editValue.trim();
        if (trimmed !== (value ?? "")) {
            onSave(fieldKey, trimmed);
        } else {
            onSave(fieldKey, undefined);
        }
        setEditing(false);
    };

    const handleCancel = () => {
        setEditValue(overrides[fieldKey] ?? value ?? "");
        setEditing(false);
    };

    if (editing) {
        const InputComp = multiline ? Textarea : Input;
        return (
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <InputComp
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (!multiline && e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                    }}
                    autoFocus
                    rows={multiline ? 4 : undefined}
                />
                <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSave}>
                        Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-0.5 group">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="flex items-start gap-1.5">
                <span className={`text-sm ${isOverridden ? "text-blue-600 font-medium" : ""}`}>
                    {currentValue || "—"}
                </span>
                <button
                    onClick={() => setEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                >
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
};

const StagingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [overrides, setOverrides] = useState({});
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await fetchStagingJob(id);
            if (res?.data) {
                setJob(res.data);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const handleOverride = useCallback((key, value) => {
        setOverrides((prev) => {
            const next = { ...prev };
            if (value === undefined) {
                delete next[key];
            } else {
                next[key] = value;
            }
            return next;
        });
    }, []);

    const handleApprove = useCallback(async () => {
        setActionLoading(true);
        const companyName = overrides.companyName || job?.jobData?.companyName || "";
        const res = await approveJob(id, overrides, companyName);
        if (res) {
            showInfoToast("Job published!");
            navigate("/admin/scraper/staging");
        }
        setActionLoading(false);
    }, [id, overrides, navigate, job]);

    const handleReject = useCallback(async () => {
        setActionLoading(true);
        const res = await rejectJob(id, rejectReason);
        if (res) {
            showInfoToast("Job rejected");
            navigate("/admin/scraper/staging");
        }
        setActionLoading(false);
        setShowRejectDialog(false);
    }, [id, rejectReason, navigate]);

    const handleDelete = useCallback(async () => {
        setActionLoading(true);
        const res = await deleteStagingJob(id);
        if (res) {
            showInfoToast("Job deleted");
            navigate("/admin/scraper/staging");
        }
        setActionLoading(false);
        setShowDeleteConfirm(false);
    }, [id, navigate]);

    const keyMap = useMemo(
        () => ({
            a: () => handleApprove(),
            r: () => setShowRejectDialog(true),
        }),
        [handleApprove]
    );

    useKeyboardShortcuts(keyMap, !showRejectDialog && !showDeleteConfirm);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Job not found.</p>
                <Button variant="link" onClick={() => navigate("/admin/scraper/staging")} className="mt-2">
                    Back to staging queue
                </Button>
            </div>
        );
    }

    const jd = job.jobData || {};
    const isEstimated = jd.salary?.includes("(estimated)");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/scraper/staging")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{overrides.title || jd.title || "Untitled"}</h1>
                        <p className="text-sm text-muted-foreground">
                            {job.source} • {job.aiProvider} • {new Date(job.scrapedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Keyboard className="h-3 w-3" />
                                <span>A = Approve, R = Reject</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Keyboard shortcuts (disabled when typing)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Approve & Publish
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={actionLoading}
                >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                </Button>
                <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
                {job.sourceUrl && (
                    <Button variant="outline" asChild>
                        <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Source Page
                        </a>
                    </Button>
                )}
                {jd.link && (
                    <Button variant="outline" asChild>
                        <a href={jd.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Apply Link
                        </a>
                    </Button>
                )}
            </div>

            {Object.keys(overrides).length > 0 && (
                <Badge variant="outline" className="text-blue-600">
                    {Object.keys(overrides).length} field(s) modified — will be sent as overrides on approve
                </Badge>
            )}

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column — preview */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Job Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h2 className="text-lg font-bold">{overrides.title || jd.title}</h2>
                                <p className="text-muted-foreground">
                                    {overrides.companyName || jd.companyName} • {overrides.location || jd.location}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(overrides.salary || jd.salary) && (
                                        <Badge variant={isEstimated ? "outline" : "secondary"}>
                                            {overrides.salary || jd.salary}
                                            {isEstimated && (
                                                <span className="ml-1 text-yellow-600 text-[10px]">AI estimated</span>
                                            )}
                                        </Badge>
                                    )}
                                    {jd.jobtype && <Badge variant="secondary">{jd.jobtype}</Badge>}
                                    {jd.workMode && <Badge variant="secondary">{jd.workMode}</Badge>}
                                    {jd.experience && <Badge variant="secondary">{jd.experience}</Badge>}
                                </div>
                            </div>

                            <HtmlPreview html={jd.jobdesc} title="Job Description" />
                            <HtmlPreview html={jd.eligibility} title="Eligibility" />
                            <HtmlPreview html={jd.responsibility} title="Responsibilities" />
                            <HtmlPreview html={jd.skills} title="Skills Required" />
                            <HtmlPreview html={jd.benefits} title="Benefits" />

                            {jd.skilltags?.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm">Skill Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jd.skilltags.map((tag) => (
                                            <Badge key={tag} variant="outline">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {jd.tags?.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm">Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jd.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column — metadata & editable fields */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Editable Fields</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <EditableField label="Title" value={jd.title} fieldKey="title" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Company Name" value={jd.companyName} fieldKey="companyName" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Location" value={jd.location} fieldKey="location" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Salary" value={jd.salary} fieldKey="salary" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Job Type" value={jd.jobtype} fieldKey="jobtype" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Batch" value={jd.batch} fieldKey="batch" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Degree" value={jd.degree} fieldKey="degree" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Experience" value={jd.experience} fieldKey="experience" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Work Mode" value={jd.workMode} fieldKey="workMode" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Category" value={jd.category} fieldKey="category" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Role" value={jd.role} fieldKey="role" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="Apply Link" value={jd.link} fieldKey="link" overrides={overrides} onSave={handleOverride} />
                            <EditableField label="About Company" value={jd.aboutCompany} fieldKey="aboutCompany" overrides={overrides} onSave={handleOverride} multiline />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={
                                                job.status === "pending"
                                                    ? "secondary"
                                                    : job.status === "approved"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                        >
                                            {job.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Source</Label>
                                    <p>{job.source}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">AI Provider</Label>
                                    <p>{job.aiProvider}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Platform</Label>
                                    <p>{jd.platform || "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Company Type</Label>
                                    <p>{jd.companytype || "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Job ID</Label>
                                    <p>{jd.jobId || "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Fingerprint</Label>
                                    <p className="truncate text-xs">{job.fingerprint || "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Scraped At</Label>
                                    <p>{new Date(job.scrapedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            {jd.salaryRange && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Salary Range (LPA)</Label>
                                    <p>{jd.salaryRange.from} – {jd.salaryRange.to}</p>
                                </div>
                            )}
                            {job.sourceUrl && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Source URL</Label>
                                    <a
                                        href={job.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1 text-xs break-all"
                                    >
                                        {job.sourceUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                </div>
                            )}
                            {job.companyPageUrl && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Company Page URL</Label>
                                    <a
                                        href={job.companyPageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1 text-xs break-all"
                                    >
                                        {job.companyPageUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reject dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Job</DialogTitle>
                        <DialogDescription>
                            Optionally provide a reason for rejection.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason (optional)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Job</DialogTitle>
                        <DialogDescription>
                            This will permanently remove this job from staging. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StagingDetail;
