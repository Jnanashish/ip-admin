import React from "react";
import { CheckCircle2, AlertCircle, Code } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "Components/ui/card";
import { Button } from "Components/ui/button";

import { showSuccessToast, showErrorToast } from "Helpers/toast";
import { buildJobPostingJsonLd } from "utils/v2/jsonLdPreview";

const FRONTEND_URL =
    process.env.REACT_APP_FRONTEND_URL || "https://careersat.tech";

const isEmpty = (v) => {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim() === "";
    if (Array.isArray(v)) return v.length === 0;
    return false;
};

const buildRequiredItems = (job) => {
    const items = [
        {
            key: "title",
            label: "Title",
            present: !isEmpty(job.title),
            sectionId: "section-basics",
        },
        {
            key: "company",
            label: "Company",
            present: !isEmpty(job.company),
            sectionId: "section-basics",
        },
        {
            key: "employmentType",
            label: "Employment type",
            present: Array.isArray(job.employmentType) && job.employmentType.length > 0,
            sectionId: "section-classification",
        },
        {
            key: "datePosted",
            label: "Date posted",
            present: !isEmpty(job.datePosted),
            sectionId: "section-dates",
        },
        {
            key: "validThrough",
            label: "Valid through",
            present: !isEmpty(job.validThrough),
            sectionId: "section-dates",
        },
        {
            key: "jobLocation",
            label: "Location",
            present: Array.isArray(job.jobLocation) && job.jobLocation.length > 0,
            sectionId: "section-location",
        },
    ];

    if (job.displayMode === "internal") {
        items.push({
            key: "jobDescription",
            label: "Job description",
            present: !isEmpty(job.jobDescription?.html),
            sectionId: "section-description",
        });
    }

    return items;
};

const buildOptionalItems = (job) => [
    {
        key: "salary",
        label: "Salary",
        present: !isEmpty(job.baseSalary?.min) || !isEmpty(job.baseSalary?.max),
        helperText: "optional, improves ranking",
    },
    {
        key: "seo",
        label: "SEO meta",
        present:
            !isEmpty(job.seo?.metaTitle) && !isEmpty(job.seo?.metaDescription),
        helperText: "optional",
    },
];

const StatusIcon = ({ present }) =>
    present ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
    ) : (
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
    );

const ReadinessChecklist = ({ job = {}, onJumpToSection }) => {
    const requiredItems = buildRequiredItems(job);
    const optionalItems = buildOptionalItems(job);

    const handleCopyJsonLd = async () => {
        try {
            const payload = buildJobPostingJsonLd(job, FRONTEND_URL);
            const text = JSON.stringify(payload, null, 2);
            await navigator.clipboard.writeText(text);
            showSuccessToast("JSON-LD copied to clipboard");
        } catch (err) {
            showErrorToast("Failed to copy JSON-LD");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    Google for Jobs readiness
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Required
                    </p>
                    <ul className="space-y-2">
                        {requiredItems.map((item) => (
                            <li
                                key={item.key}
                                className="flex items-center gap-2 text-sm"
                            >
                                <StatusIcon present={item.present} />
                                <span
                                    className={
                                        item.present
                                            ? "text-foreground"
                                            : "text-foreground"
                                    }
                                >
                                    {item.label}
                                </span>
                                {!item.present && onJumpToSection && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() =>
                                            onJumpToSection(item.sectionId)
                                        }
                                    >
                                        Fix
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Optional, improves ranking
                    </p>
                    <ul className="space-y-2">
                        {optionalItems.map((item) => (
                            <li
                                key={item.key}
                                className="flex items-center gap-2 text-sm"
                            >
                                <StatusIcon present={item.present} />
                                <span>{item.label}</span>
                                <span className="text-xs text-muted-foreground">
                                    {item.helperText}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyJsonLd}
                    >
                        <Code className="h-4 w-4 mr-2" />
                        Copy as JSON-LD
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReadinessChecklist;
