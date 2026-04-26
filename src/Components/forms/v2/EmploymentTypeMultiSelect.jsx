import React from "react";
import { useController } from "react-hook-form";
import { Button } from "Components/ui/button";
import { Label } from "Components/ui/label";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "INTERN", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];

const EmploymentTypeMultiSelect = ({ name, control }) => {
  const { field, fieldState } = useController({
    name,
    control,
    rules: {
      validate: (v) =>
        (Array.isArray(v) && v.length > 0) || "Pick at least one employment type",
    },
  });

  const value = Array.isArray(field.value) ? field.value : [];

  const toggle = (val) => {
    const next = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    field.onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label>Employment type</Label>
      <div className="flex flex-wrap gap-2">
        {EMPLOYMENT_TYPES.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              onClick={() => toggle(opt.value)}
              className="rounded-full"
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
      {fieldState.error && (
        <p className="text-xs text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
};

export default EmploymentTypeMultiSelect;
