import React from "react";
import { Card, CardContent } from "Components/ui/card";
import { formatRelativeTime } from "Helpers/relativeTime";

const formatDuration = (ms) => {
    if (!ms || ms < 0) return "—";
    const totalSec = Math.round(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min === 0) return `${sec}s`;
    return `${min}m ${sec}s`;
};

const Metric = ({ label, value, accent }) => (
    <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">
            {label}
        </span>
        <span className={`text-2xl font-bold tracking-tight ${accent || ""}`}>
            {typeof value === "number" ? value : "—"}
        </span>
    </div>
);

// Compact read-out of the most recent completed scan (lastRun from /verify-now/status).
const ScanSummaryCard = ({ lastRun }) => {
    if (!lastRun) return null;
    const {
        trigger,
        completedAt,
        durationMs,
        totalChecked,
        activeCount,
        expiredCount,
        inconclusiveCount,
    } = lastRun;

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Last scan
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {completedAt
                            ? `Completed ${formatRelativeTime(completedAt)}`
                            : ""}
                        {durationMs != null
                            ? ` · took ${formatDuration(durationMs)}`
                            : ""}
                        {trigger ? ` · ${trigger}` : ""}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Metric label="Checked" value={totalChecked} />
                    <Metric
                        label="Active"
                        value={activeCount}
                        accent="text-green-600 dark:text-green-500"
                    />
                    <Metric
                        label="Archived"
                        value={expiredCount}
                        accent="text-red-600 dark:text-red-400"
                    />
                    <Metric
                        label="Inconclusive"
                        value={inconclusiveCount}
                        accent="text-amber-600 dark:text-amber-500"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ScanSummaryCard;
