
"use client";

import { useEffect, useState } from "react";
import { X, CalendarDays } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface Service {
  id: string;
  name: string;
}

interface AvailabilityValues {
  serviceId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  capacity: number;
  timezone: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  submitting?: boolean;
  initialValues?: Partial<AvailabilityValues>;
  onSubmit: (values: AvailabilityValues) => void | Promise<void>;
}

const defaultValues: AvailabilityValues = {
  serviceId: "",
  daysOfWeek: [1],
  startTime: "09:00",
  endTime: "17:00",
  capacity: 10,
  timezone:
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
};

export default function WeeklyAvailabilityDialog({
  open,
  onOpenChange,
  services,
  submitting = false,
  initialValues,
  onSubmit,
}: Props) {
  const [values, setValues] =
    useState<AvailabilityValues>(defaultValues);

  useEffect(() => {
    if (open) {
      setValues({
        ...defaultValues,
        ...initialValues,
        daysOfWeek: initialValues?.daysOfWeek?.length
          ? initialValues.daysOfWeek
          : [1],
      });
    }
  }, [open, initialValues]);

  if (!open) return null;

  const allSelected = values.daysOfWeek.length === 7;

  const toggleDay = (day: number) => {
    setValues((current) => ({
      ...current,
      daysOfWeek: current.daysOfWeek.includes(day)
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day].sort((a, b) => a - b),
    }));
  };

  const updateField = <K extends keyof AvailabilityValues>(
    key: K,
    value: AvailabilityValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!values.serviceId) {
      alert("Please select a service.");
      return;
    }

    if (!values.daysOfWeek.length) {
      alert("Please select at least one weekday.");
      return;
    }

    if (values.startTime >= values.endTime) {
      alert("End time must be later than start time.");
      return;
    }

    if (!Number.isInteger(values.capacity) || values.capacity < 1) {
      alert("Capacity must be at least 1.");
      return;
    }

    await onSubmit(values);
  };

  const labelClass =
    "mb-1 block text-xs font-semibold text-slate-600";

  const inputClass =
    "h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[88dvh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-3 text-white sm:px-5 sm:py-3.5">
          <div>
            <h2 className="text-base font-bold sm:text-lg">
              Add Weekly Availability
            </h2>
            <p className="mt-0.5 text-[11px] text-purple-100 sm:text-xs">
              Select days and set your schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-full p-1 transition hover:bg-white/15"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable form content */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Service */}
              <div>
                <label className={labelClass}>
                  Service <span className="text-red-500">*</span>
                </label>

                <select
                  value={values.serviceId}
                  onChange={(e) =>
                    updateField("serviceId", e.target.value)
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weekdays */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">
                    Weekdays <span className="text-red-500">*</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-1 text-[10px] font-medium text-purple-700">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) =>
                        updateField(
                          "daysOfWeek",
                          e.target.checked
                            ? DAYS.map((day) => day.value)
                            : []
                        )
                      }
                      className="h-3 w-3 accent-purple-600"
                    />
                    Select all
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 p-1.5">
                  {DAYS.map((day) => (
                    <label
                      key={day.value}
                      className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-slate-700 hover:bg-purple-50 sm:text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={values.daysOfWeek.includes(day.value)}
                        onChange={() => toggleDay(day.value)}
                        className="h-3 w-3 shrink-0 accent-purple-600"
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Start time */}
              <div>
                <label className={labelClass}>
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={values.startTime}
                  onChange={(e) =>
                    updateField("startTime", e.target.value)
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* End time */}
              <div>
                <label className={labelClass}>
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={values.endTime}
                  onChange={(e) =>
                    updateField("endTime", e.target.value)
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* Capacity */}
              <div>
                <label className={labelClass}>
                  Group Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={values.capacity}
                  onChange={(e) =>
                    updateField("capacity", Number(e.target.value))
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* Timezone */}
              <div>
                <label className={labelClass}>
                  Timezone <span className="text-red-500">*</span>
                </label>
                <input
                  value={values.timezone}
                  onChange={(e) =>
                    updateField("timezone", e.target.value)
                  }
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Information */}
            <div className="flex items-start gap-1.5 rounded-lg bg-purple-50 px-2.5 py-2 text-[10px] leading-4 text-purple-700 sm:text-xs">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                This schedule repeats every week on the selected weekdays.
              </span>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="flex shrink-0 justify-end gap-2 border-t bg-slate-50 px-3 py-2.5 sm:px-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="rounded-lg border bg-white px-3 py-2 text-xs font-medium transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Availability"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
