"use client";

import { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  FileQuestion,
  LifeBuoy,
  GraduationCap,
  Users,
  Briefcase,
  Building,
  Award,
  Loader2,
  Search,
  X,
} from "lucide-react";
import FAQSection from "@/components/help-center/FAQSection";
import Troubleshooting from "@/components/help-center/Troubleshooting";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HelpCenterPage() {
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); return; }
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.user) {
          setUserRole(data.user.role || "student");
          setUserName(data.user.name || "User");
        }
      } catch {
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  const getRoleLabel = (role: string) => ({
    student: "Student",
    "job-seeker": "Job Seeker",
    coach: "Coach",
    institute: "Institute",
    company: "Company",
    admin: "Admin",
  }[role] || role);

  const getRoleIcon = (role: string) => ({
    student: GraduationCap,
    "job-seeker": Briefcase,
    coach: Users,
    institute: Building,
    company: Award,
    admin: HelpCircle,
  }[role] || HelpCircle);

  const RoleIcon = getRoleIcon(userRole);

  const quickLinks = [
    { id: "faq",             icon: FileQuestion, label: "FAQs",            color: "violet" },
    { id: "troubleshooting", icon: LifeBuoy,     label: "Troubleshooting", color: "emerald" },
  ];

  const colorMap: Record<string, { pill: string; active: string; dot: string }> = {
    violet: {
      pill:   "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100",
      active: "bg-violet-600 text-white border border-violet-600 shadow-md shadow-violet-200",
      dot:    "bg-violet-400",
    },
    emerald: {
      pill:   "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
      active: "bg-emerald-600 text-white border border-emerald-600 shadow-md shadow-emerald-200",
      dot:    "bg-emerald-400",
    },
    sky: {
      pill:   "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100",
      active: "bg-sky-600 text-white border border-sky-600 shadow-md shadow-sky-200",
      dot:    "bg-sky-400",
    },
  };

  const handleFilterClick = (id: string) => {
    setActiveFilter(prev => prev === id ? "all" : id);
    document.getElementById("content-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading your help center…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-4 pb-10 space-y-8">
                {/* ── Page Introduction ── */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span>Welcome to the Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            How can we help you?
          </h1>
        </section>

        {/* ── Search bar ── */}
        <section>
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search FAQs or troubleshooting issues…"
              className="w-full pl-14 pr-12 py-4 rounded-2xl border border-slate-200 bg-white text-base text-slate-800 placeholder-slate-400
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* ── Quick-filter pills ── */}
        <section className="flex flex-wrap justify-center gap-4">
          {quickLinks.map(({ id, icon: Icon, label, color }) => {
            const isActive = activeFilter === id;
            const cls = colorMap[color];
            return (
              <button
                key={id}
                onClick={() => handleFilterClick(id)}
                className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ${
                  isActive ? cls.active : cls.pill
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 transition-all"
            >
              <X className="w-4 h-4" /> Clear filter
            </button>
          )}
        </section>

        {/* ── Content ── */}
        <div id="content-section" className="space-y-8">

          {/* FAQ */}
          {(activeFilter === "all" || activeFilter === "faq" || activeFilter === "role") && (
            <section>
              <SectionHeader
                title="Frequently Asked Questions"
                subtitle={`Common questions for ${getRoleLabel(userRole)}s`}
                badge={getRoleLabel(userRole)}
              />
              <FAQSection
                selectedFAQ={selectedFAQ}
                setSelectedFAQ={setSelectedFAQ}
                userRole={userRole}
                searchQuery={searchQuery}
              />
            </section>
          )}

          {/* Troubleshooting */}
          {(activeFilter === "all" || activeFilter === "troubleshooting" || activeFilter === "role") && (
            <section>
              <SectionHeader
                title="Troubleshooting"
                subtitle={`Fix common issues for ${getRoleLabel(userRole)}s`}
              />
              <Troubleshooting userRole={userRole} searchQuery={searchQuery} />
            </section>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          © 2024 InterviewAI Help Center · All rights reserved
        </footer>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-3 mb-1.5">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{title}</h2>
          {badge && (
            <Badge className="bg-violet-100 text-violet-700 border-0 text-sm font-semibold px-3 py-1">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-base text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}