// app/dashboard/coach/services/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Briefcase,
  Search,
  X,
  Pencil,
  Trash2,
  Plus,
  Clock,
  IndianRupee,
  Users,
  MessageSquare,
  Video,
  Phone,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  getCoachServices,
  createCoachService,
  updateCoachService,
  toggleCoachService,
  deleteCoachService,
} from "@/services/role-coach/coachService";

import type {
  CoachService,
  SessionType,
  CreateCoachServicePayload,
  UpdateCoachServicePayload,
} from "@/types/role-coach/service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ─── Session Type Config ────────────────────────────────────────────────────
const sessionTypeConfig: Record<
  SessionType,
  { label: string; icon: React.ElementType }
> = {
  one_on_one: { label: "One-on-One", icon: Users },
  group: { label: "Group", icon: Users },
  chat: { label: "Chat", icon: MessageSquare },
  video: { label: "Video Call", icon: Video },
  phone: { label: "Phone", icon: Phone },
};

// ─── Form State Type ────────────────────────────────────────────────────────
interface ServiceFormState {
  name: string;
  description: string;
  session_type: SessionType;
  duration_minutes: string;
  is_free: boolean;
  price: string;
  currency: string;
}

const initialFormState: ServiceFormState = {
  name: "",
  description: "",
  session_type: "one_on_one",
  duration_minutes: "60",
  is_free: false,
  price: "",
  currency: "INR",
};

export default function CoachServicesPage() {
  // ── State ──
  const [services, setServices] = useState<CoachService[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<CoachService | null>(null);
  const [formState, setFormState] = useState<ServiceFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<CoachService | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch Services ──
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCoachServices();

      console.log("📊 Services response:", response);

      if (response?.success) {
        // ✅ FIX #3: backend returns { services: [...], pagination: {...} }
        setServices(response.data?.services || []);
      } else {
        toast.error(response?.message || "Failed to fetch services");
      }
    } catch (error: any) {
      console.error("❌ Error fetching services:", error);
      toast.error(error?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ── Computed Values ──
  const safeServices = Array.isArray(services) ? services : [];

  const counts = useMemo(() => {
    const total = safeServices.length;
    // ✅ FIX #2: use camelCase `isActive`
    const active = safeServices.filter((s) => s.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [safeServices]);

  const filteredServices = useMemo(() => {
    return safeServices.filter((service) => {
      // ✅ FIX #2: use camelCase `isActive`
      if (statusFilter === "active" && !service.isActive) return false;
      if (statusFilter === "inactive" && service.isActive) return false;

      // Search filter
      if (searchValue.trim()) {
        const query = searchValue.toLowerCase();
        const nameMatch = service.name?.toLowerCase().includes(query);
        const descMatch = service.description?.toLowerCase().includes(query);
        return nameMatch || descMatch;
      }

      return true;
    });
  }, [safeServices, statusFilter, searchValue]);

  // ── Handlers ──
  const openCreateDialog = () => {
    setEditingService(null);
    setFormState(initialFormState);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditDialog = (service: CoachService) => {
    setEditingService(service);
    // ✅ FIX #2: read camelCase from backend response
    setFormState({
      name: service.name || "",
      description: service.description || "",
      session_type: service.sessionType,
      duration_minutes: String(service.durationMinutes || 60),
      is_free: service.isFree,
      price: service.isFree ? "" : String(service.price || ""),
      currency: service.currency || "INR",
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.name.trim()) {
      errors.name = "Service name is required";
    }

    const duration = Number(formState.duration_minutes);
    if (!formState.duration_minutes || isNaN(duration) || duration <= 0) {
      errors.duration_minutes = "Enter a valid duration";
    }

    if (!formState.is_free) {
      const price = Number(formState.price);
      if (!formState.price || isNaN(price) || price < 0) {
        errors.price = "Enter a valid price";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // ✅ FIX #1: send camelCase keys that backend validator expects
      const basePayload = {
        name: formState.name.trim(),
        description: formState.description.trim() || undefined,
        sessionType: formState.session_type,
        durationMinutes: Number(formState.duration_minutes),
        isFree: formState.is_free,
        price: formState.is_free ? 0 : Number(formState.price),
        currency: formState.currency,
      };

      if (editingService) {
        const payload = basePayload as unknown as UpdateCoachServicePayload;
        await updateCoachService(editingService.id, payload);
        toast.success("Service updated successfully");
      } else {
        const payload = basePayload as unknown as CreateCoachServicePayload;
        await createCoachService(payload);
        toast.success("Service created successfully");
      }

      setFormOpen(false);
      fetchServices();
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: CoachService) => {
    try {
      // ✅ FIX #2: use camelCase `isActive`
      await toggleCoachService(service.id, !service.isActive);
      toast.success(
        service.isActive ? "Service deactivated" : "Service activated"
      );
      fetchServices();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteCoachService(deleteTarget.id);
      toast.success("Service deleted successfully");
      setDeleteTarget(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
  };

  const formatPrice = (service: CoachService) => {
    // ✅ FIX #2: use camelCase `isFree`
    if (service.isFree) return "Free";
    const symbol = service.currency === "INR" ? "₹" : service.currency + " ";
    return `${symbol}${Number(service.price).toLocaleString("en-IN")}`;
  };

  const hasActiveFilters = searchValue || statusFilter !== "all";

  // ── Summary Cards ──
  const summaryCards = [
    {
      label: "Total Services",
      value: counts.total,
      status: "all" as const,
      icon: Briefcase,
      color: "violet",
    },
    {
      label: "Active",
      value: counts.active,
      status: "active" as const,
      icon: CheckCircle2,
      color: "emerald",
    },
    {
      label: "Inactive",
      value: counts.inactive,
      status: "inactive" as const,
      icon: XCircle,
      color: "slate",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage the services you offer to your clients
              {counts.total > 0 && (
                <span className="ml-1.5 font-semibold text-violet-600">
                  · {counts.total} total
                </span>
              )}
            </p>
          </div>
        </div>

        <Button
          onClick={openCreateDialog}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 shadow-sm shadow-violet-200"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const isActive = statusFilter === card.status;
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => setStatusFilter(card.status)}
              className={`
                relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200
                ${
                  isActive
                    ? "border-violet-600 bg-violet-50 shadow-md shadow-violet-100"
                    : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      isActive ? "text-violet-700" : "text-slate-900"
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
                <div
                  className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${
                    isActive
                      ? "bg-violet-200 text-violet-700"
                      : "bg-slate-100 text-slate-400"
                  }
                `}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search / Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search services..."
              value={searchValue}
              className="pl-10 pr-9 rounded-xl border-slate-200 focus-visible:ring-violet-400"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status select */}
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as "all" | "active" | "inactive")
            }
          >
            <SelectTrigger className="w-full lg:w-[160px] rounded-xl border-slate-200">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-700 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-violet-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Service List ── */}
      {loading ? (
        // Loading Skeleton
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-5 bg-slate-200 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16">
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              {hasActiveFilters ? "No services found" : "No services yet"}
            </p>
            <p className="text-sm max-w-sm text-center">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Create your first service to start offering coaching sessions to clients."}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-2 rounded-xl"
              >
                Clear filters
              </Button>
            ) : (
              <Button
                onClick={openCreateDialog}
                className="mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Service Cards
        <div className="space-y-4">
          {filteredServices.map((service) => {
            // ✅ FIX #2: use camelCase `sessionType`
            const sessionConfig = sessionTypeConfig[service.sessionType];
            const SessionIcon = sessionConfig?.icon || Users;
            const sessionLabel = sessionConfig?.label || service.sessionType;

            return (
              <div
                key={service.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200"
              >
                <div className="p-5">
                  {/* Top row: name + status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate">
                        {service.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`border-0 px-2.5 py-1 font-medium ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            service.isActive
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">
                        {service.durationMinutes} min
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <SessionIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{sessionLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <span
                        className={`font-semibold ${
                          service.isFree
                            ? "text-emerald-600"
                            : "text-slate-800"
                        }`}
                      >
                        {formatPrice(service)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700 gap-1.5"
                      onClick={() => openEditDialog(service)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl">
                        {service.isActive ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(service)}
                            className="gap-2 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 text-slate-500" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(service)}
                            className="gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(service)}
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Service Dialog ── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingService ? "Edit Service" : "Create Service"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingService
                ? "Update the details of your service."
                : "Fill in the details to create a new service."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="service-name" className="text-sm font-medium">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="service-name"
                placeholder="e.g. Career Guidance Session"
                value={formState.name}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, name: e.target.value }))
                }
                className={`rounded-xl ${
                  formErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="service-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="service-desc"
                placeholder="Describe what this service includes..."
                value={formState.description}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, description: e.target.value }))
                }
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Session Type + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Session Type</Label>
                <Select
                  value={formState.session_type}
                  onValueChange={(v) =>
                    setFormState((s) => ({
                      ...s,
                      session_type: v as SessionType,
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_on_one">One-on-One</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service-duration" className="text-sm font-medium">
                  Duration <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="service-duration"
                    type="number"
                    min="1"
                    placeholder="60"
                    value={formState.duration_minutes}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        duration_minutes: e.target.value,
                      }))
                    }
                    className={`rounded-xl pr-14 ${
                      formErrors.duration_minutes
                        ? "border-red-400 focus-visible:ring-red-400"
                        : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                    min
                  </span>
                </div>
                {formErrors.duration_minutes && (
                  <p className="text-xs text-red-500">
                    {formErrors.duration_minutes}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pricing</Label>
              <RadioGroup
                value={formState.is_free ? "free" : "paid"}
                onValueChange={(v) =>
                  setFormState((s) => ({ ...s, is_free: v === "free" }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="pricing-paid" />
                  <Label
                    htmlFor="pricing-paid"
                    className="cursor-pointer font-normal"
                  >
                    Paid
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="pricing-free" />
                  <Label
                    htmlFor="pricing-free"
                    className="cursor-pointer font-normal"
                  >
                    Free
                  </Label>
                </div>
              </RadioGroup>

              {!formState.is_free && (
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="service-price" className="text-sm font-medium">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ₹
                    </span>
                    <Input
                      id="service-price"
                      type="number"
                      min="0"
                      placeholder="1000"
                      value={formState.price}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, price: e.target.value }))
                      }
                      className={`rounded-xl pl-8 ${
                        formErrors.price
                          ? "border-red-400 focus-visible:ring-red-400"
                          : ""
                      }`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-xs text-red-500">{formErrors.price}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl min-w-[130px]"
            >
              {submitting
                ? "Saving..."
                : editingService
                ? "Save Changes"
                : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Delete Service?
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}