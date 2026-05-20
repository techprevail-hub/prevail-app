"use client";

import { useState } from "react";
import {
  LayoutDashboard, User, Briefcase, FileText, Bell,
  TrendingUp, Target, Clock, CheckCircle2, Circle,
  ChevronRight, Star, MapPin, Building2, Zap,
  BookOpen, Award, ArrowUpRight, BarChart3, Eye,
  Send, Bookmark, AlertCircle, Sparkles, GraduationCap,
  ChevronUp, Activity, Calendar, Users, User2, Camera, Mic,
  MessageSquare, DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkillProgress {
  name: string;
  level: number;
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
  { name: "React.js", level: 85, category: "technical" },
  { name: "Node.js", level: 72, category: "technical" },
  { name: "TypeScript", level: 68, category: "technical" },
  { name: "PostgreSQL", level: 60, category: "technical" },
  { name: "Communication", level: 80, category: "soft" },
  { name: "Leadership", level: 55, category: "soft" },
  { name: "Fintech", level: 45, category: "domain" },
  { name: "SaaS", level: 70, category: "domain" },
];

const APPLICATIONS: JobApplication[] = [
  { id: "1", role: "Senior Frontend Developer", company: "Razorpay", location: "Bengaluru", status: "interview", appliedDate: "2 days ago", logo: "R" },
  { id: "2", role: "Full Stack Engineer", company: "Zepto", location: "Mumbai", status: "screening", appliedDate: "5 days ago", logo: "Z" },
  { id: "3", role: "React Developer", company: "CRED", location: "Bengaluru", status: "applied", appliedDate: "1 week ago", logo: "C" },
  { id: "4", role: "Software Engineer II", company: "Meesho", location: "Remote", status: "offer", appliedDate: "3 weeks ago", logo: "M" },
  { id: "5", role: "Backend Developer", company: "PhonePe", location: "Pune", status: "rejected", appliedDate: "1 month ago", logo: "P" },
];

const ACTIVITIES: Activity[] = [
  { id: "1", type: "view", message: "Razorpay recruiter viewed your profile", time: "2h ago" },
  { id: "2", type: "application", message: "Applied to Senior Frontend Dev at Razorpay", time: "2d ago" },
  { id: "3", type: "skill", message: "Completed TypeScript Advanced course", time: "4d ago" },
  { id: "4", type: "profile", message: "Profile score improved by 8%", time: "1w ago" },
  { id: "5", type: "view", message: "3 recruiters from Mumbai viewed your profile", time: "1w ago" },
];

const RECOMMENDED: RecommendedJob[] = [
  { id: "1", role: "React Developer", company: "Groww", location: "Bengaluru", type: "Full-time", match: 94, salary: "₹18–28 LPA", posted: "Today" },
  { id: "2", role: "Full Stack Engineer", company: "Slice", location: "Remote", type: "Full-time", match: 89, salary: "₹15–22 LPA", posted: "2d ago" },
  { id: "3", role: "Frontend Engineer", company: "Jupiter", location: "Bengaluru", type: "Full-time", match: 85, salary: "₹12–20 LPA", posted: "3d ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColor(status: JobApplication["status"]) {
  const colors = {
    applied: "bg-blue-100 text-blue-700",
    screening: "bg-yellow-100 text-yellow-700",
    interview: "bg-purple-100 text-purple-700",
    offer: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return colors[status];
}

function getActivityIcon(type: Activity["type"]) {
  const icons = {
    view: Eye,
    application: Send,
    skill: Zap,
    profile: TrendingUp,
  };
  return icons[type];
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-indigo-600";
  return "text-amber-600";
}

export default function SeekerDashboardPage() {
  const [skillFilter, setSkillFilter] = useState<"all" | "technical" | "soft" | "domain">("all");

  const filteredSkills = skillFilter === "all"
    ? SKILLS
    : SKILLS.filter((s) => s.category === skillFilter);

  return (
    <div>
      <div className="p-6 max-w-7xl mx-auto">
        

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Eye, label: "Profile Views", value: USER.profileViews, delta: "+12%", color: "bg-indigo-100 text-indigo-600" },
            { icon: Send, label: "Jobs Applied", value: USER.appliedJobs, delta: "+3", color: "bg-blue-100 text-blue-600" },
            { icon: Bookmark, label: "Jobs Saved", value: USER.savedJobs, delta: null, color: "bg-amber-100 text-amber-600" },
            { icon: Calendar, label: "Interviews", value: USER.interviews, delta: "+1", color: "bg-green-100 text-green-600" },
          ].map((stat, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.delta && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.delta}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid - Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Score Overview */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <CardTitle>Score Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="64" cy="64" r="56" fill="none"
                        stroke="url(#profileGradient)"
                        strokeWidth="8"
                        strokeDasharray={`${(USER.profileScore / 100) * 352} 352`}
                        strokeLinecap="round"
                        transform="rotate(-90 64 64)"
                      />
                      <defs>
                        <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute">
                      <span className="text-2xl font-bold text-indigo-600">{USER.profileScore}</span>
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">Profile Score</p>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="64" cy="64" r="56" fill="none"
                        stroke="url(#resumeGradient)"
                        strokeWidth="8"
                        strokeDasharray={`${(USER.resumeScore / 100) * 352} 352`}
                        strokeLinecap="round"
                        transform="rotate(-90 64 64)"
                      />
                      <defs>
                        <linearGradient id="resumeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute">
                      <span className="text-2xl font-bold text-purple-600">{USER.resumeScore}</span>
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">Resume Score</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Wins
                </p>
                {[
                  "Add 2-3 key projects to boost resume score",
                  "Complete your LinkedIn profile",
                  "Add professional certifications"
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ACTIVITIES.map((activity, idx) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'view' ? 'bg-indigo-100' :
                      activity.type === 'application' ? 'bg-blue-100' :
                      activity.type === 'skill' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        activity.type === 'view' ? 'text-indigo-600' :
                        activity.type === 'application' ? 'text-blue-600' :
                        activity.type === 'skill' ? 'text-purple-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                    {idx < ACTIVITIES.length - 1 && <Separator className="absolute left-0 right-0 -bottom-2" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <CardTitle>Skill Progress</CardTitle>
              </div>
              <div className="flex gap-2">
                {(["all", "technical", "soft", "domain"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSkillFilter(filter)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      skillFilter === filter
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                    <span className="text-sm text-gray-500">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Applications & Recommendations */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Applications */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <CardTitle>Recent Applications</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {APPLICATIONS.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center font-bold text-indigo-600">
                      {app.logo}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{app.role}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Building2 className="w-3 h-3" />
                        <span>{app.company}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{app.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <CardTitle>Recommended for You</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECOMMENDED.map((job) => (
                <div key={job.id} className="p-3 border rounded-xl hover:border-indigo-200 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{job.role}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Building2 className="w-3 h-3" />
                        <span>{job.company}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {job.match}% Match
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{job.type}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{job.salary}</span>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <CardTitle>Profile Completion</CardTitle>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1">
                {USER.profileScore}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={USER.profileScore} className="h-3 mb-6" />
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: "Basic Information", completed: true, points: 10 },
                { label: "Professional Summary", completed: true, points: 10 },
                { label: "Work Experience", completed: true, points: 20 },
                { label: "Education", completed: true, points: 10 },
                { label: "Skills", completed: true, points: 15 },
                { label: "Projects", completed: false, points: 15 },
                { label: "Certifications", completed: false, points: 10 },
                { label: "LinkedIn Integration", completed: false, points: 10 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={`text-sm ${item.completed ? "text-gray-700" : "text-gray-400"}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-xs ${item.completed ? "text-green-600" : "text-gray-400"}`}>
                    +{item.points} pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}