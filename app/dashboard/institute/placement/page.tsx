// app/dashboard/institute/placement/page.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Users,
  Award,
  Sparkles,
  Send,
  UserCheck,
  UserX,
  FileX,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion } from "framer-motion";

import PlacementDetailsDialog from "@/components/role-institute/placement/PlacementDetailsDialog";
import DataTable, {
  type DataTableColumn,
} from "@/components/DataTable";

import { getInstitutePlacements } from "@/services/institute_placement.service";

import type {
  PlacementRecord,
  PlacementStats,
} from "@/types/institute_Placement";

// ─── Helpers ────────────────────────────────────────────────────────────────

// ⬇️ Now accepts null / undefined too
function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function PlacementStatusBadge({ status }: { status: string }) {
  const configs = {
    placed: {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
      label: "Placed",
    },
    not_placed: {
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      label: "Not Placed",
    },
  };

  const config =
    configs[status as keyof typeof configs] || configs.not_placed;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} border-0 px-3 py-1.5 font-medium flex items-center gap-1.5 rounded-xl`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  accentClass,
  iconBgClass,
}: {
  title: string;
  value: number;
  icon: any;
  accentClass: string;
  iconBgClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {title}
              </p>
              <p className={`text-2xl font-bold mt-2 ${accentClass}`}>
                {value}
              </p>
            </div>
            <div className={`rounded-xl p-2.5 ${iconBgClass}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InstitutePlacementPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlacementStats>({
    totalStudents: 0,
    submitted: 0,
    placed: 0,
    notPlaced: 0,
    notSubmitted: 0,
  });
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);

  // ─── Sort state ───────────────────────────────────────────────────────────
  const [sort, setSort] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null;
  }>({ column: null, direction: null });

  // ─── Dialog state ─────────────────────────────────────────────────────────
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [dialogMode, setDialogMode] = useState<"view" | "add" | "edit">(
    "view"
  );

  // ─── Guard against React Strict Mode's double-effect invocation ───────────
  const hasLoadedRef = useRef(false);

  // ─── Load entire institute placement dashboard ────────────────────────────
  const loadPlacementDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getInstitutePlacements();

      setStats(response.data.stats);
      setPlacements(response.data.placements);
    } catch (error) {
      console.error(
        "Failed to load placement dashboard:",
        error
      );

      toast.error("Failed to load placement data");
      // ❌ Do NOT do: router.push("/login")
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Initial load — guarded so it only runs once ──────────────────────────
  useEffect(() => {
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    loadPlacementDashboard();
  }, [loadPlacementDashboard]);

  // ─── Dialog handlers ──────────────────────────────────────────────────────
  const handleViewPlacement = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDialogMode("view");
    setPlacementDialogOpen(true);
  };

  const handleEditPlacement = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDialogMode("edit");
    setPlacementDialogOpen(true);
  };

  const handleAddPlacement = () => {
    setSelectedStudentId("");
    setDialogMode("add");
    setPlacementDialogOpen(true);
  };

  const handlePlacementUpdated = async () => {
    await loadPlacementDashboard();
  };

  // ─── Sort handler ─────────────────────────────────────────────────────────
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSort({ column, direction });
  };

  // ─── Sorted rows ──────────────────────────────────────────────────────────
  const sortedPlacements = (() => {
    if (!sort.column) return placements;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...placements].sort((a: any, b: any) => {
      const av = a[sort.column!] ?? "";
      const bv = b[sort.column!] ?? "";
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  })();

  // ─── Column definitions ───────────────────────────────────────────────────
  const columns: DataTableColumn<PlacementRecord>[] = [
    {
      key: "avatar",
      label: "",
      sortable: false,
      width: "w-14",
      render: (row: PlacementRecord) => (
        <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
          <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
            {getInitials(row.student_name)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "student_name",
      label: "Student Name",
      sortable: true,
      render: (row: PlacementRecord) => (
        <span className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
          {row.student_name || "—"}
        </span>
      ),
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
      render: (row: PlacementRecord) => (
        <span className="text-slate-600">{row.course || "—"}</span>
      ),
    },
    {
      key: "branch",
      label: "Branch",
      sortable: true,
      render: (row: PlacementRecord) => (
        <span className="text-slate-600">{row.branch || "—"}</span>
      ),
    },
    {
      key: "placement_status",
      label: "Status",
      sortable: true,
      render: (row: PlacementRecord) => (
        <PlacementStatusBadge status={row.placement_status} />
      ),
    },
    {
      key: "company_name",
      label: "Company",
      sortable: false,
      render: (row: PlacementRecord) => (
        <span className="text-slate-600">
          {row.placement_status === "placed"
            ? row.company_name || "—"
            : "—"}
        </span>
      ),
    },
    {
      key: "job_role",
      label: "Role",
      sortable: false,
      render: (row: PlacementRecord) => (
        <span className="text-slate-600">
          {row.placement_status === "placed"
            ? row.job_role || "—"
            : "—"}
        </span>
      ),
    },
    {
      key: "package",
      label: "Package",
      sortable: false,
      render: (row: PlacementRecord) => (
        <span className="text-slate-600">
          {row.placement_status === "placed" && row.package
            ? `₹${row.package} LPA`
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      width: "w-32",
      align: "right",
      render: (row: PlacementRecord) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-700 transition-all"
            onClick={() => handleViewPlacement(row.student_id)}
            title="View Placement"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 transition-all"
            onClick={() => handleEditPlacement(row.student_id)}
            title="Edit Placement"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Institute Placements
            </h1>
            <Sparkles className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Overview of all student placements in your institute
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200"
            onClick={loadPlacementDashboard}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
            onClick={handleAddPlacement}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Placement
          </Button>
        </div>
      </motion.div>

      {/* ─── Stats Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          accentClass="text-slate-800"
          iconBgClass="bg-slate-100 text-slate-600"
        />
        <StatCard
          title="Submitted"
          value={stats.submitted}
          icon={Send}
          accentClass="text-blue-700"
          iconBgClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Placed"
          value={stats.placed}
          icon={UserCheck}
          accentClass="text-emerald-700"
          iconBgClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Not Placed"
          value={stats.notPlaced}
          icon={UserX}
          accentClass="text-amber-700"
          iconBgClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Not Submitted"
          value={stats.notSubmitted}
          icon={FileX}
          accentClass="text-rose-700"
          iconBgClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* ─── Student Table ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="space-y-4"
      >

        <DataTable<PlacementRecord>
          data={sortedPlacements}
          columns={columns}
          rowKey={(row: PlacementRecord) => row.student_id}
          loading={loading}
          skeletonRows={5}
          sort={sort}
          onSortChange={handleSortChange}
          emptyState={
            <tr>
              <td colSpan={columns.length} className="py-16">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <SearchX className="w-7 h-7 opacity-50" />
                  </div>
                  <p className="text-base font-semibold text-slate-600">
                    No Placement Records
                  </p>
                  <p className="text-sm">
                    No student has submitted placement details yet.
                  </p>
                </div>
              </td>
            </tr>
          }
        />
      </motion.div>

      {/* ─── Placement Details Dialog ─────────────────────────────────────── */}
      <PlacementDetailsDialog
        open={placementDialogOpen}
        onOpenChange={setPlacementDialogOpen}
        studentId={selectedStudentId}
        mode={dialogMode}
        onUpdated={handlePlacementUpdated}
      />
    </div>
  );
}