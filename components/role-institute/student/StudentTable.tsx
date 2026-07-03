// components/institute/student/StudentTable.tsx
"use client";

import { useState } from "react";
import {
  MoreVertical, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  SearchX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
interface StudentTableProps {
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

// ─── Column config ────────────────────────────────────────────────────────────
const columns = [
  { key: "profile_image",     label: "",            sortable: false, width: "w-14"   },
  { key: "student_id",        label: "Student ID",  sortable: true              },
  { key: "full_name",         label: "Name",        sortable: true              },
  { key: "email",             label: "Email",       sortable: true              },
  { key: "department",        label: "Department",  sortable: true              },
  { key: "semester",          label: "Semester",    sortable: true,  width: "w-24" },
  { key: "readiness_score",   label: "Readiness",   sortable: true,  width: "w-32" },
  { key: "placement_status",  label: "Placement",   sortable: false             },
  { key: "status",            label: "Status",      sortable: false             },
  { key: "actions",           label: "",            sortable: false, width: "w-12" },
];

// ─── Visual helpers ───────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Active:   "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
};

const placementStyles: Record<string, string> = {
  Placed:       "bg-violet-100 text-violet-700",
  "Not Placed": "bg-amber-100 text-amber-700",
};

function readinessColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-700" };
  if (score >= 50) return { bar: "bg-amber-500",   text: "text-amber-700"   };
  return { bar: "bg-rose-500", text: "text-rose-700" };
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentTable({
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

  const totalPages  = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? 1;
  const pageSize    = pagination?.pageSize ?? 10;
  const total       = pagination?.totalRecords ?? 0;
  const hasNext     = pagination?.hasNext ?? false;
  const hasPrevious = pagination?.hasPrevious ?? false;

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem   = Math.min(currentPage * pageSize, total);

  // visible page numbers (max 4, centred around current page)
  const pageNumbers = (() => {
    const span = 4;
    let start = Math.max(1, currentPage - Math.floor(span / 2));
    let end = Math.min(totalPages, start + span - 1);
    start = Math.max(1, end - span + 1);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  })();

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
                <td className="px-4 py-3.5"><Skeleton className="w-9 h-9 rounded-full" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-4 w-16 rounded" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-4 w-32 rounded" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-4 w-40 rounded" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-4 w-28 rounded" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-4 w-10 rounded" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-4 w-20 rounded" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="px-4 py-3.5"><Skeleton className="h-7 w-7 rounded" /></td>
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
                    <p className="text-base font-semibold text-slate-600">No Students Found</p>
                    <p className="text-sm">Try changing your filters.</p>
                  </div>
                </td>
              </tr>
            )}

            {/* ── Data rows ── */}
            {!loading && students.map(student => {
              const rc = readinessColor(student.readiness_score ?? 0);
              return (
                <tr
                  key={student.id}
                  className="group hover:bg-violet-50/40 transition-colors cursor-pointer"
                  onClick={() => onView(student)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                      <AvatarImage src={student.profile_image} alt={student.full_name} />
                      <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                        {initials(student.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{student.student_id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                    {student.full_name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{student.email}</td>
                  <td className="px-4 py-3 text-slate-600">{student.department}</td>
                  <td className="px-4 py-3 text-slate-600">Sem {student.semester}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[48px]">
                        <div className={`h-full rounded-full ${rc.bar} transition-all duration-500`} style={{ width: `${student.readiness_score ?? 0}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${rc.text}`}>{student.readiness_score ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${placementStyles[student.placement_status] ?? "bg-slate-100 text-slate-600"} border-0 text-xs font-semibold px-2.5`}>
                      {student.placement_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${statusStyles[student.status] ?? "bg-slate-100 text-slate-600"} border-0 text-xs font-semibold px-2.5`}>
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
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
                        <DropdownMenuItem onClick={() => onEdit(student)} className="gap-2 cursor-pointer">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(student)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && students.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{startItem}–{endItem}</span> of{" "}
            <span className="font-semibold text-slate-700">{total}</span> Students
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