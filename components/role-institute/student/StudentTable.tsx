"use client";

import { useState } from "react";
import {
  MoreVertical, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  SearchX,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Student } from "@/types/student";
import { Pagination } from "@/types/pagination";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface StudentTableProps {
  columns: Column[];
  students: Student[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

type SortState = { column: string | null; direction: "asc" | "desc" | null };

// ─── Status Styles ──────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-red-50 text-red-700 border-red-200",
};

// ─── Helper Functions ──────────────────────────────────────────────────────

function initials(name: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StudentTable({
  columns,
  students = [],
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
  onSort,
}: StudentTableProps) {
  const [sort, setSort] = useState<SortState>({ column: "created_at", direction: "desc" });

  const handleSort = (col: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sort.column === col && sort.direction === "asc") direction = "desc";
    setSort({ column: col, direction });
    onSort(col, direction);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sort.column !== col) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sort.direction === "asc"
      ? <ArrowUp className="w-3.5 h-3.5 text-violet-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-violet-600" />;
  };

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const total = pagination?.totalRecords ?? 0;
  const hasNext = pagination?.hasNext ?? false;
  const hasPrevious = pagination?.hasPrevious ?? false;

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // visible page numbers (max 4, centred around current page)
  const pageNumbers = (() => {
    const span = 4;
    let start = Math.max(1, currentPage - Math.floor(span / 2));
    let end = Math.min(totalPages, start + span - 1);
    start = Math.max(1, end - span + 1);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  })();

  // ─── Render Cell for a specific column ──────────────────────────────────

  const renderCell = (student: Student, column: Column) => {
    const { key } = column;

    // Avatar column
    if (key === "avatar") {
      return (
        <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
          <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
            {initials(student.student_name)}
          </AvatarFallback>
        </Avatar>
      );
    }

    // Status column
    if (key === "status") {
      const statusClass = statusStyles[student.status] || statusStyles.pending;
      const statusEmoji = student.status === 'pending' ? '⏳' : 
                          student.status === 'accepted' ? '✅' : 
                          student.status === 'cancelled' ? '❌' : '⚠️';
      return (
        <Badge variant="outline" className={`${statusClass} border-0 px-2 py-1 font-medium`}>
          {statusEmoji} {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </Badge>
      );
    }

    // Invited at column
    if (key === "invited_at") {
      return (
        <p className="text-sm text-slate-600">{formatDate(student.invited_at)}</p>
      );
    }

    // Actions column
    if (key === "actions") {
      const isPending = student.status === 'pending';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-violet-100">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onView(student)} className="gap-2 cursor-pointer">
              <Eye className="w-3.5 h-3.5" /> View
            </DropdownMenuItem>
            {isPending && (
              <DropdownMenuItem onClick={() => onEdit(student)} className="gap-2 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
            )}
            {isPending && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(student)} 
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Cancel Invitation
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Default: render the value directly
    const value = student[key as keyof Student];
    if (typeof value === 'string' || typeof value === 'number') {
      return <span>{value}</span>;
    }
    return <span>-</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Table ── */}
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
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-violet-700 transition-colors"
                    >
                      {col.label}
                      <SortIcon col={col.key} />
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
            {loading && Array.from({ length: pageSize || 8 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <td key={`skeleton-${i}-${col.key}`} className="px-4 py-3.5">
                    <Skeleton className={`h-4 ${col.width || "w-full"} rounded`} />
                  </td>
                ))}
              </tr>
            ))}

            {/* ── Empty state ── */}
            {!loading && students.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <SearchX className="w-7 h-7 opacity-50" />
                    </div>
                    <p className="text-base font-semibold text-slate-600">No Student Invitations Found</p>
                    <p className="text-sm">Try changing your filters.</p>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Data rows ── */}
            {!loading && students.map((student) => (
              <tr
                key={student.id}
                className="group hover:bg-violet-50/40 transition-colors cursor-pointer"
                onClick={() => onView(student)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3"
                    onClick={(e) => {
                      // Prevent click propagation for action buttons
                      if (col.key === 'actions' || col.key === 'avatar') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {renderCell(student, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && students.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{startItem}–{endItem}</span> of{" "}
            <span className="font-semibold text-slate-700">{total}</span> Invitations
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg gap-1 text-xs"
              disabled={!hasPrevious}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>

            {pageNumbers.map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                  p === currentPage
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:bg-violet-50"
                }`}
              >
                {p}
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg gap-1 text-xs"
              disabled={!hasNext}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}