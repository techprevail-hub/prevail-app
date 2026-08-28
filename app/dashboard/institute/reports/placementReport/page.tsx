// app/dashboard/institute/reports/placementReport/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Download, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Clock,
  Award,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

import { getPlacementReport } from "@/services/placementReportService";

import type {
  PlacementReportData,
  PlacementReportStudent,
  TopHiringCompany,
} from "@/types/PlacementReport";

// ─── Helper to get initials ──────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Summary Card Component ──────────────────────────────────────────────────

function SummaryCard({ title, value, icon: Icon, subtitle, trend }: any) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1.5 text-2xl font-bold tracking-tight">{value}</h3>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-1.5 flex items-center gap-1">
                {trend}
              </div>
            )}
          </div>
          <div className="rounded-full bg-indigo-50 p-2.5">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Placement Status Badge ─────────────────────────────────────────────────

function PlacementStatusBadge({ status, type }: { status: string; type: string | null }) {
  let config = {
    className: "",
    icon: null as any,
    label: status
  };

  if (status === "placed") {
    config = {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
      label: type === "campus" ? "Campus Placed" : type === "off-campus" ? "Off-Campus Placed" : "Placed"
    };
  } else if (status === "not-placed") {
    config = {
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      label: "Not Placed"
    };
  } else {
    config = {
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      label: "In Progress"
    };
  }

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} border-0 px-2 py-1 font-medium flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ─── Top Hiring Companies Component ─────────────────────────────────────────

function TopHiringCompanies({ companies }: { companies: TopHiringCompany[] }) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No hiring companies data available</p>
      </div>
    );
  }

  // Find max hires for progress bar
  const maxHires = Math.max(...companies.map(c => c.hiredStudents));

  return (
    <div className="space-y-3">
      {companies.map((company, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-700">{company.companyName}</span>
              <span className="text-sm font-semibold text-slate-600">{company.hiredStudents} hired</span>
            </div>
            <Progress 
              value={(company.hiredStudents / maxHires) * 100} 
              className="h-2 bg-slate-100"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PlacementReportPage() {
  const [report, setReport] = useState<PlacementReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sort state
  const [sort, setSort] = useState<{ column: keyof PlacementReportStudent | null; direction: "asc" | "desc" | null }>({
    column: null,
    direction: null
  });

  const fetchPlacementReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPlacementReport();

      console.log("Fetched placement report response:", response);

      if (!response) {
        setError("No response received from server.");
        toast.error("Failed to fetch placement report");
        return;
      }

      if (response.success === true && response.data) {
        setReport(response.data);
        toast.success("Placement report loaded successfully");
      } else {
        setError(
          response?.message || "Failed to fetch placement report."
        );
        toast.error(response?.message || "Failed to fetch placement report");
      }
    } catch (error: any) {
      console.error("Failed to fetch placement report:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch placement report.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacementReport();
  }, [fetchPlacementReport]);

  // ─── Sort Handler ──────────────────────────────────────────────────────────

  const handleSort = (column: keyof PlacementReportStudent) => {
    setSort((prev) => {
      if (prev.column === column) {
        if (prev.direction === "asc") {
          return { column, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { column: null, direction: null };
        }
        return { column, direction: "asc" };
      }
      return { column, direction: "asc" };
    });
  };

  // ─── Get Sorted Students ──────────────────────────────────────────────────

  const getSortedStudents = (): PlacementReportStudent[] => {
    if (!report) return [];
    
    let students = [...report.students];
    
    if (sort.column && sort.direction) {
      students.sort((a, b) => {
        let aVal: any = a[sort.column as keyof PlacementReportStudent];
        let bVal: any = b[sort.column as keyof PlacementReportStudent];
        
        // Handle numeric values
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        // Handle string values
        aVal = aVal?.toString().toLowerCase() || "";
        bVal = bVal?.toString().toLowerCase() || "";
        return sort.direction === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      });
    }
    
    return students;
  };

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-1 h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        
        <div className="rounded-xl border bg-white">
          <div className="border-b p-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-1 h-4 w-72" />
          </div>
          <div className="p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              onClick={fetchPlacementReport}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────────

  if (!report) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Briefcase className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No placement data available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, topHiringCompanies, students } = report;
  const sortedStudents = getSortedStudents();

  // ─── Table Columns ──────────────────────────────────────────────────────────

  const columns: { key: keyof PlacementReportStudent | "avatar"; label: string; sortable: boolean }[] = [
    { key: "avatar", label: "", sortable: false },
    { key: "name", label: "Student", sortable: true },
    { key: "course", label: "Course", sortable: true },
    { key: "placementStatus", label: "Status", sortable: true },
    { key: "companyName", label: "Company", sortable: true },
    { key: "jobRole", label: "Role", sortable: true },
    { key: "package", label: "Package", sortable: true },
    { key: "placementDate", label: "Date", sortable: true },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Placement Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track student placements, hiring companies, and placement trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 hover:border-violet-200 hover:bg-violet-50"
            onClick={fetchPlacementReport}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Eligible"
          value={summary.totalEligibleStudents}
          icon={Users}
          subtitle="Students eligible for placement"
        />
        <SummaryCard
          title="Placed Students"
          value={summary.placedStudents}
          icon={UserCheck}
          subtitle={`${summary.placementRate}% placement rate`}
          trend={
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              {summary.campusPlacements} campus • {summary.offCampusPlacements} off-campus
            </span>
          }
        />
        <SummaryCard
          title="Not Placed"
          value={summary.notPlacedStudents}
          icon={UserX}
          subtitle="Students yet to be placed"
          trend={
            summary.notPlacedStudents > 0 ? (
              <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                <Clock className="w-3 h-3" />
                Pending placement
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                All placed
              </span>
            )
          }
        />
        <SummaryCard
          title="Placement Rate"
          value={`${summary.placementRate}%`}
          icon={Award}
          subtitle="Overall placement percentage"
          trend={
            summary.placementRate >= 70 ? (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                Excellent
              </span>
            ) : summary.placementRate >= 50 ? (
              <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                Good
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                <TrendingDown className="w-3 h-3" />
                Needs improvement
              </span>
            )
          }
        />
      </div>

      {/* ─── Top Hiring Companies & Details ───────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Hiring Companies */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">Top Hiring Companies</h3>
            </div>
            <TopHiringCompanies companies={topHiringCompanies} />
          </CardContent>
        </Card>

        {/* Placement Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">Placement Summary</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Placement Rate</span>
                  <span className="font-semibold text-slate-800">{summary.placementRate}%</span>
                </div>
                <Progress value={summary.placementRate} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 font-medium">Campus Placements</p>
                  <p className="text-xl font-bold text-emerald-700">{summary.campusPlacements}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Off-Campus Placements</p>
                  <p className="text-xl font-bold text-blue-700">{summary.offCampusPlacements}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-medium">Placed</p>
                  <p className="text-xl font-bold text-emerald-600">{summary.placedStudents}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-medium">Not Placed</p>
                  <p className="text-xl font-bold text-red-600">{summary.notPlacedStudents}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Student Placement Table ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Student Placement Details
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Detailed placement information for each student.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              <span className="font-medium text-slate-700">{sortedStudents.length}</span> students
            </div>
          </div>
        </div>

        {sortedStudents.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-12">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">
              No student placement data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {columns.map(col => (
                    <th
                      key={col.key as string}
                      className={`px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${
                        col.key === "avatar" ? "w-14" : ""
                      }`}
                    >
                      {col.sortable && col.key !== "avatar" ? (
                        <button
                          onClick={() => handleSort(col.key as keyof PlacementReportStudent)}
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
                {sortedStudents.map((student) => (
                  <tr
                    key={student.invitationId}
                    className="group hover:bg-violet-50/40 transition-colors"
                  >
                    {/* Avatar */}
                    <td className="px-4 py-3">
                      <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                    </td>

                    {/* Student Name & Email */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                          {student.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {student.email}
                        </span>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-600">{student.course}</span>
                        <span className="text-xs text-slate-400">
                          {student.branch} • {student.batch}
                        </span>
                      </div>
                    </td>

                    {/* Placement Status */}
                    <td className="px-4 py-3">
                      <PlacementStatusBadge 
                        status={student.placementStatus} 
                        type={student.placementType}
                      />
                    </td>

                    {/* Company Name */}
                    <td className="px-4 py-3">
                      <span className="text-slate-600">
                        {student.companyName || "-"}
                      </span>
                    </td>

                    {/* Job Role */}
                    <td className="px-4 py-3">
                      <span className="text-slate-600">
                        {student.jobRole || "-"}
                      </span>
                    </td>

                    {/* Package */}
                    <td className="px-4 py-3">
                      {student.package ? (
                        <span className="font-semibold text-emerald-600">
                          ₹{student.package.toLocaleString()} LPA
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Placement Date */}
                    <td className="px-4 py-3">
                      {student.placementDate ? (
                        <span className="text-slate-600 text-xs">
                          {new Date(student.placementDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}