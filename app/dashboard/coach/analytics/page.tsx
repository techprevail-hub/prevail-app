"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  XCircle,
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getCoachAnalytics } from "@/services/role-coach/analyticsService";
import type {
  CoachAnalytics,
  CoachAnalyticsPeriodFilter,
} from "@/types/role-coach/analytics";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  completed: "#16a34a",
  upcoming: "#3b82f6",
  cancelled: "#ef4444",
  noShow: "#f97316",
  other: "#94a3b8",
};

const RATING_COLOR = "#f59e0b";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCurrency(
  value: number,
  currency: string | null,
  mixedCurrencies: boolean
): string {
  if (mixedCurrencies) {
    return `Value: ${formatNumber(value)}`;
  }

  const currencyCode = currency || "INR";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch {
    return `${currencyCode} ${formatNumber(value)}`;
  }
}

function formatDate(date: string): string {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-blue-50 text-blue-600",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconClassName?: string;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export default function CoachAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CoachAnalytics | null>(null);
  const [period, setPeriod] = useState<CoachAnalyticsPeriodFilter>(6);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getCoachAnalytics(period);
        setAnalytics(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading analytics."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const summary = analytics?.summary;
  const breakdown = analytics?.sessionBreakdown;

  const sessionBreakdownData = useMemo(() => {
    if (!breakdown) return [];

    return [
      {
        name: "Completed",
        value: breakdown.completed || 0,
        color: STATUS_COLORS.completed,
      },
      {
        name: "Upcoming",
        value: breakdown.upcoming || 0,
        color: STATUS_COLORS.upcoming,
      },
      {
        name: "Cancelled",
        value: breakdown.cancelled || 0,
        color: STATUS_COLORS.cancelled,
      },
      {
        name: "No-show",
        value: breakdown.noShow || 0,
        color: STATUS_COLORS.noShow,
      },
      {
        name: "Other",
        value: breakdown.other || 0,
        color: STATUS_COLORS.other,
      },
    ].filter((item) => item.value > 0);
  }, [breakdown]);

  const ratingData = useMemo(() => {
    const distribution = analytics?.ratingDistribution;

    if (!distribution) return [];

    return [1, 2, 3, 4, 5].map((rating) => ({
      rating: `${rating} star${rating === 1 ? "" : "s"}`,
      count:
        distribution[rating as keyof typeof distribution] ?? 0,
    }));
  }, [analytics?.ratingDistribution]);

  const earningsLabel = useMemo(() => {
    if (!summary) return "Earnings";

    return summary.mixedCurrencies
      ? "Earnings (mixed currencies)"
      : "Earnings";
  }, [summary]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-100" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-2xl">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load analytics
            </h2>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <Button
              onClick={() => void loadAnalytics()}
              className="mt-5"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || !summary || !breakdown) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center text-sm text-slate-500">
            No analytics data is available for this period.
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => void loadAnalytics()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-slate-50/60 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <BarChart3 className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Coach Analytics
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Track your sessions, earnings, ratings, and service performance.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(analytics.period.startDate)} –{" "}
            {formatDate(analytics.period.endDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            {[6, 12].map((months) => (
              <Button
                key={months}
                size="sm"
                variant={period === months ? "default" : "ghost"}
                className="rounded-lg"
                onClick={() =>
                  setPeriod(months as CoachAnalyticsPeriodFilter)
                }
              >
                {months} months
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => void loadAnalytics(true)}
            disabled={refreshing}
            className="bg-white"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={formatNumber(summary.totalSessions)}
          description={`${formatNumber(summary.completedSessions)} completed`}
          icon={CalendarDays}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Upcoming Sessions"
          value={formatNumber(summary.upcomingSessions)}
          description="Sessions scheduled"
          icon={Clock3}
          iconClassName="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Average Rating"
          value={`${Number(summary.averageRating || 0).toFixed(1)} / 5`}
          description={`${formatNumber(summary.totalReviews)} total reviews`}
          icon={Star}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Net Earnings"
          value={formatCurrency(
            summary.totalNetEarnings,
            summary.currency,
            summary.mixedCurrencies
          )}
          description={earningsLabel}
          icon={IndianRupee}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </section>

      {/* Additional session metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-xl font-semibold">
                {formatNumber(summary.completedSessions)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-red-50 p-2 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Cancelled</p>
              <p className="text-xl font-semibold">
                {formatNumber(summary.cancelledSessions)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">No-show Sessions</p>
              <p className="text-xl font-semibold">
                {formatNumber(summary.noShowSessions)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Monthly trends */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-blue-600" />
              Monthly Session Trend
            </CardTitle>
            <CardDescription>
              Sessions recorded each month
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.monthlyTrend.length === 0 ? (
              <EmptyChart message="No session trend data is available." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.monthlyTrend}
                    margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Sessions"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Monthly Earnings Trend
            </CardTitle>
            <CardDescription>
              {summary.mixedCurrencies
                ? "Monthly earnings values across mixed currencies"
                : `Monthly earnings${summary.currency ? ` (${summary.currency})` : ""}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.monthlyTrend.length === 0 ? (
              <EmptyChart message="No earnings trend data is available." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.monthlyTrend}
                    margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value: number) =>
                        new Intl.NumberFormat("en-IN", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(
                          Number(value ?? 0),
                          summary.currency,
                          summary.mixedCurrencies
                        ),
                        "Earnings",
                      ]}
                    />
                    <Bar
                      dataKey="earnings"
                      name="Earnings"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Gross Earnings</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(
                    summary.totalGrossEarnings,
                    summary.currency,
                    summary.mixedCurrencies
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Net Earnings</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">
                  {formatCurrency(
                    summary.totalNetEarnings,
                    summary.currency,
                    summary.mixedCurrencies
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Session breakdown and ratings */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Session Status Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of sessions by status
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sessionBreakdownData.length === 0 ? (
              <EmptyChart message="No session status data is available." />
            ) : (
              <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionBreakdownData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={88}
                        paddingAngle={3}
                      >
                        {sessionBreakdownData.map((item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Completed",
                      value: breakdown.completed,
                      color: STATUS_COLORS.completed,
                    },
                    {
                      label: "Upcoming",
                      value: breakdown.upcoming,
                      color: STATUS_COLORS.upcoming,
                    },
                    {
                      label: "Cancelled",
                      value: breakdown.cancelled,
                      color: STATUS_COLORS.cancelled,
                    },
                    {
                      label: "No-show",
                      value: breakdown.noShow,
                      color: STATUS_COLORS.noShow,
                    },
                    {
                      label: "Other",
                      value: breakdown.other,
                      color: STATUS_COLORS.other,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-600">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatNumber(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-amber-500" />
              Rating Distribution
            </CardTitle>
            <CardDescription>
              Ratings received from clients
            </CardDescription>
          </CardHeader>

          <CardContent>
            {ratingData.every((item) => item.count === 0) ? (
              <EmptyChart message="No ratings have been recorded yet." />
            ) : (
              <>
                <div className="mb-5 flex items-center gap-4 rounded-xl bg-amber-50 p-4">
                  <div className="rounded-xl bg-white p-3 text-amber-500 shadow-sm">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {Number(summary.averageRating || 0).toFixed(1)}
                      <span className="ml-1 text-sm font-medium text-slate-500">
                        / 5
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Based on {formatNumber(summary.totalReviews)} reviews
                    </p>
                  </div>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingData}
                      layout="vertical"
                      margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="rating"
                        width={70}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Reviews"
                        fill={RATING_COLOR}
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Top services */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BriefcaseBusiness className="h-5 w-5 text-violet-600" />
            Top Performing Services
          </CardTitle>
          <CardDescription>
            Services ranked by number of sessions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {analytics.topServices.length === 0 ? (
            <EmptyChart message="No service performance data is available." />
          ) : (
            <div className="space-y-5">
              {analytics.topServices.map((service, index) => {
                const maxSessions = Math.max(
                  ...analytics.topServices.map((item) => item.sessions),
                  1
                );

                const percentage = Math.min(
                  100,
                  (service.sessions / maxSessions) * 100
                );

                return (
                  <div key={`${service.name}-${index}`}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-medium text-slate-800">
                          {service.name}
                        </span>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-slate-900">
                        {formatNumber(service.sessions)}{" "}
                        {service.sessions === 1 ? "session" : "sessions"}
                      </span>
                    </div>

                    <div className="ml-11 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-400">
        <span>
          Showing analytics for the last {analytics.period.months} months
        </span>
        <span className="flex items-center gap-1">
          <ArrowUpRight className="h-3.5 w-3.5" />
          Data from your coach account
        </span>
      </div>
    </main>
  );
}