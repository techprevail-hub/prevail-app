"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Clock,
  Video,
  MoreVertical,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  UserRound,
  IndianRupee,
} from "lucide-react";

import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "@/services/role-coach/session";

import type {
  CoachSession,
  CoachSessionStatus,
} from "@/types/role-coach/session";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

const formatTime = (time: string) =>
  time?.slice(0, 5);

const getStatusLabel = (
  status: CoachSessionStatus
) => {
  const labels: Record<
    CoachSessionStatus,
    string
  > = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  return labels[status];
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CoachSessionsPage() {
  const [sessions, setSessions] = useState<
    CoachSession[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "cancelled"
  >("upcoming");

  const [selectedSession, setSelectedSession] =
    useState<CoachSession | null>(null);

  const [notesOpen, setNotesOpen] =
    useState(false);

  const [notes, setNotes] = useState("");

  const [notesLoading, setNotesLoading] =
    useState(false);

  const [rescheduleOpen, setRescheduleOpen] =
    useState(false);

  const [cancelOpen, setCancelOpen] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Fetch                                                                    */
  /* ------------------------------------------------------------------------ */

  const loadSessions = async () => {
    try {
      setLoading(true);

      const data = await getCoachSessions();

      setSessions(data || []);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ||
          "Failed to load sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Derived                                                                  */
  /* ------------------------------------------------------------------------ */

  const now = new Date();

  const upcomingSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (
          session.status === "cancelled" ||
          session.status === "completed"
        ) {
          return false;
        }

        return new Date(
          `${session.sessionDate}T${session.endTime}`
        ) >= now;
      }),
    [sessions]
  );

  const pastSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (
          session.status === "cancelled"
        ) {
          return false;
        }

        return (
          session.status === "completed" ||
          new Date(
            `${session.sessionDate}T${session.endTime}`
          ) < now
        );
      }),
    [sessions]
  );

  const cancelledSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.status === "cancelled"
      ),
    [sessions]
  );

  const visibleSessions =
    activeTab === "upcoming"
      ? upcomingSessions
      : activeTab === "past"
      ? pastSessions
      : cancelledSessions;

  /* ------------------------------------------------------------------------ */
  /* Notes                                                                     */
  /* ------------------------------------------------------------------------ */

  const openNotes = async (
    session: CoachSession
  ) => {
    try {
      setSelectedSession(session);
      setNotesOpen(true);
      setNotesLoading(true);

      const data =
        await getCoachSessionNotes(
          session.id
        );

      setNotes(data.notes || "");
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Failed to load session notes"
      );
    } finally {
      setNotesLoading(false);
    }
  };

  const saveNotes = async (
    values: Record<string, string>
  ) => {
    if (!selectedSession) return;

    try {
      setSubmitting(true);

      const updated =
        await updateCoachSessionNotes(
          selectedSession.id,
          values.notes || ""
        );

      setSessions((current) =>
        current.map((session) =>
          session.id === updated.id
            ? updated
            : session
        )
      );

      setNotesOpen(false);
      setSelectedSession(null);

      toast.success("Session notes saved");
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Failed to save notes"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Complete                                                                  */
  /* ------------------------------------------------------------------------ */

  const completeSession = async (
    session: CoachSession
  ) => {
    try {
      const updated =
        await updateCoachSessionStatus(
          session.id,
          "completed"
        );

      setSessions((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      toast.success(
        "Session marked as completed"
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Failed to complete session"
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Reschedule                                                               */
  /* ------------------------------------------------------------------------ */

  const rescheduleFields: FormFieldConfig[] =
    [
      {
        name: "sessionDate",
        label: "Date",
        type: "date",
        required: true,
      },
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

  const rescheduleInitialValues = selectedSession
  ? {
      sessionDate: selectedSession.sessionDate,
      startTime: formatTime(selectedSession.startTime),
      endTime: formatTime(selectedSession.endTime),
    }
  : undefined;
  
  const handleReschedule = async (
    values: Record<string, string>
  ) => {
    if (!selectedSession) return;

    if (
      !values.sessionDate ||
      !values.startTime ||
      !values.endTime
    ) {
      toast.error(
        "Date and time are required"
      );
      return;
    }

    try {
      setSubmitting(true);

      const updated =
        await rescheduleCoachSession(
          selectedSession.id,
          {
            sessionDate:
              values.sessionDate,
            startTime:
              values.startTime,
            endTime:
              values.endTime,
          }
        );

      setSessions((current) =>
        current.map((session) =>
          session.id === updated.id
            ? updated
            : session
        )
      );

      setRescheduleOpen(false);
      setSelectedSession(null);

      toast.success(
        "Session rescheduled successfully"
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Failed to reschedule session"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Cancel                                                                    */
  /* ------------------------------------------------------------------------ */

  const cancelFields: FormFieldConfig[] =
    [
      {
        name: "reason",
        label: "Cancellation Reason",
        type: "textarea",
        required: true,
        placeholder:
          "Enter the reason for cancelling this session",
        span: 2,
      },
    ];

  const handleCancel = async (
    values: Record<string, string>
  ) => {
    if (!selectedSession) return;

    if (!values.reason?.trim()) {
      toast.error(
        "Cancellation reason is required"
      );
      return;
    }

    try {
      setSubmitting(true);

      const updated =
        await cancelCoachSession(
          selectedSession.id,
          {
            reason:
              values.reason.trim(),
          }
        );

      setSessions((current) =>
        current.map((session) =>
          session.id === updated.id
            ? updated
            : session
        )
      );

      setCancelOpen(false);
      setSelectedSession(null);

      toast.success(
        "Session cancelled successfully"
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Failed to cancel session"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <CalendarDays className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Sessions
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage your coaching sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-500">
            Upcoming
          </p>
          <p className="text-3xl font-bold mt-1">
            {upcomingSessions.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-500">
            Completed
          </p>
          <p className="text-3xl font-bold mt-1">
            {pastSessions.filter(
              (s) => s.status === "completed"
            ).length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-500">
            Cancelled
          </p>
          <p className="text-3xl font-bold mt-1">
            {cancelledSessions.length}
          </p>
        </div>
      </div>

      {/* Tabs */}

      <div className="flex gap-2 border-b">
        {(
          [
            ["upcoming", "Upcoming"],
            ["past", "Past"],
            ["cancelled", "Cancelled"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() =>
              setActiveTab(value)
            }
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === value
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sessions */}

      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          Loading sessions...
        </div>
      ) : visibleSessions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-white p-12 text-center">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-3" />

          <p className="font-semibold text-slate-600">
            No {activeTab} sessions
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Your sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSessions.map(
            (session, index) => (
              <motion.div
                key={session.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.04,
                }}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-violet-100 p-3">
                      <UserRound className="w-5 h-5 text-violet-600" />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        Client:{" "}
                        {session.seekerId}
                      </p>

                      <p className="text-sm font-semibold text-violet-600 mt-1">
                        {session.serviceName}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDate(
                            session.sessionDate
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(
                            session.startTime
                          )}{" "}
                          -{" "}
                          {formatTime(
                            session.endTime
                          )}
                        </span>

                        <span>
                          {session.durationMinutes} min
                        </span>

                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {session.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="rounded-lg"
                    >
                      {getStatusLabel(
                        session.status
                      )}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        {session.status ===
                          "confirmed" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSession(
                                  session
                                );
                                setRescheduleOpen(
                                  true
                                );
                              }}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSession(
                                  session
                                );
                                setCancelOpen(
                                  true
                                );
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                completeSession(
                                  session
                                )
                              }
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Completed
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                          </>
                        )}

                        <DropdownMenuItem
                          onClick={() =>
                            openNotes(session)
                          }
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Session Notes
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Actions */}

                {session.status ===
                  "confirmed" && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    {session.meetingUrl && (
                      <Button
                        size="sm"
                        className="rounded-xl bg-violet-600 hover:bg-violet-700"
                        onClick={() =>
                          window.open(
                            session.meetingUrl!,
                            "_blank"
                          )
                        }
                      >
                        <Video className="w-4 h-4 mr-1.5" />
                        Join Call
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        setSelectedSession(
                          session
                        );
                        setRescheduleOpen(
                          true
                        );
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" />
                      Reschedule
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-red-600"
                      onClick={() => {
                        setSelectedSession(
                          session
                        );
                        setCancelOpen(true);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Cancel
                    </Button>
                  </div>
                )}

                {(session.status ===
                  "completed" ||
                  session.status ===
                    "no_show") && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() =>
                        openNotes(session)
                      }
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      View Session Notes
                    </Button>
                  </div>
                )}
              </motion.div>
            )
          )}
        </div>
      )}

      {/* Notes */}

      <EntityFormDialog
        open={notesOpen}
        onOpenChange={setNotesOpen}
        mode="edit"
        entityLabel="Session Notes"
        fields={[
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder:
              "Add your session notes...",
            span: 2,
          },
        ]}
        initialValues={{
          notes,
        }}
        submitting={
          submitting || notesLoading
        }
        onSubmit={saveNotes}
      />

      {/* Reschedule */}

      <EntityFormDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        mode="edit"
        entityLabel="Reschedule Session"
        fields={rescheduleFields}
        initialValues={
          rescheduleInitialValues
        }
        submitting={submitting}
        onSubmit={handleReschedule}
      />

      {/* Cancel */}

      <EntityFormDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        mode="edit"
        entityLabel="Cancel Session"
        fields={cancelFields}
        initialValues={{
          reason: "",
        }}
        submitting={submitting}
        onSubmit={handleCancel}
      />
    </div>
  );
}