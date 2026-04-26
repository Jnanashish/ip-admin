import React from "react";
import { Badge } from "Components/ui/badge";
import { cn } from "lib/utils";

const STATUS_STYLES = {
    active: {
        label: "Active",
        dot: "bg-green-500",
        badge: "border-green-300 text-green-700",
    },
    inactive: {
        label: "Inactive",
        dot: "bg-gray-400",
        badge: "border-gray-300 text-gray-600",
    },
    archived: {
        label: "Archived",
        dot: "bg-red-500",
        badge: "border-red-300 text-red-700",
    },
};

const CompanyStatusBadge = ({ status, className }) => {
    const meta = STATUS_STYLES[status];
    if (!meta) {
        return (
            <Badge
                variant="outline"
                className={cn("gap-1.5 cursor-default", className)}
            >
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {status || "Unknown"}
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className={cn("gap-1.5 cursor-default", meta.badge, className)}
        >
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </Badge>
    );
};

export default CompanyStatusBadge;
