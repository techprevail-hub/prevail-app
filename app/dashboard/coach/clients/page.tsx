"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Search,
  UserRound,
  BriefcaseBusiness,
  User,
  ArrowRight,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getCoachClients,
  getCoachClientById,
} from "@/services/role-coach/client";

import type {
  CoachClient,
  CoachClientDetails,
} from "@/types/role-coach/client";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatDate = (date?: string | null) => {
  if (!date) return "N/A";

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time?: string | null) => {
  if (!time) return "N/A";

  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time.slice(0, 5);
  }

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(minutes);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getInitials = (name: string) => {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  return labels[status] || status;
};

const getStatusVariant = (
  status: string
) => {
  switch (status) {
    case "completed":
      return "default";

    case "cancelled":
      return "destructive";

    default:
      return "outline";
  }
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CoachClientsPage() {
  const [clients, setClients] = useState<
    CoachClient[]
  >([]);

  const [selectedClient, setSelectedClient] =
    useState<CoachClientDetails | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Fetch Clients                                                            */
  /* ------------------------------------------------------------------------ */

  const loadClients = async () => {
    try {
      setLoading(true);

      const data = await getCoachClients();

      setClients(data || []);
    } catch (error: any) {
      console.error(
        "Failed to load clients:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to load clients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredClients = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.name
          ?.toLowerCase()
          .includes(query) ||
        client.email
          ?.toLowerCase()
          .includes(query) ||
        client.headline
          ?.toLowerCase()
          .includes(query) ||
        client.targetRole
          ?.toLowerCase()
          .includes(query) ||
        client.targetIndustry
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [clients, search]);

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const totalSessions = useMemo(() => {
    return clients.reduce(
      (total, client) =>
        total + client.totalSessions,
      0
    );
  }, [clients]);

  const completedSessions = useMemo(() => {
    return clients.reduce(
      (total, client) =>
        total + client.completedSessions,
      0
    );
  }, [clients]);

  /* ------------------------------------------------------------------------ */
  /* View Client                                                              */
  /* ------------------------------------------------------------------------ */

  const handleViewClient = async (
    clientId: string
  ) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setSelectedClient(null);

      const data =
        await getCoachClientById(
          clientId
        );

      setSelectedClient(data);
    } catch (error: any) {
      console.error(
        "Failed to load client:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to load client details"
      );

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                   */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-24 rounded-2xl"
              />
            )
          )}
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-64 rounded-2xl"
              />
            )
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                        */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <UserRound className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Clients
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage the clients who have booked your coaching sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Clients
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {clients.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Sessions
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {totalSessions}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">
            Completed Sessions
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {completedSessions}
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search clients..."
            className="pl-9 rounded-xl"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}

      {filteredClients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-white p-12 text-center">
          <UserRound className="w-10 h-10 mx-auto text-slate-300 mb-3" />

          <p className="font-semibold text-slate-600">
            {search
              ? "No clients found"
              : "No clients yet"}
          </p>

          <p className="text-sm text-slate-400 mt-1">
            {search
              ? "Try a different search term."
              : "Clients will appear here after they book your coaching sessions."}
          </p>
        </div>
      ) : (
        /* Client Cards */

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map(
            (client, index) => (
              <motion.div
                key={client.id}
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
                className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Client Header */}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {client.avatarUrl ? (
                      <img
                        src={client.avatarUrl}
                        alt={client.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
                        {getInitials(
                          client.name
                        )}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">
                        {client.name}
                      </h3>

                      {client.email && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="rounded-lg shrink-0"
                  >
                    {client.totalSessions}{" "}
                    {client.totalSessions === 1
                      ? "Session"
                      : "Sessions"}
                  </Badge>
                </div>

                {/* Profile Info */}

                <div className="mt-4 space-y-2">
                  {client.headline && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {client.headline}
                    </p>
                  )}

                  {client.careerStage && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                      <span>
                        {client.careerStage}
                      </span>
                    </div>
                  )}

                  {client.targetRole && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <UserRound className="h-3.5 w-3.5" />
                      <span>
                        Target:{" "}
                        {client.targetRole}
                      </span>
                    </div>
                  )}

                  {client.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {client.location}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Session Summary */}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Completed sessions
                    </span>

                    <span className="font-semibold text-slate-800">
                      {
                        client.completedSessions
                      }
                    </span>
                  </div>

                  {client.lastSession && (
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-500">
                        Last session
                      </span>

                      <span className="font-semibold text-slate-800 text-right">
                        {formatDate(
                          client.lastSession
                            .sessionDate
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action */}

                <Button
                  variant="outline"
                  className="w-full mt-5 rounded-xl"
                  onClick={() =>
                    handleViewClient(
                      client.id
                    )
                  }
                >
                  View Client
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )
          )}
        </div>
      )}

      {/* Client Details */}

      <Dialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {detailsLoading ? (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle>
                  Client Details
                </DialogTitle>
              </DialogHeader>

              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : selectedClient ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Client Details
                </DialogTitle>

                <DialogDescription>
                  View the client's profile and
                  session history.
                </DialogDescription>
              </DialogHeader>

              {/* Profile */}

              <div className="rounded-2xl border bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  {selectedClient.avatarUrl ? (
                    <img
                      src={
                        selectedClient.avatarUrl
                      }
                      alt={
                        selectedClient.name
                      }
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700">
                      {getInitials(
                        selectedClient.name
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedClient.name}
                    </h2>

                    {selectedClient.headline && (
                      <p className="text-sm text-slate-600 mt-1">
                        {
                          selectedClient.headline
                        }
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-3">
                      {selectedClient.email && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          {
                            selectedClient.email
                          }
                        </span>
                      )}

                      {selectedClient.location && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {
                            selectedClient.location
                          }
                        </span>
                      )}

                      {selectedClient.linkedinUrl && (
                        <a
                          href={
                            selectedClient.linkedinUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-violet-600 hover:underline"
                        >
                          <User className="h-3.5 w-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="rounded-xl bg-white border p-3">
                    <p className="text-xs text-slate-500">
                      Sessions
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {
                        selectedClient.totalSessions
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border p-3">
                    <p className="text-xs text-slate-500">
                      Completed
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {
                        selectedClient.completedSessions
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border p-3">
                    <p className="text-xs text-slate-500">
                      Cancelled
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {
                        selectedClient.cancelledSessions
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border p-3">
                    <p className="text-xs text-slate-500">
                      Career Stage
                    </p>

                    <p className="text-sm font-semibold mt-1 truncate">
                      {selectedClient.careerStage ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                {(selectedClient.targetRole ||
                  selectedClient.targetIndustry) && (
                  <div className="mt-4 space-y-2">
                    {selectedClient.targetRole && (
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">
                          Target Role:
                        </span>{" "}
                        <span className="text-slate-600">
                          {
                            selectedClient.targetRole
                          }
                        </span>
                      </div>
                    )}

                    {selectedClient.targetIndustry && (
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">
                          Target Industry:
                        </span>{" "}
                        <span className="text-slate-600">
                          {
                            selectedClient.targetIndustry
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {selectedClient.bio && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700">
                      About
                    </p>

                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {selectedClient.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Session History */}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Session History
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Sessions booked by this client
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="rounded-lg"
                  >
                    {
                      selectedClient.sessions
                        .length
                    } Sessions
                  </Badge>
                </div>

                {selectedClient.sessions
                  .length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
                    No session history found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedClient.sessions.map(
                      (session) => (
                        <div
                          key={session.id}
                          className="rounded-xl border bg-white p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {session.serviceName ||
                                  "Coaching Session"}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(
                                    session.sessionDate
                                  )}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(
                                    session.startTime
                                  )}{" "}
                                  -{" "}
                                  {formatTime(
                                    session.endTime
                                  )}
                                </span>
                              </div>
                            </div>

                            <Badge
                              variant={getStatusVariant(
                                session.status
                              )}
                              className="rounded-lg"
                            >
                              {getStatusLabel(
                                session.status
                              )}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}