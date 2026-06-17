"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Wifi,
  Shield,
  RefreshCw,
  Users,
  GraduationCap,
  Briefcase,
  Building,
  Award,
  Server,
  MessageCircle,
  SearchX,
  FileText,
  User,
  Briefcase as BriefcaseIcon,
  BarChart2,
  CalendarClock,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TroubleshootItem {
  id: string;
  title: string;
  description: string;
  steps: string[];
  icon: any;
  severity: "high" | "medium" | "low";
  category: string;
  roles: string[];
}

interface TroubleshootingProps {
  userRole: string;
  searchQuery?: string;
}

const allItems: TroubleshootItem[] = [
  // ── GENERAL ─────────────────────────────────────────────────────────────
  {
    id: "g-1",
    title: "Dashboard not loading or showing blank screen",
    description: "The Prevail dashboard is empty or stuck on a loading spinner after login.",
    steps: [
      "Refresh the page with Ctrl + Shift + R (or Cmd + Shift + R on Mac).",
      "Log out and log back in so Prevail can re-identify your role and reload your data.",
      "Clear your browser cache and cookies, then try again.",
      "Try a different browser (Chrome, Edge, or Firefox) or an incognito window.",
      "Check your internet connection and disable any VPN that may interfere.",
      "Contact support if the dashboard remains blank after all the above steps.",
    ],
    icon: Server,
    severity: "high",
    category: "Dashboard",
    roles: ["all"],
  },
  {
    id: "g-2",
    title: "Cannot log in or session keeps expiring",
    description: "Login fails, or you're repeatedly signed out during a session.",
    steps: [
      "Double-check your email and password — use 'Forgot Password' to reset if needed.",
      "Make sure your subscription or account is still active.",
      "Clear browser cookies and try logging in fresh.",
      "Disable browser extensions (ad blockers, password managers) that may interfere.",
      "Try a different browser or device.",
      "Contact support if login issues persist after resetting your password.",
    ],
    icon: Shield,
    severity: "high",
    category: "Authentication",
    roles: ["all"],
  },
  {
    id: "g-3",
    title: "Profile changes not saving",
    description: "Edits made on the Profile or Settings page are lost after navigating away.",
    steps: [
      "Always click the 'Save' or 'Update' button at the bottom of each section before leaving the page.",
      "Check for validation errors highlighted in red — these must be fixed before saving.",
      "Ensure you have a stable internet connection while saving.",
      "Refresh and re-enter the changes if they still don't persist.",
      "Try a different browser if the save button appears unresponsive.",
    ],
    icon: CheckCircle,
    severity: "medium",
    category: "Account",
    roles: ["all"],
  },
  {
    id: "g-4",
    title: "Notifications not appearing",
    description: "Dashboard notifications for applications, interviews, or updates are missing.",
    steps: [
      "Refresh the dashboard page.",
      "Check your notification preferences in Settings and ensure they are enabled.",
      "Log out and log back in to force a notification sync.",
      "Check your email inbox for notifications that may have been sent there instead.",
      "Contact support if notifications are consistently missing.",
    ],
    icon: AlertCircle,
    severity: "low",
    category: "Notifications",
    roles: ["all"],
  },

  // ── STUDENT ─────────────────────────────────────────────────────────────
  {
    id: "s-1",
    title: "Resume upload failing or not analysing",
    description: "The resume upload on the Resume page fails, or analysis results don't appear.",
    steps: [
      "Ensure your file is in PDF or Word (.docx) format — other formats are not supported.",
      "Check that your file size is under 5 MB.",
      "Try re-uploading the file after waiting 30 seconds.",
      "If analysis results are missing, refresh the Resume page after a minute — processing can take a moment.",
      "Try a different browser if the upload button is unresponsive.",
      "Contact support with your file details if the issue persists.",
    ],
    icon: FileText,
    severity: "high",
    category: "Resume",
    roles: ["student"],
  },
  {
    id: "s-2",
    title: "LinkedIn Analysis not returning results",
    description: "Submitting a LinkedIn URL on the LinkedIn Analysis page shows no output or an error.",
    steps: [
      "Make sure your LinkedIn profile is set to Public — private profiles cannot be analysed.",
      "Copy the full profile URL from your browser address bar (e.g. linkedin.com/in/yourname).",
      "Remove any tracking parameters at the end of the URL before pasting.",
      "Wait a minute and try submitting again — the analysis can take a few seconds.",
      "Check your internet connection and try a different browser if the issue continues.",
    ],
    icon: User,
    severity: "medium",
    category: "LinkedIn",
    roles: ["student", "job-seeker"],
  },
  {
    id: "s-3",
    title: "Campus jobs not showing on the Jobs page",
    description: "The Jobs page is empty or not displaying listings from your institute.",
    steps: [
      "Confirm your institute has been correctly set in your Profile — jobs are filtered by institute.",
      "Check that your profile is complete enough to be eligible for listings (some companies filter by profile completeness).",
      "Refresh the Jobs page and check if any filters are accidentally applied.",
      "Ask your placement coordinator if your institute has active company connections on Prevail.",
      "Contact support if the page is blank with no filter applied.",
    ],
    icon: BriefcaseIcon,
    severity: "high",
    category: "Jobs",
    roles: ["student"],
  },
  {
    id: "s-4",
    title: "Application status not updating",
    description: "Status on the Applications page is stuck or hasn't changed despite company activity.",
    steps: [
      "Status updates are made by the company — they may not have acted yet.",
      "Refresh the Applications page to pull the latest status.",
      "Check your dashboard notifications for any recent status change alerts.",
      "Log out and back in to force a full data refresh.",
      "Contact your placement coordinator to follow up with the company if a deadline has passed.",
    ],
    icon: CheckCircle,
    severity: "low",
    category: "Applications",
    roles: ["student"],
  },
  {
    id: "s-5",
    title: "Learning recommendations not loading",
    description: "The Learning page is empty or showing no course recommendations.",
    steps: [
      "Complete your Profile and upload your resume — recommendations are generated from your data.",
      "Run a LinkedIn Analysis or Resume Analysis if you haven't already, as these feed the recommendation engine.",
      "Refresh the Learning page after updating your profile.",
      "Allow a few minutes for recommendations to generate after a fresh profile update.",
      "Contact support if the page remains empty after completing your profile.",
    ],
    icon: BookOpen,
    severity: "low",
    category: "Learning",
    roles: ["student"],
  },

  // ── JOB SEEKER ──────────────────────────────────────────────────────────
  {
    id: "j-1",
    title: "Job search returning no results",
    description: "Find Jobs shows no listings even with common keywords.",
    steps: [
      "Remove all active filters and search again with a broad keyword.",
      "Try different job titles or shorter search terms.",
      "Check your profile location settings — some listings are location-restricted.",
      "Ensure your profile is complete, as some companies filter out incomplete profiles.",
      "Refresh the page and try again after a minute.",
      "Contact support if no results appear across multiple searches.",
    ],
    icon: BriefcaseIcon,
    severity: "medium",
    category: "Job Search",
    roles: ["job-seeker"],
  },
  {
    id: "j-2",
    title: "Saved jobs disappearing",
    description: "Jobs bookmarked on the Saved Jobs page are no longer visible.",
    steps: [
      "Refresh the Saved Jobs page — there may be a sync delay.",
      "Log out and back in to reload your saved data.",
      "Check if the job listing itself has been closed or removed by the company.",
      "Re-save the job if it's still active and visible in Find Jobs.",
      "Contact support if saved jobs disappear repeatedly.",
    ],
    icon: CheckCircle,
    severity: "low",
    category: "Saved Jobs",
    roles: ["job-seeker"],
  },

  // ── INSTITUTE ───────────────────────────────────────────────────────────
  {
    id: "i-1",
    title: "Student data not appearing on the Students page",
    description: "The Students page is empty or missing enrolled students.",
    steps: [
      "Confirm students have registered on Prevail using your institute's domain or invite link.",
      "Check if any filters on the Students page are hiding entries.",
      "Refresh the page and log out then back in.",
      "Verify your institute account has full admin privileges in Settings.",
      "Contact support with your institute ID if students are missing after registration.",
    ],
    icon: Users,
    severity: "high",
    category: "Student Management",
    roles: ["institute"],
  },
  {
    id: "i-2",
    title: "Analytics data is incorrect or not updating",
    description: "Placement analytics show wrong numbers or haven't refreshed after new activity.",
    steps: [
      "Refresh the Analytics page — data may take a few minutes to process.",
      "Confirm the date range or batch filter is set correctly.",
      "Log out and back in to force a data reload.",
      "Verify that student activity (applications, profile updates) is happening on the correct institute account.",
      "Contact support if numbers are consistently mismatched with your records.",
    ],
    icon: BarChart2,
    severity: "medium",
    category: "Analytics",
    roles: ["institute"],
  },
  {
    id: "i-3",
    title: "Report export failing or downloading an empty file",
    description: "Clicking Export on the Reports page fails or produces a blank file.",
    steps: [
      "Check that the selected filters return at least one student record before exporting.",
      "Try a smaller date range or fewer filters to reduce report size.",
      "Check that your browser is not blocking file downloads (look for a blocked download notice in the address bar).",
      "Try a different browser if the download button is unresponsive.",
      "Contact support with the report parameters you used if exports consistently fail.",
    ],
    icon: FileText,
    severity: "medium",
    category: "Reports",
    roles: ["institute"],
  },

  // ── COMPANY ─────────────────────────────────────────────────────────────
  {
    id: "c-1",
    title: "Job posting not going live after publishing",
    description: "A job posted via Post Job does not appear in student or job seeker listings.",
    steps: [
      "Check the Jobs page to confirm the posting status is 'Published' and not 'Draft' or 'Paused'.",
      "Verify the application deadline is set to a future date — expired deadlines hide the listing.",
      "Confirm the target institute or audience is correctly selected.",
      "Allow up to 5 minutes for the listing to propagate across the platform.",
      "Contact support if the listing is published but still not visible after 10 minutes.",
    ],
    icon: BriefcaseIcon,
    severity: "high",
    category: "Job Posting",
    roles: ["company"],
  },
  {
    id: "c-2",
    title: "Candidate profiles not loading on the Candidates page",
    description: "Applicant profiles are blank or the Candidates page shows no applications.",
    steps: [
      "Check that the relevant job posting is published and has received applications.",
      "Use the job filter on the Candidates page to select the correct role.",
      "Refresh the page to pull the latest applications.",
      "Log out and back in if profiles appear blank after loading.",
      "Contact support if candidates have applied but profiles are missing.",
    ],
    icon: Users,
    severity: "high",
    category: "Candidates",
    roles: ["company"],
  },
  {
    id: "c-3",
    title: "Interview scheduling not sending notifications to candidates",
    description: "Candidates are not receiving interview details after scheduling on the Interviews page.",
    steps: [
      "Confirm the candidate's email on their profile is correct.",
      "Check that the interview was saved and is showing as 'Scheduled' on the Interviews page.",
      "Ask the candidate to check their spam or junk folder.",
      "Reschedule the interview to trigger a fresh notification.",
      "Contact support if notifications are consistently not delivered.",
    ],
    icon: CalendarClock,
    severity: "high",
    category: "Interviews",
    roles: ["company"],
  },
  {
    id: "c-4",
    title: "Hiring analytics showing incorrect or missing data",
    description: "The Analytics page has wrong funnel numbers or missing hiring stats.",
    steps: [
      "Refresh the Analytics page — data updates may take a few minutes after activity.",
      "Check the date range and role filters applied to the analytics view.",
      "Confirm that candidate status changes (shortlisted, interviewed, offered) have been saved correctly.",
      "Log out and back in to force a data sync.",
      "Contact support with specific discrepancies if numbers remain incorrect.",
    ],
    icon: BarChart2,
    severity: "medium",
    category: "Analytics",
    roles: ["company"],
  },
];

const severityConfig = {
  high:   { label: "Critical", cls: "bg-red-100 text-red-700 border-red-200",      dot: "bg-red-400"    },
  medium: { label: "Moderate", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400"  },
  low:    { label: "Minor",    cls: "bg-sky-100 text-sky-700 border-sky-200",       dot: "bg-sky-400"    },
};

const roleColors: Record<string, string> = {
  student:      "bg-blue-100 text-blue-700",
  "job-seeker": "bg-emerald-100 text-emerald-700",
  institute:    "bg-orange-100 text-orange-700",
  company:      "bg-rose-100 text-rose-700",
};

const roleLabels: Record<string, string> = {
  student:      "Student",
  "job-seeker": "Job Seeker",
  institute:    "Institute",
  company:      "Company",
};

export default function Troubleshooting({ userRole, searchQuery = "" }: TroubleshootingProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [displayItems, setDisplayItems] = useState<TroubleshootItem[]>([]);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const byRole = allItems.filter(i => i.roles.includes("all") || i.roles.includes(userRole));
    const bySearch = q
      ? byRole.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.steps.some(s => s.toLowerCase().includes(q))
        )
      : byRole;
    setDisplayItems(bySearch);
    setCategoryFilter("All");
  }, [userRole, searchQuery]);

  const categories = ["All", ...Array.from(new Set(displayItems.map(i => i.category)))];

  const visible =
    categoryFilter === "All"
      ? displayItems
      : displayItems.filter(i => i.category === categoryFilter);

  return (
    <div className="space-y-5">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              categoryFilter === cat
                ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <SearchX className="w-10 h-10 opacity-40" />
          <p className="text-sm font-medium">No issues match your search.</p>
          <p className="text-xs">Try different keywords or a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {visible.map(item => {
            const Icon = item.icon;
            const sev = severityConfig[item.severity];
            const isOpen = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white transition-all duration-300 ${
                  isOpen
                    ? "border-violet-300 shadow-md shadow-violet-100 ring-1 ring-violet-200"
                    : "border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className="w-full px-5 py-4 text-left flex items-center gap-4 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOpen ? "bg-violet-100" : "bg-slate-100 group-hover:bg-violet-50"
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${
                      isOpen ? "text-violet-600" : "text-slate-500 group-hover:text-violet-500"
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                        {item.title}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                        {sev.label}
                      </span>
                      {item.roles.includes("all") ? (
                        <Badge className="bg-slate-100 text-slate-500 text-[10px] font-semibold border-0">General</Badge>
                      ) : (
                        item.roles.map(r => (
                          <Badge key={r} className={`${roleColors[r] ?? "bg-gray-100 text-gray-600"} text-[10px] font-semibold border-0`}>
                            {roleLabels[r] ?? r}
                          </Badge>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{item.description}</p>
                  </div>

                  <ChevronRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-all duration-200 ${
                    isOpen ? "rotate-90 text-violet-500" : "group-hover:text-violet-400"
                  }`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Steps to resolve
                    </p>
                    <ol className="space-y-2.5">
                      {item.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}