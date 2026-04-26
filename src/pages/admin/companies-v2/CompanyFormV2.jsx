import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
import { Textarea } from "Components/ui/textarea";
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

import SlugField from "Components/forms/v2/SlugField";
import StatusDropdown from "Components/forms/v2/StatusDropdown";
import TagInput from "Components/forms/v2/TagInput";
import SeoSection from "Components/forms/v2/SeoSection";
import RichTextEditor from "Components/forms/v2/RichTextEditor";

import {
    companyFormSchema,
    defaultCompanyValues,
    extractDirtyValues,
    COMPANY_TYPES,
    INDUSTRIES,
    EMPLOYEE_COUNTS,
    SPONSORSHIP_TIERS,
} from "validators/v2/companyFormSchema";
import {
    createCompanyV2,
    updateCompanyV2,
    deleteCompanyV2,
} from "api/v2/companies";
import {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
} from "Helpers/toast";
import { cn } from "lib/utils";

const CURRENT_YEAR = new Date().getFullYear();

const slugifyCompany = ({ name = "" } = {}) =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const titleCase = (s) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const isHttpsUrl = (s) => {
    if (!s) return false;
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
};

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

const SLUG_TAKEN_MESSAGE =
    "A company with this slug already exists. Try a custom slug.";

const CompanyFormV2 = ({
    mode = "create",
    companyId,
    initialValues,
    openJobsCount,
}) => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteBlock, setDeleteBlock] = useState(null);
    const [bannerError, setBannerError] = useState(false);
    const [iconError, setIconError] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        formState: { errors, dirtyFields },
    } = useForm({
        resolver: zodResolver(companyFormSchema),
        defaultValues: initialValues || defaultCompanyValues(),
        mode: "onBlur",
    });

    const watched = useWatch({ control });

    const websiteValid = isHttpsUrl(watched.website);
    const bannerValid = isHttpsUrl(watched.logo?.banner);
    const iconValid = isHttpsUrl(watched.logo?.icon);

    const shortLen = watched.description?.short?.length || 0;
    const shortOver = shortLen > 160;

    const fetchLogo = () => {
        try {
            const u = new URL(watched.website);
            setValue(
                "logo.icon",
                `https://logo.clearbit.com/${u.hostname}`,
                { shouldDirty: true }
            );
            setIconError(false);
        } catch {
            showErrorToast("Enter a valid website URL first");
        }
    };

    const seoAutoFill = { name: watched.companyName };

    const generateMetaTitle = ({ name }) =>
        name ? `${name} — Careers & Jobs at CareersAt.Tech` : "";

    const generateMetaDescription = ({ name }) => {
        if (!name) return "";
        const fallback = `Find fresher tech jobs at ${name}. Apply for open roles at ${name} on CareersAt.Tech.`;
        const short = (watched.description?.short || "").trim();
        const text = short || fallback;
        return text.length > 155 ? text.slice(0, 155) : text;
    };

    const submit = handleSubmit(async (values) => {
        setSubmitting(true);
        try {
            if (mode === "create") {
                const res = await createCompanyV2(values);
                if (res.status === 201 || res.status === 200) {
                    showSuccessToast("Company created");
                    const newId = res.data?.id || res.data?._id;
                    if (newId) {
                        navigate(`/admin/companies/${newId}/edit`, {
                            replace: true,
                        });
                    }
                    return;
                }
                if (res.status === 409) {
                    setError("slug", {
                        type: "server",
                        message: SLUG_TAKEN_MESSAGE,
                    });
                    return;
                }
                if (res.status === 400) {
                    if (!applyServerErrors(setError, res.error)) {
                        showErrorToast(res.error?.message || "Validation failed");
                    }
                    return;
                }
                showErrorToast(
                    res.error?.message ||
                        "Something went wrong. Please try again."
                );
            } else {
                const partial = extractDirtyValues(values, dirtyFields) || {};
                // tier→none transitions need the full sponsorship object so
                // activeUntil is cleared server-side even if it's not dirty.
                if (dirtyFields?.sponsorship?.tier) {
                    partial.sponsorship = values.sponsorship;
                }
                if (Object.keys(partial).length === 0) {
                    showInfoToast("No changes to save");
                    return;
                }
                const res = await updateCompanyV2(companyId, partial);
                if (res.status === 200 || res.status === 201) {
                    showSuccessToast("Company updated");
                    reset(values, { keepValues: false });
                    return;
                }
                if (res.status === 409) {
                    setError("slug", {
                        type: "server",
                        message: SLUG_TAKEN_MESSAGE,
                    });
                    return;
                }
                if (res.status === 400) {
                    if (!applyServerErrors(setError, res.error)) {
                        showErrorToast(res.error?.message || "Validation failed");
                    }
                    return;
                }
                showErrorToast(
                    res.error?.message ||
                        "Something went wrong. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    });

    const onDeleteConfirm = async () => {
        if (!companyId) return;
        setDeleting(true);
        try {
            const res = await deleteCompanyV2(companyId);
            if (res.status === 200 || res.status === 204) {
                showSuccessToast("Company deleted");
                // /admin/companies listing lands in a later phase; the
                // legacy /companys route is the current stand-in.
                navigate("/admin/companies");
            } else if (res.status === 409) {
                const count =
                    res.error?.activeJobsCount ?? res.error?.count ?? null;
                setDeleteBlock({ activeJobsCount: count });
                setConfirmDelete(false);
            } else {
                showErrorToast(
                    res.error?.message || "Failed to delete company"
                );
            }
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="px-4 lg:px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                    {mode === "create" ? "Create company" : "Edit company"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {mode === "create"
                        ? "Fill out the sections below and save to create a company record."
                        : "Update fields and save. Only changed fields are sent."}
                </p>
            </div>

            <form
                className="space-y-6"
                onSubmit={(e) => e.preventDefault()}
            >
                {/* Section 1 — Identity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Identity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="companyName">Company name</Label>
                            <Input
                                id="companyName"
                                {...register("companyName")}
                                placeholder="Acme Corp"
                                aria-invalid={!!errors.companyName}
                            />
                            {errors.companyName && (
                                <p className="text-xs text-destructive">
                                    {errors.companyName.message}
                                </p>
                            )}
                        </div>

                        <SlugField
                            name="slug"
                            control={control}
                            autoGenerateFrom={{ name: watched.companyName }}
                            generate={slugifyCompany}
                            mode={mode}
                            previewPrefix="careersat.tech/companies/"
                        />
                    </CardContent>
                </Card>

                {/* Section 2 — Branding */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                {...register("website")}
                                placeholder="https://acme.example"
                                aria-invalid={!!errors.website}
                            />
                            {errors.website && (
                                <p className="text-xs text-destructive">
                                    {errors.website.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="logo.icon">Logo icon URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="logo.icon"
                                    {...register("logo.icon", {
                                        onChange: () => setIconError(false),
                                    })}
                                    placeholder="https://..."
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchLogo}
                                    disabled={!websiteValid}
                                    className="shrink-0"
                                    title={
                                        websiteValid
                                            ? "Fetch logo from website hostname"
                                            : "Enter a valid website first"
                                    }
                                >
                                    Auto-fetch from website
                                </Button>
                            </div>
                            {iconValid && !iconError && (
                                <img
                                    src={watched.logo.icon}
                                    alt="Logo preview"
                                    className="h-12 w-12 rounded-md border object-contain bg-muted"
                                    onError={() => setIconError(true)}
                                />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="logo.banner">
                                Banner URL{" "}
                                <span className="text-xs text-muted-foreground">
                                    (3:1 aspect)
                                </span>
                            </Label>
                            <Input
                                id="logo.banner"
                                {...register("logo.banner", {
                                    onChange: () => setBannerError(false),
                                })}
                                placeholder="https://..."
                            />
                            {bannerValid && !bannerError && (
                                <img
                                    src={watched.logo.banner}
                                    alt="Banner preview"
                                    className="aspect-[3/1] w-full max-w-md object-cover rounded-md border"
                                    onError={() => setBannerError(true)}
                                />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="logo.iconAlt">
                                Logo alt text
                            </Label>
                            <Input
                                id="logo.iconAlt"
                                {...register("logo.iconAlt")}
                                placeholder="Acme Corp logo"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="logo.bgColor">
                                Background color
                            </Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    aria-label="Pick background color"
                                    value={
                                        /^#[0-9a-fA-F]{6}$/.test(
                                            watched.logo?.bgColor || ""
                                        )
                                            ? watched.logo.bgColor
                                            : "#ffffff"
                                    }
                                    onChange={(e) =>
                                        setValue(
                                            "logo.bgColor",
                                            e.target.value,
                                            { shouldDirty: true }
                                        )
                                    }
                                    className="h-9 w-12 rounded-md border cursor-pointer p-0"
                                />
                                <Input
                                    id="logo.bgColor"
                                    {...register("logo.bgColor")}
                                    placeholder="#1A8FE3"
                                    className="max-w-[160px] font-mono"
                                    aria-invalid={!!errors.logo?.bgColor}
                                />
                            </div>
                            {errors.logo?.bgColor && (
                                <p className="text-xs text-destructive">
                                    {errors.logo.bgColor.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3 — Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="description.short">
                                Short description
                            </Label>
                            <Textarea
                                id="description.short"
                                rows={3}
                                {...register("description.short")}
                                placeholder="One-line pitch (max 160 characters)"
                                aria-invalid={!!errors.description?.short}
                            />
                            <div className="flex items-center justify-between">
                                {errors.description?.short ? (
                                    <p className="text-xs text-destructive">
                                        {errors.description.short.message}
                                    </p>
                                ) : (
                                    <span />
                                )}
                                <span
                                    className={cn(
                                        "text-xs",
                                        shortOver
                                            ? "text-destructive"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {shortLen}/160
                                </span>
                            </div>
                        </div>

                        <RichTextEditor
                            name="description.long"
                            control={control}
                            label="About the company"
                            helperText="Long-form blurb. Headings, bullets, and links are supported."
                        />
                    </CardContent>
                </Card>

                {/* Section 4 — Classification */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Classification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="companyType">
                                    Company type
                                </Label>
                                <Select
                                    value={watched.companyType || undefined}
                                    onValueChange={(v) =>
                                        setValue("companyType", v, {
                                            shouldDirty: true,
                                        })
                                    }
                                >
                                    <SelectTrigger id="companyType">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMPANY_TYPES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {titleCase(c)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="industry">Industry</Label>
                                <Select
                                    value={watched.industry || undefined}
                                    onValueChange={(v) =>
                                        setValue("industry", v, {
                                            shouldDirty: true,
                                        })
                                    }
                                >
                                    <SelectTrigger id="industry">
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <TagInput
                            name="tags"
                            control={control}
                            label="Tags"
                            placeholder="e.g. fintech, b2b — Enter to add"
                        />
                        <TagInput
                            name="techStack"
                            control={control}
                            label="Tech stack"
                            placeholder="e.g. React, Node.js, Python"
                        />
                    </CardContent>
                </Card>

                {/* Section 5 — Meta */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Meta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="foundedYear">
                                    Founded year
                                </Label>
                                <Input
                                    id="foundedYear"
                                    type="number"
                                    min={1800}
                                    max={CURRENT_YEAR}
                                    {...register("foundedYear")}
                                    aria-invalid={!!errors.foundedYear}
                                />
                                {errors.foundedYear && (
                                    <p className="text-xs text-destructive">
                                        {errors.foundedYear.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="employeeCount">
                                    Employee count
                                </Label>
                                <Select
                                    value={watched.employeeCount || undefined}
                                    onValueChange={(v) =>
                                        setValue("employeeCount", v, {
                                            shouldDirty: true,
                                        })
                                    }
                                >
                                    <SelectTrigger id="employeeCount">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EMPLOYEE_COUNTS.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="headquarters">
                                Headquarters
                            </Label>
                            <Input
                                id="headquarters"
                                {...register("headquarters")}
                                placeholder="e.g. Bangalore, India"
                            />
                        </div>

                        <TagInput
                            name="locations"
                            control={control}
                            label="Office locations"
                            placeholder="e.g. Bangalore, Berlin — Enter to add"
                        />
                    </CardContent>
                </Card>

                {/* Section 6 — External links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            External links
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="careerPageLink">
                                Careers page
                            </Label>
                            <Input
                                id="careerPageLink"
                                type="url"
                                {...register("careerPageLink")}
                                placeholder="https://acme.example/careers"
                                aria-invalid={!!errors.careerPageLink}
                            />
                            {errors.careerPageLink && (
                                <p className="text-xs text-destructive">
                                    {errors.careerPageLink.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="socialLinks.linkedin">
                                    LinkedIn
                                </Label>
                                <Input
                                    id="socialLinks.linkedin"
                                    type="url"
                                    {...register("socialLinks.linkedin")}
                                    placeholder="https://linkedin.com/company/..."
                                    aria-invalid={
                                        !!errors.socialLinks?.linkedin
                                    }
                                />
                                {errors.socialLinks?.linkedin && (
                                    <p className="text-xs text-destructive">
                                        {errors.socialLinks.linkedin.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="socialLinks.twitter">
                                    Twitter / X
                                </Label>
                                <Input
                                    id="socialLinks.twitter"
                                    type="url"
                                    {...register("socialLinks.twitter")}
                                    placeholder="https://twitter.com/..."
                                    aria-invalid={
                                        !!errors.socialLinks?.twitter
                                    }
                                />
                                {errors.socialLinks?.twitter && (
                                    <p className="text-xs text-destructive">
                                        {errors.socialLinks.twitter.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="socialLinks.instagram">
                                    Instagram
                                </Label>
                                <Input
                                    id="socialLinks.instagram"
                                    type="url"
                                    {...register("socialLinks.instagram")}
                                    placeholder="https://instagram.com/..."
                                    aria-invalid={
                                        !!errors.socialLinks?.instagram
                                    }
                                />
                                {errors.socialLinks?.instagram && (
                                    <p className="text-xs text-destructive">
                                        {errors.socialLinks.instagram.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="socialLinks.glassdoor">
                                    Glassdoor
                                </Label>
                                <Input
                                    id="socialLinks.glassdoor"
                                    type="url"
                                    {...register("socialLinks.glassdoor")}
                                    placeholder="https://glassdoor.com/..."
                                    aria-invalid={
                                        !!errors.socialLinks?.glassdoor
                                    }
                                />
                                {errors.socialLinks?.glassdoor && (
                                    <p className="text-xs text-destructive">
                                        {errors.socialLinks.glassdoor.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 7 — Ratings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Ratings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="ratings.glassdoor">
                                    Glassdoor (0–5)
                                </Label>
                                <Input
                                    id="ratings.glassdoor"
                                    type="number"
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    {...register("ratings.glassdoor")}
                                    aria-invalid={!!errors.ratings?.glassdoor}
                                />
                                {errors.ratings?.glassdoor && (
                                    <p className="text-xs text-destructive">
                                        {errors.ratings.glassdoor.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="ratings.ambitionBox">
                                    AmbitionBox (0–5)
                                </Label>
                                <Input
                                    id="ratings.ambitionBox"
                                    type="number"
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    {...register("ratings.ambitionBox")}
                                    aria-invalid={
                                        !!errors.ratings?.ambitionBox
                                    }
                                />
                                {errors.ratings?.ambitionBox && (
                                    <p className="text-xs text-destructive">
                                        {errors.ratings.ambitionBox.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 8 — Lifecycle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Lifecycle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <StatusDropdown
                            name="status"
                            control={control}
                            variant="company"
                        />

                        {typeof openJobsCount === "number" &&
                            openJobsCount >= 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {openJobsCount} active{" "}
                                    {openJobsCount === 1 ? "job" : "jobs"}{" "}
                                    reference this company.
                                </p>
                            )}

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="isVerified"
                                checked={!!watched.isVerified}
                                onCheckedChange={(v) =>
                                    setValue("isVerified", !!v, {
                                        shouldDirty: true,
                                    })
                                }
                            />
                            <Label
                                htmlFor="isVerified"
                                className="cursor-pointer"
                            >
                                Verified company
                            </Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sponsorship.tier">
                                    Sponsorship tier
                                </Label>
                                <Select
                                    value={
                                        watched.sponsorship?.tier || "none"
                                    }
                                    onValueChange={(v) =>
                                        setValue("sponsorship.tier", v, {
                                            shouldDirty: true,
                                        })
                                    }
                                >
                                    <SelectTrigger id="sponsorship.tier">
                                        <SelectValue placeholder="Select tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPONSORSHIP_TIERS.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {titleCase(c)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {watched.sponsorship?.tier &&
                                watched.sponsorship.tier !== "none" && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sponsorship.activeUntil">
                                            Active until
                                        </Label>
                                        <Input
                                            id="sponsorship.activeUntil"
                                            type="date"
                                            {...register(
                                                "sponsorship.activeUntil"
                                            )}
                                            aria-invalid={
                                                !!errors.sponsorship
                                                    ?.activeUntil
                                            }
                                        />
                                        {errors.sponsorship?.activeUntil && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    errors.sponsorship
                                                        .activeUntil.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 9 — SEO */}
                <SeoSection
                    name="seo"
                    control={control}
                    autoFillFrom={seoAutoFill}
                    generateMetaTitle={generateMetaTitle}
                    generateMetaDescription={generateMetaDescription}
                />
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
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={submitting}
                    >
                        {submitting ? "Saving…" : "Save changes"}
                    </Button>
                </div>
            </div>

            <Dialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this company?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the company record.
                            This action cannot be undone.
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

            <Dialog
                open={!!deleteBlock}
                onOpenChange={(o) => !o && setDeleteBlock(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cannot delete company</DialogTitle>
                        <DialogDescription>
                            {deleteBlock?.activeJobsCount != null
                                ? `This company has ${deleteBlock.activeJobsCount} active ${
                                      deleteBlock.activeJobsCount === 1
                                          ? "job"
                                          : "jobs"
                                  }. Archive or reassign them first.`
                                : "This company has active jobs. Archive or reassign them first."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteBlock(null)}
                        >
                            Close
                        </Button>
                        {/* /admin/jobs listing v2 lands in a later phase. */}
                        <Button asChild>
                            <Link
                                to={`/admin/jobs?company=${encodeURIComponent(
                                    companyId || ""
                                )}`}
                            >
                                View jobs
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CompanyFormV2;
