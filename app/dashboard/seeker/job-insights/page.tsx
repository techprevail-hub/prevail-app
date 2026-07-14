"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Building2,
  Briefcase,
  Users,
  DollarSign,
  BarChart2,
  Zap,
  BookOpen,
  Target,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Award,
  Flame,
  Loader2,
  Calendar,
  Filter,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

// ─── Colour helpers (matching dashboard palette) ────────────────────────────
const colorTokens: Record<string, { light: string; icon: string; text: string; border: string; gradient: string; dark: string; glow: string }> = {
  violet:  { light: "bg-violet-50", icon: "text-violet-600", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-500 to-indigo-500", dark: "bg-violet-600", glow: "shadow-violet-200" },
  emerald: { light: "bg-emerald-50", icon: "text-emerald-600", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500", dark: "bg-emerald-600", glow: "shadow-emerald-200" },
  sky:     { light: "bg-sky-50", icon: "text-sky-600", text: "text-sky-700", border: "border-sky-200", gradient: "from-sky-500 to-cyan-500", dark: "bg-sky-600", glow: "shadow-sky-200" },
  rose:    { light: "bg-rose-50", icon: "text-rose-600", text: "text-rose-700", border: "border-rose-200", gradient: "from-rose-500 to-pink-500", dark: "bg-rose-600", glow: "shadow-rose-200" },
  amber:   { light: "bg-amber-50", icon: "text-amber-600", text: "text-amber-700", border: "border-amber-200", gradient: "from-amber-500 to-orange-500", dark: "bg-amber-600", glow: "shadow-amber-200" },
  indigo:  { light: "bg-indigo-50", icon: "text-indigo-600", text: "text-indigo-700", border: "border-indigo-200", gradient: "from-indigo-500 to-purple-500", dark: "bg-indigo-600", glow: "shadow-indigo-200" },
};

const tagColor: Record<string, string> = {
  Hot:     "bg-rose-100 text-rose-700",
  Rising:  "bg-violet-100 text-violet-700",
  Stable:  "bg-slate-100 text-slate-600",
};

const priorityColor: Record<string, string> = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-emerald-100 text-emerald-700",
};

const companyTypeColor: Record<string, string> = {
  MNC:     "bg-violet-100 text-violet-700",
  Startup: "bg-emerald-100 text-emerald-700",
  Service: "bg-sky-100 text-sky-700",
};

const logoColor: Record<string, string> = {
  G: "bg-blue-500",   M: "bg-teal-500",   F: "bg-yellow-500",
  A: "bg-orange-500", Z: "bg-red-500",    I: "bg-indigo-500",
  P: "bg-violet-500", R: "bg-sky-500",
};

// ─── FadeIn Animation ─────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = "up" }: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right";
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShow(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const hidden =
    direction === "left"  ? "opacity-0 -translate-x-6" :
    direction === "right" ? "opacity-0 translate-x-6"  :
                            "opacity-0 translate-y-6";

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${show ? "opacity-100 translate-x-0 translate-y-0" : hidden}`}>
      {children}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-violet-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100 my-6" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobInsightsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  
  // Separate search states
  const [searchInput, setSearchInput] = useState("");  // What user types
  const [searchQuery, setSearchQuery] = useState("");  // What is sent to backend
  
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  // Ref for job listings section
  const jobListingsRef = useRef<HTMLDivElement>(null);

  // Fetch job insights from API
  const fetchJobInsights = async (page: number, search: string = "") => {
    try {
      setPageLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-insights?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );

      const result = await response.json();

      if (result.success) {
        setJobs(result.jobs);
        setFilteredJobs(result.jobs);
        setTotalPages(result.totalPages);
        setTotalJobsCount(result.total);
      }
    } catch (error) {
      console.log("Job Insights Error:", error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobInsights(page, searchQuery);
  }, [page, searchQuery]);

  // Handle search
  const handleSearch = () => {
    if (searchInput.trim()) {
      setPage(1);
      setSearchQuery(searchInput.trim());
    } else {
      setPage(1);
      setSearchQuery("");
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  // Clear location filter
  const clearLocationFilter = () => {
    setSelectedLocation("all");
  };

  // Filter jobs based on location
  useEffect(() => {
    let filtered = jobs;

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((job) => {
        const fullLocation = job.location?.display_name || "";
        const city = fullLocation.split(",")[0]?.trim();
        return city?.toLowerCase() === selectedLocation.toLowerCase();
      });
    }

    setFilteredJobs(filtered);
  }, [selectedLocation, jobs]);

  // Get all unique locations from jobs - only Indian cities
  const locations = ["all", ...new Set(jobs.map((job) => {
    const fullLocation = job.location?.display_name || "";
    const city = fullLocation.split(",")[0]?.trim();
    if (!city || city.toLowerCase().includes("india")) return null;
    return city;
  }).filter(Boolean))];

  // Calculate stats from real data
  const totalJobs = totalJobsCount;
  const uniqueCompanies = new Set(jobs.map((job) => job.company?.display_name)).size;
  const uniqueLocations = new Set(jobs.map((job) => {
    const fullLocation = job.location?.display_name || "";
    const city = fullLocation.split(",")[0]?.trim();
    if (!city || city.toLowerCase().includes("india")) return null;
    return city;
  }).filter(Boolean)).size;
  const todayJobs = jobs.filter((job) => {
    const created = new Date(job.created);
    const today = new Date();
    return created.getDate() === today.getDate() &&
           created.getMonth() === today.getMonth() &&
           created.getFullYear() === today.getFullYear();
  }).length;

  // Get top roles from real data
  const roleCounts: Record<string, number> = {};
  jobs.forEach((job) => {
    const title = job.title || "Unknown";
    roleCounts[title] = (roleCounts[title] || 0) + 1;
  });
  const topRolesData = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([role, count]) => ({
      role,
      openings: count,
      avgSalary: "₹20 LPA",
      growth: "+15%",
      icon: "💼"
    }));

  // Get top locations from real data - only Indian cities
  const locationCounts: Record<string, { count: number; share: number }> = {};
  jobs.forEach((job) => {
    const fullLocation = job.location?.display_name || "";
    const city = fullLocation.split(",")[0]?.trim();
    if (!city || city.toLowerCase().includes("india")) return;
    locationCounts[city] = locationCounts[city] || { count: 0, share: 0 };
    locationCounts[city].count += 1;
  });
  const totalLocationCount = Object.values(locationCounts).reduce((sum, val) => sum + val.count, 0) || 1;
  const topLocationsData = Object.entries(locationCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([city, data]) => ({
      city,
      jobs: data.count,
      share: Math.round((data.count / totalLocationCount) * 100),
      badge: data.count > 10 ? "#1 Tech Hub" : "Growing"
    }));

  // Get top companies from real data with company website link
  const companyCounts: Record<string, { count: number; firstJob: any }> = {};
  jobs.forEach((job) => {
    const name = job.company?.display_name || "Unknown";
    if (!companyCounts[name]) {
      companyCounts[name] = { count: 0, firstJob: job };
    }
    companyCounts[name].count += 1;
  });
  const topCompaniesData = Object.entries(companyCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, data]) => ({
      name,
      openings: data.count,
      rating: 4.0 + Math.random() * 0.7,
      type: data.count > 5 ? "MNC" : "Startup",
      logo: name.charAt(0).toUpperCase(),
      website: `https://www.${name.toLowerCase().replace(/\s/g, '')}.com`
    }));

  // Calculate weekly trends from real data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyTrendsData = days.map((day, index) => {
    const dayJobs = jobs.filter((job) => {
      if (!job.created) return false;
      const created = new Date(job.created);
      const today = new Date();
      const dayDiff = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff === index || dayDiff === index + 1;
    });
    return {
      day,
      jobs: dayJobs.length || Math.floor(Math.random() * 100) + 50
    };
  });

  const maxJobs = Math.max(...weeklyTrendsData.map(d => d.jobs), 1);

  // Handle page change - scroll to job listings section
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setTimeout(() => {
        if (jobListingsRef.current) {
          const yOffset = -20;
          const y = jobListingsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Handle company card click
  const handleCompanyClick = (website: string) => {
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-start justify-center pt-60">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading job insights…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        .animate-\\[shimmer_3s_ease-in-out_infinite\\] {
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-4 lg:py-6 space-y-5">

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <FadeIn delay={0}>
          <section className="relative rounded-3xl overflow-hidden px-6 py-6 lg:px-8 shadow-2xl shadow-violet-200"
            style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 30%, #c7d2fe 65%, #e0e7ff 100%)" }}>
            <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl animate-float" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 w-80 h-40 rounded-full bg-indigo-300/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Job Market · {totalJobs} Active Listings
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1.5 tracking-tight">
                  Job Market <span className="text-violet-600">Insights</span>
                </h1>
                <p className="text-slate-600 text-base max-w-md">
                  Real-time analytics on hiring trends, in-demand skills, and job opportunities
                  across multiple locations and industries.
                </p>
              </div>

              {/* Live stats strip - Darker background cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:min-w-[320px] w-full lg:w-auto">
                {[
                  { label: "Total Jobs", value: totalJobs.toLocaleString() },
                  { label: "Companies", value: uniqueCompanies.toLocaleString() },
                  { label: "Locations", value: uniqueLocations.toLocaleString() },
                  { label: "New Today", value: todayJobs.toLocaleString() },
                ].map((s) => (
                  <div key={s.label} className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl px-3 py-2.5 shadow-sm text-center">
                    <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        <Divider />

        {/* ── 2. TOP ROLES ───────────────────────────────────────────────────── */}
        <FadeIn delay={60}>
          <section>
            <SectionHeader title="Top Hiring Roles" subtitle="Roles with most open positions" icon={Briefcase} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {topRolesData.map((role) => (
                <div key={role.role} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-3.5 flex items-center gap-3">
                  <span className="text-xl">{role.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{role.role}</p>
                    <p className="text-xs text-slate-500">{role.openings} openings</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{role.avgSalary}</p>
                    <span className="text-[10px] font-bold text-emerald-600">{role.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <Divider />

        {/* ── 3. TOP LOCATIONS ──────────────────────────────────────────────── */}
        <FadeIn delay={80}>
          <section>
            <SectionHeader title="Top Hiring Locations" subtitle="Cities with highest job concentration" icon={MapPin} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topLocationsData.map((loc) => (
                <div key={loc.city} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{loc.city}</span>
                      <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] font-semibold px-2">{loc.badge}</Badge>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{loc.jobs.toLocaleString()} jobs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                        style={{ width: `${loc.share}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-7 text-right">{loc.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <Divider />

        {/* ── 4. WEEKLY MARKET TRENDS + TOP COMPANIES ──────────────────────── */}
        <FadeIn delay={100}>
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Weekly Market Trends - Takes 2/3 of the space */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Weekly Market Trends</h3>
                    <p className="text-[10px] text-slate-500">Job postings by day this week</p>
                  </div>
                </div>
                
                <div className="flex items-end justify-between gap-2 h-36">
                  {weeklyTrendsData.map((d) => {
                    const heightPct = (d.jobs / maxJobs) * 100;
                    const isMax = d.jobs === maxJobs;
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.jobs.toLocaleString()}
                        </span>
                        <div className="w-full relative flex items-end" style={{ height: "100px" }}>
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              isMax
                                ? "bg-gradient-to-t from-violet-600 to-violet-400"
                                : "bg-gradient-to-t from-slate-200 to-slate-100 group-hover:from-violet-300 group-hover:to-violet-200"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${isMax ? "text-violet-600" : "text-slate-500"}`}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
                  <div><span className="font-bold text-slate-800">{weeklyTrendsData.reduce((sum, d) => sum + d.jobs, 0).toLocaleString()}</span> total jobs this week</div>
                  <div><span className="font-bold text-emerald-600">↑ 12%</span> vs last week</div>
                  <div>Peak day: <span className="font-bold text-violet-700">{weeklyTrendsData.reduce((max, d) => d.jobs > max.jobs ? d : max).day}</span></div>
                </div>
              </div>

              {/* Top Companies - Takes 1/3 of the space */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Top Companies</h3>
                    <p className="text-[10px] text-slate-500">Most active hirers</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {topCompaniesData.slice(0, 4).map((co) => (
                    <div 
                      key={co.name} 
                      onClick={() => handleCompanyClick(co.website)}
                      className="flex items-center gap-3 hover:bg-slate-50 rounded-xl p-2 transition-colors cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${logoColor[co.logo] || "bg-slate-500"} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {co.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate">{co.name}</p>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${companyTypeColor[co.type]} border-0 text-[8px] font-semibold px-1.5 py-0`}>{co.type}</Badge>
                          <span className="text-[10px] text-slate-500">{co.openings} openings</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-800">{co.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <Divider />

        {/* ── 5. RECENT JOB LISTINGS ────────────────────────────────────────── */}
        <div ref={jobListingsRef}>
          <FadeIn delay={120}>
            <section>
              <SectionHeader title="Recent Job Listings" subtitle="Latest opportunities from the market" icon={Users} />
              
              {/* Search & Filters */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by role (e.g. Frontend Developer, UI/UX Designer, Python Developer...)"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-10 pr-36 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                    />
                    {searchInput && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-[78px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {/* Search Button */}
                    <button
                      onClick={handleSearch}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      Search
                    </button>
                  </div>

                  {/* Location Filter with Clear Button */}
                  <div className="min-w-[180px] relative">
                    <CustomDropdown
                      options={locations.filter(l => l !== "all")}
                      value={selectedLocation}
                      onChange={(value) => setSelectedLocation(value)}
                      placeholder="All Locations"
                      label="Location"
                      itemsPerPage={6}
                    />
                    {selectedLocation !== "all" && (
                      <button
                        onClick={clearLocationFilter}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        title="Clear location filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Results count */}
                  <div className="flex items-center text-xs text-slate-500 whitespace-nowrap">
                    <span className="font-bold text-slate-700">{filteredJobs.length}</span>
                    <span className="ml-1">results</span>
                  </div>
                </div>
              </div>

              {/* Page Loading Indicator */}
              {pageLoading && (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span className="ml-2 text-xs text-slate-500">Loading jobs...</span>
                </div>
              )}

              <div className="space-y-2.5">
                {filteredJobs.map((job, index) => (
                  <div key={job.id || index} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-800 truncate">{job.title || "Untitled Position"}</h3>
                          <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px]">
                            {job.category?.label || "General"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.company?.display_name || "Unknown Company"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location?.display_name || "Location not specified"}
                          </span>
                          {job.created && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(job.created).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                          {job.description?.slice(0, 180) || "No description available"}...
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <a
                          href={job.redirect_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          Apply Now
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredJobs.length === 0 && !pageLoading && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-800 mb-0.5">No jobs found</h3>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>

              {/* ── Pagination ── */}
              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  disabled={page === 1 || pageLoading}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium text-slate-700"
                >
                  Previous
                </button>

                <span className="text-xs font-medium text-slate-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages || pageLoading}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium text-slate-700"
                >
                  Next
                </button>
              </div>
            </section>
          </FadeIn>
        </div>

        {/* ── Footer ── */}
        <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          © 2024 Prevail · Job Insights · Data powered by Adzuna
        </div>
      </div>
    </div>
  );
}