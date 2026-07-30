"use client";

import { useState } from "react";
import { Users, Search, X, Pencil, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import useStudents from "@/hooks/useStudents";
import studentService from "@/services/student.service";

import StudentDrawer from "@/components/role-institute/student/StudentDrawer";
import EntityFormDialog, { FormFieldConfig } from "@/components/role-institute/FormDialog";

import { Student } from "@/types/student";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// ─── Field definitions for the Add / Edit Student Invitation form ────────
const studentFormFields: FormFieldConfig[] = [
  { name: "student_name", label: "Student Name", type: "text", required: true, placeholder: "e.g. Aarav Sharma", span: 2 },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "student@email.com",
    validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email") },
  { name: "course", label: "Course", type: "text", required: true, placeholder: "e.g. B.Tech" },
  { name: "branch", label: "Branch", type: "text", required: true, placeholder: "e.g. Computer Science" },
  { name: "batch", label: "Batch", type: "text", required: true, placeholder: "e.g. 2024" },
];

// ─── Status Styles ──────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-red-50 text-red-700 border-red-200",
};

// ─── Helper Functions ──────────────────────────────────────────────────────
function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentPage() {
  const {
    students = [],
    counts,
    loading,
    pagination,
    fetchStudents,
    changePage,
    changePageSize,
    changeSearch,
    changeStatus,
    changeSorting,
  } = useStudents();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add / Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [activeStatus, setActiveStatus] = useState("");

  // ── Table Columns Definition ──
  const columns = [
    {
      key: "student_name",
      label: "Student Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
    },
    {
      key: "branch",
      label: "Branch",
      sortable: true,
    },
    {
      key: "batch",
      label: "Batch",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      width: "w-24",
    },
  ];

  // ── View (drawer) ──
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  // ── Open Edit dialog (from table row action) ──
  const handleEdit = (student: Student) => {
    setFormMode("edit");
    setEditingStudent(student);
    setFormOpen(true);
  };

  // ── Cancel Invitation ──
  const handleCancelInvitation = async (student: Student) => {
    try {
      await studentService.cancelInvitation(student.id);
      toast.success("Invitation cancelled successfully");
      fetchStudents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel invitation");
    }
  };

  // ── Submit handler — shared for create + edit ──
  const handleFormSubmit = async (values: Record<string, string>) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await studentService.createStudentInvitation(values);
        toast.success("Student invitation sent successfully");
      } else if (editingStudent) {
        await studentService.updateStudentInvitation(editingStudent.id, values);
        toast.success("Student invitation updated successfully");
      }
      setFormOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    changeSearch(value);
  };

  const handleCardClick = (status: string) => {
    setActiveStatus(status);
    changeStatus(status);
  };

  const clearFilters = () => {
    setSearchValue("");
    setActiveStatus("");
    changeSearch("");
    changeStatus("");
  };

  // ── Summary Cards ──
  const summaryCards = [
    { label: "Total", value: counts?.total || 0, status: "", icon: Users },
    { label: "Pending", value: counts?.pending || 0, status: "pending", icon: Users },
    { label: "Accepted", value: counts?.accepted || 0, status: "accepted", icon: Users },
    { label: "Cancelled", value: counts?.cancelled || 0, status: "cancelled", icon: Users },
  ];

  // ─── Render Row ───────────────────────────────────────────────────────────
  const renderRow = (student: Student) => {
    const statusClass = statusStyles[student.status] || statusStyles.pending;
    const statusEmoji = student.status === 'pending' ? '⏳' : 
                        student.status === 'accepted' ? '✅' : 
                        student.status === 'cancelled' ? '❌' : '⚠️';

    // Only show actions for pending status
    const showActions = student.status === 'pending';

    return (
      <>
        <td className="px-4 py-3 font-semibold text-slate-800">
          {student.student_name}
        </td>
        <td className="px-4 py-3 text-slate-500">{student.email}</td>
        <td className="px-4 py-3 text-slate-600">{student.course}</td>
        <td className="px-4 py-3 text-slate-600">{student.branch}</td>
        <td className="px-4 py-3 text-slate-600">{student.batch}</td>
        <td className="px-4 py-3">
          <Badge variant="outline" className={`${statusClass} border-0 px-2 py-1 font-medium`}>
            {statusEmoji} {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </Badge>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {showActions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-violet-100">
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleEdit(student)} className="gap-2 cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleCancelInvitation(student)} 
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Cancel Invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>
      </>
    );
  };

  // Convert the selected student into string values the form can consume
  const editInitialValues: Record<string, string> | undefined = editingStudent
    ? {
        student_name: editingStudent.student_name ?? "",
        email: editingStudent.email ?? "",
        course: editingStudent.course ?? "",
        branch: editingStudent.branch ?? "",
        batch: editingStudent.batch ?? "",
      }
    : undefined;

  // ✅ Safety check: ensure students is always an array
  const safeStudents = Array.isArray(students) ? students : [];

  // ✅ Get pagination values with fallbacks
  const currentPage = pagination?.page ?? pagination?.currentPage ?? 1;
  const pageSize = pagination?.limit ?? pagination?.pageSize ?? 10;
  const totalRecords = pagination?.total ?? pagination?.totalRecords ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPrev = pagination?.hasPrev ?? pagination?.hasPrevious ?? false;
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
            <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your institute's students
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
              placeholder="Search by student name, email, course, branch, or batch"
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

      {/* ── Student Table ── */}
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
              ) : !safeStudents || safeStudents.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Users className="w-7 h-7 opacity-50" />
                      </div>
                      <p className="text-base font-semibold text-slate-600">No Students Found</p>
                      <p className="text-sm">Try changing your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                safeStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-violet-50/40 transition-colors"
                  >
                    {renderRow(student)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && safeStudents.length > 0 && pagination && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">
                {((currentPage - 1) * pageSize) + 1}
              </span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, totalRecords)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{totalRecords}</span> Students
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1 text-xs"
                disabled={!hasPrev}
                onClick={() => changePage(currentPage - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = (() => {
                  const total = totalPages;
                  const current = currentPage;
                  if (total <= 5) return i + 1;
                  if (current <= 3) return i + 1;
                  if (current >= total - 2) return total - 4 + i;
                  return current - 2 + i;
                })();
                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      pageNum === currentPage
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
                onClick={() => changePage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Student Drawer (view) ── */}
      <StudentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        student={selectedStudent}
      />

      {/* ── Add / Edit Student Invitation Dialog ── */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        entityLabel="Student Invitation"
        fields={studentFormFields}
        initialValues={editInitialValues}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  );
}