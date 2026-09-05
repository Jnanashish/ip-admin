/**
 * "Best to post" scoring for the jobs listing.
 *
 * A job is a good social-post candidate when all three hold:
 *   1. The company has a logo (banner generation needs one).
 *   2. The company is a known one — companyType in KNOWN_COMPANY_TYPES.
 *   3. It is a fresher role — the experience range sits inside 0–4 years.
 *
 * Company data comes from the `companyMap` the jobs list hydrates lazily, so
 * callers should expect `eligible: false` until the map is populated.
 */

export const KNOWN_COMPANY_TYPES = ["bigtech", "mnc", "unicorn", "product"];

export const FRESHER_MAX_EXPERIENCE = 4;

const toNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

export const getCompanyId = (job) =>
    typeof job?.company === "object"
        ? job.company?._id || job.company?.id || ""
        : job?.company || "";

/**
 * Resolve the company document for a job, preferring the hydrated map entry
 * over whatever the job payload embedded.
 */
export const resolveCompany = (job, companyMap = {}) => {
    const id = getCompanyId(job);
    const mapped = id ? companyMap[id] : null;
    if (mapped) return mapped;
    return typeof job?.company === "object" ? job.company : null;
};

export const hasCompanyLogo = (job, companyMap = {}) => {
    const company = resolveCompany(job, companyMap);
    return !!(
        company?.logo?.icon ||
        company?.logo?.banner ||
        job?.companyLogo
    );
};

export const isKnownCompany = (job, companyMap = {}) => {
    const company = resolveCompany(job, companyMap);
    return KNOWN_COMPANY_TYPES.includes(company?.companyType);
};

/**
 * Fresher-friendly means the whole advertised range fits within 0–4 years.
 * A job with no experience data at all does not qualify — we cannot confirm it.
 */
export const isFresherExperience = (experience) => {
    const min = toNumber(experience?.min);
    const max = toNumber(experience?.max);
    if (min === null && max === null) return false;
    if (min !== null && (min < 0 || min > FRESHER_MAX_EXPERIENCE)) return false;
    if (max !== null && max > FRESHER_MAX_EXPERIENCE) return false;
    return true;
};

/**
 * Per-check breakdown, so the UI can explain why a row is (not) highlighted.
 */
export const evaluateBestToPost = (job, companyMap = {}) => {
    const checks = {
        hasLogo: hasCompanyLogo(job, companyMap),
        knownCompany: isKnownCompany(job, companyMap),
        fresher: isFresherExperience(job?.experience),
    };
    return {
        ...checks,
        eligible: checks.hasLogo && checks.knownCompany && checks.fresher,
    };
};

export const isBestToPost = (job, companyMap = {}) =>
    evaluateBestToPost(job, companyMap).eligible;
