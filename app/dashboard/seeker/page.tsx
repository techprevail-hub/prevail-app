"use client";

import { useState } from "react";
import {
  LayoutDashboard, User, Briefcase, FileText, Bell,
  TrendingUp, Target, Clock, CheckCircle2, Circle,
  ChevronRight, Star, MapPin, Building2, Zap,
  BookOpen, Award, ArrowUpRight, BarChart3, Eye,
  Send, Bookmark, AlertCircle, Sparkles, GraduationCap,
  ChevronUp, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkillProgress {
  name: string;
  level: number; // 0–100
  category: "technical" | "soft" | "domain";
}

interface JobApplication {
  id: string;
  role: string;
  company: string;
  location: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected";
  appliedDate: string;
  logo: string;
}

interface ResumeSection {
  label: string;
  filled: boolean;
  score: number;
  tip?: string;
}

interface Activity {
  id: string;
  type: "application" | "view" | "skill" | "profile";
  message: string;
  time: string;
}

interface RecommendedJob {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  match: number;
  salary: string;
  posted: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const USER = {
  name: "Arjun Mehta",
  role: "Full Stack Developer",
  location: "Nagpur, Maharashtra",
  college: "VNIT Nagpur",
  experience: "Mid Level",
  profileScore: 78,
  resumeScore: 65,
  profileViews: 142,
  appliedJobs: 12,
  savedJobs: 8,
  interviews: 3,
};

const SKILLS: SkillProgress[] = [
  { name: "React.js",      level: 85, category: "technical" },
  { name: "Node.js",       level: 72, category: "technical" },
  { name: "TypeScript",    level: 68, category: "technical" },
  { name: "PostgreSQL",    level: 60, category: "technical" },
  { name: "Communication", level: 80, category: "soft" },
  { name: "Leadership",    level: 55, category: "soft" },
  { name: "Fintech",       level: 45, category: "domain" },
  { name: "SaaS",          level: 70, category: "domain" },
];

const APPLICATIONS: JobApplication[] = [
  { id: "1", role: "Senior Frontend Developer", company: "Razorpay",     location: "Bengaluru", status: "interview",  appliedDate: "2 days ago",  logo: "R" },
  { id: "2", role: "Full Stack Engineer",       company: "Zepto",        location: "Mumbai",    status: "screening",  appliedDate: "5 days ago",  logo: "Z" },
  { id: "3", role: "React Developer",           company: "CRED",         location: "Bengaluru", status: "applied",    appliedDate: "1 week ago",  logo: "C" },
  { id: "4", role: "Software Engineer II",      company: "Meesho",       location: "Remote",    status: "offer",      appliedDate: "3 weeks ago", logo: "M" },
  { id: "5", role: "Backend Developer",         company: "PhonePe",      location: "Pune",      status: "rejected",   appliedDate: "1 month ago", logo: "P" },
];

const RESUME_SECTIONS: ResumeSection[] = [
  { label: "Contact Info",       filled: true,  score: 10 },
  { label: "Professional Summary", filled: true,  score: 10, tip: "Add more keywords from your target roles" },
  { label: "Work Experience",    filled: true,  score: 20 },
  { label: "Skills",             filled: true,  score: 15 },
  { label: "Education",          filled: true,  score: 10 },
  { label: "Projects",           filled: false, score: 0,  tip: "Add 2–3 key projects to boost your score by +15" },
  { label: "Certifications",     filled: false, score: 0,  tip: "Add relevant certifications to stand out" },
  { label: "LinkedIn URL",       filled: false, score: 0,  tip: "Link your LinkedIn to increase recruiter trust" },
];

const ACTIVITIES: Activity[] = [
  { id: "1", type: "view",        message: "Razorpay recruiter viewed your profile",        time: "2h ago" },
  { id: "2", type: "application", message: "Applied to Senior Frontend Dev at Razorpay",    time: "2d ago" },
  { id: "3", type: "skill",       message: "Completed TypeScript Advanced course",           time: "4d ago" },
  { id: "4", type: "profile",     message: "Profile score improved by 8%",                  time: "1w ago" },
  { id: "5", type: "view",        message: "3 recruiters from Mumbai viewed your profile",  time: "1w ago" },
];

const RECOMMENDED: RecommendedJob[] = [
  { id: "1", role: "React Developer",        company: "Groww",    location: "Bengaluru", type: "Full-time", match: 94, salary: "₹18–28 LPA", posted: "Today" },
  { id: "2", role: "Full Stack Engineer",    company: "Slice",    location: "Remote",    type: "Full-time", match: 89, salary: "₹15–22 LPA", posted: "2d ago" },
  { id: "3", role: "Frontend Engineer",      company: "Jupiter",  location: "Bengaluru", type: "Full-time", match: 85, salary: "₹12–20 LPA", posted: "3d ago" },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",    active: true  },
  { icon: User,            label: "Profile",      active: false },
  { icon: Briefcase,       label: "Jobs",         active: false },
  { icon: FileText,        label: "Resume",       active: false },
  { icon: BookOpen,        label: "Learning",     active: false },
  { icon: Award,           label: "Certifications", active: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusConfig(status: JobApplication["status"]) {
  const map = {
    applied:   { label: "Applied",   className: "dash-status--applied"   },
    screening: { label: "Screening", className: "dash-status--screening" },
    interview: { label: "Interview", className: "dash-status--interview" },
    offer:     { label: "Offer",     className: "dash-status--offer"     },
    rejected:  { label: "Rejected",  className: "dash-status--rejected"  },
  };
  return map[status];
}

function getActivityIcon(type: Activity["type"]) {
  const map = {
    view:        { icon: Eye,          className: "dash-act-icon--view"    },
    application: { icon: Send,         className: "dash-act-icon--apply"   },
    skill:       { icon: Zap,          className: "dash-act-icon--skill"   },
    profile:     { icon: TrendingUp,   className: "dash-act-icon--profile" },
  };
  return map[type];
}

function getScoreColor(score: number) {
  if (score >= 80) return "dash-score--high";
  if (score >= 60) return "dash-score--mid";
  return "dash-score--low";
}

function getSkillCategoryClass(cat: SkillProgress["category"]) {
  return {
    technical: "dash-skill-bar--technical",
    soft:      "dash-skill-bar--soft",
    domain:    "dash-skill-bar--domain",
  }[cat];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delta?: string;
  iconClass?: string;
}) {
  return (
    <Card className="dash-stat-card">
      <CardContent className="dash-stat-body">
        <div className="dash-stat-top">
          <span className={`dash-stat-icon-wrap ${iconClass ?? ""}`}>
            <Icon size={15} />
          </span>
          {delta && (
            <span className="dash-stat-delta">
              <ChevronUp size={11} />
              {delta}
            </span>
          )}
        </div>
        <p className="dash-stat-value">{value}</p>
        <p className="dash-stat-label">{label}</p>
      </CardContent>
    </Card>
  );
}

function CircleScore({
  score,
  size = 100,
  label,
}: {
  score: number;
  size?: number;
  label: string;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="dash-circle-wrap">
      <svg width={size} height={size} viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} className="dash-circle-track" />
        <circle
          cx="44" cy="44" r={r}
          className={`dash-circle-fill ${getScoreColor(score)}`}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div className="dash-circle-center">
        <span className="dash-circle-pct">{score}</span>
        <span className="dash-circle-slash">%</span>
      </div>
      <p className="dash-circle-label">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SeekerDashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [skillFilter, setSkillFilter] = useState<"all" | "technical" | "soft" | "domain">("all");

  const filteredSkills = skillFilter === "all"
    ? SKILLS
    : SKILLS.filter((s) => s.category === skillFilter);

  const resumeScore = RESUME_SECTIONS.reduce((acc, s) => acc + s.score, 0);
  const resumeMax   = 100;

  return (
    <div className="dash-root">

      {/* ── Ambient ── */}
      <div className="dash-blob dash-blob--1" />
      <div className="dash-blob dash-blob--2" />
      <div className="dash-blob dash-blob--3" />

      {/* ══════ MAIN ══════ */}
      <div className="dash-main">

        <div className="dash-body">

          {/* ══ ROW 1 — Stat cards ══ */}
          <div className="dash-stats-row">
            <StatCard icon={Eye}       label="Profile Views"   value={USER.profileViews} delta="+12 this week" iconClass="dash-stat-icon--purple" />
            <StatCard icon={Send}      label="Jobs Applied"    value={USER.appliedJobs}  delta="+3 this week"  iconClass="dash-stat-icon--blue"   />
            <StatCard icon={Bookmark}  label="Jobs Saved"      value={USER.savedJobs}                          iconClass="dash-stat-icon--amber"  />
            <StatCard icon={Activity}  label="Interviews"      value={USER.interviews}   delta="+1 this week"  iconClass="dash-stat-icon--green"  />
          </div>

          {/* ══ ROW 2 — Scores + Progress ══ */}
          <div className="dash-row-2">

            {/* Score card */}
            <Card className="dash-score-card">
              <CardHeader className="dash-card-header">
                <BarChart3 size={15} className="dash-card-header-icon" />
                <CardTitle className="dash-card-title">Score Overview</CardTitle>
              </CardHeader>
              <CardContent className="dash-score-body">
                <div className="dash-circles-row">
                  <CircleScore score={USER.profileScore} label="Profile Score" />
                  <div className="dash-circles-divider" />
                  <CircleScore score={USER.resumeScore}  label="Resume Score"  />
                </div>

                <Separator className="dash-sep" />

                {/* Score tips */}
                <div className="dash-score-tips">
                  <p className="dash-score-tips-title">
                    <Zap size={12} /> Quick wins
                  </p>
                  {RESUME_SECTIONS.filter((s) => !s.filled).slice(0, 3).map((s) => (
                    <div key={s.label} className="dash-score-tip-row">
                      <AlertCircle size={12} className="dash-tip-icon" />
                      <span>{s.tip ?? `Complete ${s.label}`}</span>
                    </div>
                  ))}
                </div>

                <Button className="dash-score-btn">
                  Improve Score <ArrowUpRight size={13} />
                </Button>
              </CardContent>
            </Card>

            {/* Resume breakdown */}
            <Card className="dash-resume-card">
              <CardHeader className="dash-card-header">
                <FileText size={15} className="dash-card-header-icon" />
                <CardTitle className="dash-card-title">Resume Breakdown</CardTitle>
                <Badge className="dash-resume-score-badge">{resumeScore}/{resumeMax}</Badge>
              </CardHeader>
              <CardContent className="dash-resume-body">
                {RESUME_SECTIONS.map((section) => (
                  <div key={section.label} className="dash-resume-row">
                    <div className="dash-resume-row-left">
                      {section.filled
                        ? <CheckCircle2 size={14} className="dash-resume-check--done" />
                        : <Circle       size={14} className="dash-resume-check--empty" />
                      }
                      <span className={`dash-resume-section-label ${!section.filled ? "dash-resume-section-label--empty" : ""}`}>
                        {section.label}
                      </span>
                    </div>
                    <div className="dash-resume-row-right">
                      <div className="dash-resume-mini-track">
                        <div
                          className={`dash-resume-mini-fill ${section.filled ? "dash-resume-mini-fill--done" : ""}`}
                          style={{ width: section.filled ? "100%" : "0%" }}
                        />
                      </div>
                      <span className="dash-resume-pts">
                        {section.filled ? `+${section.score}` : "+0"}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity feed */}
            <Card className="dash-activity-card">
              <CardHeader className="dash-card-header">
                <Clock size={15} className="dash-card-header-icon" />
                <CardTitle className="dash-card-title">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="dash-activity-body">
                {ACTIVITIES.map((act, i) => {
                  const cfg = getActivityIcon(act.type);
                  const Icon = cfg.icon;
                  return (
                    <div key={act.id} className="dash-act-row">
                      <div className={`dash-act-icon-wrap ${cfg.className}`}>
                        <Icon size={12} />
                      </div>
                      <div className="dash-act-content">
                        <p className="dash-act-message">{act.message}</p>
                        <p className="dash-act-time">{act.time}</p>
                      </div>
                      {i < ACTIVITIES.length - 1 && <div className="dash-act-line" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* ══ ROW 3 — Skills ══ */}
          <Card className="dash-skills-card">
            <CardHeader className="dash-card-header dash-card-header--between">
              <div className="dash-card-header-left">
                <Target size={15} className="dash-card-header-icon" />
                <CardTitle className="dash-card-title">Skill Progress</CardTitle>
              </div>
              <div className="dash-skill-filters">
                {(["all", "technical", "soft", "domain"] as const).map((f) => (
                  <button
                    key={f}
                    className={`dash-filter-btn ${skillFilter === f ? "dash-filter-btn--active" : ""}`}
                    onClick={() => setSkillFilter(f)}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="dash-skills-body">
              <div className="dash-skills-grid">
                {filteredSkills.map((skill) => (
                  <div key={skill.name} className="dash-skill-row">
                    <div className="dash-skill-meta">
                      <span className="dash-skill-name">{skill.name}</span>
                      <span className="dash-skill-pct">{skill.level}%</span>
                    </div>
                    <div className="dash-skill-track">
                      <div
                        className={`dash-skill-bar ${getSkillCategoryClass(skill.category)}`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ══ ROW 4 — Applications + Recommended ══ */}
          <div className="dash-row-4">

            {/* Applications */}
            <Card className="dash-apps-card">
              <CardHeader className="dash-card-header dash-card-header--between">
                <div className="dash-card-header-left">
                  <Briefcase size={15} className="dash-card-header-icon" />
                  <CardTitle className="dash-card-title">Applications</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="dash-view-all-btn">
                  View all <ChevronRight size={13} />
                </Button>
              </CardHeader>
              <CardContent className="dash-apps-body">
                {APPLICATIONS.map((app) => {
                  const status = getStatusConfig(app.status);
                  return (
                    <div key={app.id} className="dash-app-row">
                      <div className="dash-app-logo">{app.logo}</div>
                      <div className="dash-app-info">
                        <p className="dash-app-role">{app.role}</p>
                        <div className="dash-app-meta">
                          <Building2 size={11} />
                          <span>{app.company}</span>
                          <span className="dash-dot">·</span>
                          <MapPin size={11} />
                          <span>{app.location}</span>
                        </div>
                      </div>
                      <div className="dash-app-right">
                        <Badge className={`dash-status-badge ${status.className}`}>
                          {status.label}
                        </Badge>
                        <span className="dash-app-date">{app.appliedDate}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recommended jobs */}
            <Card className="dash-reco-card">
              <CardHeader className="dash-card-header dash-card-header--between">
                <div className="dash-card-header-left">
                  <Sparkles size={15} className="dash-card-header-icon" />
                  <CardTitle className="dash-card-title">Recommended for you</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="dash-view-all-btn">
                  View all <ChevronRight size={13} />
                </Button>
              </CardHeader>
              <CardContent className="dash-reco-body">
                {RECOMMENDED.map((job) => (
                  <div key={job.id} className="dash-reco-row">
                    <div className="dash-reco-top">
                      <div>
                        <p className="dash-reco-role">{job.role}</p>
                        <div className="dash-reco-meta">
                          <Building2 size={11} />
                          <span>{job.company}</span>
                          <span className="dash-dot">·</span>
                          <MapPin size={11} />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <span className="dash-match-badge">{job.match}% match</span>
                    </div>
                    <div className="dash-reco-bottom">
                      <div className="dash-reco-tags">
                        <span className="dash-reco-tag">{job.type}</span>
                        <span className="dash-reco-tag">{job.salary}</span>
                        <span className="dash-reco-tag dash-reco-tag--time">{job.posted}</span>
                      </div>
                      <Button size="sm" className="dash-apply-btn">
                        Apply <ArrowUpRight size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ══ ROW 5 — Profile strength detail ══ */}
          <Card className="dash-profile-card">
            <CardHeader className="dash-card-header dash-card-header--between">
              <div className="dash-card-header-left">
                <GraduationCap size={15} className="dash-card-header-icon" />
                <CardTitle className="dash-card-title">Profile Completion</CardTitle>
              </div>
              <span className="dash-profile-pct-badge">{USER.profileScore}% complete</span>
            </CardHeader>
            <CardContent className="dash-profile-body">

              {/* Master bar */}
              <div className="dash-profile-master-track">
                <div
                  className="dash-profile-master-fill"
                  style={{ width: `${USER.profileScore}%` }}
                />
                <span className="dash-profile-master-label">{USER.profileScore}%</span>
              </div>

              {/* Checklist */}
              <div className="dash-profile-checklist">
                {[
                  { label: "Basic Info (Name, Email, Phone, Location)", done: true,  pts: 10 },
                  { label: "Professional Bio",                          done: true,  pts: 10 },
                  { label: "Work Experience",                           done: true,  pts: 20 },
                  { label: "Education",                                 done: true,  pts: 10 },
                  { label: "Skills (5+ added)",                         done: true,  pts: 15 },
                  { label: "LinkedIn URL",                              done: false, pts: 8  },
                  { label: "Projects (2+ added)",                       done: false, pts: 15 },
                  { label: "Profile Photo",                             done: false, pts: 7  },
                  { label: "Certifications",                            done: false, pts: 5  },
                ].map((item) => (
                  <div key={item.label} className="dash-checklist-row">
                    {item.done
                      ? <CheckCircle2 size={14} className="dash-check--done" />
                      : <Circle       size={14} className="dash-check--empty" />
                    }
                    <span className={`dash-checklist-label ${!item.done ? "dash-checklist-label--pending" : ""}`}>
                      {item.label}
                    </span>
                    <span className={`dash-checklist-pts ${item.done ? "dash-checklist-pts--done" : "dash-checklist-pts--pending"}`}>
                      {item.done ? `+${item.pts} pts` : `+${item.pts} pts available`}
                    </span>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}