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
import { Bar, BarChart, Area, AreaChart, Pie, PieChart, XAxis, YAxis, CartesianGrid, Label } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "Components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "Components/ui/chart";
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

const jobsChartConfig = {
    jobsAdded: {
        label: "Added",
        color: "hsl(var(--chart-1))",
    },
    jobsExpired: {
        label: "Expired",
        color: "hsl(var(--chart-2))",
    },
};

const clicksChartConfig = {
    clicks: {
        label: "Clicks",
        color: "hsl(var(--chart-1))",
    },
};

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
        } catch {
        } finally {
            setLoading(false);
        }
    }, [period]);

    const fetchCategory = useCallback(async () => {
        try {
            const res = await get(`${apiEndpoint.analyticsJobsByCategory}?groupBy=${category}`);
            setCategoryData(res?.data || []);
        } catch {
        }
    }, [category]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    // Build pie chart config dynamically from category data
    const pieChartConfig = React.useMemo(() => {
        const chartColors = [
            "hsl(var(--chart-1))",
            "hsl(var(--chart-2))",
            "hsl(var(--chart-3))",
            "hsl(var(--chart-4))",
            "hsl(var(--chart-5))",
        ];
        const config = {};
        categoryData.forEach((item, idx) => {
            config[item.label] = {
                label: item.label,
                color: chartColors[idx % chartColors.length],
            };
        });
        return config;
    }, [categoryData]);

    // Add fill color to category data for pie chart
    const pieData = React.useMemo(() => {
        const chartColors = [
            "hsl(var(--chart-1))",
            "hsl(var(--chart-2))",
            "hsl(var(--chart-3))",
            "hsl(var(--chart-4))",
            "hsl(var(--chart-5))",
        ];
        return categoryData.map((item, idx) => ({
            ...item,
            fill: chartColors[idx % chartColors.length],
        }));
    }, [categoryData]);

    // Compute total for pie chart center label
    const totalCategoryCount = React.useMemo(() => {
        return categoryData.reduce((sum, item) => sum + item.count, 0);
    }, [categoryData]);

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
                <Card>
                    <CardHeader>
                        <div className="h-5 w-48 rounded-md bg-muted animate-pulse" />
                        <div className="h-3 w-56 rounded-md bg-muted animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full rounded-md bg-muted animate-pulse" />
                    </CardContent>
                </Card>
                <Separator />
                <Card>
                    <CardHeader>
                        <div className="h-5 w-40 rounded-md bg-muted animate-pulse" />
                        <div className="h-3 w-56 rounded-md bg-muted animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full rounded-md bg-muted animate-pulse" />
                    </CardContent>
                </Card>
                <Separator />
                <div className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-5 w-40 rounded-md bg-muted animate-pulse" />
                                <div className="h-3 w-56 rounded-md bg-muted animate-pulse" />
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

    const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label || period;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
                    <p className="text-sm text-muted-foreground">Job portal performance overview</p>
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

            {/* Full-width Daily Click Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">Daily Click Trends</CardTitle>
                    <CardDescription>Click count per day — {periodLabel}</CardDescription>
                </CardHeader>
                <CardContent>
                    {clicksOverTime.length > 0 ? (
                        <ChartContainer config={clicksChartConfig} className="aspect-auto h-[400px] w-full">
                            <AreaChart
                                accessibilityLayer
                                data={clicksOverTime}
                                margin={{ left: -20, right: 12 }}
                            >
                                <defs>
                                    <linearGradient id="fillDailyClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={formatDate}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    allowDecimals={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" labelFormatter={formatDate} />}
                                />
                                <Area
                                    dataKey="clicks"
                                    type="natural"
                                    fill="url(#fillDailyClicks)"
                                    stroke="var(--color-clicks)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-12">No click data yet</p>
                    )}
                </CardContent>
                {clicksOverTime.length > 0 && summary && (
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            {summary.clicksInPeriod?.toLocaleString()} clicks this period
                            {summary.clicksInPeriod > 0 && <TrendingUp className="h-4 w-4" />}
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Day-by-day click count — {summary.totalClicks?.toLocaleString()} total all time
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Separator />

            {/* Jobs Added vs Expired - Full Width */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">Jobs Added vs Expired</CardTitle>
                    <CardDescription>{periodLabel}</CardDescription>
                </CardHeader>
                <CardContent>
                    {jobsOverTime.length > 0 ? (
                        <ChartContainer config={jobsChartConfig} className="aspect-auto h-[300px] w-full">
                            <BarChart
                                accessibilityLayer
                                data={jobsOverTime}
                                margin={{ left: -20, right: 12 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={formatDate}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    allowDecimals={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent labelFormatter={formatDate} />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="jobsAdded"
                                    fill="var(--color-jobsAdded)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="jobsExpired"
                                    fill="var(--color-jobsExpired)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-12">No data available</p>
                    )}
                </CardContent>
                {jobsOverTime.length > 0 && summary && (
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            {summary.jobsAddedInPeriod > 0 ? (
                                <>
                                    {summary.jobsAddedInPeriod} jobs added this period
                                    <TrendingUp className="h-4 w-4" />
                                </>
                            ) : (
                                "No new jobs added this period"
                            )}
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing jobs added and expired over time
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Separator />

            {/* Charts Row 2: Top Jobs + Category Distribution */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Performing Jobs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold tracking-tight">Top Performing Jobs</CardTitle>
                        <CardDescription>Top 10 jobs by click count</CardDescription>
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
                            <p className="text-sm text-muted-foreground text-center py-12">No click data yet</p>
                        )}
                    </CardContent>
                    {topJobs.length > 0 && (
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="leading-none text-muted-foreground">
                                Ranked by total click count
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* Pie Chart - Category Distribution */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <div className="space-y-1.5">
                            <CardTitle className="text-lg font-semibold tracking-tight">Job Distribution</CardTitle>
                            <CardDescription>
                                By {CATEGORY_OPTIONS.find((o) => o.value === category)?.label || category}
                            </CardDescription>
                        </div>
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
                    <CardContent className="flex-1 pb-0">
                        {pieData.length > 0 ? (
                            <ChartContainer
                                config={pieChartConfig}
                                className="mx-auto aspect-square max-h-[300px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={pieData}
                                        dataKey="count"
                                        nameKey="label"
                                        innerRadius={60}
                                        strokeWidth={5}
                                    >
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {totalCategoryCount.toLocaleString()}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className="fill-muted-foreground"
                                                            >
                                                                Jobs
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-12">No data available</p>
                        )}
                    </CardContent>
                    {pieData.length > 0 && (
                        <CardFooter className="flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2 font-medium leading-none">
                                {totalCategoryCount.toLocaleString()} total jobs across {pieData.length} categories
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Distribution by {CATEGORY_OPTIONS.find((o) => o.value === category)?.label?.toLowerCase() || category}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
