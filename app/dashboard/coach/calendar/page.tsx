
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, Clock, Plus, MoreVertical,
  Pencil, Trash2, Power, Users, Globe, Repeat,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EntityFormDialog, {
  type FormFieldConfig,
} from "@/components/role-institute/FormDialog";
import WeeklyAvailabilityDialog from "@/components/role-coach/WeeklyAvailabilityDialog";
import { api } from "@/utils/apiServices";

import {
  getCoachAvailability, createCoachAvailability,
  updateCoachAvailability, toggleCoachAvailability,
  deleteCoachAvailability, getCoachOverrides,
  createCoachOverride, updateCoachOverride,
  deleteCoachOverride, createMonthlyAvailability,
} from "@/services/role-coach/availability";

import type {
  CoachAvailability, CoachAvailabilityOverride,
  CreateOverridePayload, OverrideType,
} from "@/types/role-coach/availability";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

interface Service {
  id: string;
  name: string;
}

interface WeeklyValues {
  serviceId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  capacity: number;
  timezone: string;
}

const getTime = (value?: string | null) => value?.slice(0, 5) || "";
const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const localMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const normalizeServices = (response: any): Service[] => {
  let data = response?.data ?? response;

  if (data?.success) {
    data = data.data;
  }

  const list = Array.isArray(data)
    ? data
    : data?.services ?? data?.items ?? [];

  return list
    .filter((service: any) =>
      (service.isActive ?? service.is_active) !== false
    )
    .map((service: any) => ({
      id: String(service.id ?? service.serviceId ?? ""),
      name: String(service.name ?? service.title ?? ""),
    }))
    .filter((service: Service) => service.id && service.name);
};

export default function CoachCalendarPage() {
  const [availability, setAvailability] = useState<CoachAvailability[]>([]);
  const [overrides, setOverrides] = useState<CoachAvailabilityOverride[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [monthlyOpen, setMonthlyOpen] = useState(false);

  const [editingAvailability, setEditingAvailability] = useState<CoachAvailability | null>(null);
  const [editingOverride, setEditingOverride] = useState<CoachAvailabilityOverride | null>(null);
  const [overridePrefill, setOverridePrefill] = useState<Record<string, string> | null>(null);

  const [month, setMonth] = useState(localMonth());
  const [days, setDays] = useState<number[]>([]);
  const [monthlyStart, setMonthlyStart] = useState("09:00");
  const [monthlyEnd, setMonthlyEnd] = useState("17:00");
  const [monthlyNote, setMonthlyNote] = useState("Monthly availability");

  const activeSlots = availability.filter((s) => s.isActive);
  const inactiveSlots = availability.length - activeSlots.length;
const loadData = async () => {
  setLoading(true);

  try {
    const results = await Promise.allSettled([
      getCoachAvailability(),
      getCoachOverrides(),
      api.get("/api/role-coach/services"),
    ]);

    if (results[0].status === "fulfilled") {
      setAvailability(results[0].value || []);
    } else {
      console.error("Availability loading error:", results[0].reason);
      toast.error("Failed to load availability");
    }

    if (results[1].status === "fulfilled") {
      setOverrides(results[1].value || []);
    } else {
      console.error("Overrides loading error:", results[1].reason);
      toast.error("Failed to load overrides");
    }

    if (results[2].status === "fulfilled") {
      const normalized = normalizeServices(results[2].value);
      setServices(normalized);

      console.log("Loaded coach services:", normalized);
    } else {
      console.error("Services loading error:", results[2].reason);
      toast.error("Failed to load services");
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  /* -------------------------- Weekly availability -------------------------- */

const saveAvailability = async (
  values: WeeklyValues
): Promise<void> => {
  const {
    serviceId,
    daysOfWeek,
    startTime,
    endTime,
    capacity,
  } = values;

  if (!serviceId || !daysOfWeek?.length) {
    toast.error("Select a service and at least one weekday");
    return;
  }

  if (
    daysOfWeek.some((day) => !Number.isInteger(day) || day < 0 || day > 6) ||
    new Set(daysOfWeek).size !== daysOfWeek.length
  ) {
    toast.error("Please select valid weekdays");
    return;
  }

  if (
    !TIME_REGEX.test(startTime) ||
    !TIME_REGEX.test(endTime) ||
    minutes(startTime) >= minutes(endTime)
  ) {
    toast.error("Please enter a valid time range");
    return;
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    toast.error("Capacity must be a positive integer");
    return;
  }

  if (editingAvailability && daysOfWeek.length !== 1) {
    toast.error("Select only one weekday when editing");
    return;
  }

  // Preserve the coach-wide overlap rule across all services.
  const overlap = daysOfWeek.some((day) =>
    availability.some((slot) =>
      slot.isActive &&
      slot.dayOfWeek === day &&
      slot.id !== editingAvailability?.id &&
      minutes(startTime) < minutes(getTime(slot.endTime)) &&
      minutes(endTime) > minutes(getTime(slot.startTime))
    )
  );

  if (overlap) {
    toast.error("This time overlaps another availability slot");
    return;
  }

  try {
    setSubmitting(true);

    const base = {
      serviceId,
      startTime,
      endTime,
      capacity,
      timezone: values.timezone?.trim() || timezone,
    };

    if (editingAvailability) {
      const updated = await updateCoachAvailability(
        editingAvailability.id,
        {
          ...base,
          dayOfWeek: daysOfWeek[0],
        }
      );

      setAvailability((prev) =>
        prev.map((slot) =>
          slot.id === updated.id ? updated : slot
        )
      );

      toast.success("Availability updated");
    } else {
      console.log("Creating weekly availability:", {
        ...base,
        daysOfWeek,
      });

      const created = await createCoachAvailability({
        ...base,
        daysOfWeek,
      });

      if (!Array.isArray(created)) {
        throw new Error(
          "Invalid API response. Expected an array of created availability slots."
        );
      }

      setAvailability((prev) => [...prev, ...created]);

      toast.success(
        `Availability added for ${created.length} weekdays`
      );
    }

    setAvailabilityOpen(false);
    setEditingAvailability(null);
  } catch (error: any) {
    console.error("Availability API error:", error);

    toast.error(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to save availability"
    );

    throw error;
  } finally {
    setSubmitting(false);
  }
};

  const handleToggle = async (slot: CoachAvailability) => {
    try {
      const updated = await toggleCoachAvailability(slot.id, !slot.isActive);
      setAvailability((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      toast.success(slot.isActive ? "Availability deactivated" : "Availability activated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update availability");
    }
  };

  const handleDelete = async (slot: CoachAvailability) => {
    if (!window.confirm("Delete this availability slot?")) return;
    try {
      await deleteCoachAvailability(slot.id);
      setAvailability((prev) => prev.filter((s) => s.id !== slot.id));
      toast.success("Availability deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete availability");
    }
  };

  /* ------------------------------ Overrides ------------------------------ */

const saveOverride = async (
  values: Record<string, string>
): Promise<void> => {
  const type = values.overrideType as OverrideType;
  const date = values.overrideDate?.trim();

  const startTime =
    type === "available" ? values.startTime?.trim() || "" : null;

  const endTime =
    type === "available" ? values.endTime?.trim() || "" : null;

  if (!date || !type) {
    toast.error("Date and type are required");
    return;
  }

  if (
    type === "available" &&
    (
      !TIME_REGEX.test(startTime || "") ||
      !TIME_REGEX.test(endTime || "") ||
      minutes(startTime!) >= minutes(endTime!)
    )
  ) {
    toast.error("Please enter a valid time range");
    return;
  }

  const payload: CreateOverridePayload = {
    overrideDate: date,
    overrideType: type,
    startTime,
    endTime,
    timezone: values.timezone?.trim() || timezone,
    note: values.note?.trim() || null,
  };

  try {
    setSubmitting(true);

    if (editingOverride) {
      const updated = await updateCoachOverride(
        editingOverride.id,
        payload
      );

      setOverrides((prev) =>
        prev.map((s) => s.id === updated.id ? updated : s)
      );

      toast.success("Override updated");
    } else {
      const created = await createCoachOverride(payload);

      setOverrides((prev) => [...prev, created]);

      toast.success("Override added");
    }

    setOverrideOpen(false);
    setEditingOverride(null);
    setOverridePrefill(null);

  } catch (error: any) {
    toast.error(error?.message || "Failed to save override");
  } finally {
    setSubmitting(false);
  }
};

  const handleDeleteOverride = async (item: CoachAvailabilityOverride) => {
    if (!window.confirm("Delete this date override?")) return;
    try {
      await deleteCoachOverride(item.id);
      setOverrides((prev) => prev.filter((s) => s.id !== item.id));
      toast.success("Override deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete override");
    }
  };

  /* -------------------------- Monthly availability -------------------------- */

  const saveMonthlyAvailability = async () => {
    if (!month || !days.length) return toast.error("Select month and weekdays");

    if (
      !TIME_REGEX.test(monthlyStart) ||
      !TIME_REGEX.test(monthlyEnd) ||
      minutes(monthlyStart) >= minutes(monthlyEnd)
    ) {
      return toast.error("Please enter a valid time range");
    }

    const [year, selectedMonth] = month.split("-").map(Number);

    try {
      setSubmitting(true);

      const created = await createMonthlyAvailability({
        month: selectedMonth - 1,
        year,
        daysOfWeek: days,
        startTime: monthlyStart,
        endTime: monthlyEnd,
        timezone,
        note: monthlyNote,
      });

      setOverrides((prev) => [...prev, ...created]);
      toast.success(`${created.length} monthly dates created`);
      setMonthlyOpen(false);
    } catch (error: any) {
      const latest = await getCoachOverrides().catch(() => null);
      if (latest) setOverrides(latest);
      toast.error(error?.message || "Monthly availability failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------- Form fields ----------------------------- */

  const overrideFields: FormFieldConfig[] = [
    { name: "overrideDate", label: "Date", type: "date", required: true },
    {
      name: "overrideType", label: "Type", type: "select", required: true,
      options: [
        { label: "Custom Availability", value: "available" },
        { label: "Unavailable", value: "blocked" },
      ],
    },
    { name: "startTime", label: "Start Time", type: "text", placeholder: "09:00" },
    { name: "endTime", label: "End Time", type: "text", placeholder: "17:00" },
    { name: "timezone", label: "Timezone", type: "text", required: true },
    { name: "note", label: "Note", type: "textarea", span: 2 },
  ];

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
        overrideDate: new Date().toLocaleDateString("en-CA"),
        overrideType: "available",
        startTime: "09:00",
        endTime: "17:00",
        timezone,
        note: "",
      };

  /* ----------------------------- Slot card ----------------------------- */

  const renderSlot = (slot: CoachAvailability) => (
    <div key={slot.id} className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-xs font-bold text-violet-600">{DAYS[slot.dayOfWeek]}</p>
          <p className="mt-1 font-bold">{getTime(slot.startTime)} - {getTime(slot.endTime)}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setEditingAvailability(slot);
              setAvailabilityOpen(true);
            }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggle(slot)}>
              <Power className="mr-2 h-4 w-4" />
              {slot.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(slot)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 space-y-2 border-t pt-3 text-xs text-slate-500">
        <p>{slot.serviceName || services.find((s) => s.id === slot.serviceId)?.name || "Service"}</p>
        <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Capacity: {slot.capacity ?? 10}</p>
        <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> {slot.timezone}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="h-6 w-6 text-violet-600" /> Calendar & Availability
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage your coaching schedule</p>
        </div>
        <span className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <Globe className="h-4 w-4" /> {timezone}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Total Slots", availability.length],
          ["Active", activeSlots.length],
          ["Inactive", inactiveSlots],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-violet-600">{value}</p>
          </div>
        ))}
      </div>

      {/* Weekly section */}
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Weekly Availability</h2>
          <p className="text-sm text-slate-500">Configure recurring service schedules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMonthlyOpen(true)}>
            <Repeat className="mr-2 h-4 w-4" /> Monthly
          </Button>
          <Button
            disabled={loading || !services.length}
            onClick={() => {
              if (!services.length) {
                toast.error("Please create a coach service first");
                return;
              }

              setEditingAvailability(null);
              setAvailabilityOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Weekly
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading availability...</p>
      ) : activeSlots.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeSlots.map(renderSlot)}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed py-10 text-center text-sm text-slate-500">
          <Clock className="mx-auto mb-2 h-7 w-7 text-slate-300" />
          No active availability slots yet.
        </div>
      )}

      {inactiveSlots > 0 && (
        <details className="rounded-xl border bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Show inactive slots ({inactiveSlots})
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availability.filter((s) => !s.isActive).map(renderSlot)}
          </div>
        </details>
      )}

      {/* Weekly overview */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-bold">Weekly Overview</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {DAYS.map((day, index) => {
            const slots = activeSlots.filter((s) => s.dayOfWeek === index);
            return (
              <div key={day} className="rounded-lg border p-3">
                <p className="mb-2 text-xs font-bold">{day.slice(0, 3)}</p>
                {slots.length ? slots.map((s) => (
                  <p key={s.id} className="mb-1 rounded bg-violet-50 px-2 py-1 text-[10px] text-violet-700">
                    {getTime(s.startTime)} - {getTime(s.endTime)}
                  </p>
                )) : <p className="text-xs text-slate-400">Off</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date overrides */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">Date Overrides</h2>
            <p className="text-sm text-slate-500">Manage additional or blocked dates.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setEditingOverride(null);
            setOverridePrefill(null);
            setOverrideOpen(true);
          }}>
            <Plus className="mr-1 h-4 w-4" /> Add Override
          </Button>
        </div>

        {overrides.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overrides.map((item) => (
              <div key={item.id} className="rounded-xl border bg-white p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{item.overrideDate}</p>
                    <p className={`mt-1 text-xs ${item.overrideType === "available" ? "text-green-600" : "text-red-600"}`}>
                      {item.overrideType}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingOverride(item);
                        setOverrideOpen(true);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteOverride(item)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {item.overrideType === "available" && (
                  <p className="mt-2 text-sm text-slate-600">
                    {getTime(item.startTime)} - {getTime(item.endTime)}
                  </p>
                )}
                {item.note && <p className="mt-2 text-xs text-slate-400">{item.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">
            No date overrides found.
          </p>
        )}
      </div>

      {/* Weekly dialog */}
      <WeeklyAvailabilityDialog
        open={availabilityOpen}
        onOpenChange={(open) => {
          setAvailabilityOpen(open);

          if (!open) {
            setEditingAvailability(null);
          }
        }}
        services={services}
        submitting={submitting}
        initialValues={
          editingAvailability
            ? {
                serviceId: editingAvailability.serviceId || "",
                daysOfWeek: [editingAvailability.dayOfWeek],
                startTime: getTime(editingAvailability.startTime),
                endTime: getTime(editingAvailability.endTime),
                capacity: editingAvailability.capacity || 10,
                timezone: editingAvailability.timezone,
              }
            : {
                serviceId: services[0]?.id || "",
                daysOfWeek: [1],
                startTime: "09:00",
                endTime: "17:00",
                capacity: 10,
                timezone,
              }
        }
        onSubmit={saveAvailability}
      />

      {/* Override dialog */}
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

      {/* Monthly dialog */}
      {monthlyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Monthly Availability</h2>
              <Button variant="ghost" size="sm" onClick={() => setMonthlyOpen(false)}>Close</Button>
            </div>

            <div className="space-y-4">
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                Monthly availability uses coach-wide date overrides and is not service-specific.
              </p>

              <div>
                <label className="mb-1 block text-sm font-medium">Select Month</label>
                <input type="month" min={localMonth()} value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 w-full rounded-lg border px-3 text-sm" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Select Weekdays</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DAYS.map((day, index) => (
                    <label key={day} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                      <input type="checkbox" checked={days.includes(index)} onChange={() => setDays((prev) => prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort())} />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Start Time</label>
                  <input type="time" value={monthlyStart} onChange={(e) => setMonthlyStart(e.target.value)} className="h-10 w-full rounded-lg border px-3" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">End Time</label>
                  <input type="time" value={monthlyEnd} onChange={(e) => setMonthlyEnd(e.target.value)} className="h-10 w-full rounded-lg border px-3" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Note</label>
                <input value={monthlyNote} onChange={(e) => setMonthlyNote(e.target.value)} className="h-10 w-full rounded-lg border px-3" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" disabled={submitting} onClick={() => setMonthlyOpen(false)}>Cancel</Button>
                <Button disabled={submitting} onClick={saveMonthlyAvailability} className="bg-violet-600 text-white hover:bg-violet-700">
                  {submitting ? "Creating..." : "Create Availability"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
