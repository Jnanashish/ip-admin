import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Trash2, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "Components/ui/dialog";

import BatchYearChips from "Components/forms/v2/BatchYearChips";
import EmploymentTypeMultiSelect from "Components/forms/v2/EmploymentTypeMultiSelect";
import JobLocationRepeater from "Components/forms/v2/JobLocationRepeater";
import ReadinessIndicator, {
    computeReadiness,
} from "Components/forms/v2/ReadinessIndicator";
import ReadinessChecklist from "Components/forms/v2/ReadinessChecklist";
import SalaryFields from "Components/forms/v2/SalaryFields";
import SeoSection from "Components/forms/v2/SeoSection";
import SlugField from "Components/forms/v2/SlugField";
import StatusDropdown from "Components/forms/v2/StatusDropdown";
import CompanyAsyncSelect from "Components/forms/v2/CompanyAsyncSelect";
import TagInput from "Components/forms/v2/TagInput";
import RichTextEditor from "Components/forms/v2/RichTextEditor";
import DisplayModeRadio from "Components/forms/v2/DisplayModeRadio";

import {
    jobFormSchema,
    defaultJobValues,
    extractDirtyValues,
    CATEGORIES,
    WORK_MODES,
    APPLY_PLATFORMS,
} from "validators/v2/jobFormSchema";
import { createJobV2, updateJobV2, deleteJobV2, listJobsV2 } from "api/v2/jobs";
import {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
} from "Helpers/toast";

const FRONTEND_URL =
    process.env.REACT_APP_FRONTEND_URL || "https://careersat.tech";

const slugify = (input = {}) => {
    const { companyName = "", title = "" } = input;
    return `${title} ${companyName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const titleCase = (s) =>
    s
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

const applyServerErrors = (setError, error) => {
    if (!error) return false;
    const fieldErrors =
        error.fieldErrors || error.errors || error.details || null;
    if (!fieldErrors) return false;
    let applied = false;
    if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((fe) => {
            const path = fe.path || fe.field;
            const message = fe.message || fe.error;
            if (path && message) {
                setError(path, { type: "server", message });
                applied = true;
            }
        });
    } else if (typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([path, message]) => {
            const msg = typeof message === "string" ? message : message?.message;
            if (msg) {
                setError(path, { type: "server", message: msg });
                applied = true;
            }
        });
    }
    return applied;
};

const JobFormV2 = ({ mode = "create", jobId, initialValues }) => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [skillSuggestions, setSkillSuggestions] = useState([]);

    const {
        control,
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        formState: { errors, dirtyFields },
    } = useForm({
        resolver: zodResolver(jobFormSchema),
        defaultValues: initialValues || defaultJobValues(),
        mode: "onBlur",
    });

    useEffect(() => {
        let cancelled = false;
        listJobsV2({ limit: 0 })
            .then((res) => {
                if (cancelled) return;
                const list = Array.isArray(res?.data)
                    ? res.data
                    : res?.data?.items || res?.data?.data || [];
                const set = new Set();
                list.forEach((j) => {
                    (j?.requiredSkills || []).forEach((s) => {
                        if (typeof s === "string" && s.trim()) set.add(s.trim());
                    });
                });
                setSkillSuggestions(Array.from(set).sort());
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const watched = useWatch({ control });

    const readinessJob = useMemo(
        () => ({
            title: watched.title,
            slug: watched.slug,
            company: watched.company,
            employmentType: watched.employmentType,
            batch: watched.batch,
            validThrough: watched.validThrough,
            jobLocation: watched.jobLocation,
            datePosted: watched.datePosted,
            displayMode: watched.displayMode,
            jobDescription: watched.jobDescription,
        }),
        [watched]
    );

    const readiness = computeReadiness(readinessJob);

    const isInternal = watched.displayMode === "internal";
    const showDeadlineWarning =
        watched.status === "published" && !watched.validThrough;

    const seoAutoFill = {
        title: watched.title,
        companyName: watched.companyName,
        batch: watched.batch,
        location: watched.jobLocation?.[0]?.city,
    };

    const submit = async (values, intendedStatus) => {
        const payload = { ...values, status: intendedStatus || values.status };
        setSubmitting(true);
        try {
            if (mode === "create") {
                const res = await createJobV2(payload);
                if (res.status === 201 || res.status === 200) {
                    showSuccessToast("Job created");
                    const newId = res.data?.id || res.data?._id;
                    if (newId) {
                        navigate(`/admin/jobs/${newId}/edit`, { replace: true });
                    }
                    return;
                }
                if (res.status === 409) {
                    showErrorToast("Slug already taken — try regenerating");
                    return;
                }
                if (res.status === 400) {
                    if (!applyServerErrors(setError, res.error)) {
                        showErrorToast(res.error?.message || "Validation failed");
                    }
                    return;
                }
                showErrorToast(
                    res.error?.message || "Something went wrong. Please try again."
                );
            } else {
                const partial = extractDirtyValues(payload, dirtyFields) || {};
                if (intendedStatus) partial.status = intendedStatus;
                if (Object.keys(partial).length === 0) {
                    showInfoToast("No changes to save");
                    return;
                }
                const res = await updateJobV2(jobId, partial);
                if (res.status === 200 || res.status === 201) {
                    showSuccessToast("Job updated");
                    reset(payload, { keepValues: false });
                    return;
                }
                if (res.status === 409) {
                    showErrorToast("Slug already taken — try regenerating");
                    return;
                }
                if (res.status === 400) {
                    if (!applyServerErrors(setError, res.error)) {
                        showErrorToast(res.error?.message || "Validation failed");
                    }
                    return;
                }
                showErrorToast(
                    res.error?.message || "Something went wrong. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const onSaveDraft = handleSubmit((v) => submit(v));
    const onPublish = handleSubmit((v) => submit(v, "published"));

    const handleJumpToSection = (id) => {
        if (typeof document === "undefined") return;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const isPublished = watched.status === "published";
    const previewUrl =
        watched.slug ? `${FRONTEND_URL}/jobs/${watched.slug}` : "";
    const canRichResultsTest = isPublished && !!watched.slug;
    const canPreview = isPublished && !!watched.slug;

    const openRichResultsTest = () => {
        if (!canRichResultsTest) return;
        const target = `https://search.google.com/test/rich-results?url=${encodeURIComponent(
            previewUrl
        )}`;
        window.open(target, "_blank", "noopener");
    };

    const openPreview = () => {
        if (!canPreview) return;
        window.open(previewUrl, "_blank", "noopener");
    };

    const onDeleteConfirm = async () => {
        if (!jobId) return;
        setDeleting(true);
        try {
            const res = await deleteJobV2(jobId);
            if (res.status === 200 || res.status === 204) {
                showSuccessToast("Job deleted");
                // /admin/jobs listing lands in A5; legacy /jobs is the stand-in.
                navigate("/admin/jobs");
            } else {
                showErrorToast(res.error?.message || "Failed to delete job");
            }
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className="px-4 lg:px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {mode === "create" ? "Create job" : "Edit job"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {mode === "create"
                            ? "Fill out the sections below. Save as Draft any time; Publish unlocks once Readiness is green."
                            : "Update fields and save. Only changed fields are sent."}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {mode === "edit" && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openRichResultsTest}
                                disabled={!canRichResultsTest}
                                title={
                                    canRichResultsTest
                                        ? "Open Google Rich Results test for this job"
                                        : isPublished
                                          ? "Save with a slug first"
                                          : "Publish the job first"
                                }
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Test on Google Rich Results
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openPreview}
                                disabled={!canPreview}
                                title={
                                    canPreview
                                        ? "Open the public job page in a new tab"
                                        : isPublished
                                          ? "Save with a slug first"
                                          : "Publish the job first"
                                }
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Preview on site
                            </Button>
                        </div>
                    )}
                    <ReadinessIndicator job={readinessJob} />
                </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Section 1: Basics */}
                <Card id="section-basics">
                    <CardHeader>
                        <CardTitle className="text-lg">Basics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                {...register("title")}
                                placeholder="Frontend Engineer"
                                aria-invalid={!!errors.title}
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <CompanyAsyncSelect
                            name="company"
                            companyNameField="companyName"
                            control={control}
                            setValue={setValue}
                        />

                        <div className="space-y-1.5">
                            <Label htmlFor="companyName">Company name</Label>
                            <Input
                                id="companyName"
                                {...register("companyName")}
                                readOnly
                                disabled
                                placeholder="Auto-filled from selected company"
                            />
                        </div>

                        <DisplayModeRadio name="displayMode" control={control} />

                        <div className="space-y-1.5">
                            <Label htmlFor="applyLink">Apply link</Label>
                            <Input
                                id="applyLink"
                                type="url"
                                {...register("applyLink")}
                                placeholder="https://example.com/careers/123"
                                aria-invalid={!!errors.applyLink}
                            />
                            {errors.applyLink && (
                                <p className="text-xs text-destructive">
                                    {errors.applyLink.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Classification */}
                <Card id="section-classification">
                    <CardHeader>
                        <CardTitle className="text-lg">Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <EmploymentTypeMultiSelect
                            name="employmentType"
                            control={control}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={watched.category || undefined}
                                    onValueChange={(v) =>
                                        setValue("category", v, { shouldDirty: true })
                                    }
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {titleCase(c)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="workMode">Work mode</Label>
                                <Select
                                    value={watched.workMode || undefined}
                                    onValueChange={(v) =>
                                        setValue("workMode", v, { shouldDirty: true })
                                    }
                                >
                                    <SelectTrigger id="workMode">
                                        <SelectValue placeholder="Select work mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WORK_MODES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {titleCase(c)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Eligibility */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Eligibility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <BatchYearChips name="batch" control={control} />

                        <TagInput
                            name="degree"
                            control={control}
                            label="Degree"
                            placeholder="e.g. B.Tech, B.E., MCA — press Enter"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="experience.min">Min experience (years)</Label>
                                <Input
                                    id="experience.min"
                                    type="number"
                                    min={0}
                                    {...register("experience.min")}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="experience.max">Max experience (years)</Label>
                                <Input
                                    id="experience.max"
                                    type="number"
                                    min={0}
                                    {...register("experience.max")}
                                    aria-invalid={!!errors.experience?.max}
                                />
                                {errors.experience?.max && (
                                    <p className="text-xs text-destructive">
                                        {errors.experience.max.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Location */}
                <Card id="section-location">
                    <CardHeader>
                        <CardTitle className="text-lg">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <JobLocationRepeater name="jobLocation" control={control} />
                    </CardContent>
                </Card>

                {/* Section 5: Compensation */}
                <SalaryFields name="baseSalary" control={control} />

                {/* Section 6: Description (conditional) */}
                {isInternal && (
                    <Card id="section-description">
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RichTextEditor
                                name="jobDescription.html"
                                control={control}
                                label="Job description"
                                helperText="Tip: Use clear headings for Responsibilities, Requirements, and Benefits."
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Section 7: Skills & Tags */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Skills & Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <TagInput
                            name="requiredSkills"
                            control={control}
                            label="Required skills"
                            placeholder="e.g. React, TypeScript"
                            suggestions={skillSuggestions}
                        />
                        <TagInput
                            name="preferredSkills"
                            control={control}
                            label="Preferred skills"
                            placeholder="Nice-to-haves"
                        />
                        <TagInput
                            name="topicTags"
                            control={control}
                            label="Topic tags"
                            placeholder="e.g. fintech, ai, remote"
                        />
                    </CardContent>
                </Card>

                {/* Section 8: Apply platform */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Apply platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1.5">
                            <Label htmlFor="applyPlatform">Where do candidates apply?</Label>
                            <Select
                                value={watched.applyPlatform || undefined}
                                onValueChange={(v) =>
                                    setValue("applyPlatform", v, { shouldDirty: true })
                                }
                            >
                                <SelectTrigger id="applyPlatform">
                                    <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPLY_PLATFORMS.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {titleCase(c)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 9: Dates */}
                <Card id="section-dates">
                    <CardHeader>
                        <CardTitle className="text-lg">Dates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="datePosted">Date posted</Label>
                                <Input
                                    id="datePosted"
                                    type="date"
                                    {...register("datePosted")}
                                    aria-invalid={!!errors.datePosted}
                                />
                                {errors.datePosted && (
                                    <p className="text-xs text-destructive">
                                        {errors.datePosted.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="validThrough">Application deadline</Label>
                                <Input
                                    id="validThrough"
                                    type="date"
                                    {...register("validThrough")}
                                />
                                {showDeadlineWarning && (
                                    <p className="text-xs text-amber-600">
                                        Published jobs should have a deadline.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 10: Lifecycle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Lifecycle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <StatusDropdown name="status" control={control} variant="job" />
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="isVerified"
                                checked={!!watched.isVerified}
                                onCheckedChange={(v) =>
                                    setValue("isVerified", !!v, { shouldDirty: true })
                                }
                            />
                            <Label htmlFor="isVerified" className="cursor-pointer">
                                Verified job
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {mode === "edit" && (
                    <ReadinessChecklist
                        job={watched}
                        onJumpToSection={handleJumpToSection}
                    />
                )}

                {/* Section 11: SEO */}
                <SeoSection name="seo" control={control} autoFillFrom={seoAutoFill} />

                {/* Section 12: Slug */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Slug</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SlugField
                            name="slug"
                            control={control}
                            autoGenerateFrom={{
                                companyName: watched.companyName,
                                title: watched.title,
                            }}
                            generate={slugify}
                            mode={mode}
                        />
                    </CardContent>
                </Card>
            </form>

            {/* Sticky footer */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-40">
                <div className="max-w-4xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
                    <div>
                        {mode === "edit" && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setConfirmDelete(true)}
                                disabled={submitting || deleting}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSaveDraft}
                            disabled={submitting}
                        >
                            Save as Draft
                        </Button>
                        <Button
                            type="button"
                            onClick={onPublish}
                            disabled={submitting || !readiness.ready}
                            title={
                                readiness.ready
                                    ? "Publish this job"
                                    : "Fill all required fields to publish"
                            }
                        >
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this job?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the job posting. This action cannot
                            be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDeleteConfirm}
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

export default JobFormV2;
