import React, { useState, useEffect, useCallback } from "react";
import {
    Briefcase,
    CheckCircle2,
    XCircle,
    MousePointerClick,
    TrendingUp,
    TrendingDown,
    Building2,
} from "lucide-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "Components/ui/select";
import { Badge } from "Components/ui/badge";
import { Separator } from "Components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "Components/ui/tooltip";
import { get } from "Helpers/request";
import { apiEndpoint } from "Helpers/apiEndpoints";

const PERIOD_OPTIONS = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
];

const CATEGORY_OPTIONS = [
    { value: "jobtype", label: "Job Type" },
    { value: "workMode", label: "Work Mode" },
    { value: "location", label: "Location" },
    { value: "companytype", label: "Company Type" },
    { value: "tags", label: "Tags" },
];

const PIE_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#8884d8",
    "#ffc658",
    "#ff7c43",
];

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const StatsCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>{title}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold tracking-tight">{value ?? "—"}</div>
            {description && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {description}
                </p>
            )}
        </CardContent>
    </Card>
);

const AnalyticsDashboard = () => {
    const [period, setPeriod] = useState("30d");
    const [category, setCategory] = useState("jobtype");
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [jobsOverTime, setJobsOverTime] = useState([]);
    const [clicksOverTime, setClicksOverTime] = useState([]);
    const [topJobs, setTopJobs] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, jobsRes, clicksRes, topRes] = await Promise.all([
                get(`${apiEndpoint.analyticsSummary}?period=${period}`),
                get(`${apiEndpoint.analyticsJobsOverTime}?period=${period}`),
                get(`${apiEndpoint.analyticsClicksOverTime}?period=${period}`),
                get(`${apiEndpoint.analyticsTopJobs}?period=${period}&limit=10`),
            ]);

            setSummary(summaryRes?.data || null);
            setJobsOverTime(summaryRes?.data ? (jobsRes?.data || []) : []);
            setClicksOverTime(summaryRes?.data ? (clicksRes?.data || []) : []);
            setTopJobs(topRes?.data || []);
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [period]);

    const fetchCategory = useCallback(async () => {
        try {
            const res = await get(`${apiEndpoint.analyticsJobsByCategory}?groupBy=${category}`);
            setCategoryData(res?.data || []);
        } catch (err) {
            console.error("Category fetch error:", err);
        }
    }, [category]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
                        <div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
                    </div>
                    <div className="h-9 w-[160px] rounded-md bg-muted animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                                <div className="h-4 w-4 rounded-md bg-muted animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-7 w-16 rounded-md bg-muted animate-pulse" />
                                <div className="h-3 w-32 rounded-md bg-muted animate-pulse mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Separator />
                <div className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-5 w-40 rounded-md bg-muted animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full rounded-md bg-muted animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Separator />
                <div className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-5 w-40 rounded-md bg-muted animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full rounded-md bg-muted animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">Job portal performance overview</p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIOD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Stat Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Jobs"
                        value={summary.totalJobs?.toLocaleString()}
                        icon={Briefcase}
                        description={`${summary.jobsAddedInPeriod} added in period`}
                        trend="up"
                    />
                    <StatsCard
                        title="Active Jobs"
                        value={summary.activeJobs?.toLocaleString()}
                        icon={CheckCircle2}
                        description={`${summary.expiredJobs} expired`}
                    />
                    <StatsCard
                        title="Expired in Period"
                        value={summary.jobsExpiredInPeriod?.toLocaleString()}
                        icon={XCircle}
                        trend="down"
                    />
                    <StatsCard
                        title="Clicks in Period"
                        value={summary.clicksInPeriod?.toLocaleString()}
                        icon={MousePointerClick}
                        description={`${summary.totalClicks?.toLocaleString()} all time`}
                    />
                </div>
            )}

            <Separator />

            {/* Charts Row 1: Jobs Over Time + Clicks Over Time */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold tracking-tight">Jobs Added vs Expired</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {jobsOverTime.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={jobsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        className="text-xs"
                                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <RechartsTooltip
                                        labelFormatter={formatDate}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="jobsAdded" name="Added" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="jobsExpired" name="Expired" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-12">No data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold tracking-tight">Click Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {clicksOverTime.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={clicksOverTime}>
                                    <defs>
                                        <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <RechartsTooltip
                                        labelFormatter={formatDate}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="hsl(var(--chart-1))"
                                        fill="url(#clickGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-12">No click data yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Charts Row 2: Top Jobs + Category Distribution */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Jobs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold tracking-tight">Top Performing Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topJobs.length > 0 ? (
                            <div className="space-y-3">
                                {topJobs.map((job, i) => (
                                    <div
                                        key={job.jobId}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-muted-foreground w-5 text-right">
                                            {i + 1}
                                        </span>
                                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                            {job.companyLogo && job.companyLogo !== "none" ? (
                                                <img
                                                    src={job.companyLogo}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{job.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {job.companyName} · {job.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    job.isActive
                                                        ? "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
                                                        : "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
                                                }
                                            >
                                                {job.isActive ? "Active" : "Expired"}
                                            </Badge>
                                            <span className="text-sm font-semibold tabular-nums">
                                                {job.clicks?.toLocaleString()}
                                            </span>
                                            <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-12">No click data yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg font-semibold tracking-tight">Job Distribution</CardTitle>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="count"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={50}
                                        paddingAngle={2}
                                        label={({ label, percent }) =>
                                            `${label} (${(percent * 100).toFixed(0)}%)`
                                        }
                                    >
                                        {categoryData.map((_, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={PIE_COLORS[idx % PIE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-12">No data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
