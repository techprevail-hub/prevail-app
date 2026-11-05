
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  RefreshCw,
  Video,
  GraduationCap,
  BriefcaseBusiness,
  AlertCircle,
  CalendarCheck,
  Users,
  ExternalLink,
} from "lucide-react";

import { api } from "@/utils/apiServices";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Coach } from "@/types/seeker/coach-types";

const BOOKINGS_ENDPOINT = "/api/role-seeker/bookings/my";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

interface Booking {
  id: string;
  coachId: string;
  seekerId?: string;
  serviceId?: string;

  sessionDate: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  durationMinutes?: number;

  serviceName?: string;
  sessionType?: string;

  price?: number;
  currency?: string;

  status: BookingStatus | string;
  paymentStatus?: string;

  meetingUrl?: string | null;

  // Group session details
  groupSessionId?: string | null;
  groupSessionStatus?: string | null;
  groupCapacity?: number | null;

  createdAt?: string;
  coachName?: string;
}

interface MyBookingsProps {
  coaches: Coach[];
  refreshKey?: number;
}

function unwrapResponse(response: any): any {
  const body =
    response?.data && response?.success === undefined
      ? response.data
      : response;

  if (body?.success === false) {
    throw new Error(body.message || "Unable to fetch your bookings.");
  }

  return body?.data ?? body;
}

function normalizeBooking(item: any): Booking {
  return {
    ...item,

    id: item.id,
    coachId: item.coachId ?? item.coach_id,
    seekerId: item.seekerId ?? item.seeker_id,
    serviceId: item.serviceId ?? item.service_id,

    sessionDate: item.sessionDate ?? item.session_date,
    startTime: item.startTime ?? item.start_time,
    endTime: item.endTime ?? item.end_time,
    timezone: item.timezone,

    durationMinutes:
      item.durationMinutes ?? item.duration_minutes,

    serviceName: item.serviceName ?? item.service_name,
    sessionType: item.sessionType ?? item.session_type,

    paymentStatus: item.paymentStatus ?? item.payment_status,

    meetingUrl:
      item.meetingUrl ??
      item.groupMeetingUrl ??
      item.group_meeting_url ??
      item.meeting_url ??
      null,

    groupSessionId:
      item.groupSessionId ?? item.group_session_id ?? null,

    groupSessionStatus:
      item.groupSessionStatus ?? item.group_session_status ?? null,

    groupCapacity:
      item.groupCapacity ?? item.group_capacity ?? null,

    coachName: item.coachName ?? item.coach_name,
  };
}

function normalizeBookings(result: any): Booking[] {
  let items: any[] = [];

  if (Array.isArray(result)) {
    items = result;
  } else if (Array.isArray(result?.bookings)) {
    items = result.bookings;
  } else if (Array.isArray(result?.data?.bookings)) {
    items = result.data.bookings;
  } else if (Array.isArray(result?.data)) {
    items = result.data;
  }

  return items.map(normalizeBooking);
}

function formatDate(date?: string) {
  if (!date) return "Date not available";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time?: string) {
  if (!time) return "Time not available";

  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatStatus(status?: string) {
  if (!status) return "Unknown";

  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClasses(status?: string) {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "completed":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "cancelled":
    case "no_show":
      return "bg-red-50 text-red-700 ring-red-200";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function isGroupBooking(booking: Booking) {
  return (
    booking.sessionType?.toLowerCase().includes("group") ||
    Boolean(booking.groupSessionId)
  );
}

export default function MyBookings({
  coaches,
  refreshKey = 0,
}: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBookings = useCallback(async (manual = false) => {
    try {
      if (manual) setIsRefreshing(true);
      else setIsLoading(true);

      setErrorMessage("");

      const response = await api.get(BOOKINGS_ENDPOINT);
      const result = unwrapResponse(response);

      setBookings(normalizeBookings(result));
    } catch (error: unknown) {
      console.error("Fetch my bookings error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your bookings. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings, refreshKey]);

  const coachNameById = useMemo(() => {
    return new Map(coaches.map((coach) => [coach.id, coach.name]));
  }, [coaches]);

  const filters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;

    if (activeFilter === "cancelled") {
      return bookings.filter((booking) =>
        ["cancelled", "no_show"].includes(
          booking.status?.toLowerCase()
        )
      );
    }

    return bookings.filter(
      (booking) =>
        booking.status?.toLowerCase() === activeFilter
    );
  }, [bookings, activeFilter]);

  return (
    <section
      id="my-bookings"
      className="scroll-mt-6 space-y-5"
      aria-labelledby="my-bookings-heading"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-xs font-semibold text-[#6C5CE7]">
            <CalendarCheck size={14} />
            Your sessions
          </span>

          <h2
            id="my-bookings-heading"
            className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
          >
            My <span className="text-[#6C5CE7]">Bookings</span>
          </h2>

          <p className="mt-1 text-sm text-[#787680]">
            Track your coach booking requests and upcoming sessions.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void fetchBookings(true)}
          disabled={isRefreshing || isLoading}
          className="gap-2 self-start rounded-xl sm:self-auto"
        >
          <RefreshCw
            size={15}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </div>

      {!isLoading && !errorMessage && bookings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? bookings.length
                : filter.value === "cancelled"
                  ? bookings.filter((booking) =>
                      ["cancelled", "no_show"].includes(
                        booking.status?.toLowerCase()
                      )
                    ).length
                  : bookings.filter(
                      (booking) =>
                        booking.status?.toLowerCase() === filter.value
                    ).length;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeFilter === filter.value
                    ? "border-[#6C5CE7] bg-[#6C5CE7] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#6C5CE7]/50 hover:text-[#6C5CE7]"
                )}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse space-y-4 rounded-3xl border bg-white p-5"
            >
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="h-4 w-48 rounded bg-slate-100" />
              <div className="h-16 rounded-2xl bg-slate-100" />
              <div className="h-8 rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <Card className="rounded-3xl border-red-100 p-8 text-center">
          <AlertCircle
            className="mx-auto mb-3 text-red-500"
            size={28}
          />

          <h3 className="font-semibold text-slate-900">
            Unable to load bookings
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            {errorMessage}
          </p>

          <Button
            type="button"
            onClick={() => void fetchBookings(true)}
            disabled={isRefreshing}
            className="mt-4 gap-2 bg-[#6C5CE7] text-white hover:bg-[#5b4bd6]"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Try again
          </Button>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="rounded-3xl border-dashed p-8 text-center md:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
            <CalendarDays size={26} />
          </div>

          <h3 className="font-semibold text-slate-900">
            {bookings.length === 0
              ? "No bookings yet"
              : "No bookings in this category"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {bookings.length === 0
              ? "When you book a session with a coach, your booking details and status will appear here."
              : "Try selecting another status filter to see your bookings."}
          </p>

          {activeFilter !== "all" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveFilter("all")}
              className="mt-4 rounded-xl"
            >
              Show all bookings
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking) => {
            const coachName =
              booking.coachName ||
              coachNameById.get(booking.coachId) ||
              "Your coach";

            const isGroup = isGroupBooking(booking);

            const isConfirmed =
              booking.status?.toLowerCase() === "confirmed";

            const isGroupCancelled =
              booking.groupSessionStatus?.toLowerCase() === "cancelled";

            const canJoin =
              Boolean(booking.meetingUrl) &&
              isConfirmed &&
              !isGroupCancelled;

            return (
              <Card
                key={booking.id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border-white/70 bg-white/90 p-5 shadow-[0_8px_28px_rgba(108,92,231,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
                      {isGroup ? (
                        <GraduationCap size={20} />
                      ) : (
                        <Video size={19} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">
                        {booking.serviceName || "Coach session"}
                      </h3>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        with {coachName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                      statusClasses(booking.status)
                    )}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </div>

                {isGroup && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#6C5CE7]/15 bg-[#6C5CE7]/5 px-3 py-2">
                    <Users
                      size={16}
                      className="shrink-0 text-[#6C5CE7]"
                    />

                    <span className="text-xs font-semibold text-[#5546C7]">
                      Group Session
                    </span>

                    {booking.groupCapacity != null && (
                      <span className="ml-auto text-xs text-slate-600">
                        Capacity: {booking.groupCapacity}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-5 space-y-3 rounded-2xl bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CalendarDays
                      size={16}
                      className="shrink-0 text-[#6C5CE7]"
                    />

                    <span>{formatDate(booking.sessionDate)}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Clock
                      size={16}
                      className="shrink-0 text-[#6C5CE7]"
                    />

                    <span>
                      {formatTime(booking.startTime)} –{" "}
                      {formatTime(booking.endTime)}
                      {booking.durationMinutes
                        ? ` · ${booking.durationMinutes} min`
                        : ""}
                    </span>
                  </div>

                  {booking.sessionType && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      {isGroup ? (
                        <GraduationCap
                          size={16}
                          className="shrink-0 text-[#6C5CE7]"
                        />
                      ) : (
                        <BriefcaseBusiness
                          size={16}
                          className="shrink-0 text-[#6C5CE7]"
                        />
                      )}

                      <span>
                        {booking.sessionType
                          .replace(/[_-]/g, " ")
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                          )}
                      </span>
                    </div>
                  )}

                  {isGroup && booking.groupSessionStatus && (
                    <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2 text-xs">
                      <span className="text-slate-500">
                        Group session status
                      </span>

                      <span className="font-medium text-slate-700">
                        {formatStatus(booking.groupSessionStatus)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {Number(booking.price ?? 0) === 0
                      ? "Free session"
                      : `${booking.currency || "INR"} ${Number(
                          booking.price
                        ).toLocaleString("en-IN")}`}
                  </p>

                  {canJoin && (
                    <a
                      href={booking.meetingUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#6C5CE7] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#5b4bd6]"
                    >
                      Join session
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {isConfirmed && !booking.meetingUrl && (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Meeting link has not been added by your coach yet.
                  </p>
                )}

                {isGroupCancelled && (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                    This group session has been cancelled.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
