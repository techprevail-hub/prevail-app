"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Mail, ChevronRight, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StudentNeedingAttention {
  studentId: string;
  name: string;
  email: string;
  course?: string | null;
  branch?: string | null;
  reasons?: string[];
}

interface StudentsAttentionSectionProps {
  students?: StudentNeedingAttention[];
  loading?: boolean;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StudentsAttentionSection({
  students = [],
  loading,
}: StudentsAttentionSectionProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="lg:col-span-2"
    >
      <Card className="border-0 shadow-sm h-full overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50/60 to-slate-50/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Students Needing Attention
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Students identified by the backend as requiring intervention
              </CardDescription>
            </div>
            {students.length > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 border-0 px-3 py-1 rounded-lg"
              >
                {students.length} student{students.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="rounded-full bg-emerald-50 p-3 mb-3">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                No students need attention right now.
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All students are currently on track.
              </p>
            </motion.div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((student, index) => (
                <motion.li
                  key={student.studentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                      {getInitials(student.name)}
                    </div>

                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {student.email}
                          </p>
                          {(student.course || student.branch) && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {[student.course, student.branch]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-slate-200 hover:border-violet-200 hover:bg-violet-50 shrink-0 group"
                          onClick={() =>
                            router.push(
                              `/dashboard/institute/students/${student.studentId}`
                            )
                          }
                        >
                          View Student
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>

                      {/* Reasons */}
                      {student.reasons && student.reasons.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {student.reasons.map((reason, i) => (
                            <li
                              key={i}
                              className="text-xs text-amber-700 flex items-start gap-1.5"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}