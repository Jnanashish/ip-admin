import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

const TagInput = ({ tags = [], onChange, suggestions = [], placeholder = "Add tag..." }) => {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    const filteredSuggestions = useMemo(() => {
        if (!inputValue.trim()) return [];
        const lower = inputValue.toLowerCase();
        return suggestions
            .filter(
                (s) =>
                    s.toLowerCase().includes(lower) &&
                    !tags.includes(s)
            )
            .slice(0, 5);
    }, [inputValue, suggestions, tags]);

    const addTag = useCallback(
        (tag) => {
            const trimmed = tag.trim();
            if (trimmed && !tags.includes(trimmed)) {
                onChange([...tags, trimmed]);
            }
            setInputValue("");
            setShowSuggestions(false);
            inputRef.current?.focus();
        },
        [tags, onChange]
    );

    const removeTag = useCallback(
        (tagToRemove) => {
            onChange(tags.filter((t) => t !== tagToRemove));
        },
        [tags, onChange]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (inputValue.trim()) {
                    addTag(inputValue);
                }
            } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
                removeTag(tags[tags.length - 1]);
            }
        },
        [inputValue, addTag, removeTag, tags]
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="space-y-2">
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="rounded-full p-0.5 hover:bg-muted-foreground/20 min-h-0 min-w-0"
                                aria-label={`Remove ${tag}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="min-h-[44px]"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                        {filteredSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent min-h-[44px] flex items-center"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagInput;
