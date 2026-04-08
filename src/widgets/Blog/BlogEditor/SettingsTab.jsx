import React, { useCallback, useContext, useState } from "react";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { Button } from "../../../Components/ui/button";
import TagInput from "../../../Components/Blog/TagInput";
import { UserContext } from "../../../Context/userContext";
import { Plus } from "lucide-react";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Publish Now" },
    { value: "scheduled", label: "Schedule" },
];

const SettingsTab = ({ blogData, onChange, categories = [], existingTags = [] }) => {
    const { user } = useContext(UserContext);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState("");

    const handleCategoryChange = useCallback(
        (e) => {
            const val = e.target.value;
            if (val === "__new__") {
                setShowNewCategory(true);
            } else {
                onChange({ category: val });
                setShowNewCategory(false);
            }
        },
        [onChange]
    );

    const handleAddCategory = useCallback(() => {
        const trimmed = newCategoryInput.trim();
        if (trimmed) {
            onChange({ category: trimmed });
            setNewCategoryInput("");
            setShowNewCategory(false);
        }
    }, [newCategoryInput, onChange]);

    const handleTagsChange = useCallback(
        (tags) => {
            onChange({ tags });
        },
        [onChange]
    );

    const handleAuthorChange = useCallback(
        (e) => {
            onChange({ author: e.target.value });
        },
        [onChange]
    );

    const handleStatusChange = useCallback(
        (e) => {
            const status = e.target.value;
            const updates = { status };
            if (status === "published") {
                updates.publishedAt = new Date().toISOString();
                updates.scheduledAt = null;
            } else if (status === "draft") {
                updates.scheduledAt = null;
            }
            onChange(updates);
        },
        [onChange]
    );

    const handleScheduleChange = useCallback(
        (e) => {
            onChange({ scheduledAt: e.target.value || null });
        },
        [onChange]
    );

    // Default author to current user
    const authorValue = blogData.author || user?.email || "";

    return (
        <div className="space-y-4">
            {/* Category */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category</Label>
                <select
                    value={showNewCategory ? "__new__" : blogData.category}
                    onChange={handleCategoryChange}
                    className="flex h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                    <option value="__new__">+ Create new category</option>
                </select>
                {showNewCategory && (
                    <div className="flex gap-2">
                        <Input
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            placeholder="New category name"
                            className="min-h-[44px]"
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleAddCategory()
                            }
                        />
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleAddCategory}
                            className="min-h-[44px]"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tags</Label>
                <TagInput
                    tags={blogData.tags || []}
                    onChange={handleTagsChange}
                    suggestions={existingTags}
                    placeholder="Add tag..."
                />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Author</Label>
                <Input
                    value={authorValue}
                    onChange={handleAuthorChange}
                    placeholder="Author name or email"
                    className="min-h-[44px]"
                />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex flex-col gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                        <label
                            key={opt.value}
                            className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent transition-colors min-h-[44px]"
                        >
                            <input
                                type="radio"
                                name="blog-status"
                                value={opt.value}
                                checked={blogData.status === opt.value}
                                onChange={handleStatusChange}
                                className="accent-primary h-4 w-4"
                            />
                            <span className="text-sm font-medium">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Schedule DateTime */}
            {blogData.status === "scheduled" && (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Publish Date & Time</Label>
                    <Input
                        type="datetime-local"
                        value={blogData.scheduledAt || ""}
                        onChange={handleScheduleChange}
                        className="min-h-[44px]"
                    />
                </div>
            )}
        </div>
    );
};

export default SettingsTab;
