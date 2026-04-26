import React, { useMemo, useRef, useState } from "react";
import { useController } from "react-hook-form";
import { X } from "lucide-react";
import { Input } from "Components/ui/input";
import { Label } from "Components/ui/label";
import { cn } from "lib/utils";

const TagInput = ({
    name,
    control,
    label,
    placeholder = "Type and press Enter",
    suggestions = [],
    rules,
    disabled = false,
}) => {
    const { field, fieldState } = useController({
        name,
        control,
        rules,
        defaultValue: [],
    });

    const value = useMemo(
        () => (Array.isArray(field.value) ? field.value : []),
        [field.value]
    );
    const [draft, setDraft] = useState("");
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);

    const lower = useMemo(() => value.map((t) => t.toLowerCase()), [value]);

    const matches = useMemo(() => {
        if (!focused || !draft.trim() || suggestions.length === 0) return [];
        const q = draft.trim().toLowerCase();
        return suggestions
            .filter((s) => s && s.toLowerCase().includes(q) && !lower.includes(s.toLowerCase()))
            .slice(0, 8);
    }, [focused, draft, suggestions, lower]);

    const addTag = (raw) => {
        const t = (raw || "").trim();
        if (!t) return;
        if (lower.includes(t.toLowerCase())) {
            setDraft("");
            return;
        }
        field.onChange([...value, t]);
        setDraft("");
    };

    const removeTag = (idx) => {
        const next = value.slice();
        next.splice(idx, 1);
        field.onChange(next);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(draft);
            return;
        }
        if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    return (
        <div className="space-y-1.5">
            {label && <Label htmlFor={name}>{label}</Label>}
            <div
                className={cn(
                    "flex flex-wrap gap-1.5 min-h-10 rounded-md border bg-background px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring",
                    fieldState.error && "border-destructive"
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag, idx) => (
                    <span
                        key={`${tag}-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-xs"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${tag}`}
                            disabled={disabled}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <Input
                    ref={inputRef}
                    id={name}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setTimeout(() => setFocused(false), 100);
                        if (draft.trim()) addTag(draft);
                    }}
                    onFocus={() => setFocused(true)}
                    placeholder={value.length === 0 ? placeholder : ""}
                    disabled={disabled}
                    className="flex-1 min-w-[8rem] border-0 shadow-none focus-visible:ring-0 px-1 h-7"
                />
            </div>
            {matches.length > 0 && (
                <ul className="rounded-md border bg-popover shadow-md py-1 text-sm max-h-48 overflow-auto">
                    {matches.map((m) => (
                        <li key={m}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    addTag(m);
                                }}
                                className="block w-full text-left px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
                            >
                                {m}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {fieldState.error && (
                <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
        </div>
    );
};

export default TagInput;
