import React, { useEffect, useRef } from "react";
import { useController } from "react-hook-form";
import { RefreshCw } from "lucide-react";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
import { Button } from "Components/ui/button";
import { cn } from "lib/utils";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Mirrors backend `validateSlug` — keep regex in sync if the backend changes.
export const validateSlug = (slug) => {
  if (!slug) return { valid: false, error: "Slug is required" };
  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      error: "Use lowercase letters, numbers, and hyphens only (no leading/trailing/double hyphens)",
    };
  }
  return { valid: true, error: null };
};

const SlugField = ({
  name,
  control,
  autoGenerateFrom,
  generate,
  mode = "create",
  previewPrefix = "careersat.tech/jobs/",
  disabled = false,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
    rules: {
      validate: (value) => {
        const { valid, error } = validateSlug(value || "");
        return valid || error;
      },
    },
  });

  const userEditedRef = useRef(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (mode !== "create") return undefined;
    if (userEditedRef.current) return undefined;
    if (!autoGenerateFrom || typeof generate !== "function") return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = (generate(autoGenerateFrom) || "").toLowerCase();
      if (next && next !== field.value) field.onChange(next);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(autoGenerateFrom), mode]);

  const handleChange = (e) => {
    userEditedRef.current = true;
    field.onChange(e.target.value.toLowerCase());
  };

  const regenerate = () => {
    if (typeof generate !== "function" || !autoGenerateFrom) return;
    userEditedRef.current = false;
    const next = (generate(autoGenerateFrom) || "").toLowerCase();
    field.onChange(next);
  };

  const showEditWarning = mode === "edit" && fieldState.isDirty && !fieldState.error;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>URL Slug</Label>
      <div className="flex gap-2">
        <Input
          id={name}
          value={field.value || ""}
          onChange={handleChange}
          onBlur={field.onBlur}
          disabled={disabled}
          placeholder="frontend-engineer-acme"
          className={cn(fieldState.error && "border-destructive")}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={regenerate}
          disabled={disabled || !autoGenerateFrom || typeof generate !== "function"}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Regenerate
        </Button>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        {previewPrefix}
        {field.value || ""}
      </p>
      {showEditWarning && (
        <p className="text-xs text-amber-600">
          Changing the slug will break existing URLs.
        </p>
      )}
      {fieldState.error && (
        <p className="text-xs text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
};

export default SlugField;
