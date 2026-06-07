import React from "react";
import { cn } from "lib/utils";

const STATUS_STYLES = {
    draft: { label: "Draft", dot: "bg-gray-400" },
    published: { label: "Published", dot: "bg-green-500" },
    paused: { label: "Paused", dot: "bg-yellow-400" },
    expired: { label: "Expired", dot: "bg-orange-500" },
    // Archived is a resting state, not an alert — render it muted/secondary.
    archived: { label: "Archived", dot: "bg-muted-foreground", muted: true },
};

const StatusBadge = ({ status, className }) => {
    const meta = STATUS_STYLES[status] || {
        label: status || "Unknown",
        dot: "bg-gray-300",
    };
    return (
        <span
            role="status"
            aria-label={meta.label}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                meta.muted
                    ? "border-border bg-muted text-muted-foreground"
                    : "border-border bg-background text-foreground",
                className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
            {meta.label}
        </span>
    );
};

export default StatusBadge;
