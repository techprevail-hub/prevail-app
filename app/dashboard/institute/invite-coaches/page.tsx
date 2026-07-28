"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Edit,
  XCircle,
  Mail,
  RefreshCw,
  Loader2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Send,
  ExternalLink,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SearchX,
  Briefcase,
  Award,
} from "lucide-react";
import { toast } from "sonner";

// shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import types
import { 
  CoachInvitation, 
  CoachInvitationFilters,
  Pagination,
} from "@/types/CoachInvitation";
import { api } from "@/utils/apiServices";

// ─── Constants ──────────────────────────────────────────────────────────────
const API_ENDPOINTS = {
  COACH_INVITATIONS: '/api/role-institute/coach-invitations',
  COACH_INVITATION_BY_ID: (id: string) => `/api/role-institute/coach-invitations/${id}`,
  CANCEL_INVITATION: (id: string) => `/api/role-institute/coach-invitations/${id}/cancel`,
  RESEND_INVITATION: (id: string) => `/api/role-institute/coach-invitations/${id}/resend`,
};

// ─── Status Badge Component ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    accepted: {
      label: "Accepted",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    expired: {
      label: "Expired",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} border-0 px-2 py-1 font-medium`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// ─── Invite Coach Dialog ──────────────────────────────────────────────
function InviteCoachDialog({
  open,
  onOpenChange,
  onSuccess,
  editingInvitation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingInvitation?: CoachInvitation | null;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coachName: "",
    email: "",
    specialization: "",
    experience: "",
  });

  const isEditing = !!editingInvitation;

  useEffect(() => {
    if (editingInvitation) {
      setFormData({
        coachName: editingInvitation.coach_name || "",
        email: editingInvitation.email || "",
        specialization: editingInvitation.specialization || "",
        experience: editingInvitation.experience || "",
      });
    } else {
      setFormData({
        coachName: "",
        email: "",
        specialization: "",
        experience: "",
      });
    }
  }, [editingInvitation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && editingInvitation) {
        await api.put(API_ENDPOINTS.COACH_INVITATION_BY_ID(editingInvitation.id), formData);
        toast.success("Coach invitation updated successfully");
      } else {
        await api.post(API_ENDPOINTS.COACH_INVITATIONS, formData);
        toast.success("Coach invitation sent successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Coach Invitation" : "Invite Coach"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the coach invitation details"
              : "Send an invitation to a new coach to join the platform"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coachName">Coach Name</Label>
              <Input
                id="coachName"
                placeholder="Enter coach name"
                value={formData.coachName}
                onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isEditing}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="e.g., Frontend Development, Data Science"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                placeholder="e.g., 5 Years, 3+ Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Sending..."}
                </>
              ) : (
                <>
                  {isEditing ? "Update Invitation" : "Send Invitation"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirmation Dialog ────────────────────────────────────────────────
function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Yes, Cancel",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Helper Functions ────────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Actions Component ──────────────────────────────────────────────────
function InvitationActions({ 
  invitation, 
  onEdit, 
  onDelete,
  onResend,
  isDeleting,
  isResending,
}: { 
  invitation: CoachInvitation;
  onEdit: (invitation: CoachInvitation) => void;
  onDelete: (id: string) => void;
  onResend: (id: string) => void;
  isDeleting: boolean;
  isResending: boolean;
}) {
  const isPending = invitation.status === 'pending';

  if (isPending) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-700 transition-all"
          onClick={() => onEdit(invitation)}
          title="Edit Invitation"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-blue-100 text-slate-500 hover:text-blue-700 transition-all"
          onClick={() => onResend(invitation.id)}
          disabled={isResending}
          title="Resend Invitation"
        >
          {isResending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-700 transition-all"
          onClick={() => onDelete(invitation.id)}
          disabled={isDeleting}
          title="Delete Invitation"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // For non-pending statuses, show a view-only indicator
  return (
    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
      <CheckCircle className="w-3 h-3 mr-1" />
      {invitation.status === 'accepted' ? 'Accepted' : 
       invitation.status === 'expired' ? 'Expired' : 'Cancelled'}
    </Badge>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function CoachInvitationsPage() {
  const router = useRouter();

  // State
  const [invitations, setInvitations] = useState<CoachInvitation[]>([]);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Sort state
  const [sort, setSort] = useState<{ column: string | null; direction: "asc" | "desc" | null }>({
    column: "created_at",
    direction: "desc"
  });

  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<CoachInvitation | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

  // ─── Fetch Invitations ──────────────────────────────────────────────────
  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const params: CoachInvitationFilters = {
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter as any,
      };

      // Add sort params if available
      if (sort.column) {
        // @ts-ignore
        params.sortBy = sort.column;
        // @ts-ignore
        params.sortOrder = sort.direction || 'desc';
      }

      const response = await api.get(API_ENDPOINTS.COACH_INVITATIONS, params);
      
      console.log("API Response:", response);
      
      if (response && response.success) {
        const invitationsData = response.data || [];
        const paginationData = response.pagination || null;
        
        console.log("Invitations Data:", invitationsData);
        console.log("Pagination Data:", paginationData);
        
        setInvitations(invitationsData);
        setPagination(paginationData);
      } else {
        setInvitations([]);
        setPagination(null);
        if (response?.message) {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      console.error("Fetch invitations error:", error);
      setInvitations([]);
      setPagination(null);
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || error.message || "Failed to load invitations");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, statusFilter, sort]);

  // ─── Load on mount and filter changes ──────────────────────────────────
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSort({ column, direction });
    setCurrentPage(1);
  };

  const handleEdit = (invitation: CoachInvitation) => {
    setEditingInvitation(invitation);
    setIsInviteDialogOpen(true);
  };

  // ─── Resend Handler ─────────────────────────────────────────────────────
  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      await api.post(API_ENDPOINTS.RESEND_INVITATION(id), {});
      toast.success("Coach invitation resent successfully");
      await fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  // ─── Delete Handler ─────────────────────────────────────────────────────
  const handleDeleteClick = (id: string) => {
    setSelectedInvitationId(id);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvitationId) return;

    setDeletingId(selectedInvitationId);
    try {
      // Call the cancel invitation API (which acts as delete for pending invitations)
      await api.patch(API_ENDPOINTS.CANCEL_INVITATION(selectedInvitationId));
      toast.success("Coach invitation cancelled successfully");
      await fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to cancel invitation");
    } finally {
      setDeletingId(null);
      setIsConfirmDialogOpen(false);
      setSelectedInvitationId(null);
    }
  };

  const handleInviteSuccess = () => {
    fetchInvitations();
  };

  // ─── Table Columns ─────────────────────────────────────────────────────
  const columns = [
    { key: "avatar", label: "", sortable: false, width: "w-14" },
    { key: "coach_name", label: "Coach Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "specialization", label: "Specialization", sortable: true },
    { key: "experience", label: "Experience", sortable: true },
    { key: "status", label: "Status", sortable: false },
    { key: "created_at", label: "Invited", sortable: true },
    { key: "actions", label: "Actions", sortable: false, width: "w-36" },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Coach Invitations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track coach invitations</p>
        </div>
        <Button 
          onClick={() => {
            setEditingInvitation(null);
            setIsInviteDialogOpen(true);
          }}
          className="bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Coach
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${col.width ?? ""}`}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => {
                          const newDirection = sort.column === col.key && sort.direction === "asc" ? "desc" : "asc";
                          handleSort(col.key, newDirection);
                        }}
                        className="inline-flex items-center gap-1.5 hover:text-violet-700 transition-colors"
                      >
                        {col.label}
                        {sort.column === col.key ? (
                          sort.direction === "asc" 
                            ? <ArrowUp className="w-3.5 h-3.5 text-violet-600" />
                            : <ArrowDown className="w-3.5 h-3.5 text-violet-600" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {/* ── Loading skeleton rows ── */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3"><Skeleton className="w-9 h-9 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-28 rounded" /></td>
                </tr>
              ))}

              {/* ── Empty state ── */}
              {!loading && invitations.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <SearchX className="w-7 h-7 opacity-50" />
                      </div>
                      <p className="text-base font-semibold text-slate-600">No Coach Invitations Found</p>
                      <p className="text-sm">Try changing your filters or invite a new coach.</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* ── Data rows ── */}
              {!loading && invitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="group hover:bg-violet-50/40 transition-colors"
                >
                  {/* Avatar */}
                  <td className="px-4 py-3">
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                      <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                        {getInitials(invitation.coach_name)}
                      </AvatarFallback>
                    </Avatar>
                  </td>

                  {/* Coach Name */}
                  <td className="px-4 py-3 font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                    {invitation.coach_name}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-slate-500">{invitation.email}</td>

                  {/* Specialization */}
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {invitation.specialization}
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      {invitation.experience}
                    </div>
                  </td>

                  {/* Status - Only show status badge here */}
                  <td className="px-4 py-3">
                    <StatusBadge status={invitation.status} />
                  </td>

                  {/* Invited Date */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(invitation.created_at).toLocaleTimeString()}
                    </p>
                  </td>

                  {/* Actions - Edit, Resend, and Delete icons */}
                  <td className="px-4 py-3">
                    <InvitationActions
                      invitation={invitation}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onResend={handleResend}
                      isDeleting={deletingId === invitation.id}
                      isResending={resendingId === invitation.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && invitations.length > 0 && pagination && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">
                {((pagination.page - 1) * pagination.limit) + 1}
              </span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.total}</span> Coach Invitations
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1 text-xs"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = (() => {
                  const total = pagination.totalPages;
                  const current = pagination.page;
                  if (total <= 5) return i + 1;
                  if (current <= 3) return i + 1;
                  if (current >= total - 2) return total - 4 + i;
                  return current - 2 + i;
                })();
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      pageNum === pagination.page
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
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <InviteCoachDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSuccess={handleInviteSuccess}
        editingInvitation={editingInvitation}
      />

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Cancel Invitation"
        description="Are you sure you want to cancel this coach invitation? This action cannot be undone."
        confirmText="Yes, Cancel Invitation"
      />
    </div>
  );
}