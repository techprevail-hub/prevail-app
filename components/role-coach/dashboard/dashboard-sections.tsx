"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Star,
  Users,
  Clock3,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  BOX,
  Bar,
  Donut,
  Empty,
  EarningsBars,
  Panel,
  SessionRow,
  StatTile,
  formatCurrency,
  formatDate,
  getAmount,
  getInitials,
  greeting,
  pct,
} from "./dashboard-ui";

import type {
  CoachDashboardData,
} from "@/types/role-coach/coachDashboard.types";

const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";
const PRIMARY = "text-[#6C5CE7]";

const ROUTES = {
  earnings: "/dashboard/coach/earnings",
  clients: "/dashboard/coach/clients",
  sessions: "/dashboard/coach/sessions",
  reviews: "/dashboard/coach/reviews",
  analytics: "/dashboard/coach/analytics",
  calendar: "/dashboard/coach/calendar",
};

type DashboardSectionsProps = {
  dashboard: CoachDashboardData | null;
  loading: boolean;
};

export function DashboardSections({
  dashboard,
  loading,
}: DashboardSectionsProps) {
  const hasDashboard = Boolean(dashboard);

  const coach = dashboard?.coach;
  const overview = dashboard?.overview;
  const upcomingSessions = dashboard?.upcomingSessions ?? [];
  const recentClients = dashboard?.recentClients ?? [];
  const earningsOverview = dashboard?.earningsOverview;
  const performanceOverview = dashboard?.performanceOverview;
  const recentReviews = dashboard?.recentReviews ?? [];

  const currency =
    overview?.monthlyEarnings?.[0]?.currency ||
    overview?.totalEarnings?.[0]?.currency ||
    "INR";

  const thisMonth = getAmount(earningsOverview?.currentMonth, currency);
  const lastMonth = getAmount(earningsOverview?.previousMonth, currency);

  const change =
    lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

  const completion = pct(coach?.profileCompletion);

  const breakdown = [
    {
      label: "Completed",
      value: overview?.completedSessions ?? 0,
      hex: "#10b981",
    },
    {
      label: "Confirmed",
      value: overview?.confirmedSessions ?? 0,
      hex: "#6C5CE7",
    },
    {
      label: "Pending",
      value: overview?.pendingSessions ?? 0,
      hex: "#f59e0b",
    },
    {
      label: "Cancelled",
      value: overview?.cancelledSessions ?? 0,
      hex: "#ef4444",
    },
  ];

  return (
    <>
      {/* Hero and Earnings */}
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
                src={coach?.profileImage || undefined}
                alt={coach?.name || "Coach"}
              />
              <AvatarFallback className="bg-gradient-to-br from-[#6C5CE7] to-[#8E7BFF] text-xl font-semibold text-white">
                {getInitials(coach?.name)}
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
                {hasDashboard ? coach?.name || "Coach" : "Loading your dashboard…"}
              </h1>

              <p className="mt-1 line-clamp-2 text-sm text-[#787680]">
                {coach?.headline ||
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
              <Link
                href={ROUTES.sessions}
                className="rounded-2xl bg-violet-50 px-4 py-2.5 text-center transition-colors hover:bg-violet-100"
              >
                <p className={cn(HEADING, "text-xl font-extrabold", PRIMARY)}>
                  {hasDashboard ? overview?.upcomingSessions : "—"}
                </p>
                <p className="text-xs text-[#787680]">Upcoming</p>
              </Link>

              <Link
                href={ROUTES.sessions}
                className="rounded-2xl bg-amber-50 px-4 py-2.5 text-center transition-colors hover:bg-amber-100"
              >
                <p className={cn(HEADING, "text-xl font-extrabold", PRIMARY)}>
                  {hasDashboard ? overview?.pendingSessions : "—"}
                </p>
                <p className="text-xs text-[#787680]">Pending</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Earnings card */}
        <Link
          href={ROUTES.earnings}
          className="group relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C5CE7] to-[#8E7BFF] p-5 text-white shadow-lg shadow-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-violet-100">Earnings this month</p>
              <p className={cn(HEADING, "mt-1 text-3xl font-extrabold")}>
                {hasDashboard ? formatCurrency(thisMonth, currency) : "—"}
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
            (earningsOverview?.monthlyBreakdown?.length ?? 0) > 0 ? (
              <EarningsBars
                data={earningsOverview!.monthlyBreakdown}
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
              {hasDashboard ? formatCurrency(lastMonth, currency) : "—"}
            </p>
          </div>

          <span className="absolute bottom-5 right-5 text-xs font-semibold text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
            View earnings →
          </span>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total Clients"
          value={hasDashboard ? overview?.totalClients ?? 0 : "—"}
          icon={Users}
          tone="bg-blue-50 text-blue-600"
          href={ROUTES.clients}
        />

        <StatTile
          label="Total Sessions"
          value={hasDashboard ? overview?.totalSessions ?? 0 : "—"}
          icon={CalendarDays}
          tone="bg-violet-100 text-[#6C5CE7]"
          href={ROUTES.sessions}
        />

        <StatTile
          label="Completed"
          value={hasDashboard ? overview?.completedSessions ?? 0 : "—"}
          icon={Clock3}
          tone="bg-emerald-50 text-emerald-600"
          href={ROUTES.sessions}
        />

        <StatTile
          label="Net Earnings"
          value={
            hasDashboard
              ? formatCurrency(
                  getAmount(overview?.totalEarnings, currency),
                  currency
                )
              : "—"
          }
          icon={DollarSign}
          tone="bg-amber-50 text-[#AC5D00]"
          href={ROUTES.earnings}
        />
      </div>

      {/* Upcoming sessions and status */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title="Upcoming Sessions"
          icon={CalendarDays}
          className="lg:col-span-2"
          href={ROUTES.sessions}
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
              {upcomingSessions.map((session) => (
                <SessionRow key={session.id} session={session} />
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

        <Panel
          title="Session Status"
          icon={Activity}
          href={ROUTES.sessions}
        >
          <div className="flex flex-col items-center gap-6">
            <Donut
              segments={breakdown}
              total={overview?.totalSessions ?? 0}
              loading={!hasDashboard || loading}
            />

            <div className="grid w-full grid-cols-2 gap-3">
              {breakdown.map((item) => {
                const share =
                  (overview?.totalSessions ?? 0) > 0
                    ? Math.round(
                        (item.value / overview!.totalSessions) * 100
                      )
                    : 0;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-violet-50/60 p-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-[#787680]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: item.hex }}
                      />
                      {item.label}
                    </div>

                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className={cn(HEADING, "text-xl font-extrabold", PRIMARY)}>
                        {hasDashboard ? item.value : "—"}
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

      {/* Recent clients and performance */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title="Recent Clients"
          icon={Users}
          className="lg:col-span-2"
          href={ROUTES.clients}
        >
          {recentClients.length > 0 ? (
            <div className="divide-y divide-violet-50">
              {recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={ROUTES.clients}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-violet-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C5CE7]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-violet-100 font-semibold text-[#6C5CE7]">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {client.name}
                      </p>
                      <p className="truncate text-xs text-[#787680]">
                        {client.position || client.industry || "Client"}
                        {client.company ? ` · ${client.company}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-[#6C5CE7]">
                      {client.totalSessions} sessions
                    </span>
                    <span className="hidden rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-[#6C5CE7] sm:inline">
                      {client.completedSessions} done
                    </span>
                  </div>
                </Link>
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

        <Panel
          title="Performance"
          icon={BriefcaseBusiness}
          href={ROUTES.analytics}
        >
          <div className="space-y-5">
            {[
              {
                label: "Completion Rate",
                value: performanceOverview?.completionRate ?? 0,
                fill: "bg-[#6C5CE7]",
              },
              {
                label: "Cancellation Rate",
                value: performanceOverview?.cancellationRate ?? 0,
                fill: "bg-red-400",
              },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-600">{metric.label}</span>
                  <span className={cn("font-semibold", PRIMARY)}>
                    {hasDashboard ? `${Number(metric.value || 0)}%` : "—"}
                  </span>
                </div>
                <Bar
                  value={hasDashboard ? metric.value : 0}
                  fill={metric.fill}
                />
              </div>
            ))}

            <div className="flex items-center justify-between rounded-2xl bg-violet-50/70 p-4">
              <span className="text-sm text-[#787680]">Active Services</span>
              <span className={cn(HEADING, "text-2xl font-extrabold", PRIMARY)}>
                {hasDashboard ? overview?.activeServices : "—"}
                <span className="ml-1 text-sm font-normal text-[#787680]">
                  / {hasDashboard ? overview?.totalServices : "—"}
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
        href={ROUTES.reviews}
        action={
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[#6C5CE7]">
              {hasDashboard
                ? Number(overview?.averageRating || 0).toFixed(1)
                : "—"}
            </span>
            <span className="text-xs text-[#787680]">
              ({hasDashboard ? overview?.totalReviews : "—"})
            </span>
          </div>
        }
      >
        {recentReviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentReviews.map((review) => (
              <Link
                key={review.id}
                href={ROUTES.reviews}
                className="flex flex-col rounded-2xl bg-violet-50/50 p-4 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "h-4 w-4",
                        index < Math.round(Number(review.rating) || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      )}
                    />
                  ))}
                </div>

                <p
                  className={cn(
                    "mt-3 flex-1 text-sm leading-6",
                    review.reviewText
                      ? "text-slate-600"
                      : "italic text-slate-400"
                  )}
                >
                  {review.reviewText || "No written feedback provided."}
                </p>

                <div className="mt-4 flex items-center gap-3 border-t border-violet-100 pt-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-white text-xs font-semibold text-[#6C5CE7]">
                      {getInitials(review.clientName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {review.clientName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
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

      {/* Availability shortcut */}
      <Link
        href={ROUTES.calendar}
        className="flex items-center justify-between gap-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-[#6C5CE7]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-slate-900">Manage Availability</p>
            <p className="text-sm text-[#787680]">
              Update your calendar and available time slots.
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-[#6C5CE7]" />
      </Link>
    </>
  );
}