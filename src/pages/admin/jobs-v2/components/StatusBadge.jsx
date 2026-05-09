import React from "react";
import { cn } from "lib/utils";

const STATUS_STYLES = {
    draft: {
        label: "Draft",
        dot: "bg-gray-400",
    },
    published: {
        label: "Published",
        dot: "bg-green-500",
    },
    paused: {
        label: "Paused",
        dot: "bg-yellow-400",
    },
    expired: {
        label: "Expired",
        dot: "bg-orange-500",
    },
    archived: {
        label: "Archived",
        dot: "bg-red-500",
    },
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
            title={meta.label}
            className={cn(
                "inline-block h-2.5 w-2.5 rounded-full",
                meta.dot,
                className
            )}
        />
    );
};

export default StatusBadge;
