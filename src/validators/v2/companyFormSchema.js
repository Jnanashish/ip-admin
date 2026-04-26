import { z } from "zod";

// extractDirtyValues is shared with the job form — re-export so callers
// have one import path. Arrays of primitives (tags, techStack, locations)
// are sent in full whenever any element is dirty (RHF default behaviour);
// the backend replaces these arrays rather than merging.
export { extractDirtyValues } from "./jobFormSchema";

export const COMPANY_TYPES = [
    "product",
    "service",
    "startup",
    "mnc",
    "consulting",
    "unicorn",
    "bigtech",
    "other",
];

export const INDUSTRIES = [
    "Fintech",
    "SaaS",
    "E-commerce",
    "Healthtech",
    "Edtech",
    "Consulting",
    "IT Services",
    "Product",
    "AI/ML",
    "Gaming",
    "Logistics",
    "Media",
    "Other",
];

export const EMPLOYEE_COUNTS = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5000+",
];

export const COMPANY_STATUSES = ["active", "inactive", "archived"];

export const SPONSORSHIP_TIERS = ["none", "featured", "sponsored"];

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const isHttpUrl = (s) => {
    if (!s) return false;
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
};

const optionalString = z.string().trim().optional().or(z.literal(""));
const optionalNumber = z
    .union([z.number(), z.string().regex(/^\d*\.?\d*$/)])
    .optional()
    .or(z.literal(""));

const optionalUrl = z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isHttpUrl(v), "Enter a valid URL");

const logoSchema = z.object({
    icon: optionalString,
    banner: optionalString,
    iconAlt: optionalString,
    bgColor: optionalString.refine(
        (v) => !v || HEX_COLOR_REGEX.test(v),
        "Use #RRGGBB format"
    ),
});

const descriptionSchema = z.object({
    short: z
        .string()
        .trim()
        .max(160, "Max 160 characters")
        .optional()
        .or(z.literal("")),
    long: z.string().default(""),
});

const socialLinksSchema = z.object({
    linkedin: optionalUrl,
    twitter: optionalUrl,
    instagram: optionalUrl,
    glassdoor: optionalUrl,
});

const ratingsSchema = z.object({
    glassdoor: optionalNumber,
    ambitionBox: optionalNumber,
});

const sponsorshipSchema = z.object({
    tier: z.enum(SPONSORSHIP_TIERS),
    activeUntil: optionalString,
});

const seoSchema = z.object({
    metaTitle: optionalString,
    metaDescription: optionalString,
    ogImage: optionalString,
});

export const companyFormSchema = z
    .object({
        companyName: z.string().trim().min(1, "Company name is required"),
        slug: z
            .string()
            .trim()
            .min(1, "Slug is required")
            .regex(
                SLUG_REGEX,
                "Use lowercase letters, numbers, and hyphens only (no leading/trailing/double hyphens)"
            ),

        website: optionalUrl,

        logo: logoSchema.default({
            icon: "",
            banner: "",
            iconAlt: "",
            bgColor: "",
        }),

        description: descriptionSchema.default({ short: "", long: "" }),

        companyType: z.enum(COMPANY_TYPES).optional().or(z.literal("")),
        industry: z.enum(INDUSTRIES).optional().or(z.literal("")),
        tags: z.array(z.string()).default([]),
        techStack: z.array(z.string()).default([]),

        foundedYear: optionalNumber,
        employeeCount: z.enum(EMPLOYEE_COUNTS).optional().or(z.literal("")),
        headquarters: optionalString,
        locations: z.array(z.string()).default([]),

        careerPageLink: optionalUrl,
        socialLinks: socialLinksSchema.default({
            linkedin: "",
            twitter: "",
            instagram: "",
            glassdoor: "",
        }),

        ratings: ratingsSchema.default({ glassdoor: "", ambitionBox: "" }),

        status: z.enum(COMPANY_STATUSES),
        isVerified: z.boolean().default(false),

        sponsorship: sponsorshipSchema.default({
            tier: "none",
            activeUntil: "",
        }),

        seo: seoSchema.default({
            metaTitle: "",
            metaDescription: "",
            ogImage: "",
        }),
    })
    .superRefine((v, ctx) => {
        if (v.sponsorship?.tier && v.sponsorship.tier !== "none") {
            if (!v.sponsorship.activeUntil) {
                ctx.addIssue({
                    path: ["sponsorship", "activeUntil"],
                    code: "custom",
                    message: "Active-until date is required for paid sponsorship",
                });
            }
        }

        const checkRating = (key) => {
            const raw = v.ratings?.[key];
            if (raw === "" || raw === undefined || raw === null) return;
            const num = Number(raw);
            if (Number.isNaN(num) || num < 0 || num > 5) {
                ctx.addIssue({
                    path: ["ratings", key],
                    code: "custom",
                    message: "Rating must be between 0 and 5",
                });
            }
        };
        checkRating("glassdoor");
        checkRating("ambitionBox");

        if (v.foundedYear !== "" && v.foundedYear !== undefined && v.foundedYear !== null) {
            const num = Number(v.foundedYear);
            const currentYear = new Date().getFullYear();
            if (Number.isNaN(num) || num < 1800 || num > currentYear) {
                ctx.addIssue({
                    path: ["foundedYear"],
                    code: "custom",
                    message: `Year must be between 1800 and ${currentYear}`,
                });
            }
        }
    });

export const defaultCompanyValues = () => ({
    companyName: "",
    slug: "",
    website: "",
    logo: { icon: "", banner: "", iconAlt: "", bgColor: "" },
    description: { short: "", long: "" },
    companyType: "",
    industry: "",
    tags: [],
    techStack: [],
    foundedYear: "",
    employeeCount: "",
    headquarters: "",
    locations: [],
    careerPageLink: "",
    socialLinks: { linkedin: "", twitter: "", instagram: "", glassdoor: "" },
    ratings: { glassdoor: "", ambitionBox: "" },
    status: "active",
    isVerified: false,
    sponsorship: { tier: "none", activeUntil: "" },
    seo: { metaTitle: "", metaDescription: "", ogImage: "" },
});

export const mapCompanyResponseToFormValues = (apiCompany = {}) => {
    const defaults = defaultCompanyValues();
    return {
        ...defaults,
        ...apiCompany,
        logo: { ...defaults.logo, ...(apiCompany.logo || {}) },
        description: {
            short: apiCompany.description?.short ?? "",
            long: apiCompany.description?.long ?? "",
        },
        tags: apiCompany.tags ?? [],
        techStack: apiCompany.techStack ?? [],
        foundedYear:
            apiCompany.foundedYear === null || apiCompany.foundedYear === undefined
                ? ""
                : String(apiCompany.foundedYear),
        locations: apiCompany.locations ?? [],
        socialLinks: {
            ...defaults.socialLinks,
            ...(apiCompany.socialLinks || {}),
        },
        ratings: {
            glassdoor:
                apiCompany.ratings?.glassdoor === null ||
                apiCompany.ratings?.glassdoor === undefined
                    ? ""
                    : String(apiCompany.ratings.glassdoor),
            ambitionBox:
                apiCompany.ratings?.ambitionBox === null ||
                apiCompany.ratings?.ambitionBox === undefined
                    ? ""
                    : String(apiCompany.ratings.ambitionBox),
        },
        sponsorship: {
            tier: apiCompany.sponsorship?.tier || "none",
            activeUntil: apiCompany.sponsorship?.activeUntil
                ? String(apiCompany.sponsorship.activeUntil).slice(0, 10)
                : "",
        },
        seo: { ...defaults.seo, ...(apiCompany.seo || {}) },
        isVerified: !!apiCompany.isVerified,
        status: apiCompany.status || "active",
    };
};
