"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe,
  Mail,
  MessageSquare,
  Plus,
  Star,
  Users,
  Wallet,
  Layers,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Bar,
  Chip,
  Donut,
  EarningsBars,
  EmptyState,
  Panel,
  ProgressRing,
  ServiceCard,
  SessionRow,
  StatCell,
  StatStrip,
  formatCurrency,
  formatDate,
  formatTime,
  formatTimezone,
  getAmount,
  getInitials,
  greeting,
  pct,
  statusStyle,
} from "./dashboard-ui";

import type { CoachDashboardData } from "@/types/role-coach/coachDashboard.types";

const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";

const ROUTES = {
  earnings: "/dashboard/coach/earnings",
  clients: "/dashboard/coach/clients",
  sessions: "/dashboard/coach/sessions",
  reviews: "/dashboard/coach/reviews",
  analytics: "/dashboard/coach/analytics",
  calendar: "/dashboard/coach/calendar",
  services: "/dashboard/coach/services",
};

const ACTION_LINK =
  "text-[11px] font-bold uppercase tracking-wide text-[#6C5CE7] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] rounded";

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
  const services = dashboard?.services ?? [];
  const earningsOverview = dashboard?.earningsOverview;
  const performanceOverview = dashboard?.performanceOverview;
  const recentReviews = dashboard?.recentReviews ?? [];

  /* ------------------------------ derived data ----------------------------- */

  const currency =
    overview?.monthlyEarnings?.[0]?.currency ||
    overview?.totalEarnings?.[0]?.currency ||
    "INR";

  const thisMonth = getAmount(earningsOverview?.currentMonth, currency);
  const lastMonth = getAmount(earningsOverview?.previousMonth, currency);
  const pendingSettlement = getAmount(
    earningsOverview?.pendingSettlement,
    currency
  );
  const netEarnings = getAmount(overview?.totalEarnings, currency);

  const monthly = earningsOverview?.monthlyBreakdown ?? [];
  const range =
    monthly.length > 0
      ? `${monthly[0].label} – ${monthly[monthly.length - 1].label}`
      : "";

  const completion = pct(coach?.profileCompletion);

  const totalSessions = overview?.totalSessions ?? 0;
  const confirmed = overview?.confirmedSessions ?? 0;
  const completed = overview?.completedSessions ?? 0;
  const pending = overview?.pendingSessions ?? 0;
  const cancelled = overview?.cancelledSessions ?? 0;

  const totalClients = overview?.totalClients ?? 0;
  const activeServices = overview?.activeServices ?? 0;
  const totalServices = overview?.totalServices ?? 0;

  const share = (value: number) =>
    totalSessions > 0 ? Math.round((value / totalSessions) * 100) : 0;

  const catalogueLive =
    totalServices > 0 ? Math.round((activeServices / totalServices) * 100) : 0;

  const breakdown = [
    { label: "Confirmed", value: confirmed, hex: "#6C5CE7" },
    { label: "Completed", value: completed, hex: "#10b981" },
    { label: "Pending", value: pending, hex: "#f59e0b" },
    { label: "Cancelled", value: cancelled, hex: "#f87171" },
  ];

  const experience = coach?.experienceYears
    ? ` (${coach.experienceYears} ${coach.experienceYears === 1 ? "yr" : "yrs"} exp)`
    : "";

  const timezone = formatTimezone(coach?.timezone);
  const placeholder = "—";

  /* --------------------------------- render -------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      {/* ------------------------------ Hero (50/50 Split) ------------------------------ */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-violet-100 sm:p-7">
        {/* Mesh background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="absolute left-1/2 -top-24 h-56 w-56 rounded-full bg-fuchsia-100/60 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(108,92,231,0.09)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom_right,black,transparent_70%)]" />
        </div>

        {/* 
          Grid layout: 
          - Mobile: stack (1 col)
          - Desktop: 50/50 split (2 cols)
        */}
        <div className="relative grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-center">
          
          {/* LEFT 50%: Identity */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative shrink-0 self-start sm:self-auto">
              <div className="rounded-full bg-gradient-to-br from-[#6C5CE7] via-[#A29BFE] to-[#AC5D00]/70 p-[3px] shadow-lg shadow-violet-200">
                <Avatar className="h-20 w-20 ring-[3px] ring-white sm:h-24 sm:w-24">
                  <AvatarImage
                    src={coach?.profileImage || undefined}
                    alt={coach?.name || "Coach"}
                  />
                  <AvatarFallback
                    className={cn(
                      HEADING,
                      "bg-gradient-to-br from-[#6C5CE7] to-[#8E7BFF] text-2xl font-extrabold text-white"
                    )}
                  >
                    {getInitials(coach?.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-[3px] ring-white"
                title="Active"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#6C5CE7]">{greeting()}</p>

              <h1
                className={cn(
                  HEADING,
                  "mt-0.5 truncate text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
                )}
              >
                {hasDashboard ? coach?.name || "Coach" : "Loading…"}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Chip tone="amber" className="uppercase tracking-wide">
                  AI Coach
                </Chip>
                <Chip tone="green">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Mentor
                </Chip>
              </div>

              <p className="mt-3 line-clamp-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
                {hasDashboard
                  ? `${coach?.headline || coach?.specialization || "Career Coach"}${experience}`
                  : "Loading your dashboard…"}
              </p>

              {(coach?.email || timezone) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  {coach?.email && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-violet-100">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#6C5CE7]" />
                      <span className="truncate">{coach.email}</span>
                    </span>
                  )}
                  {timezone && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-violet-100">
                      <Globe className="h-3.5 w-3.5 shrink-0 text-[#6C5CE7]" />
                      {timezone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 50%: Readiness + Quick Counts */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-violet-100 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <ProgressRing
                value={completion}
                loading={!hasDashboard}
                size={76}
                stroke={8}
              />
              <div className="min-w-0">
                <p className={cn(HEADING, "text-sm font-bold text-slate-900")}>
                  Profile readiness
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[#787680]">
                  {hasDashboard && completion >= 100
                    ? "Your profile is fully set up."
                    : "Complete your profile to attract more bookings."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href={ROUTES.sessions}
                className="group flex items-center gap-3 rounded-xl bg-violet-50 p-3 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#6C5CE7] shadow-sm">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <span>
                  <span className={cn(HEADING, "block text-xl font-extrabold leading-none text-[#6C5CE7]")}>
                    {hasDashboard ? overview?.upcomingSessions ?? 0 : placeholder}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-[#787680]">
                    Upcoming
                  </span>
                </span>
              </Link>

              <Link
                href={ROUTES.sessions}
                className="group flex items-center gap-3 rounded-xl bg-amber-50 p-3 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#AC5D00] shadow-sm">
                  <Clock3 className="h-4 w-4" />
                </span>
                <span>
                  <span className={cn(HEADING, "block text-xl font-extrabold leading-none text-[#AC5D00]")}>
                    {hasDashboard ? pending : placeholder}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-[#787680]">
                    Pending
                  </span>
                </span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------------------- Stat strip --------------------------- */}
      <StatStrip>
        <StatCell
          label="Total Clients"
          icon={Users}
          href={ROUTES.clients}
          chip={totalClients > 0 ? "Active" : "None yet"}
          chipTone={totalClients > 0 ? "green" : "slate"}
          value={hasDashboard ? totalClients : placeholder}
          unit={totalClients === 1 ? "Student" : "Students"}
          footnote={
            hasDashboard
              ? `${totalClients} unique ${totalClients === 1 ? "student" : "students"}`
              : undefined
          }
        />

        <StatCell
          label="Total Sessions"
          icon={CalendarDays}
          href={ROUTES.sessions}
          chip={
            totalSessions > 0 ? `${share(confirmed)}% Confirmed` : "No bookings"
          }
          chipTone={totalSessions > 0 ? "solid" : "slate"}
          value={hasDashboard ? totalSessions : placeholder}
          unit="Booked"
          footnote={
            hasDashboard
              ? `${totalSessions - cancelled} / ${totalSessions} Booked`
              : undefined
          }
        />

        <StatCell
          label="Completed"
          icon={CheckCircle2}
          href={ROUTES.sessions}
          chip={completed > 0 ? `${share(completed)}% Done` : "First Cycle"}
          chipTone={completed > 0 ? "green" : "amber"}
          value={hasDashboard ? completed : placeholder}
          unit="Sessions"
          footnote={
            completed > 0 ? "Delivered successfully" : "Awaiting first delivery"
          }
        />

        <StatCell
          label="Active Services"
          icon={Layers}
          href={ROUTES.services}
          chip={`${activeServices} Live`}
          chipTone="amber"
          value={
            hasDashboard ? `${activeServices} / ${totalServices}` : placeholder
          }
          footnote={
            hasDashboard ? `${catalogueLive}% Catalogue Live` : undefined
          }
        />

        <StatCell
          label="Net Earnings"
          icon={Wallet}
          href={ROUTES.earnings}
          chip="Ready"
          chipTone="green"
          value={hasDashboard ? formatCurrency(netEarnings, currency) : placeholder}
          footnote={
            <>
              <span className="font-semibold text-emerald-700">
                Payout Ready
              </span>
              <br />
              Last month: {hasDashboard ? formatCurrency(lastMonth, currency) : placeholder}
            </>
          }
        />
      </StatStrip>

      {/* --------------------------- Main columns -------------------------- */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ============================ LEFT ============================ */}
        <div className="min-w-0 space-y-5">
          {/* Upcoming sessions */}
          <Panel
            title="Upcoming Sessions"
            accent="violet"
            action={
              <Chip tone="slate">
                {hasDashboard ? `${upcomingSessions.length} Scheduled` : "Loading…"}
              </Chip>
            }
          >
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title={
                  hasDashboard
                    ? "No upcoming sessions right now"
                    : "Loading your sessions…"
                }
                text="Your confirmed bookings will appear here automatically. Keep your calendar open to secure more client appointments."
                action={
                  hasDashboard && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl border-violet-200 bg-white text-xs font-bold uppercase tracking-wide text-[#6C5CE7] hover:bg-violet-50"
                    >
                      <Link href={ROUTES.calendar}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Manage availability &amp; calendar
                      </Link>
                    </Button>
                  )
                }
              />
            )}
          </Panel>

          {/* Client directory */}
          <Panel
            title="Client Directory"
            accent="amber"
            subtitle={
              hasDashboard
                ? `${totalClients} active ${totalClients === 1 ? "learner" : "learners"} linked to your coaching profile`
                : undefined
            }
            action={
              <Link href={ROUTES.clients} className={ACTION_LINK}>
                View all ({hasDashboard ? totalClients : 0})
              </Link>
            }
          >
            {recentClients.length > 0 ? (
              <div className="space-y-3">
                {recentClients.map((client) => {
                  const role = [
                    client.position && client.company
                      ? `${client.position} at ${client.company}`
                      : client.position || client.company,
                    client.location,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  const last = client.lastSession;

                  return (
                    <div
                      key={client.id}
                      className="rounded-2xl bg-violet-50/50 p-3 ring-1 ring-violet-100 sm:p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            HEADING,
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7] text-sm font-bold text-white"
                          )}
                        >
                          {getInitials(client.name)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {client.name}
                            </p>
                            {client.experienceLevel && (
                              <Chip tone="violet">
                                {client.experienceLevel} Level
                              </Chip>
                            )}
                            {client.industry && (
                              <Chip tone="blue">{client.industry}</Chip>
                            )}
                          </div>
                          {role && (
                            <p className="mt-0.5 truncate text-xs text-[#787680]">
                              {role}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 divide-x divide-violet-100 rounded-xl bg-white text-center ring-1 ring-violet-100">
                          <div className="px-3 py-1.5">
                            <p className={cn(HEADING, "text-sm font-extrabold text-[#6C5CE7]")}>
                              {client.totalSessions}
                            </p>
                            <p className="text-[9px] font-semibold uppercase text-[#787680]">
                              Booked
                            </p>
                          </div>
                          <div className="px-3 py-1.5">
                            <p className={cn(HEADING, "text-sm font-extrabold text-slate-900")}>
                              {client.completedSessions}
                            </p>
                            <p className="text-[9px] font-semibold uppercase text-[#787680]">
                              Done
                            </p>
                          </div>
                        </div>
                      </div>

                      {last && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-white p-3 ring-1 ring-violet-100">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[#6C5CE7]">
                            <Clock3 className="h-4 w-4" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900">
                              {last.serviceName || "Coaching Session"}
                            </p>
                            <p className="text-[11px] text-[#787680]">
                              {formatDate(last.date)}
                              {last.startTime ? `, ${formatTime(last.startTime)}` : ""}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn("capitalize", statusStyle(last.status))}
                          >
                            {last.status}
                          </Badge>

                          <div className="flex gap-2">
                            {client.email ? (
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg border-violet-200 text-xs"
                              >
                                <a href={`mailto:${client.email}`}>Message</a>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-8 rounded-lg text-xs"
                              >
                                Message
                              </Button>
                            )}
                            <Button
                              asChild
                              size="sm"
                              className="h-8 rounded-lg bg-[#6C5CE7] text-xs hover:bg-[#5b4bd6]"
                            >
                              <Link href={ROUTES.clients}>History</Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                compact
                icon={Users}
                title={hasDashboard ? "No clients yet" : "Loading clients…"}
                text="Learners who book a session with you will appear here."
              />
            )}
          </Panel>

          {/* Services & offerings */}
          <Panel
            title="Services & Offerings"
            accent="violet"
            subtitle={
              hasDashboard
                ? `${activeServices} live consultation ${activeServices === 1 ? "package" : "packages"} published`
                : undefined
            }
            action={
              <Link href={ROUTES.services} className={ACTION_LINK}>
                <Plus className="mr-0.5 inline h-3 w-3" />
                Add service
              </Link>
            }
          >
            {services.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={Layers}
                title={hasDashboard ? "No services published" : "Loading services…"}
                text="Publish a consultation package so learners can start booking you."
                action={
                  hasDashboard && (
                    <Button
                      asChild
                      className="rounded-xl bg-[#6C5CE7] text-xs font-bold hover:bg-[#5b4bd6]"
                    >
                      <Link href={ROUTES.services}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add service
                      </Link>
                    </Button>
                  )
                }
              />
            )}
          </Panel>
        </div>

        {/* ============================ RIGHT =========================== */}
        <div className="min-w-0 space-y-5">
          {/* Earnings overview */}
          <Panel
            title="Earnings Overview"
            accent="violet"
            action={
              range ? <span className="text-[11px] text-[#787680]">{range}</span> : null
            }
          >
            <p className="text-xs text-[#787680]">Earnings this month</p>
            <p className={cn(HEADING, "mb-4 mt-1 text-3xl font-extrabold text-slate-900")}>
              {hasDashboard ? formatCurrency(thisMonth, currency) : placeholder}
            </p>

            {monthly.length > 0 ? (
              <EarningsBars data={monthly} currency={currency} variant="light" />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-2xl bg-violet-50/60 text-xs text-[#787680]">
                {hasDashboard ? "No earnings data available yet." : "Loading earnings…"}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 text-xs">
              <span className="text-[#787680]">
                Pending settlement:{" "}
                <span className="font-semibold text-slate-700">
                  {hasDashboard ? formatCurrency(pendingSettlement, currency) : placeholder}
                </span>
              </span>
              <Link
                href={ROUTES.earnings}
                className="inline-flex items-center gap-1 font-semibold text-[#6C5CE7] hover:underline"
              >
                Payout details
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Panel>

          {/* Session distribution */}
          <Panel
            title="Session Distribution"
            accent="violet"
            action={
              <span className="text-[11px] font-semibold text-[#6C5CE7]">
                {hasDashboard ? totalSessions : 0} Total
              </span>
            }
          >
            <div className="flex items-center gap-4">
              <Donut
                size={124}
                label="Sessions"
                segments={breakdown}
                total={totalSessions}
                loading={!hasDashboard || loading}
              />

              <ul className="min-w-0 flex-1 space-y-2 rounded-2xl bg-violet-50/60 p-3">
                {breakdown.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-slate-600">
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: item.hex }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-900">
                      {hasDashboard ? item.value : placeholder}{" "}
                      <span className="font-normal text-[#787680]">
                        ({hasDashboard ? share(item.value) : 0}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* Performance health */}
          <Panel
            title="Performance Health"
            accent="amber"
            action={
              <span className="text-[11px] text-[#787680]">Monthly benchmark</span>
            }
          >
            <div className="space-y-5">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Completion Rate</span>
                  <span className="font-bold text-[#6C5CE7]">
                    {hasDashboard
                      ? `${Number(performanceOverview?.completionRate || 0)}%`
                      : placeholder}
                  </span>
                </div>
                <Bar value={performanceOverview?.completionRate ?? 0} />
                {hasDashboard && completed === 0 && (
                  <p className="mt-1.5 text-[11px] leading-4 text-[#787680]">
                    Calculated once initial appointments are concluded.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Cancellation Rate</span>
                  <span className="font-bold text-slate-900">
                    {hasDashboard
                      ? `${Number(performanceOverview?.cancellationRate || 0)}%`
                      : placeholder}
                    {hasDashboard &&
                      Number(performanceOverview?.cancellationRate || 0) === 0 && (
                        <span className="ml-1 font-semibold text-emerald-600">
                          (Ideal)
                        </span>
                      )}
                  </span>
                </div>
                <Bar
                  value={performanceOverview?.cancellationRate ?? 0}
                  fill="bg-red-400"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-violet-50/70 px-4 py-3">
                <span className="text-xs font-semibold text-slate-700">
                  Published Catalogue
                </span>
                <span className="text-xs font-bold text-[#6C5CE7]">
                  {hasDashboard
                    ? `${activeServices} of ${totalServices} Available`
                    : placeholder}
                </span>
              </div>
            </div>
          </Panel>

          {/* Learner reviews */}
          <Panel
            title="Learner Reviews"
            accent="violet"
            action={
              <Link
                href={ROUTES.reviews}
                className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs"
              >
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">
                  {hasDashboard ? Number(overview?.averageRating || 0).toFixed(1) : placeholder}
                </span>
                <span className="text-[#787680]">
                  ({hasDashboard ? overview?.totalReviews ?? 0 : 0})
                </span>
              </Link>
            }
          >
            {recentReviews.length > 0 ? (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={ROUTES.reviews}
                    className="block rounded-2xl bg-violet-50/50 p-4 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
                  >
                    <div className="flex gap-0.5" aria-label={`${review.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            "h-3.5 w-3.5",
                            index < Math.round(Number(review.rating) || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          )}
                        />
                      ))}
                    </div>

                    <p
                      className={cn(
                        "mt-2 line-clamp-3 text-xs leading-5",
                        review.reviewText ? "text-slate-600" : "italic text-slate-400"
                      )}
                    >
                      {review.reviewText || "No written feedback provided."}
                    </p>

                    <p className="mt-3 text-[11px] text-[#787680]">
                      <span className="font-semibold text-slate-900">
                        {review.clientName}
                      </span>{" "}
                      · {formatDate(review.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={MessageSquare}
                title={hasDashboard ? "No reviews received yet" : "Loading reviews…"}
                text={`Testimonials and ratings from ${
                  recentClients[0]?.name ?? "your learners"
                } and other students will display upon completing sessions.`}
              />
            )}
          </Panel>
        </div>
      </div>
    </MotionConfig>
  );
}