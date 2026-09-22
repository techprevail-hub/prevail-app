// components/institute-dashboard/StudentsAttentionSection.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Mail,
  ChevronRight,
  UserCheck,
  GraduationCap,
  BookOpen,
  ArrowUpRight,
  Zap,
} from "lucide-react";
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

const AVATAR_GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-blue-600",
];

function getAvatarGradient(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
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

// ─── Student Row Card (Compact) ─────────────────────────────────────────────

function StudentRow({
  student,
  index,
}: {
  student: StudentNeedingAttention;
  index: number;
}) {
  const router = useRouter();
  const gradient = getAvatarGradient(student.studentId);
  const reasons = student.reasons ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4 }}
      whileHover={{ x: 4 }}
    >
      <div
        onClick={() =>
          router.push(`/dashboard/institute/students/${student.studentId}`)
        }
        className="relative group cursor-pointer rounded-xl border border-white/50 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-amber-200/80 transition-all duration-300 p-3 overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/40 group-hover:to-orange-50/40 transition-all duration-300 pointer-events-none" />

        <div className="relative flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"
              whileHover={{ scale: 1.2 }}
            />
            <div
              className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white group-hover:ring-amber-100 transition-all duration-300`}
            >
              {getInitials(student.name)}
            </div>
            <motion.span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-lg ring-1 ring-white"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse" />
            </motion.span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 truncate text-sm group-hover:text-amber-700 transition-colors">
                  {student.name}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate group-hover:text-slate-600 transition-colors">
                  <Mail className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                  {student.email}
                </p>
              </div>

              <motion.div
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <div className="rounded-md bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 p-1">
                  <ArrowUpRight className="h-3 w-3 text-amber-600" />
                </div>
              </motion.div>
            </div>

            {/* Course/branch + reasons in one row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {student.course && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[9px] font-semibold text-slate-700">
                  <GraduationCap className="w-2.5 h-2.5" />
                  {student.course}
                </span>
              )}
              {student.branch && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[9px] font-semibold text-slate-700">
                  <BookOpen className="w-2.5 h-2.5" />
                  {student.branch}
                </span>
              )}
              {reasons.map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200/70 text-[10px] font-semibold text-amber-700"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-3"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-100 blur-2xl opacity-40" />
        <div className="relative rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-3.5">
          <UserCheck className="h-6 w-6 text-emerald-600 mx-auto" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          All students are on track 🎉
        </h3>
        <p className="text-xs text-slate-600 max-w-xs">
          No students currently need intervention.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StudentsAttentionSection({
  students = [],
  loading,
}: StudentsAttentionSectionProps) {
  const router = useRouter();
  const studentCount = students.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="h-full"
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300 h-full overflow-hidden relative flex flex-col">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-amber-100/20 to-orange-100/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-rose-100/20 to-pink-100/20 blur-3xl pointer-events-none" />

        <CardHeader className="border-b border-white/40 bg-gradient-to-r from-white/50 to-amber-50/30 px-5 py-3 relative">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-1.5 shadow-lg">
                <AlertTriangle className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Students Needing Attention
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600 mt-0.5">
                  Intervention opportunities
                </CardDescription>
              </div>
            </div>

            {studentCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold text-[10px] shadow-md">
                  {studentCount} {studentCount === 1 ? "Student" : "Students"}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 relative flex-1">
          {loading ? (
            <LoadingSkeleton />
          ) : studentCount === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {students.map((student, index) => (
                  <StudentRow
                    key={student.studentId}
                    student={student}
                    index={index}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-3 border-t border-white/40"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 group border border-amber-200/60 hover:border-amber-300 font-semibold rounded-lg text-xs h-9"
                  onClick={() => router.push("/dashboard/institute/students")}
                >
                  View All Students
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}