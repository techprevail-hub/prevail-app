"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays, CalendarCheck2, CalendarX2, Clock, Video,
  MoreHorizontal, CheckCircle2, XCircle, RotateCcw, FileText,
  Building2, Users, User, Hourglass,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EntityFormDialog, {
  type FormFieldConfig,
} from "@/components/role-institute/FormDialog";

import {
  getCoachSessions,
  getCoachSessionNotes,
  updateCoachSessionNotes,
  updateCoachSessionStatus,
  rescheduleCoachSession,
  cancelCoachSession,
  updateGroupMeetingLink,
} from "@/services/role-coach/session";

import type {
  CoachSession,
  CoachSessionStatus,
} from "@/types/role-coach/session";

const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";
const toLocalDate = (date: string) => new Date(`${date}T00:00:00`);

const formatDate = (date: string) => {
  const target = toLocalDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  return target.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (time: string) => time?.slice(0, 5);

const formatPrice = (price: number, currency: string) =>
  price > 0
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 0,
      }).format(price)
    : "Free";

const getInitials = (name?: string | null) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const capitalize = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const statusLabels: Record<CoachSessionStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const statusStyles: Record<
  CoachSessionStatus,
  { bar: string; badge: string; dot: string }
> = {
  pending: {
    bar: "from-[#AC5D00] to-amber-300",
    badge: "bg-amber-50 text-[#AC5D00] ring-amber-200",
    dot: "bg-[#AC5D00]",
  },
  confirmed: {
    bar: "from-[#6C5CE7] to-[#a29bfe]",
    badge: "bg-violet-50 text-[#6C5CE7] ring-violet-200",
    dot: "bg-[#6C5CE7]",
  },
  completed: {
    bar: "from-emerald-500 to-emerald-300",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    bar: "from-slate-400 to-slate-300",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  no_show: {
    bar: "from-rose-500 to-rose-300",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

type TabValue = "upcoming" | "past" | "cancelled";

export default function CoachSessionsPage() {
  const [sessions, setSessions] = useState<CoachSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");

  const [selectedSession, setSelectedSession] = useState<CoachSession | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Group meeting link
  const [meetingLinkOpen, setMeetingLinkOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setSessions(await getCoachSessions());
    } catch (error: any) {
      toast.error(error?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const upcomingSessions = useMemo(
    () => sessions.filter(
      (s) =>
        s.status !== "cancelled" &&
        s.status !== "completed" &&
        new Date(`${s.sessionDate}T${s.endTime}`) >= new Date()
    ),
    [sessions]
  );

  const pastSessions = useMemo(
    () => sessions.filter(
      (s) =>
        s.status !== "cancelled" &&
        (s.status === "completed" ||
          new Date(`${s.sessionDate}T${s.endTime}`) < new Date())
    ),
    [sessions]
  );

  const cancelledSessions = useMemo(
    () => sessions.filter((s) => s.status === "cancelled"),
    [sessions]
  );

  const pendingCount = useMemo(
    () => upcomingSessions.filter((s) => s.status === "pending").length,
    [upcomingSessions]
  );

  const visibleSessions =
    activeTab === "upcoming"
      ? upcomingSessions
      : activeTab === "past"
        ? pastSessions
        : cancelledSessions;

  const replaceSession = (updated: CoachSession) => {
    setSessions((current) =>
      current.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
  };

  /* --------------------------- handlers ---------------------------- */

  const handleAccept = async (session: CoachSession) => {
    if (session.status !== "pending") return;

    try {
      setUpdatingSessionId(session.id);
      const updated = await updateCoachSessionStatus(session.id, "confirmed");
      replaceSession(updated);
      toast.success("Booking accepted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to accept booking");
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const handleReject = async (session: CoachSession) => {
    if (session.status !== "pending") return;

    if (!window.confirm("Are you sure you want to reject this booking?")) return;

    try {
      setUpdatingSessionId(session.id);
      const updated = await cancelCoachSession(session.id, {
        reason: "Booking rejected by coach.",
      });
      replaceSession(updated);
      toast.success("Booking rejected successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject booking");
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const openNotes = async (session: CoachSession) => {
    setSelectedSession(session);
    setNotesOpen(true);
    setNotesLoading(true);

    try {
      const data = await getCoachSessionNotes(session.id);
      setNotes(data.notes || "");
    } catch (error: any) {
      toast.error(error?.message || "Failed to load session notes");
    } finally {
      setNotesLoading(false);
    }
  };

  const saveNotes = async (values: Record<string, string>) => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      const updated = await updateCoachSessionNotes(
        selectedSession.id,
        values.notes || ""
      );
      replaceSession(updated);
      setNotesOpen(false);
      setSelectedSession(null);
      toast.success("Session notes saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save notes");
    } finally {
      setSubmitting(false);
    }
  };

  const completeSession = async (session: CoachSession) => {
    try {
      setUpdatingSessionId(session.id);
      const updated = await updateCoachSessionStatus(session.id, "completed");
      replaceSession(updated);
      toast.success("Session marked as completed");
    } catch (error: any) {
      toast.error(error?.message || "Failed to complete session");
    } finally {
      setUpdatingSessionId(null);
    }
  };

  // Open group meeting link dialog
  const openMeetingLinkDialog = (session: CoachSession) => {
    if (!session.groupSessionId) {
      toast.error("Group session reference is missing");
      return;
    }

    setSelectedSession(session);
    setMeetingUrl(session.meetingUrl || "");
    setMeetingLinkOpen(true);
  };

  // Save shared group meeting link
  const handleSaveMeetingLink = async (
    values: Record<string, string>
  ) => {
    if (!selectedSession?.groupSessionId) {
      toast.error("Group session reference is missing");
      return;
    }

    const url = values.meetingUrl?.trim();

    if (!url) {
      toast.error("Meeting link is required");
      return;
    }

    try {
      setSubmitting(true);

      const updated = await updateGroupMeetingLink(
        selectedSession.groupSessionId,
        url
      );

      setSessions((current) =>
        current.map((session) =>
          session.groupSessionId === updated.id
            ? { ...session, meetingUrl: updated.meetingUrl }
            : session
        )
      );

      setMeetingLinkOpen(false);
      setSelectedSession(null);
      toast.success("Group meeting link updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update meeting link");
    } finally {
      setSubmitting(false);
    }
  };

  const rescheduleFields: FormFieldConfig[] = [
    { name: "sessionDate", label: "Date", type: "date", required: true },
    {
      name: "startTime",
      label: "Start Time",
      type: "text",
      placeholder: "10:00",
      required: true,
    },
    {
      name: "endTime",
      label: "End Time",
      type: "text",
      placeholder: "11:00",
      required: true,
    },
  ];

  const handleReschedule = async (values: Record<string, string>) => {
    if (!selectedSession) return;

    if (!values.sessionDate || !values.startTime || !values.endTime) {
      toast.error("Date and time are required");
      return;
    }

    try {
      setSubmitting(true);
      const updated = await rescheduleCoachSession(selectedSession.id, {
        sessionDate: values.sessionDate,
        startTime: values.startTime,
        endTime: values.endTime,
      });
      replaceSession(updated);
      setRescheduleOpen(false);
      setSelectedSession(null);
      toast.success("Session rescheduled successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reschedule session");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (values: Record<string, string>) => {
    if (!selectedSession) return;

    if (!values.reason?.trim()) {
      toast.error("Cancellation reason is required");
      return;
    }

    try {
      setSubmitting(true);
      const updated = await cancelCoachSession(selectedSession.id, {
        reason: values.reason.trim(),
      });
      replaceSession(updated);
      setCancelOpen(false);
      setSelectedSession(null);
      toast.success("Session cancelled successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel session");
    } finally {
      setSubmitting(false);
    }
  };

  const openReschedule = (session: CoachSession) => {
    setSelectedSession(session);
    setRescheduleOpen(true);
  };

  const openCancel = (session: CoachSession) => {
    setSelectedSession(session);
    setCancelOpen(true);
  };

  /* ---------------------------- view data -------------------------- */

  const stats = [
    {
      label: "Upcoming",
      hint: pendingCount > 0 ? `${pendingCount} awaiting your reply` : "All caught up",
      count: upcomingSessions.length,
      icon: CalendarCheck2,
      tone: "bg-violet-100 text-[#6C5CE7]",
    },
    {
      label: "Completed",
      hint: "Sessions delivered",
      count: pastSessions.filter((s) => s.status === "completed").length,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Cancelled",
      hint: "Rejected or cancelled",
      count: cancelledSessions.length,
      icon: CalendarX2,
      tone: "bg-slate-100 text-slate-500",
    },
  ];

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: "upcoming", label: "Upcoming", count: upcomingSessions.length },
    { value: "past", label: "Past", count: pastSessions.length },
    { value: "cancelled", label: "Cancelled", count: cancelledSessions.length },
  ];

  /* ----------------------------- render ---------------------------- */

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#6C5CE7]/10 via-white to-[#AC5D00]/10 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#6C5CE7]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#AC5D00]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/80 p-3.5 shadow-sm ring-1 ring-violet-100 backdrop-blur">
              <CalendarDays className="h-6 w-6 text-[#6C5CE7]" />
            </div>
            <div>
              <h1 className={`${HEADING} text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl`}>
                My Sessions
              </h1>
              <p className="mt-1 text-sm text-[#787680]">
                Review bookings, confirm requests and run your coaching calls.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, hint, count, icon: Icon, tone }) => (
              <div key={label} title={hint} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-md">
                <div className={`mb-2 inline-flex rounded-lg p-1.5 ${tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`${HEADING} text-2xl font-extrabold leading-none text-slate-900`}>
                  {count}
                </p>
                <p className="mt-1 text-xs font-medium text-[#787680]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="inline-flex rounded-2xl border bg-white/70 p-1 shadow-sm backdrop-blur">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/40 ${
              activeTab === tab.value ? "text-white" : "text-[#787680] hover:text-slate-900"
            }`}
          >
            {activeTab === tab.value && (
              <motion.span
                layoutId="sessions-tab-pill"
                className="absolute inset-0 rounded-xl bg-[#6C5CE7] shadow-md shadow-violet-300/50"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {tab.label}
              <span className={`rounded-full px-1.5 text-xs ${
                activeTab === tab.value ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border bg-white/70" />
          ))}
        </div>
      ) : visibleSessions.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-violet-200 bg-white/60 p-14 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <CalendarDays className="h-7 w-7 text-[#6C5CE7]" />
          </div>
          <p className={`${HEADING} text-lg font-bold text-slate-800`}>
            No {activeTab} sessions
          </p>
          <p className="mt-1 text-sm text-[#787680]">
            New bookings from your clients will show up here.
          </p>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleSessions.map((session) => {
            const isUpdating = updatingSessionId === session.id;
            const style = statusStyles[session.status];
            const isGroup = session.sessionType === "group";
            const SessionTypeIcon = isGroup ? Users : User;

            return (
              <motion.article
                key={session.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm backdrop-blur transition-shadow hover:shadow-xl hover:shadow-violet-200/40"
              >
                <div className={`h-1.5 bg-gradient-to-r ${style.bar}`} />

                <div className="flex flex-1 flex-col gap-4 p-5">
                  {/* Seeker */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`${HEADING} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] text-sm font-bold text-white shadow-md shadow-violet-300/50`}>
                        {getInitials(session.seekerName)}
                      </div>
                      <div className="min-w-0">
                        <p className={`${HEADING} truncate text-base font-bold text-slate-900`}>
                          {session.seekerName || "Unknown client"}
                        </p>
                        <p className="truncate text-xs text-[#787680]">
                          {session.seekerEmail}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 shrink-0 rounded-xl text-[#787680]" aria-label="More actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {session.status === "confirmed" && (
                          <>
                            <DropdownMenuItem onClick={() => openReschedule(session)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => openCancel(session)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel session
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => openNotes(session)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Session notes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Service + status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-[#6C5CE7]">
                      {session.serviceName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <SessionTypeIcon className="h-3 w-3" />
                      {capitalize(session.sessionType)}
                    </span>
                    <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${style.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {statusLabels[session.status]}
                    </span>
                  </div>

                  {/* Schedule */}
                  <div className="grid grid-cols-2 gap-3 rounded-2xl bg-gradient-to-br from-violet-50/80 to-white p-3.5 ring-1 ring-violet-100">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs text-[#787680]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Date
                      </p>
                      <p className={`${HEADING} mt-0.5 text-sm font-bold text-slate-900`}>
                        {formatDate(session.sessionDate)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs text-[#787680]">
                        <Clock className="h-3.5 w-3.5" />
                        Time
                      </p>
                      <p className={`${HEADING} mt-0.5 text-sm font-bold text-slate-900`}>
                        {formatTime(session.startTime)} – {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between gap-3 text-xs text-[#787680]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{session.instituteName || "Independent"}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span>{session.durationMinutes} min</span>
                      <span className={`${HEADING} rounded-md px-2 py-0.5 text-xs font-bold ${
                        session.price > 0 ? "bg-amber-50 text-[#AC5D00]" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {formatPrice(session.price, session.currency)}
                      </span>
                    </span>
                  </div>

                  {session.status === "cancelled" && session.cancellationReason && (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold">Reason: </span>
                      {session.cancellationReason}
                    </p>
                  )}

                  {/* Pending actions */}
                  {session.status === "pending" && (
                    <div className="mt-auto flex gap-2 border-t pt-4">
                      <Button size="sm" disabled={isUpdating} className="flex-1 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bd6]" onClick={() => handleAccept(session)}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {isUpdating ? "Processing..." : "Accept"}
                      </Button>
                      <Button size="sm" variant="outline" disabled={isUpdating} className="flex-1 rounded-xl border-violet-200 text-[#6C5CE7] hover:bg-violet-50 hover:text-[#6C5CE7]" onClick={() => openReschedule(session)}>
                        <RotateCcw className="mr-1.5 h-4 w-4" />
                        Reschedule
                      </Button>
                      <Button size="sm" variant="outline" disabled={isUpdating} className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => handleReject(session)}>
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Confirmed actions */}
                  {session.status === "confirmed" && (
                    <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
                      {session.meetingUrl ? (
                        <Button size="sm" className="flex-1 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bd6]" onClick={() => window.open(session.meetingUrl!, "_blank", "noopener,noreferrer")}>
                          <Video className="mr-1.5 h-4 w-4" />
                          Join call
                        </Button>
                      ) : (
                        <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 text-xs text-[#787680]">
                          <Hourglass className="h-3.5 w-3.5" />
                          Link not added yet
                        </div>
                      )}

                      {isGroup && (
                        <Button size="sm" variant="outline" disabled={isUpdating || !session.groupSessionId} className="rounded-xl" onClick={() => openMeetingLinkDialog(session)}>
                          <Video className="mr-1.5 h-4 w-4" />
                          {session.meetingUrl ? "Update Link" : "Add Link"}
                        </Button>
                      )}

                      <Button size="sm" variant="outline" disabled={isUpdating} className="rounded-xl" onClick={() => completeSession(session)}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {isUpdating ? "Saving..." : "Complete"}
                      </Button>
                    </div>
                  )}

                  {(session.status === "completed" || session.status === "no_show") && (
                    <div className="mt-auto border-t pt-4">
                      <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => openNotes(session)}>
                        <FileText className="mr-1.5 h-4 w-4" />
                        View session notes
                      </Button>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}

      {/* Dialogs */}
      <EntityFormDialog
        open={notesOpen}
        onOpenChange={setNotesOpen}
        mode="edit"
        entityLabel="Session Notes"
        fields={[{
          name: "notes",
          label: "Notes",
          type: "textarea",
          placeholder: "Add your session notes...",
          span: 2,
        }]}
        initialValues={{ notes }}
        submitting={submitting || notesLoading}
        onSubmit={saveNotes}
      />

      <EntityFormDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        mode="edit"
        entityLabel="Reschedule Session"
        fields={rescheduleFields}
        initialValues={selectedSession ? {
          sessionDate: selectedSession.sessionDate,
          startTime: formatTime(selectedSession.startTime),
          endTime: formatTime(selectedSession.endTime),
        } : undefined}
        submitting={submitting}
        onSubmit={handleReschedule}
      />

      <EntityFormDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        mode="edit"
        entityLabel="Cancel Session"
        fields={[{
          name: "reason",
          label: "Cancellation Reason",
          type: "textarea",
          required: true,
          placeholder: "Enter the reason for cancelling this session",
          span: 2,
        }]}
        initialValues={{ reason: "" }}
        submitting={submitting}
        onSubmit={handleCancel}
      />

      {/* Group Meeting Link Dialog */}
      <EntityFormDialog
        open={meetingLinkOpen}
        onOpenChange={setMeetingLinkOpen}
        mode="edit"
        entityLabel="Group Meeting Link"
        fields={[{
          name: "meetingUrl",
          label: "Meeting URL",
          type: "text",
          placeholder: "https://meet.google.com/xxx-xxxx-xxx",
          required: true,
          span: 2,
        }]}
        initialValues={{ meetingUrl }}
        submitting={submitting}
        onSubmit={handleSaveMeetingLink}
      />
    </div>
  );
}