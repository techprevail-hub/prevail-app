
"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Clock, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/utils/apiServices";

import {
  Coach,
  CoachService,
  AvailableSlot,
  CreateBookingPayload,
  CoachAvailabilityResponse,
} from "@/types/seeker/coach-types";

interface BookDemoDialogProps {
  coach: Coach;
  service: CoachService | null;
  onClose: () => void;
  onConfirm: (payload: CreateBookingPayload) => Promise<void>;
}

function todayISO() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

function getApiBody(response: any) {
  // Supports both a direct API body and an Axios-style response.
  const body =
    response?.data && response?.success === undefined
      ? response.data
      : response;

  if (body?.success === false) {
    throw new Error(body.message || "Request failed.");
  }

  return body?.data ?? body;
}

function formatTime(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return time;

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${minutes} ${suffix}`;
}

export default function BookDemoDialog({
  coach,
  service,
  onClose,
  onConfirm,
}: BookDemoDialogProps) {
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [timezone, setTimezone] = useState("");
  const [note, setNote] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const minDate = useMemo(() => todayISO(), []);

  useEffect(() => {
    if (!service) return;

    setDate("");
    setSelectedTime("");
    setSlots([]);
    setTimezone("");
    setNote("");
    setAvailabilityError("");
  }, [service?.id]);

  useEffect(() => {
    if (!service || !date) {
      setSlots([]);
      setSelectedTime("");
      setAvailabilityError("");
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setIsLoadingSlots(true);
      setAvailabilityError("");
      setSlots([]);
      setSelectedTime("");

      try {
        const query = new URLSearchParams({
          coachId: coach.id,
          serviceId: service!.id,
          date,
        });

        const response = await api.get(
          `/api/role-seeker/bookings/availability?${query.toString()}`
        );

        const result = getApiBody(response) as
          | CoachAvailabilityResponse["data"]
          | undefined;

        if (!result || !Array.isArray(result.slots)) {
          throw new Error("The availability API returned an unexpected response.");
        }

        if (!cancelled) {
          setSlots(result.slots.filter((slot) => slot.available));
          setTimezone(result.timezone || "");
        }
      } catch (error: unknown) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "Could not load available time slots.";

        setAvailabilityError(message);
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [coach.id, service?.id, date]);

  const canSubmit =
    !!service &&
    !!date &&
    !!selectedTime &&
    !!timezone &&
    !isLoadingSlots &&
    !isSubmitting &&
    slots.some((slot) => slot.startTime === selectedTime);

  const handleSubmit = async () => {
    if (!service || !canSubmit) return;

    try {
      setIsSubmitting(true);

      await onConfirm({
        coachId: coach.id,
        serviceId: service.id,
        sessionDate: date,
        startTime: selectedTime,
        timezone,
      });

      toast.success("Booking request submitted successfully.");
      onClose();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not book the session."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={!!service}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
            <CalendarCheck size={20} />
          </div>

          <DialogTitle className="text-xl font-bold">
            Book a demo session
          </DialogTitle>

          <DialogDescription>
            {service?.name} with {coach.name} · {service?.durationMinutes} min
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="demo-date"
              className="mb-2 block text-sm font-semibold"
            >
              Choose a date
            </label>

            <Input
              id="demo-date"
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Clock size={14} />
              Choose an available time
            </p>

            {!date && (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                Select a date to see this coach&apos;s available times.
              </p>
            )}

            {date && isLoadingSlots && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <Loader2 size={16} className="animate-spin" />
                Loading available slots...
              </div>
            )}

            {date && !isLoadingSlots && availabilityError && (
              <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{availabilityError}</p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    // Re-selecting the date triggers a fresh availability request.
                    const currentDate = date;
                    setDate("");
                    window.setTimeout(() => setDate(currentDate), 0);
                  }}
                >
                  <RefreshCw size={14} />
                  Retry
                </Button>
              </div>
            )}

            {date &&
              !isLoadingSlots &&
              !availabilityError &&
              slots.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                  No available slots for this date. Please choose another date.
                </p>
              )}

            {date && !isLoadingSlots && slots.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setSelectedTime(slot.startTime)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                      selectedTime === slot.startTime
                        ? "border-[#6C5CE7] bg-[#6C5CE7] text-white"
                        : "bg-white hover:border-[#6C5CE7]/50 hover:bg-[#6C5CE7]/5"
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="demo-note"
              className="mb-2 block text-sm font-semibold"
            >
              What would you like to cover?{" "}
              <span className="font-normal text-[#787680]">(optional)</span>
            </label>

            <textarea
              id="demo-note"
              rows={3}
              maxLength={300}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. I'm switching from QA to product management."
              className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              disabled={isSubmitting}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              This note is currently for the UI only; the booking API does not
              yet accept it.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="gap-2 bg-[#6C5CE7] text-white hover:bg-[#5b4bd6]"
            >
              {isSubmitting && (
                <Loader2 size={15} className="animate-spin" />
              )}
              Confirm booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
