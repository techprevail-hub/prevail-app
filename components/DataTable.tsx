// components/DataTable.tsx

"use client";

import { ReactNode } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  /** Unique key for this column. Also used as the sort identifier by default. */
  key: string;
  /** Header label (string, or ReactNode for custom headers). */
  label: ReactNode;
  /** Whether the column header is clickable for sorting. */
  sortable?: boolean;
  /** Tailwind class for header/cell width, e.g. "w-14", "w-36". */
  width?: string;
  /** Custom renderer for the cell. Receives the row + index. */
  render?: (row: T, index: number) => ReactNode;
  /** Optional cell className. */
  cellClassName?: string;
  /** Optional header className. */
  headerClassName?: string;
  /** Right-align this column (useful for actions). */
  align?: "left" | "right" | "center";
}

export interface DataTablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DataTableSort {
  column: string | null;
  direction: "asc" | "desc" | null;
}

export interface DataTableProps<T> {
  /** The rows to render. */
  data: T[];
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Unique key extractor for each row. */
  rowKey: (row: T) => string;

  /** Loading state — shows skeleton rows when true and data is empty. */
  loading?: boolean;
  /** How many skeleton rows to render while loading. Default 5. */
  skeletonRows?: number;

  /** Sort state + handler. Omit to disable sorting. */
  sort?: DataTableSort;
  onSortChange?: (column: string, direction: "asc" | "desc") => void;

  /** Custom empty state. */
  emptyState?: ReactNode;

  /** Pagination info + handler. Omit to hide pagination footer. */
  pagination?: DataTablePagination | null;
  onPageChange?: (page: number) => void;

  /** Optional row className resolver. */
  rowClassName?: (row: T) => string;
}

// ─── Default Empty State ────────────────────────────────────────────────────

function DefaultEmptyState({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16">
        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="text-2xl">∅</span>
          </div>
          <p className="text-base font-semibold text-slate-600">
            No records found
          </p>
          <p className="text-sm">
            Try adjusting your filters or add a new record.
          </p>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  skeletonRows = 5,
  sort,
  onSortChange,
  emptyState,
  pagination,
  onPageChange,
  rowClassName,
}: DataTableProps<T>) {
  const showSkeleton = loading && data.length === 0;
  const showEmpty = !loading && data.length === 0;

  const handleSortClick = (column: string) => {
    if (!onSortChange) return;
    const newDirection =
      sort?.column === column && sort?.direction === "asc"
        ? "desc"
        : "asc";
    onSortChange(column, newDirection);
  };

  const alignClass = (align?: "left" | "right" | "center") => {
    if (align === "right") return "text-right";
    if (align === "center") return "text-center";
    return "text-left";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* ─── Header ─────────────────────────────────────────────── */}
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                    alignClass(col.align)
                  } ${col.width ?? ""} ${col.headerClassName ?? ""}`}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      onClick={() => handleSortClick(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-violet-700 transition-colors"
                    >
                      {col.label}
                      {sort?.column === col.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600" />
                        )
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

          {/* ─── Body ───────────────────────────────────────────────── */}
          <tbody className="divide-y divide-slate-50">
            {/* Skeleton rows */}
            {showSkeleton &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td
                      key={`${col.key}-${i}`}
                      className={`px-4 py-3 ${alignClass(col.align)}`}
                    >
                      <Skeleton className="h-4 w-24 rounded" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {showEmpty &&
              (emptyState ?? <DefaultEmptyState colSpan={columns.length} />)}

            {/* Data rows */}
            {!showSkeleton &&
              !showEmpty &&
              data.map((row, index) => (
                <tr
                  key={rowKey(row)}
                  className={
                    rowClassName?.(row) ??
                    "group hover:bg-violet-50/40 transition-colors"
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${alignClass(col.align)} ${
                        col.cellClassName ?? ""
                      }`}
                    >
                      {col.render
                        ? col.render(row, index)
                        : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {!loading && data.length > 0 && pagination && onPageChange && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total}
            </span>{" "}
            records
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg gap-1 text-xs"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
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
                    onClick={() => onPageChange(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      pageNum === pagination.page
                        ? "bg-violet-600 text-white"
                        : "text-slate-600 hover:bg-violet-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg gap-1 text-xs"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}