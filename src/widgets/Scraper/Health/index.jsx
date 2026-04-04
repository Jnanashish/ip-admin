import React, { useState, useEffect } from "react";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Play,
    HeartPulse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Badge } from "Components/ui/badge";
import { scraperGet, scraperPost } from "Helpers/scraperRequest";
import { scraperEndpoints } from "Helpers/scraperApiEndpoints";

const statusConfig = {
    success: { color: "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900", icon: CheckCircle2, iconColor: "text-green-500", label: "Healthy" },
    failed: { color: "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900", icon: XCircle, iconColor: "text-red-500", label: "Failed" },
    partial: { color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900", icon: AlertTriangle, iconColor: "text-yellow-500", label: "Partial" },
};

const AdapterCard = ({ adapter, onTest }) => {
    const config = statusConfig[adapter.status] || statusConfig.partial;
    const Icon = config.icon;

    return (
        <Card className={`border ${config.color}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{adapter.name}</CardTitle>
                    <Badge
                        variant={adapter.status === "success" ? "default" : adapter.status === "failed" ? "destructive" : "secondary"}
                    >
                        <Icon className={`mr-1 h-3 w-3 ${config.iconColor}`} />
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-muted-foreground">Jobs Ingested</span>
                        <p className="font-medium">{adapter.jobsIngested ?? 0}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Errors</span>
                        <p className="font-medium">{adapter.errorCount ?? 0}</p>
                    </div>
                </div>
                {adapter.lastRun && (
                    <p className="text-xs text-muted-foreground">
                        Last run: {new Date(adapter.lastRun).toLocaleString()}
                    </p>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onTest(adapter.name)}
                >
                    <Play className="mr-2 h-3 w-3" />
                    Test Adapter
                </Button>
            </CardContent>
        </Card>
    );
};

const AdapterHealth = () => {
    const [adapters, setAdapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testResults, setTestResults] = useState({});

    useEffect(() => {
        const fetchHealth = async () => {
            setLoading(true);
            const res = await scraperGet(scraperEndpoints.scrapeHealth);
            if (res?.data) {
                setAdapters(res.data);
            }
            setLoading(false);
        };
        fetchHealth();
    }, []);

    const handleTest = async (name) => {
        setTestResults((prev) => ({ ...prev, [name]: { loading: true } }));
        try {
            const res = await scraperPost(scraperEndpoints.testAdapter(name), {});
            setTestResults((prev) => ({ ...prev, [name]: { loading: false, result: res } }));
        } catch (err) {
            setTestResults((prev) => ({
                ...prev,
                [name]: { loading: false, error: err.message || "Test failed" },
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Adapter Health</h1>

            {adapters.length === 0 ? (
                <div className="text-center py-16">
                    <HeartPulse className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No adapter data available.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {adapters.map((adapter) => (
                        <AdapterCard
                            key={adapter.name}
                            adapter={adapter}
                            onTest={handleTest}
                        />
                    ))}
                </div>
            )}

            {/* Test results */}
            {Object.entries(testResults).map(([name, result]) => (
                <Card key={name}>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Test Result: {name}
                            {result.loading && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
                        </CardTitle>
                    </CardHeader>
                    {!result.loading && (
                        <CardContent>
                            {result.error ? (
                                <p className="text-red-500 text-sm">{result.error}</p>
                            ) : (
                                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-96">
                                    {JSON.stringify(result.result, null, 2)}
                                </pre>
                            )}
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default AdapterHealth;
