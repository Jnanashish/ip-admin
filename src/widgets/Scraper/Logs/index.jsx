import React, { useState, useEffect } from "react";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Badge } from "Components/ui/badge";
import { scraperGet } from "Helpers/scraperRequest";
import { scraperEndpoints } from "Helpers/scraperApiEndpoints";

const formatDuration = (ms) => {
    if (!ms) return "—";
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s`;
};

const AdapterRow = ({ adapter }) => {
    const isSuccess = adapter.status === "success";
    const isFailed = adapter.status === "failed";

    return (
        <div className="flex items-start gap-2 text-sm">
            {isSuccess && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />}
            {isFailed && <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
            {!isSuccess && !isFailed && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />}
            <div className="flex-1">
                <span className="font-medium">{adapter.name}</span>
                <span className="text-muted-foreground">
                    {" — "}
                    {adapter.jobsIngested ?? 0} new, {adapter.jobsSkipped ?? 0} skipped, {adapter.errors?.length ?? 0} errors
                    {adapter.durationMs ? ` (${formatDuration(adapter.durationMs)})` : ""}
                </span>
                {adapter.errors?.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                        {adapter.errors.map((err, i) => (
                            <p key={i} className="text-xs text-red-500">{typeof err === "string" ? err : JSON.stringify(err)}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const LogEntry = ({ log }) => {
    const [expanded, setExpanded] = useState(false);

    const startTime = log.startedAt ? new Date(log.startedAt) : null;
    const endTime = log.completedAt ? new Date(log.completedAt) : null;
    const durationMs = startTime && endTime ? endTime - startTime : null;

    return (
        <Card>
            <CardContent className="pt-4">
                <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                    {log.runId?.slice(0, 8)}
                                </span>
                                <Badge variant="outline">{log.trigger || "manual"}</Badge>
                                <span className="text-sm">
                                    {startTime ? startTime.toLocaleString() : "—"}
                                </span>
                                {durationMs && (
                                    <span className="text-sm text-muted-foreground">
                                        • {formatDuration(durationMs)}
                                    </span>
                                )}
                            </div>
                            {log.aiProvider && (
                                <p className="text-xs text-muted-foreground mt-0.5">AI: {log.aiProvider}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {log.summary && (
                            <div className="flex gap-3 text-sm">
                                <span className="text-green-600">{log.summary.totalNew ?? 0} new</span>
                                <span className="text-muted-foreground">{log.summary.totalSkipped ?? 0} skipped</span>
                                {(log.summary.totalErrors ?? 0) > 0 && (
                                    <span className="text-red-500">{log.summary.totalErrors} errors</span>
                                )}
                            </div>
                        )}
                        {expanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </div>

                {expanded && log.adapters?.length > 0 && (
                    <div className="mt-4 pl-7 space-y-2 border-t pt-3">
                        {log.adapters.map((adapter) => (
                            <AdapterRow key={adapter.name} adapter={adapter} />
                        ))}
                    </div>
                )}

                {expanded && (!log.adapters || log.adapters.length === 0) && (
                    <p className="mt-3 pl-7 text-sm text-muted-foreground">No adapter details available.</p>
                )}
            </CardContent>
        </Card>
    );
};

const ScrapeLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(20);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const res = await scraperGet(`${scraperEndpoints.scrapeLogs}?limit=${limit}`);
            if (res?.data) {
                setLogs(res.data);
            }
            setLoading(false);
        };
        fetchLogs();
    }, [limit]);

    if (loading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Scrape Logs</h1>

            {logs.length === 0 ? (
                <div className="text-center py-16">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No scrape runs yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <LogEntry key={log.runId} log={log} />
                    ))}
                </div>
            )}

            {logs.length >= limit && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => setLimit((prev) => prev + 20)}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ScrapeLogs;
