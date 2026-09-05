// Shape adapters between the v2 API payload and the banner canvas props.
//
// Extracted from pages/Banners so the daily-digest screen renders banners from
// exactly the same mapping — two copies would drift the moment a schema field
// changes.
//
// Note these produce *display* shapes: batch/degree collapse to strings and
// jobLocation collapses to one line. The caption builders need the raw arrays,
// so pass them the untouched API job, not the adapted one.

export const formatExperience = (exp) => {
    if (!exp) return "";
    const min = exp.min ?? "";
    const max = exp.max ?? "";
    if (min === "" && max === "") return "";
    if (Number(min) === 0 && (max === "" || Number(max) === 0)) return "Fresher";
    if (min !== "" && max !== "") return `${min}-${max} years`;
    return `${min || max} years`;
};

const formatAmount = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num) || num === 0) return "";
    const trim = (v) => (v % 1 === 0 ? v.toString() : v.toFixed(1).replace(/\.0$/, ""));
    if (num >= 100000) return `${trim(num / 100000)}LPA`;
    if (num >= 1000) return `${trim(num / 1000)}k`;
    return num.toString();
};

export const formatSalary = (s) => {
    if (!s) return "";
    const min = s.min ?? "";
    const max = s.max ?? "";
    if (min === "" && max === "") return "";
    const cur = (s.currency || "").toUpperCase();
    const symbol = cur === "INR" ? "₹" : cur === "USD" ? "$" : cur === "EUR" ? "€" : (s.currency ? `${s.currency} ` : "");
    const fmt = (v) => (v !== "" ? `${symbol}${formatAmount(v)}` : "");
    const minStr = fmt(min);
    const maxStr = fmt(max);
    if (minStr && maxStr) return `${minStr} - ${maxStr}`;
    return minStr || maxStr;
};

export const formatLocation = (jobLocation = []) =>
    (Array.isArray(jobLocation) ? jobLocation : [])
        .map((l) => l?.city || l?.region || l?.country)
        .filter(Boolean)
        .join(", ");

export const looksLikeJob = (v) =>
    !!v &&
    typeof v === "object" &&
    (v.title || v._id || v.id || v.slug || v.companyName);

export const unwrapJob = (body) => {
    if (!body || typeof body !== "object") return null;
    if (looksLikeJob(body)) return body;
    const candidates = [body.job, body.data, body.result];
    for (const c of candidates) {
        if (looksLikeJob(c)) return c;
        if (c && typeof c === "object") {
            const inner = c.job || c.data || c.result;
            if (looksLikeJob(inner)) return inner;
        }
    }
    return null;
};

export const unwrapCompany = (body) => {
    if (!body || typeof body !== "object") return null;
    if (body.companyName || body._id || body.slug) return body;
    return body.company || body.data || body.result || null;
};

export const adaptJobForCanvas = (apiJob) => {
    if (!apiJob) return null;
    const role = apiJob.title || "";
    return {
        _id: apiJob.id || apiJob._id,
        title: role,
        role,
        companyName: apiJob.companyName || apiJob.company?.name || "",
        link: apiJob.applyLink || "",
        batch: Array.isArray(apiJob.batch) ? apiJob.batch.join(", ") : (apiJob.batch || ""),
        degree: Array.isArray(apiJob.degree) ? apiJob.degree.join(", ") : (apiJob.degree || ""),
        experience: formatExperience(apiJob.experience),
        salary: formatSalary(apiJob.baseSalary),
        location: formatLocation(apiJob.jobLocation),
    };
};

export const adaptCompanyForCanvas = (apiCompany) => {
    if (!apiCompany) return null;
    const logo = apiCompany.logo || {};
    return {
        ...apiCompany,
        largeLogo: logo.banner || logo.icon || "",
        smallLogo: logo.icon || logo.banner || "",
    };
};

// The job's populated `company` is the preferred source; a bare ObjectId string
// means the caller has to fetch the company separately.
export const companyFromJob = (apiJob) => {
    const c = apiJob?.company;
    if (!c || typeof c === "string") return null;
    return adaptCompanyForCanvas(c);
};
