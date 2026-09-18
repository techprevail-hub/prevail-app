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

// Deterministic gradient per student (nice variety without being random)
const AVATAR_GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-blue-600",
];

function getAvatarGradient(id: string) {
  const hash = id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

// ─── Student Row ────────────────────────────────────────────────────────────

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
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <div
        onClick={() =>
          router.push(`/dashboard/institute/students/${student.studentId}`)
        }
        className="relative cursor-pointer rounded-xl border border-slate-100 bg-white hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/50 transition-all duration-300 p-4 overflow-hidden"
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start gap-4">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
            <div
              className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow-md ring-4 ring-white`}
            >
              {getInitials(student.name)}
            </div>
            {/* Alert dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            </span>
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            {/* Name + action */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate text-[15px] group-hover:text-violet-700 transition-colors">
                  {student.name}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                  {student.email}
                </p>
              </div>

              {/* Action icon (visible on hover) */}
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="rounded-lg bg-violet-50 border border-violet-100 p-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-violet-600" />
                </div>
              </div>
            </div>

            {/* Meta chips (course / branch) */}
            {(student.course || student.branch) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {student.course && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600">
                    <GraduationCap className="w-2.5 h-2.5" />
                    {student.course}
                  </span>
                )}
                {student.branch && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600">
                    <BookOpen className="w-2.5 h-2.5" />
                    {student.branch}
                  </span>
                )}
              </div>
            )}

            {/* Reasons as chips */}
            {reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {reasons.map((reason, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-[11px] font-medium text-amber-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {reason}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
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
      transition={{ duration: 0.5, delay: 0.4 }}
      className="lg:col-span-2"
    >
      <Card className="border-0 shadow-sm h-full overflow-hidden relative">
        {/* Decorative gradient blob */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-br from-amber-50 to-rose-50 opacity-70 blur-3xl pointer-events-none" />

        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50/60 via-slate-50/60 to-rose-50/40 px-6 py-4 relative">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-1.5 shadow-sm shadow-amber-500/30">
                  <AlertTriangle className="h-3.5 w-3.5 text-white" />
                </div>
                Students Needing Attention
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Students identified as requiring intervention
              </CardDescription>
            </div>
            {students.length > 0 && (
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 border px-3 py-1 rounded-lg font-semibold shadow-sm"
              >
                {students.length} student{students.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 relative">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-14 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-100 blur-xl opacity-60" />
                <div className="relative rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 mb-4">
                  <UserCheck className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                All students are on track 🎉
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                No interventions needed right now. Great work!
              </p>
            </motion.div>
          ) : (
            <ul className="space-y-2.5">
              {students.map((student, index) => (
                <StudentRow
                  key={student.studentId}
                  student={student}
                  index={index}
                />
              ))}
            </ul>
          )}

          {/* Footer link */}
          {students.length > 0 && !loading && (
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 group"
                onClick={() => router.push("/dashboard/institute/students")}
              >
                View All Students
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}