import { z } from "zod";

export const EMPLOYMENT_TYPES = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACTOR",
    "INTERN",
    "TEMPORARY",
];

export const CATEGORIES = [
    "engineering",
    "design",
    "product",
    "data",
    "devops",
    "qa",
    "management",
    "other",
];

export const WORK_MODES = ["onsite", "hybrid", "remote"];

export const APPLY_PLATFORMS = [
    "careerspage",
    "linkedin",
    "cuvette",
    "email",
    "other",
];

export const JOB_STATUSES = [
    "draft",
    "published",
    "paused",
    "expired",
    "archived",
];

export const DISPLAY_MODES = ["internal", "external_redirect"];

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const todayIso = () => new Date().toISOString().slice(0, 10);

const optionalString = z.string().trim().optional().or(z.literal(""));
const optionalNumber = z
    .union([z.number(), z.string().regex(/^\d*$/)])
    .optional()
    .or(z.literal(""));

const locationSchema = z.object({
    city: z.string().trim().optional().or(z.literal("")),
    region: z.string().trim().optional().or(z.literal("")),
    country: z.string().trim().optional().or(z.literal("")),
});

const salarySchema = z.object({
    currency: z.enum(["INR", "USD", "EUR", "GBP"]),
    min: z
        .union([z.string(), z.number()])
        .transform((v) => (v === "" || v === null || v === undefined ? "" : String(v)))
        .optional(),
    max: z
        .union([z.string(), z.number()])
        .transform((v) => (v === "" || v === null || v === undefined ? "" : String(v)))
        .optional(),
    unitText: z.enum(["YEAR", "MONTH", "WEEK", "DAY", "HOUR"]),
});

const seoSchema = z.object({
    metaTitle: optionalString,
    metaDescription: optionalString,
    ogImage: optionalString,
});

export const jobFormSchema = z
    .object({
        title: z.string().trim().min(1, "Title is required"),
        company: z.string().trim().min(1, "Select a company"),
        companyName: z.string().trim().min(1, "Company name is required"),
        displayMode: z.enum(DISPLAY_MODES),
        applyLink: z
            .string()
            .trim()
            .min(1, "Apply link is required")
            .url("Enter a valid URL"),

        employmentType: z
            .array(z.enum(EMPLOYMENT_TYPES))
            .min(1, "Select at least one employment type"),
        category: z.enum(CATEGORIES).optional().or(z.literal("")),
        workMode: z.enum(WORK_MODES).optional().or(z.literal("")),

        batch: z.array(z.number()).min(1, "Select at least one batch year"),
        degree: z.array(z.string()).default([]),
        experience: z
            .object({
                min: optionalNumber,
                max: optionalNumber,
            })
            .default({ min: "", max: "" }),

        jobLocation: z.array(locationSchema).default([]),

        baseSalary: salarySchema,

        jobDescription: z
            .object({
                html: z.string().default(""),
            })
            .default({ html: "" }),

        requiredSkills: z.array(z.string()).default([]),
        preferredSkills: z.array(z.string()).default([]),
        topicTags: z.array(z.string()).default([]),

        applyPlatform: z.enum(APPLY_PLATFORMS).optional().or(z.literal("")),

        datePosted: z.string().min(1, "Date posted is required"),
        validThrough: z.string().optional().or(z.literal("")),

        status: z.enum(JOB_STATUSES),
        isVerified: z.boolean().default(false),

        seo: seoSchema.default({ metaTitle: "", metaDescription: "", ogImage: "" }),

        slug: z
            .string()
            .trim()
            .min(1, "Slug is required")
            .regex(
                SLUG_REGEX,
                "Use lowercase letters, numbers, and hyphens only (no leading/trailing/double hyphens)"
            ),
    })
    .superRefine((v, ctx) => {
        if (v.displayMode === "internal") {
            const html = v.jobDescription?.html?.trim?.() || "";
            if (!html) {
                ctx.addIssue({
                    path: ["jobDescription", "html"],
                    code: "custom",
                    message: "Job description is required for internal jobs",
                });
            }
        }

        const minStr = v.experience?.min;
        const maxStr = v.experience?.max;
        const minNum = minStr === "" || minStr === undefined ? null : Number(minStr);
        const maxNum = maxStr === "" || maxStr === undefined ? null : Number(maxStr);
        if (minNum !== null && maxNum !== null && minNum > maxNum) {
            ctx.addIssue({
                path: ["experience", "max"],
                code: "custom",
                message: "Max experience must be ≥ min",
            });
        }
    });

export const defaultJobValues = () => ({
    title: "",
    company: "",
    companyName: "",
    displayMode: "internal",
    applyLink: "",

    employmentType: [],
    category: "",
    workMode: "",

    batch: [],
    degree: [],
    experience: { min: "", max: "" },

    jobLocation: [],

    baseSalary: { currency: "INR", min: "", max: "", unitText: "YEAR" },

    jobDescription: { html: "" },

    requiredSkills: [],
    preferredSkills: [],
    topicTags: [],

    applyPlatform: "",

    datePosted: todayIso(),
    validThrough: "",

    status: "draft",
    isVerified: false,

    seo: { metaTitle: "", metaDescription: "", ogImage: "" },

    slug: "",
});

export const mapJobResponseToFormValues = (apiJob = {}) => {
    const defaults = defaultJobValues();
    const company =
        typeof apiJob.company === "object" && apiJob.company
            ? apiJob.company.id || apiJob.company._id || ""
            : apiJob.company || "";
    const companyName =
        apiJob.companyName ||
        (typeof apiJob.company === "object" ? apiJob.company?.name : "") ||
        "";

    return {
        ...defaults,
        ...apiJob,
        company,
        companyName,
        employmentType: apiJob.employmentType ?? [],
        batch: apiJob.batch ?? [],
        degree: apiJob.degree ?? [],
        experience: {
            min: apiJob.experience?.min ?? "",
            max: apiJob.experience?.max ?? "",
        },
        jobLocation: apiJob.jobLocation ?? [],
        baseSalary: {
            ...defaults.baseSalary,
            ...(apiJob.baseSalary || {}),
            min: apiJob.baseSalary?.min ?? "",
            max: apiJob.baseSalary?.max ?? "",
        },
        jobDescription: { html: apiJob.jobDescription?.html ?? "" },
        requiredSkills: apiJob.requiredSkills ?? [],
        preferredSkills: apiJob.preferredSkills ?? [],
        topicTags: apiJob.topicTags ?? [],
        seo: { ...defaults.seo, ...(apiJob.seo || {}) },
        datePosted: apiJob.datePosted ? String(apiJob.datePosted).slice(0, 10) : "",
        validThrough: apiJob.validThrough ? String(apiJob.validThrough).slice(0, 10) : "",
        isVerified: !!apiJob.isVerified,
    };
};

const isPlainObject = (v) =>
    v !== null && typeof v === "object" && !Array.isArray(v);

export const extractDirtyValues = (values, dirtyFields) => {
    if (dirtyFields === true) return values;
    if (Array.isArray(dirtyFields)) {
        const anyDirty = dirtyFields.some((entry) =>
            entry === true || (isPlainObject(entry) && Object.keys(entry).length > 0)
        );
        return anyDirty ? values : undefined;
    }
    if (isPlainObject(dirtyFields)) {
        const out = {};
        Object.keys(dirtyFields).forEach((key) => {
            const sub = extractDirtyValues(values?.[key], dirtyFields[key]);
            if (sub !== undefined) out[key] = sub;
        });
        return Object.keys(out).length === 0 ? undefined : out;
    }
    return undefined;
};
