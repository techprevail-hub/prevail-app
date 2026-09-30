"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  PowerOff,
  Sparkles,
  CheckCircle2,
  Globe,
  Briefcase,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
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
  getCoachAvailability,
  createCoachAvailability,
  updateCoachAvailability,
  toggleCoachAvailability,
  deleteCoachAvailability,
  getCoachOverrides,
  createCoachOverride,
  updateCoachOverride,
  deleteCoachOverride,
} from "@/services/role-coach/availability";

import type {
  CoachAvailability,
  CoachAvailabilityOverride,
  OverrideType,
} from "@/types/role-coach/availability";

const DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const timezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "Asia/Kolkata";

const getDayName = (day: number) =>
  DAYS.find((d) => d.value === day)?.label || "";

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

const getTime = (value: string | null) =>
  value ? value.slice(0, 5) : "";

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const getDayFromDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getDay();
};

const sortSlots = (items: CoachAvailability[]) =>
  [...items].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek)
      return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });

export default function CoachCalendarPage() {
  const [availability, setAvailability] = useState<CoachAvailability[]>(
    []
  );
  const [overrides, setOverrides] = useState<
    CoachAvailabilityOverride[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);

  const [editingAvailability, setEditingAvailability] =
    useState<CoachAvailability | null>(null);

  const [editingOverride, setEditingOverride] =
    useState<CoachAvailabilityOverride | null>(null);

  const [overridePrefill, setOverridePrefill] = useState<any>(null);

  const selectedDateKey = getDateKey(selectedDate);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [a, o] = await Promise.allSettled([
        getCoachAvailability(),
        getCoachOverrides(),
      ]);

      if (a.status === "fulfilled") setAvailability(a.value || []);
      else toast.error("Failed to load availability");

      if (o.status === "fulfilled") setOverrides(o.value || []);
      else toast.error("Failed to load date overrides");

      setLoading(false);
    })();
  }, []);

  const totalSlots = availability.length;
  const activeSlots = availability.filter((s) => s.isActive).length;
  const inactiveSlots = totalSlots - activeSlots;

  const openAddAvailability = () => {
    setEditingAvailability(null);
    setAvailabilityOpen(true);
  };

  const openEditAvailability = (slot: CoachAvailability) => {
    setEditingAvailability(slot);
    setAvailabilityOpen(true);
  };

  const openOverrideFromSlot = (slot: CoachAvailability) => {
    setEditingOverride(null);
    setOverrideOpen(true);
    setOverridePrefill({
      overrideDate: selectedDateKey,
      overrideType: "available",
      startTime: getTime(slot.startTime),
      endTime: getTime(slot.endTime),
      timezone: slot.timezone,
      note: `Override for ${getDayName(slot.dayOfWeek)} ${getTime(
        slot.startTime
      )} - ${getTime(slot.endTime)}`,
    });
  };

  const saveAvailability = async (
    values: Record<string, string>
  ) => {
    const date = values.availabilityDate?.trim();
    const startTime = values.startTime?.trim();
    const endTime = values.endTime?.trim();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const dayOfWeek = getDayFromDate(date);

    if (dayOfWeek === null) {
      toast.error("Invalid date");
      return;
    }

    if (
      !startTime ||
      !endTime ||
      !TIME_REGEX.test(startTime) ||
      !TIME_REGEX.test(endTime)
    ) {
      toast.error("Enter valid time in HH:mm format");
      return;
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      toast.error(
        "End time must be later than start time. For 1 PM use 13:00."
      );
      return;
    }

    const overlap = availability.some((slot) => {
      if (
        slot.dayOfWeek !== dayOfWeek ||
        !slot.isActive ||
        slot.id === editingAvailability?.id
      )
        return false;

      return (
        toMinutes(startTime) < toMinutes(getTime(slot.endTime)) &&
        toMinutes(endTime) > toMinutes(getTime(slot.startTime))
      );
    });

    if (overlap) {
      toast.error("This time overlaps another availability slot");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        dayOfWeek,
        startTime,
        endTime,
        timezone: values.timezone?.trim() || timezone,
      };

      if (editingAvailability) {
        const updated = await updateCoachAvailability(
          editingAvailability.id,
          payload
        );

        setAvailability((current) =>
          sortSlots(
            current.map((item) =>
              item.id === editingAvailability.id ? updated : item
            )
          )
        );

        toast.success("Availability updated");
      } else {
        const created = await createCoachAvailability(payload);

        setAvailability((current) =>
          sortSlots([...current, created])
        );

        toast.success("Availability added");
      }

      setSelectedDate(new Date(`${date}T00:00:00`));
      setAvailabilityOpen(false);
      setEditingAvailability(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save availability");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (slot: CoachAvailability) => {
    try {
      const updated = await toggleCoachAvailability(
        slot.id,
        !slot.isActive
      );

      setAvailability((current) =>
        current.map((item) =>
          item.id === slot.id ? updated : item
        )
      );

      toast.success(
        slot.isActive
          ? "Availability deactivated"
          : "Availability activated"
      );
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to update availability"
      );
    }
  };

  const handleDelete = async (slot: CoachAvailability) => {
    if (
      !window.confirm(
        `Delete ${getDayName(slot.dayOfWeek)} ${getTime(
          slot.startTime
        )} - ${getTime(slot.endTime)}?`
      )
    )
      return;

    try {
      await deleteCoachAvailability(slot.id);

      setAvailability((current) =>
        current.filter((item) => item.id !== slot.id)
      );

      toast.success("Availability deleted");
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to delete availability"
      );
    }
  };

  const saveOverride = async (
    values: Record<string, string>
  ) => {
    const type = values.overrideType as OverrideType;
    const date = values.overrideDate?.trim();

    if (!date || !type) {
      toast.error("Date and type are required");
      return;
    }

    let startTime: string | null = null;
    let endTime: string | null = null;

    if (type === "available") {
      startTime = values.startTime?.trim() || "";
      endTime = values.endTime?.trim() || "";

      if (
        !TIME_REGEX.test(startTime) ||
        !TIME_REGEX.test(endTime)
      ) {
        toast.error("Enter valid time in HH:mm format");
        return;
      }

      if (toMinutes(startTime) >= toMinutes(endTime)) {
        toast.error("End time must be later than start time");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        overrideDate: date,
        overrideType: type,
        startTime,
        endTime,
        timezone: values.timezone?.trim() || timezone,
        note: values.note?.trim() || null,
      };

      if (editingOverride) {
        const updated = await updateCoachOverride(
          editingOverride.id,
          payload
        );

        setOverrides((current) =>
          current.map((item) =>
            item.id === editingOverride.id ? updated : item
          )
        );

        toast.success("Date override updated");
      } else {
        const created = await createCoachOverride(payload);

        setOverrides((current) => [...current, created]);

        toast.success("Date override added");
      }

      setOverrideOpen(false);
      setEditingOverride(null);
      setOverridePrefill(null);
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to save date override"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const availabilityFields: FormFieldConfig[] = [
    {
      name: "availabilityDate",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "startTime",
      label: "Start Time",
      type: "text",
      placeholder: "09:00",
      required: true,
      validate: (v) =>
        TIME_REGEX.test(v) ? null : "Use HH:mm format",
    },
    {
      name: "endTime",
      label: "End Time",
      type: "text",
      placeholder: "17:00",
      required: true,
      validate: (v) =>
        TIME_REGEX.test(v) ? null : "Use HH:mm format",
    },
    {
      name: "timezone",
      label: "Timezone",
      type: "text",
      required: true,
      placeholder: "Asia/Kolkata",
    },
  ];

  const overrideFields: FormFieldConfig[] = [
    {
      name: "overrideDate",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "overrideType",
      label: "Type",
      type: "select",
      required: true,
      options: [
        {
          label: "Custom Availability",
          value: "available",
        },
        {
          label: "Unavailable All Day",
          value: "blocked",
        },
      ],
    },
    {
      name: "startTime",
      label: "Start Time",
      type: "text",
      placeholder: "09:00",
      required: false,
    },
    {
      name: "endTime",
      label: "End Time",
      type: "text",
      placeholder: "17:00",
      required: false,
    },
    {
      name: "timezone",
      label: "Timezone",
      type: "text",
      required: true,
      placeholder: "Asia/Kolkata",
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Optional note",
      span: 2,
    },
  ];

  const availabilityInitialValues = editingAvailability
    ? {
        availabilityDate: selectedDateKey,
        startTime: getTime(editingAvailability.startTime),
        endTime: getTime(editingAvailability.endTime),
        timezone: editingAvailability.timezone,
      }
    : {
        availabilityDate: selectedDateKey,
        startTime: "09:00",
        endTime: "17:00",
        timezone,
      };

  const overrideInitialValues = editingOverride
    ? {
        overrideDate: editingOverride.overrideDate,
        overrideType: editingOverride.overrideType,
        startTime: getTime(editingOverride.startTime),
        endTime: getTime(editingOverride.endTime),
        timezone: editingOverride.timezone,
        note: editingOverride.note || "",
      }
    : overridePrefill || {
        overrideDate: selectedDateKey,
        overrideType: "available",
        startTime: "09:00",
        endTime: "17:00",
        timezone,
        note: "",
      };

  return (
    <div className="space-y-6 p-1">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-violet-100 p-3">
            <CalendarDays className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">
                Calendar & Availability
              </h1>
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage your coaching availability
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 items-center rounded-xl bg-white px-3 py-1.5 border border-slate-200">
            <Globe className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs text-slate-600">
              {timezone}
            </span>
          </div>
          {loading && (
            <span className="text-xs text-slate-500">
              Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Services Card */}
        <div className="relative rounded-2xl border-2 border-violet-500 border-b-4 border-b-violet-600 bg-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Services
              </p>
              <p className="text-3xl font-bold text-violet-600 mt-1">
                {totalSlots}
              </p>
            </div>
            <div className="rounded-xl bg-violet-100 p-2.5">
              <Briefcase className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Active Card */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {activeSlots}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Inactive Card */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {inactiveSlots}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2.5">
              <XCircle className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Slots Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg text-slate-800">
              Available Slots
            </h2>
            <p className="text-sm text-slate-500">
              All your weekly availability at a glance
            </p>
          </div>

          <Button
            size="sm"
            onClick={openAddAvailability}
            className="rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] text-white shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Availability
          </Button>
        </div>

        {!availability.filter((s) => s.isActive).length ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 py-12 text-center">
            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              No availability slots yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Add Availability" to create your first slot
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortSlots(availability)
              .filter((s) => s.isActive)
              .map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:border-violet-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2 shadow-sm">
                      <Clock className="w-4 h-4 text-white" />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-violet-50"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => openEditAvailability(slot)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Slot
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openOverrideFromSlot(slot)}
                        >
                          <CalendarClock className="w-4 h-4 mr-2" />
                          Override Date/Time
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleToggle(slot)}
                        >
                          <PowerOff className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDelete(slot)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Slot
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                    {getDayName(slot.dayOfWeek)}
                  </p>

                  <p className="text-base font-bold text-slate-800 mt-1">
                    {getTime(slot.startTime)} - {getTime(slot.endTime)}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-500">
                      {slot.timezone}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl p-5 shadow-md">
        <h2 className="font-bold text-sm mb-4">
          Weekly Availability
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const slots = availability
              .filter((s) => s.dayOfWeek === day.value)
              .sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              );

            return (
              <div
                key={day.value}
                className="rounded-xl border p-3"
              >
                <div className="flex justify-between mb-2">
                  <p className="text-[11px] font-bold">
                    {day.short}
                  </p>

                  {slots.some((s) => s.isActive) && (
                    <span className="text-[9px] text-violet-600">
                      {slots.filter((s) => s.isActive).length} slots
                    </span>
                  )}
                </div>

                {slots.length ? (
                  <div className="space-y-1">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`text-[10px] rounded-md px-1.5 py-1 ${
                          slot.isActive
                            ? "bg-violet-50 text-violet-700"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        {getTime(slot.startTime)} -{" "}
                        {getTime(slot.endTime)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    Off
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <EntityFormDialog
        open={availabilityOpen}
        onOpenChange={(open) => {
          setAvailabilityOpen(open);
          if (!open) setEditingAvailability(null);
        }}
        mode={editingAvailability ? "edit" : "create"}
        entityLabel="Availability"
        fields={availabilityFields}
        initialValues={availabilityInitialValues}
        submitting={submitting}
        onSubmit={saveAvailability}
      />

      <EntityFormDialog
        open={overrideOpen}
        onOpenChange={(open) => {
          setOverrideOpen(open);
          if (!open) {
            setEditingOverride(null);
            setOverridePrefill(null);
          }
        }}
        mode={editingOverride ? "edit" : "create"}
        entityLabel="Date Override"
        fields={overrideFields}
        initialValues={overrideInitialValues}
        submitting={submitting}
        onSubmit={saveOverride}
      />
    </div>
  );
}