"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, User, Mic, TrendingUp, Download, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  getCareerPerformanceReport,
} from "@/services/careerPerformanceReportService";

import type {
  CareerPerformanceReportData,
} from "@/types/CareerPerformanceReport";

// ─── Helper to get initials ──────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Summary Card Component ──────────────────────────────────────────────────

function SummaryCard({ title, value, icon: Icon, subtitle }: any) {
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
          </div>
          <div className="rounded-full bg-indigo-50 p-2.5">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status Badge for Performance ────────────────────────────────────────────

function PerformanceBadge({ score }: { score: number }) {
  let status = "";
  let className = "";
  
  if (score >= 80) {
    status = "Excellent";
    className = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (score >= 60) {
    status = "Good";
    className = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (score >= 40) {
    status = "Average";
    className = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    status = "Needs Improvement";
    className = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <Badge variant="outline" className={`${className} border-0 px-2 py-1 font-medium`}>
      {status}
    </Badge>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CareerPerformanceReportPage() {
  const [report, setReport] = useState<CareerPerformanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sort state
  const [sort, setSort] = useState<{ column: string | null; direction: "asc" | "desc" | null }>({
    column: null,
    direction: null
  });

  const fetchCareerPerformanceReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCareerPerformanceReport();

      if (response && response.success === true && response.data) {
        setReport(response.data);
      } else {
        setError(
          response?.message || "Failed to fetch career performance report."
        );
      }
    } catch (error) {
      console.error("Failed to fetch career performance report:", error);
      setError("Failed to fetch career performance report.");
      toast.error("Failed to load career performance report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCareerPerformanceReport();
  }, [fetchCareerPerformanceReport]);

  // ─── Sort Handler ──────────────────────────────────────────────────────────

  const handleSort = (column: string) => {
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

  const getSortedStudents = () => {
    if (!report) return [];
    
    let students = [...report.students];
    
    if (sort.column && sort.direction) {
      students.sort((a, b) => {
        let aVal: any = a[sort.column as keyof typeof a];
        let bVal: any = b[sort.column as keyof typeof b];
        
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
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-1 h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
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
                <Skeleton className="h-8 w-16" />
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
              onClick={fetchCareerPerformanceReport}
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
            <Users className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No career performance data available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary } = report;
  const sortedStudents = getSortedStudents();

  // ─── Table Columns ──────────────────────────────────────────────────────────

  const columns = [
    { key: "avatar", label: "", sortable: false },
    { key: "name", label: "Student", sortable: true },
    { key: "course", label: "Course", sortable: true },
    { key: "resumeScore", label: "Resume", sortable: true },
    { key: "linkedinScore", label: "LinkedIn", sortable: true },
    { key: "interviewScore", label: "Interview", sortable: true },
    { key: "overallPerformance", label: "Overall", sortable: true },
    { key: "status", label: "Status", sortable: false },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Career Performance Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track the overall career performance and progress of your students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 hover:border-violet-200 hover:bg-violet-50"
            onClick={fetchCareerPerformanceReport}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Students"
          value={summary.totalStudents}
          icon={Users}
        />
        <SummaryCard
          title="Avg Resume Score"
          value={`${summary.averageResumeScore}%`}
          icon={FileText}
          subtitle="Resume quality score"
        />
        <SummaryCard
          title="Avg LinkedIn Score"
          value={`${summary.averageLinkedinScore}%`}
          icon={User}
          subtitle="Profile optimization"
        />
        <SummaryCard
          title="Avg Interview Score"
          value={`${summary.averageInterviewScore}%`}
          icon={Mic}
          subtitle="Interview readiness"
        />
        <SummaryCard
          title="Avg Performance"
          value={`${summary.averagePerformanceScore}%`}
          icon={TrendingUp}
          subtitle="Overall performance"
        />
      </div>

      {/* ─── Student Performance Table ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Student Performance
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Individual performance across resume, LinkedIn, and interview preparation.
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
              No student performance data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={`px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${
                        col.key === "avatar" ? "w-14" : ""
                      }`}
                    >
                      {col.sortable ? (
                        <button
                          onClick={() => handleSort(col.key)}
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

                    {/* Resume Score */}
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        student.resumeScore >= 70 ? 'text-emerald-600' : 
                        student.resumeScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {student.resumeScore}%
                      </span>
                    </td>

                    {/* LinkedIn Score */}
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        student.linkedinScore >= 70 ? 'text-emerald-600' : 
                        student.linkedinScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {student.linkedinScore}%
                      </span>
                    </td>

                    {/* Interview Score */}
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        student.interviewScore >= 70 ? 'text-emerald-600' : 
                        student.interviewScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {student.interviewScore}%
                      </span>
                    </td>

                    {/* Overall Performance */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-700">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {student.overallPerformance}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <PerformanceBadge score={student.overallPerformance} />
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