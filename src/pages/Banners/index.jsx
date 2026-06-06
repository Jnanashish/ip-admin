import React, { useEffect, useState } from "react";

import Canvas from "../../Components/Canvas";
import Loader from "../../Components/Loader";
import { Button } from "Components/ui/button";
import { cn } from "lib/utils";

import { fetchJobV2 } from "api/v2/jobs";
import { fetchCompanyV2, listCompaniesV2 } from "api/v2/companies";
import { showErrorToast, showInfoToast, showWarnToast } from "../../Helpers/toast";

const formatExperience = (exp) => {
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

const formatSalary = (s) => {
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

const formatLocation = (jobLocation = []) =>
    jobLocation.map((l) => l?.city || l?.region || l?.country).filter(Boolean).join(", ");

const looksLikeJob = (v) =>
    !!v &&
    typeof v === "object" &&
    (v.title || v._id || v.id || v.slug || v.companyName);

const unwrapJob = (body) => {
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

const unwrapCompany = (body) => {
    if (!body || typeof body !== "object") return null;
    if (body.companyName || body._id || body.slug) return body;
    return body.company || body.data || body.result || null;
};

const adaptJobForCanvas = (apiJob) => {
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

const adaptCompanyForCanvas = (apiCompany) => {
    if (!apiCompany) return null;
    const logo = apiCompany.logo || {};
    return {
        ...apiCompany,
        largeLogo: logo.banner || logo.icon || "",
        smallLogo: logo.icon || logo.banner || "",
    };
};

const resolveCompanyId = (apiJob, fallbackId) => {
    if (fallbackId) return fallbackId;
    const c = apiJob?.company;
    if (!c) return null;
    if (typeof c === "string") return c;
    return c.id || c._id || null;
};

const findCompanyByName = async (name) => {
    if (!name) return null;
    const res = await listCompaniesV2({ search: name, limit: 1 });
    const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.companies || res?.data?.items || res?.data?.data || [];
    return list[0] || null;
};

function Banners() {
    const [jobdetails, setJobdetails] = useState();
    const [companyDetails, setCompanyDetails] = useState();
    const [bannerType, setBannerType] = useState("careersattech");
    const [loading, setLoading] = useState(true);

    const loadFromQuery = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get("jobid");
        const companyName = urlParams.get("companyname");
        const companyIdParam = urlParams.get("companyid");

        const hasJobParam = !!jobId;
        const hasCompanyParam = companyName || companyIdParam;

        if (!hasJobParam && !hasCompanyParam) {
            setLoading(false);
            return;
        }

        try {
            let apiJob = null;
            if (hasJobParam) {
                const jobRes = await fetchJobV2(jobId);
                if (jobRes?.status === 200) {
                    apiJob = unwrapJob(jobRes.data);
                    if (apiJob) {
                        setJobdetails(adaptJobForCanvas(apiJob));
                    } else {
                        // eslint-disable-next-line no-console
                        console.error(
                            "[Banners] 200 OK but job response shape unrecognised:",
                            jobRes.data
                        );
                        showErrorToast("Job loaded but response shape was unexpected");
                    }
                } else {
                    showErrorToast(
                        (typeof jobRes?.error === "string"
                            ? jobRes.error
                            : jobRes?.error?.message) || "Failed to load job"
                    );
                }
            }

            const companyId = resolveCompanyId(apiJob, companyIdParam);
            const nameForLookup = companyName || apiJob?.companyName || apiJob?.company?.name;
            let apiCompany = null;
            if (companyId) {
                const compRes = await fetchCompanyV2(companyId);
                apiCompany = compRes?.status === 200 ? unwrapCompany(compRes?.data) : null;
            }
            if (!apiCompany && nameForLookup) {
                apiCompany = await findCompanyByName(nameForLookup);
            }

            if (apiCompany) {
                const adapted = adaptCompanyForCanvas(apiCompany);
                setCompanyDetails(adapted);
                if (adapted.largeLogo || adapted.smallLogo) {
                    showInfoToast("Logo found in database");
                } else {
                    showWarnToast("Logo not found, upload manually");
                }
            } else if (apiJob || hasCompanyParam) {
                showWarnToast("Company not found, upload logo manually");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFromQuery();
    }, []);

    const bannerOptions = [
        { key: "careersattech", label: "CareersAtTech" },
        { key: "jobsattech", label: "JobsAtTech" },
        { key: "linkedinbanner", label: "LinkedIn" },
        { key: "carousel", label: "Carousel" },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Banner Generator</h2>
            <p className="text-sm text-muted-foreground mb-6">Generate social media banners for job postings</p>

            <div className="flex flex-wrap gap-1 mb-8 p-1 bg-muted rounded-lg w-fit">
                {bannerOptions.map((item) => (
                    <Button
                        key={item.key}
                        variant={bannerType === item.key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setBannerType(item.key)}
                        className={cn("capitalize", bannerType === item.key && "shadow-sm")}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader />
                </div>
            ) : jobdetails ? (
                <Canvas bannerType={bannerType} jobdetails={jobdetails} companyDetails={companyDetails || {}} />
            ) : (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="max-w-md text-center border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold tracking-tight mb-2">No job selected</h3>
                        <p className="text-sm text-muted-foreground">
                            Open this page from a job listing, or append <span className="font-mono text-xs">?jobid=&lt;id&gt;</span> to the URL to generate a banner.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Banners;
