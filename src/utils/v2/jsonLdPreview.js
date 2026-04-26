const stripUndefined = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(stripUndefined);
    }
    if (obj !== null && typeof obj === "object") {
        const out = {};
        Object.keys(obj).forEach((key) => {
            const value = stripUndefined(obj[key]);
            if (value !== undefined) out[key] = value;
        });
        return out;
    }
    return obj;
};

const toNumberOrUndefined = (v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};

const buildHiringOrganization = (job) => {
    const name = job.companyName || job.company || "";
    if (!name) return undefined;
    const sameAs =
        job.companyDetails?.website ||
        job.companyDetails?.url ||
        undefined;
    const logo =
        job.companyDetails?.logo ||
        job.companyDetails?.logoUrl ||
        undefined;
    return {
        "@type": "Organization",
        name,
        sameAs,
        logo,
    };
};

const buildJobLocations = (locations = []) => {
    if (!Array.isArray(locations) || locations.length === 0) return undefined;
    return locations.map((l) => ({
        "@type": "Place",
        address: {
            "@type": "PostalAddress",
            addressLocality: l?.city || undefined,
            addressRegion: l?.region || undefined,
            addressCountry: l?.country || undefined,
        },
    }));
};

const buildBaseSalary = (salary) => {
    if (!salary) return undefined;
    const minValue = toNumberOrUndefined(salary.min);
    const maxValue = toNumberOrUndefined(salary.max);
    if (minValue === undefined && maxValue === undefined) return undefined;
    return {
        "@type": "MonetaryAmount",
        currency: salary.currency,
        value: {
            "@type": "QuantitativeValue",
            minValue,
            maxValue,
            unitText: salary.unitText,
        },
    };
};

export const buildJobPostingJsonLd = (job = {}, frontendBaseUrl = "") => {
    const description =
        job.displayMode === "internal"
            ? job.jobDescription?.html || ""
            : job.seo?.metaDescription || job.title || "";

    const slug = job.slug || "";
    const url = slug ? `${frontendBaseUrl}/jobs/${slug}` : undefined;

    const payload = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title || undefined,
        description: description || undefined,
        datePosted: job.datePosted || undefined,
        validThrough: job.validThrough || undefined,
        employmentType:
            Array.isArray(job.employmentType) && job.employmentType.length > 0
                ? job.employmentType
                : undefined,
        hiringOrganization: buildHiringOrganization(job),
        jobLocation: buildJobLocations(job.jobLocation),
        baseSalary: buildBaseSalary(job.baseSalary),
        url,
        identifier: slug
            ? {
                  "@type": "PropertyValue",
                  name: "careersat.tech",
                  value: slug,
              }
            : undefined,
    };

    return stripUndefined(payload);
};

export default buildJobPostingJsonLd;
