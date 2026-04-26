import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "Components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "Components/ui/popover";
import { cn } from "lib/utils";

const REQUIRED_FIELDS = [
  { key: "title", label: "Job title" },
  { key: "slug", label: "URL slug" },
  { key: "company", label: "Company" },
  { key: "employmentType", label: "Employment type" },
  { key: "batch", label: "Eligible batches" },
  { key: "validThrough", label: "Valid through (apply-by date)" },
  { key: "jobLocation", label: "Job location" },
  { key: "datePosted", label: "Date posted" },
];

const isEmpty = (v) => {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
};

export const computeReadiness = (job = {}) => {
  const missing = [];
  REQUIRED_FIELDS.forEach(({ key, label }) => {
    if (isEmpty(job[key])) missing.push(label);
  });

  if (job.displayMode === "internal") {
    const html = job.jobDescription?.html;
    if (isEmpty(html)) missing.push("Job description");
  }

  return { ready: missing.length === 0, missing };
};

const ReadinessIndicator = ({ job = {} }) => {
  const { ready, missing } = computeReadiness(job);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "inline-flex items-center gap-1.5 cursor-pointer",
            ready
              ? "border-green-500 text-green-600"
              : "border-red-500 text-red-600"
          )}
        >
          {ready ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {ready ? "Ready for Google for Jobs" : "Missing fields"}
        </Badge>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        {ready ? (
          <p className="text-sm text-muted-foreground">
            All required fields are filled. This job is eligible for Google for
            Jobs indexing.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Missing fields:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ReadinessIndicator;
