import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    Inbox,
    Bot,
    Activity,
    Loader2,
    Play,
    CheckCircle2,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import { Button } from "Components/ui/button";
import { Badge } from "Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "Components/ui/dialog";
import { scraperGet, scraperPost } from "Helpers/scraperRequest";
import { scraperEndpoints } from "Helpers/scraperApiEndpoints";
import { usePolling } from "hooks/usePolling";
import { showInfoToast } from "Helpers/toast";

const StatsCard = ({ title, value, icon: Icon, description }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value ?? "—"}</div>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
        </CardContent>
    </Card>
);

const HealthIndicator = ({ adapters }) => {
    if (!adapters || adapters.length === 0) return null;

    const failed = adapters.filter((a) => a.status === "failed").length;
    const total = adapters.length;

    let color = "bg-green-500";
    let label = "All Healthy";
    if (failed === total) {
        color = "bg-red-500";
        label = "All Failed";
    } else if (failed > 0) {
        color = "bg-yellow-500";
        label = `${failed}/${total} Failed`;
    }

    return (
        <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${color} inline-block`} />
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
};

const ScraperDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingCount: null,
        totalScraped: null,
        lastScrapeTime: null,
        aiProvider: null,
    });
    const [healthData, setHealthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [scrapePolling, setScrapePolling] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [stagingRes, healthRes, logsRes] = await Promise.all([
                scraperGet(`${scraperEndpoints.stagingList}?status=pending&page=1&size=1`),
                scraperGet(scraperEndpoints.scrapeHealth),
                scraperGet(`${scraperEndpoints.scrapeLogs}?limit=1`),
            ]);

            const pendingCount = stagingRes?.totalCount ?? 0;
            const adapters = healthRes?.data || [];
            const lastLog = logsRes?.data?.[0];

            const totalScraped = adapters.reduce((sum, a) => sum + (a.jobsIngested || 0), 0);
            const lastScrapeTime = lastLog?.startedAt
                ? new Date(lastLog.startedAt).toLocaleString()
                : "Never";
            const aiProvider = lastLog?.aiProvider || "—";

            setStats({ pendingCount, totalScraped, lastScrapeTime, aiProvider });
            setHealthData(adapters);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const pollCallback = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const { isPolling } = usePolling({
        callback: pollCallback,
        interval: 30000,
        maxIterations: 10,
        enabled: scrapePolling,
    });

    const handleScrapeNow = async () => {
        setShowConfirm(false);
        const res = await scraperPost(scraperEndpoints.scrapeRun, {}, "Scrape Run");
        if (res) {
            showInfoToast("Scrape run started. New jobs will appear in the staging queue shortly.");
            setScrapePolling(true);
            setTimeout(() => setScrapePolling(false), 5 * 60 * 1000);
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scraper Dashboard</h1>
                    <p className="text-muted-foreground">CareersAt.Tech Job Scraper Admin</p>
                </div>
                <div className="flex items-center gap-4">
                    <HealthIndicator adapters={healthData} />
                    <Button onClick={() => setShowConfirm(true)} disabled={isPolling}>
                        {isPolling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Scraping...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Scrape Now
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Pending Jobs"
                    value={stats.pendingCount}
                    icon={Inbox}
                    description="Awaiting review"
                />
                <StatsCard
                    title="Total Scraped"
                    value={stats.totalScraped}
                    icon={Activity}
                    description="From last run"
                />
                <StatsCard
                    title="Last Scrape"
                    value={stats.lastScrapeTime}
                    icon={Clock}
                />
                <StatsCard
                    title="AI Provider"
                    value={stats.aiProvider}
                    icon={Bot}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3">Adapter Status</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {healthData.map((adapter) => (
                        <Card key={adapter.name} className="transition-all hover:shadow-md">
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{adapter.name}</span>
                                    <Badge
                                        variant={
                                            adapter.status === "success"
                                                ? "default"
                                                : adapter.status === "failed"
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {adapter.status === "success" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                        {adapter.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                                        {adapter.status !== "success" && adapter.status !== "failed" && (
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                        )}
                                        {adapter.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div>Jobs ingested: {adapter.jobsIngested ?? 0}</div>
                                    <div>Errors: {adapter.errorCount ?? 0}</div>
                                    {adapter.lastRun && (
                                        <div>Last run: {new Date(adapter.lastRun).toLocaleString()}</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {healthData.length === 0 && (
                        <p className="text-muted-foreground col-span-full">No adapter data available.</p>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/admin/scraper/staging")}>
                    <Inbox className="mr-2 h-4 w-4" />
                    View Staging Queue
                </Button>
                <Button variant="outline" onClick={() => navigate("/admin/scraper/logs")}>
                    <Clock className="mr-2 h-4 w-4" />
                    View Scrape Logs
                </Button>
            </div>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start Scrape Run</DialogTitle>
                        <DialogDescription>
                            This will scrape up to 20 jobs from each enabled source. Continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleScrapeNow}>Start Scraping</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ScraperDashboard;
