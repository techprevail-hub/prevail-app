
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  DollarSign,
  MessageSquare,
  RefreshCw,
  Star,
  Users,
  Video,
} from "lucide-react";

import { getCoachDashboard } from "@/services/role-coach/coachDashboard.service";

import type {
  CoachDashboardData,
  CurrencyAmount,
  MonthlyEarning,
  UpcomingCoachSession,
} from "@/types/role-coach/coachDashboard.types";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";
const PRIMARY = "text-[#6C5CE7]";

const BOX =
  "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-violet-100 sm:p-6";

// ---------------- helpers ----------------

const formatCurrency = (amount: number, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency} ${amount || 0}`;
  }
};

const parseDate = (date?: string | null) => {
  const d = date
    ? new Date(`${date.slice(0, 10)}T00:00:00`)
    : null;

  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const formatDate = (date?: string | null) =>
  parseDate(date)?.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) ?? "Date unavailable";

const formatTime = (time?: string | null) => {
  if (!time) return "Time unavailable";

  const [h, m] = time.split(":");
  const d = new Date();

  d.setHours(Number(h), Number(m), 0, 0);

  return Number.isNaN(d.getTime())
    ? time
    : d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
};

const getInitials = (name?: string | null) =>
  name?.trim()
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "C";

const getAmount = (
  amounts: CurrencyAmount[] | undefined,
  currency = "INR"
) =>
  amounts?.find(
    (a) => a.currency?.toUpperCase() === currency.toUpperCase()
  )?.amount || 0;

const pct = (v: number | null | undefined) =>
  Math.min(Math.max(Number(v) || 0, 0), 100);

const greeting = () => {
  const h = new Date().getHours();

  return h < 12
    ? "Good morning"
    : h < 17
      ? "Good afternoon"
      : "Good evening";
};

const statusStyle = (status: string) =>
  ({
    confirmed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  })[status?.toLowerCase()] ??
  "border-slate-200 bg-slate-50 text-slate-600";

// ---------------- building blocks ----------------

const Bar = ({
  value,
  fill = "bg-[#6C5CE7]",
  className,
}: {
  value: number | null | undefined;
  fill?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "h-2 w-full overflow-hidden rounded-full bg-violet-100",
      className
    )}
  >
    <div
      className={cn(
        "h-full rounded-full transition-all duration-500",
        fill
      )}
      style={{
        width: `${pct(value)}%`,
      }}
    />
  </div>
);

function Panel({
  title,
  icon: Icon,
  action,
  className,
  children,
}: {
  title: string;
  icon: ElementType;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn(BOX, className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-[#6C5CE7]">
            <Icon className="h-[18px] w-[18px]" />
          </span>

          <h2
            className={cn(
              HEADING,
              "text-base font-bold text-slate-900"
            )}
          >
            {title}
          </h2>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

const Empty = ({
  icon: Icon,
  text,
}: {
  icon: ElementType;
  text: string;
}) => (
  <div className="rounded-2xl bg-violet-50/60 px-4 py-9 text-center">
    <Icon className="mx-auto h-7 w-7 text-violet-300" />

    <p className="mt-2 text-sm text-[#787680]">{text}</p>
  </div>
);

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  tone: string;
}) {
  return (
    <div
      className={cn(
        BOX,
        "flex items-center gap-4 !p-5 transition-shadow hover:shadow-md hover:shadow-violet-100"
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          tone
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm text-[#787680]">{label}</p>

        <p
          className={cn(
            HEADING,
            "truncate text-2xl font-extrabold",
            PRIMARY
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SessionRow({
  session,
}: {
  session: UpcomingCoachSession;
}) {
  const d = parseDate(session.sessionDate);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-violet-50/50 p-3 transition-colors hover:bg-violet-50 sm:gap-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#6C5CE7] shadow-sm">
        <span
          className={cn(
            HEADING,
            "text-lg font-extrabold leading-none"
          )}
        >
          {d?.getDate() ?? "--"}
        </span>

        <span className="mt-0.5 text-[10px] font-semibold uppercase">
          {d?.toLocaleDateString("en-IN", {
            month: "short",
          }) ?? "---"}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">
          {session.serviceName || "Coaching Session"}
        </p>

        <p className="truncate text-sm text-[#787680]">
          With {session.clientName || "Client"}
        </p>

        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#787680]">
          <Clock3 className="h-3 w-3" />

          {formatTime(session.startTime)}

          {session.durationMinutes
            ? ` · ${session.durationMinutes} min`
            : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            statusStyle(session.status)
          )}
        >
          {session.status}
        </Badge>

        {session.meetingUrl && (
          <Button
            size="sm"
            className="rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bd6]"
            onClick={() =>
              window.open(
                session.meetingUrl!,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <Video className="mr-1.5 h-4 w-4" />
            Join
          </Button>
        )}
      </div>
    </div>
  );
}

function EarningsBars({
  data,
  currency,
}: {
  data: MonthlyEarning[];
  currency: string;
}) {
  const rows = data.map((i) => ({
    ...i,
    amount: getAmount(i.earnings, currency),
  }));

  const max = Math.max(...rows.map((r) => r.amount), 1);

  return (
    <div className="flex h-36 items-end gap-2">
      {rows.map((r, i) => (
        <div
          key={r.month}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
        >
          <div className="flex h-full w-full items-end">
            <div
              title={`${r.label}: ${formatCurrency(
                r.amount,
                currency
              )}`}
              className={cn(
                "w-full rounded-t-lg",
                i === rows.length - 1
                  ? "bg-white"
                  : "bg-white/30"
              )}
              style={{
                height: `${
                  r.amount > 0
                    ? Math.max((r.amount / max) * 100, 6)
                    : 3
                }%`,
              }}
            />
          </div>

          <span className="text-[11px] text-white/80">
            {r.label.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

function Donut({
  segments,
  total,
  loading = false,
}: {
  segments: {
    label: string;
    value: number;
    hex: string;
  }[];
  total: number;
  loading?: boolean;
}) {
  const size = 168;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  const active = segments.filter((s) => s.value > 0);
  const gap = active.length > 1 ? 4 : 0;

  let offset = 0;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EDE9FE"
          strokeWidth={stroke}
        />

        {total > 0 &&
          active.map((seg) => {
            const len = (seg.value / total) * circ;

            const el = (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.hex}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(
                  len - gap,
                  0
                )} ${circ}`}
                strokeDashoffset={-offset}
              />
            );

            offset += len;

            return el;
          })}
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className={cn(
            HEADING,
            "text-4xl font-extrabold leading-none",
            PRIMARY
          )}
        >
          {loading ? "—" : total}
        </span>

        <span
          style={{
            color: "#787680",
            fontSize: 12,
            marginTop: 6,
          }}
        >
          Total sessions
        </span>
      </div>
    </div>
  );
}

// ---------------- page ----------------

export default function CoachDashboardPage() {
  const [dashboard, setDashboard] =
    useState<CoachDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API loads in the background.
  // The UI does not wait for this function to finish.
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCoachDashboard();

      if (!data?.coach || !data?.overview) {
        throw new Error(
          "Invalid dashboard response received from the server."
        );
      }

      setDashboard(data);
    } catch (err) {
      console.error("Coach dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load coach dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const currency = useMemo(
    () =>
      dashboard?.overview.monthlyEarnings?.[0]?.currency ||
      dashboard?.overview.totalEarnings?.[0]?.currency ||
      "INR",
    [dashboard]
  );

  // Default values let the complete UI render before the API responds.
  const hasDashboard = Boolean(dashboard);

  const {
    coach,
    overview,
    upcomingSessions,
    recentClients,
    earningsOverview,
    performanceOverview,
    recentReviews,
  } = dashboard ?? {
    coach: {
      id: "",
      name: "",
      email: "",
      profileImage: null,
      headline: null,
      specialization: null,
      experienceYears: 0,
      profileCompletion: 0,
    },

    overview: {
      totalClients: 0,
      totalServices: 0,
      activeServices: 0,
      totalSessions: 0,
      completedSessions: 0,
      confirmedSessions: 0,
      pendingSessions: 0,
      cancelledSessions: 0,
      upcomingSessions: 0,
      totalEarnings: [],
      monthlyEarnings: [],
      averageRating: 0,
      totalReviews: 0,
    },

    upcomingSessions: [],
    recentClients: [],

    earningsOverview: {
      currentMonth: [],
      previousMonth: [],
      monthlyBreakdown: [],
    },

    performanceOverview: {
      completionRate: 0,
      cancellationRate: 0,
    },

    recentReviews: [],
  };

  const thisMonth = getAmount(
    earningsOverview.currentMonth,
    currency
  );

  const lastMonth = getAmount(
    earningsOverview.previousMonth,
    currency
  );

  const change =
    lastMonth > 0
      ? ((thisMonth - lastMonth) / lastMonth) * 100
      : null;

  const completion = pct(coach.profileCompletion);

  const breakdown = [
    {
      label: "Completed",
      value: overview.completedSessions,
      hex: "#10b981",
    },
    {
      label: "Confirmed",
      value: overview.confirmedSessions,
      hex: "#6C5CE7",
    },
    {
      label: "Pending",
      value: overview.pendingSessions,
      hex: "#f59e0b",
    },
    {
      label: "Cancelled",
      value: overview.cancelledSessions,
      hex: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen space-y-5 bg-gradient-to-b from-[#F6F4FF] to-white p-4 md:p-6 lg:p-8">

      {/* Loading / Error message */}
      {(error || loading) && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-violet-100 bg-white/80 text-slate-500"
          )}
        >
          <p>
            {error
              ? `Dashboard data could not be refreshed: ${error}`
              : "Loading your latest dashboard data…"}
          </p>

          {error && (
            <Button
              size="sm"
              onClick={loadDashboard}
              className="rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bd6]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      )}

      {/* Hero + Earnings */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section
          className={cn(
            BOX,
            "relative flex flex-col justify-between gap-6 overflow-hidden lg:col-span-2"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-100/70 blur-3xl"
          />

          <div className="relative flex items-center gap-4 sm:gap-5">
            <Avatar className="h-16 w-16 shrink-0 ring-4 ring-violet-100 sm:h-20 sm:w-20">
              <AvatarImage
                src={coach.profileImage || undefined}
                alt={hasDashboard ? coach.name || "Coach" : "Loading"}
              />

              <AvatarFallback className="bg-gradient-to-br from-[#6C5CE7] to-[#8E7BFF] text-xl font-semibold text-white">
                {getInitials(coach.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#6C5CE7]">
                {greeting()} 👋
              </p>

              <h1
                className={cn(
                  HEADING,
                  "truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
                )}
              >
                {hasDashboard
                  ? coach.name || "Coach"
                  : "Loading your dashboard…"}
              </h1>

              <p className="mt-1 line-clamp-2 text-sm text-[#787680]">
                {coach.headline ||
                  "Here is an overview of your coaching activities and performance."}
              </p>
            </div>
          </div>

          <div className="relative grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Profile completion
                </span>

                <span className="font-bold text-[#6C5CE7]">
                  {hasDashboard ? `${completion}%` : "—"}
                </span>
              </div>

              <Bar
                value={hasDashboard ? completion : 0}
                className="h-2.5"
              />

              {hasDashboard && completion < 100 && (
                <p className="mt-2 text-xs text-[#787680]">
                  Complete your profile to attract more bookings.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl bg-violet-50 px-4 py-2.5 text-center">
                <p className={cn(HEADING, "text-xl font-extrabold", PRIMARY)}>
                  {hasDashboard ? overview.upcomingSessions : "—"}
                </p>

                <p className="text-xs text-[#787680]">Upcoming</p>
              </div>

              <div className="rounded-2xl bg-amber-50 px-4 py-2.5 text-center">
                <p className={cn(HEADING, "text-xl font-extrabold", PRIMARY)}>
                  {hasDashboard ? overview.pendingSessions : "—"}
                </p>

                <p className="text-xs text-[#787680]">Pending</p>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings */}
        <section className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C5CE7] to-[#8E7BFF] p-5 text-white shadow-lg shadow-violet-200 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-violet-100">
                Earnings this month
              </p>

              <p className={cn(HEADING, "mt-1 text-3xl font-extrabold")}>
                {hasDashboard
                  ? formatCurrency(thisMonth, currency)
                  : "—"}
              </p>
            </div>

            {hasDashboard && change !== null && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                <ArrowUpRight
                  className={cn(
                    "h-3.5 w-3.5",
                    change < 0 && "rotate-90"
                  )}
                />

                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>

          <div className="relative">
            {hasDashboard &&
            earningsOverview.monthlyBreakdown?.length > 0 ? (
              <EarningsBars
                data={earningsOverview.monthlyBreakdown}
                currency={currency}
              />
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-violet-100">
                {hasDashboard
                  ? "No earnings data available yet."
                  : "Loading earnings…"}
              </div>
            )}

            <p className="mt-3 text-xs text-violet-100">
              Last month:{" "}
              {hasDashboard
                ? formatCurrency(lastMonth, currency)
                : "—"}
            </p>
          </div>
        </section>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total Clients"
          value={hasDashboard ? overview.totalClients : "—"}
          icon={Users}
          tone="bg-blue-50 text-blue-600"
        />

        <StatTile
          label="Total Sessions"
          value={hasDashboard ? overview.totalSessions : "—"}
          icon={CalendarDays}
          tone="bg-violet-100 text-[#6C5CE7]"
        />

        <StatTile
          label="Completed"
          value={hasDashboard ? overview.completedSessions : "—"}
          icon={Clock3}
          tone="bg-emerald-50 text-emerald-600"
        />

        <StatTile
          label="Net Earnings"
          value={
            hasDashboard
              ? formatCurrency(
                  getAmount(overview.totalEarnings, currency),
                  currency
                )
              : "—"
          }
          icon={DollarSign}
          tone="bg-amber-50 text-[#AC5D00]"
        />
      </div>

      {/* Upcoming + Status */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title="Upcoming Sessions"
          icon={CalendarDays}
          className="lg:col-span-2"
          action={
            <Badge
              variant="outline"
              className="border-violet-200 bg-violet-50 text-[#6C5CE7]"
            >
              {hasDashboard
                ? `${upcomingSessions.length} upcoming`
                : "Loading…"}
            </Badge>
          }
        >
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          ) : (
            <Empty
              icon={CalendarDays}
              text={
                hasDashboard
                  ? "Your confirmed bookings will appear here."
                  : "Loading your upcoming sessions…"
              }
            />
          )}
        </Panel>

        <Panel title="Session Status" icon={Activity}>
          <div className="flex flex-col items-center gap-6">
            <Donut
              segments={breakdown}
              total={overview.totalSessions}
              loading={!hasDashboard}
            />

            <div className="grid w-full grid-cols-2 gap-3">
              {breakdown.map((b) => {
                const share =
                  overview.totalSessions > 0
                    ? Math.round(
                        (b.value / overview.totalSessions) * 100
                      )
                    : 0;

                return (
                  <div
                    key={b.label}
                    className="rounded-2xl bg-violet-50/60 p-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-[#787680]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: b.hex }}
                      />

                      {b.label}
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          HEADING,
                          "text-xl font-extrabold",
                          PRIMARY
                        )}
                      >
                        {hasDashboard ? b.value : "—"}
                      </span>

                      <span className="text-xs text-[#787680]">
                        {hasDashboard ? `${share}%` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      </div>

      {/* Clients + Performance */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title="Recent Clients"
          icon={Users}
          className="lg:col-span-2"
        >
          {recentClients.length > 0 ? (
            <div className="divide-y divide-violet-50">
              {recentClients.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-violet-100 font-semibold text-[#6C5CE7]">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {c.name}
                      </p>

                      <p className="truncate text-xs text-[#787680]">
                        {c.position || c.industry || "Client"}
                        {c.company ? ` · ${c.company}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-[#6C5CE7]">
                      {c.totalSessions} sessions
                    </span>

                    <span className="hidden rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-[#6C5CE7] sm:inline">
                      {c.completedSessions} done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              icon={Users}
              text={
                hasDashboard
                  ? "No clients available yet."
                  : "Loading your recent clients…"
              }
            />
          )}
        </Panel>

        <Panel title="Performance" icon={BriefcaseBusiness}>
          <div className="space-y-5">
            {[
              {
                label: "Completion Rate",
                value: performanceOverview.completionRate,
                fill: "bg-[#6C5CE7]",
              },
              {
                label: "Cancellation Rate",
                value: performanceOverview.cancellationRate,
                fill: "bg-red-400",
              },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-600">{m.label}</span>

                  <span className={cn("font-semibold", PRIMARY)}>
                    {hasDashboard
                      ? `${Number(m.value || 0)}%`
                      : "—"}
                  </span>
                </div>

                <Bar
                  value={hasDashboard ? m.value : 0}
                  fill={m.fill}
                />
              </div>
            ))}

            <div className="flex items-center justify-between rounded-2xl bg-violet-50/70 p-4">
              <span className="text-sm text-[#787680]">
                Active Services
              </span>

              <span
                className={cn(
                  HEADING,
                  "text-2xl font-extrabold",
                  PRIMARY
                )}
              >
                {hasDashboard ? overview.activeServices : "—"}

                <span className="ml-1 text-sm font-normal text-[#787680]">
                  / {hasDashboard ? overview.totalServices : "—"}
                </span>
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Reviews */}
      <Panel
        title="Recent Reviews"
        icon={MessageSquare}
        action={
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

            <span className="font-bold text-[#6C5CE7]">
              {hasDashboard
                ? Number(overview.averageRating || 0).toFixed(1)
                : "—"}
            </span>

            <span className="text-xs text-[#787680]">
              ({hasDashboard ? overview.totalReviews : "—"})
            </span>
          </div>
        }
      >
        {recentReviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentReviews.map((r) => (
              <div
                key={r.id}
                className="flex flex-col rounded-2xl bg-violet-50/50 p-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(Number(r.rating) || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      )}
                    />
                  ))}
                </div>

                <p
                  className={cn(
                    "mt-3 flex-1 text-sm leading-6",
                    r.reviewText
                      ? "text-slate-600"
                      : "italic text-slate-400"
                  )}
                >
                  {r.reviewText || "No written feedback provided."}
                </p>

                <div className="mt-4 flex items-center gap-3 border-t border-violet-100 pt-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-white text-xs font-semibold text-[#6C5CE7]">
                      {getInitials(r.clientName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {r.clientName}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon={MessageSquare}
            text={
              hasDashboard
                ? "No reviews received yet."
                : "Loading your recent reviews…"
            }
          />
        )}
      </Panel>
    </div>
  );
}
