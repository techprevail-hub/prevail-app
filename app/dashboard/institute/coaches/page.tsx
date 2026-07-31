// app/dashboard/institute/coaches/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, X, Pencil, Trash2, Eye, Briefcase, Award } from "lucide-react";
import { toast } from "sonner";

import coachService from "@/services/coachService";
import { Coach, CoachCounts, CoachPagination } from "@/types/coaches";

import CoachDrawer from "@/components/role-institute/coach/CoachDrawer";
import EntityFormDialog, { FormFieldConfig } from "@/components/role-institute/FormDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Field definitions for Edit Coach Invitation form ────────
// (Only edit mode, no create)
const coachFormFields: FormFieldConfig[] = [
  { name: "coachName", label: "Coach Name", type: "text", required: true, placeholder: "e.g. John Smith", span: 2 },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "coach@email.com",
    validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email") },
  { name: "specialization", label: "Specialization", type: "text", required: true, placeholder: "e.g. Frontend Development" },
  { name: "experience", label: "Experience", type: "text", required: true, placeholder: "e.g. 5 Years" },
];

// ─── Status Styles ──────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-red-50 text-red-700 border-red-200",
};

export default function CoachPage() {
  // ── State ──
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [counts, setCounts] = useState<CoachCounts>({
    total: 0,
    pending: 0,
    accepted: 0,
    cancelled: 0,
    expired: 0,
  });
  const [pagination, setPagination] = useState<CoachPagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Query params state
  const [searchValue, setSearchValue] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog states
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Table Columns Definition ──
  const columns = [
    { key: "coach_name", label: "Coach Name" },
    { key: "email", label: "Email" },
    { key: "specialization", label: "Specialization" },
    { key: "experience", label: "Experience" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", width: "w-32" },
  ];

  // ── Fetch Coaches ──
  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: activeStatus || undefined,
        sortBy,
        sortOrder,
      };

      const response = await coachService.getCoaches(params);
      
      console.log("📊 Coach response:", response);
      
      if (response && response.success) {
        setCoaches(response.data || []);
        setCounts(response.counts || { total: 0, pending: 0, accepted: 0, cancelled: 0, expired: 0 });
        setPagination(response.pagination || null);
      } else {
        toast.error(response?.message || "Failed to fetch coaches");
      }
    } catch (error: any) {
      console.error("❌ Error fetching coaches:", error);
      toast.error(error?.message || "Failed to load coaches");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchValue, activeStatus, sortBy, sortOrder]);

  // ── Load on mount and when dependencies change ──
  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  // ── Handlers ──
  const handleView = (coach: Coach) => {
    setSelectedCoach(coach);
    setDrawerOpen(true);
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormOpen(true);
  };

  const handleCancelInvitation = async (coach: Coach) => {
    try {
      await coachService.cancelCoach(coach.id);
      toast.success("Coach invitation cancelled successfully");
      fetchCoaches();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel invitation");
    }
  };

  // ── Edit handler only (no create) ──
  const handleFormSubmit = async (values: Record<string, string>) => {
    try {
      setSubmitting(true);
      if (editingCoach) {
        await coachService.updateCoach(editingCoach.id, values);
        toast.success("Coach invitation updated successfully");
        setFormOpen(false);
        fetchCoaches();
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleCardClick = (status: string) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchValue("");
    setActiveStatus("");
    setCurrentPage(1);
  };

  // ── Summary Cards ──
  const summaryCards = [
    { label: "Total", value: counts?.total || 0, status: "", icon: Users },
    { label: "Pending", value: counts?.pending || 0, status: "pending", icon: Users },
    { label: "Accepted", value: counts?.accepted || 0, status: "accepted", icon: Users },
    { label: "Cancelled", value: counts?.cancelled || 0, status: "cancelled", icon: Users },
  ];

  // ─── Render Row ───────────────────────────────────────────────────────────
  const renderRow = (coach: Coach) => {
    const statusClass = statusStyles[coach.status] || statusStyles.pending;
    const statusEmoji = coach.status === 'pending' ? '⏳' : 
                        coach.status === 'accepted' ? '✅' : 
                        coach.status === 'cancelled' ? '❌' : '⚠️';

    // Only show actions for pending status
    const showActions = coach.status === 'pending';

    return (
      <>
        <td className="px-4 py-3 font-semibold text-slate-800">
          {coach.coach_name}
        </td>
        <td className="px-4 py-3 text-slate-500">{coach.email}</td>
        <td className="px-4 py-3 text-slate-600">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {coach.specialization}
          </div>
        </td>
        <td className="px-4 py-3 text-slate-600">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            {coach.experience}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant="outline" className={`${statusClass} border-0 px-2 py-1 font-medium`}>
            {statusEmoji} {coach.status.charAt(0).toUpperCase() + coach.status.slice(1)}
          </Badge>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-violet-100"
              onClick={() => handleView(coach)}
              title="View Coach"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
            {showActions && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-blue-100"
                  onClick={() => handleEdit(coach)}
                  title="Edit Coach"
                >
                  <Pencil className="w-4 h-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-red-100"
                  onClick={() => handleCancelInvitation(coach)}
                  title="Cancel Invitation"
                >
                  <Trash2 className="w-4 h-4 text-slate-500" />
                </Button>
              </>
            )}
          </div>
        </td>
      </>
    );
  };

  // Convert the selected coach into string values the form can consume
  const editInitialValues: Record<string, string> | undefined = editingCoach
    ? {
        coachName: editingCoach.coach_name ?? "",
        email: editingCoach.email ?? "",
        specialization: editingCoach.specialization ?? "",
        experience: editingCoach.experience ?? "",
      }
    : undefined;

  // ✅ Safety check: ensure coaches is always an array
  const safeCoaches = Array.isArray(coaches) ? coaches : [];

  // ✅ Get pagination values with fallbacks
  const currentPageNum = pagination?.page ?? 1;
  const pageSizeNum = pagination?.limit ?? 10;
  const totalRecords = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPrev = pagination?.hasPrev ?? false;
  const hasNext = pagination?.hasNext ?? false;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Coach Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your institute's coaches
              {counts?.total ? (
                <span className="ml-1.5 font-semibold text-violet-600">· {counts.total} total</span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const isActive = activeStatus === card.status;
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => handleCardClick(card.status)}
              className={`
                relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200
                ${isActive 
                  ? 'border-violet-600 bg-violet-50 shadow-md shadow-violet-100' 
                  : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${isActive ? 'text-violet-700' : 'text-slate-900'}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${isActive ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-400'}
                `}>
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

      {/* ── Search ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">

          {/* Search bar */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search by coach name, email, specialization, or experience"
              value={searchValue}
              className="pl-10 pr-9 rounded-xl border-slate-200 focus-visible:ring-violet-400"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear filters button */}
          {(searchValue || activeStatus) && (
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

      {/* ── Coach Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${col.width || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {columns.map((col) => (
                      <td key={`skeleton-${i}-${col.key}`} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !safeCoaches || safeCoaches.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Users className="w-7 h-7 opacity-50" />
                      </div>
                      <p className="text-base font-semibold text-slate-600">No Coaches Found</p>
                      <p className="text-sm">Try changing your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                safeCoaches.map((coach) => (
                  <tr
                    key={coach.id}
                    className="group hover:bg-violet-50/40 transition-colors"
                  >
                    {renderRow(coach)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && safeCoaches.length > 0 && pagination && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">
                {((currentPageNum - 1) * pageSizeNum) + 1}
              </span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPageNum * pageSizeNum, totalRecords)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{totalRecords}</span> Coaches
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1 text-xs"
                disabled={!hasPrev}
                onClick={() => setCurrentPage(currentPageNum - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = (() => {
                  const total = totalPages;
                  const current = currentPageNum;
                  if (total <= 5) return i + 1;
                  if (current <= 3) return i + 1;
                  if (current >= total - 2) return total - 4 + i;
                  return current - 2 + i;
                })();
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      pageNum === currentPageNum
                        ? "bg-violet-600 text-white"
                        : "text-slate-600 hover:bg-violet-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1 text-xs"
                disabled={!hasNext}
                onClick={() => setCurrentPage(currentPageNum + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Coach Drawer (view) ── */}
      <CoachDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        coach={selectedCoach}
      />

      {/* ── Edit Coach Invitation Dialog (no create) ── */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        entityLabel="Coach Invitation"
        fields={coachFormFields}
        initialValues={editInitialValues}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  );
}