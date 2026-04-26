import React from "react";
import { useController } from "react-hook-form";
import { Label } from "Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "Components/ui/select";

const JOB_STATUSES = [
  { value: "draft", label: "Draft", dot: "bg-gray-400" },
  { value: "published", label: "Published", dot: "bg-green-500" },
  { value: "paused", label: "Paused", dot: "bg-yellow-400" },
  { value: "expired", label: "Expired", dot: "bg-orange-500" },
  { value: "archived", label: "Archived", dot: "bg-red-500" },
];

const COMPANY_STATUSES = [
  { value: "active", label: "Active", dot: "bg-green-500" },
  { value: "inactive", label: "Inactive", dot: "bg-gray-400" },
  { value: "archived", label: "Archived", dot: "bg-red-500" },
];

const StatusDropdown = ({ name, control, variant = "job" }) => {
  const { field } = useController({ name, control });
  const options = variant === "company" ? COMPANY_STATUSES : JOB_STATUSES;
  const labelText = variant === "company" ? "Company status" : "Job status";

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{labelText}</Label>
      <Select
        value={field.value || ""}
        onValueChange={(v) => field.onChange(v)}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusDropdown;
