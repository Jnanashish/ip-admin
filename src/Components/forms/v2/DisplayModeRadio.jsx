import React from "react";
import { useController } from "react-hook-form";
import { Check } from "lucide-react";
import { Label } from "Components/ui/label";
import { cn } from "lib/utils";

const OPTIONS = [
    {
        value: "internal",
        title: "Show on CareersAt.Tech",
        description: "Render the full job page on our site (requires job description).",
    },
    {
        value: "external_redirect",
        title: "Redirect directly to company career page",
        description: "Apply link opens the external URL — no internal job page.",
    },
];

const DisplayModeRadio = ({ name, control }) => {
    const { field, fieldState } = useController({
        name,
        control,
        rules: { required: "Select how this job should appear" },
    });

    return (
        <div className="space-y-1.5">
            <Label>How should this job appear?</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                {OPTIONS.map((opt) => {
                    const checked = field.value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            onClick={() => field.onChange(opt.value)}
                            onBlur={field.onBlur}
                            className={cn(
                                "text-left rounded-md border p-4 transition-colors",
                                "hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                checked
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-medium">{opt.title}</span>
                                {checked && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {opt.description}
                            </p>
                        </button>
                    );
                })}
            </div>
            {fieldState.error && (
                <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
        </div>
    );
};

export default DisplayModeRadio;
