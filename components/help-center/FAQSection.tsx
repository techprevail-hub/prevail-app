"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FAQSectionProps {
  selectedFAQ: string | null;
  setSelectedFAQ: (id: string | null) => void;
  userRole: string;
  searchQuery?: string;
}

const allFaqs = [
  {
    id: "faq-1",
    question: "What is InterviewAI?",
    answer:
      "InterviewAI is an AI-powered platform that helps you prepare for interviews through Mock Interviews, Resume Analysis, LinkedIn Profile Analysis, AI Headshot Generation, and progress tracking.",
    category: "Getting Started",
    roles: ["all"],
  },

  {
    id: "faq-2",
    question: "How do I start a mock interview?",
    answer:
      "Go to the Interview page, choose a category and technology, then click Start Interview. You will receive AI-generated questions and feedback.",
    category: "Mock Interview",
    roles: ["all"],
  },

  {
    id: "faq-3",
    question: "How is the interview score calculated?",
    answer:
      "The AI evaluates your answers based on accuracy, explanation quality, technical knowledge, and communication skills to generate an overall score.",
    category: "Mock Interview",
    roles: ["all"],
  },

  {
    id: "faq-4",
    question: "Can I view my previous interviews?",
    answer:
      "Yes. Interview history stores all completed interviews, scores, and AI reports for future review.",
    category: "History",
    roles: ["all"],
  },

  {
    id: "faq-5",
    question: "How does the Resume Analyzer work?",
    answer:
      "Upload your resume in PDF or DOCX format. AI analyzes your skills, ATS score, strengths, weaknesses, and provides improvement suggestions.",
    category: "Resume Analyzer",
    roles: ["all"],
  },

  {
    id: "faq-6",
    question: "Which resume formats are supported?",
    answer:
      "Currently, PDF and DOCX files are supported with a maximum file size of 5MB.",
    category: "Resume Analyzer",
    roles: ["all"],
  },

  {
    id: "faq-7",
    question: "What is ATS Score?",
    answer:
      "ATS Score indicates how compatible your resume is with Applicant Tracking Systems used by recruiters.",
    category: "Resume Analyzer",
    roles: ["all"],
  },

  {
    id: "faq-8",
    question: "How does LinkedIn Analyzer work?",
    answer:
      "Provide your LinkedIn profile URL or profile content. AI analyzes profile completeness, keywords, strengths, and provides recommendations.",
    category: "LinkedIn Analyzer",
    roles: ["all"],
  },

  {
    id: "faq-9",
    question: "Can I improve my LinkedIn profile using AI suggestions?",
    answer:
      "Yes. AI provides suggestions for headlines, summaries, keywords, and profile optimization to increase visibility.",
    category: "LinkedIn Analyzer",
    roles: ["all"],
  },

  {
    id: "faq-10",
    question: "How do I generate AI Headshots?",
    answer:
      "Upload an image and choose a style. AI will generate professional headshots which are saved in your history.",
    category: "Headshot Generator",
    roles: ["all"],
  },

  {
    id: "faq-11",
    question: "Where can I find my generated headshots?",
    answer:
      "All generated headshots are available in the Headshot History section.",
    category: "Headshot Generator",
    roles: ["all"],
  },

  {
    id: "faq-12",
    question: "What are notifications used for?",
    answer:
      "Notifications inform you when interview reports, resume analysis, LinkedIn reports, and AI headshots are ready.",
    category: "Notifications",
    roles: ["all"],
  },

  {
    id: "faq-13",
    question: "Can I mark notifications as read?",
    answer:
      "Yes. You can mark individual notifications or all notifications as read from the notification dropdown.",
    category: "Notifications",
    roles: ["all"],
  },

  {
    id: "faq-14",
    question: "Can I track my interview progress?",
    answer:
      "Yes. Your dashboard displays interview scores, completed sessions, and performance trends.",
    category: "Progress",
    roles: ["all"],
  },

  {
    id: "faq-15",
    question: "How do I update my profile information?",
    answer:
      "Go to Settings or Profile and edit your personal details. Changes are saved automatically.",
    category: "Account",
    roles: ["all"],
  },

  {
    id: "faq-16",
    question: "Can I use InterviewAI on mobile devices?",
    answer:
      "Yes. The platform is fully responsive and works on desktop, tablet, and mobile devices.",
    category: "General",
    roles: ["all"],
  },

  {
    id: "faq-17",
    question: "What should I do if AI generation fails?",
    answer:
      "Retry after a few minutes. Temporary failures may occur because of API limits or heavy traffic.",
    category: "Technical",
    roles: ["all"],
  },

  {
    id: "faq-18",
    question: "Why am I getting a rate limit error?",
    answer:
      "The AI provider may temporarily restrict requests during high demand. Wait for some time and try again.",
    category: "Technical",
    roles: ["all"],
  },

  {
    id: "faq-19",
    question: "Can I delete my history?",
    answer:
      "Yes. You can remove interview sessions, reports, and generated records from their respective history sections.",
    category: "History",
    roles: ["all"],
  },

  {
    id: "faq-20",
    question: "Who can use InterviewAI?",
    answer:
      "Students, job seekers, professionals, and anyone preparing for interviews can use InterviewAI.",
    category: "General",
    roles: ["all"],
  }
];

const roleStyle: Record<string, { label: string; cls: string }> = {
  student:     { label: "Student",     cls: "bg-blue-100 text-blue-700" },
  "job-seeker":{ label: "Job Seeker",  cls: "bg-emerald-100 text-emerald-700" },
  coach:       { label: "Coach",       cls: "bg-purple-100 text-purple-700" },
  institute:   { label: "Institute",   cls: "bg-orange-100 text-orangeald-700" },
  company:     { label: "Company",     cls: "bg-rose-100 text-rose-700" },
};

export default function FAQSection({ selectedFAQ, setSelectedFAQ, userRole, searchQuery = "" }: FAQSectionProps) {
  const [filtered, setFiltered] = useState(allFaqs);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const byRole = allFaqs.filter(f => f.roles.includes("all") || f.roles.includes(userRole));
    setFiltered(
      q
        ? byRole.filter(f =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
          )
        : byRole
    );
  }, [userRole, searchQuery]);

  const toggle = (id: string) => setSelectedFAQ(selectedFAQ === id ? null : id);

  const RoleBadges = ({ roles }: { roles: string[] }) =>
    roles.includes("all") ? (
      <Badge className="bg-slate-100 text-slate-500 text-[10px] font-semibold border-0">General</Badge>
    ) : (
      <div className="flex flex-wrap gap-1">
        {roles.map(r => (
          <Badge key={r} className={`${roleStyle[r]?.cls} text-[10px] font-semibold border-0`}>
            {roleStyle[r]?.label ?? r}
          </Badge>
        ))}
      </div>
    );

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <SearchX className="w-10 h-10 opacity-40" />
        <p className="text-sm font-medium">No FAQs match your search.</p>
        <p className="text-xs">Try different keywords or clear the search bar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map(faq => {
        const isOpen = selectedFAQ === faq.id;
        return (
          <div
            key={faq.id}
            className={`rounded-2xl border bg-white transition-all duration-300 ${
              isOpen
                ? "border-violet-300 shadow-md shadow-violet-100 ring-1 ring-violet-200"
                : "border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md"
            }`}
          >
            <button
              onClick={() => toggle(faq.id)}
              className="w-full px-5 py-4 text-left flex items-start gap-4 group"
            >
              {/* colour strip */}
              <div className={`mt-1 w-1 h-8 flex-shrink-0 rounded-full transition-colors duration-200 ${
                isOpen ? "bg-violet-500" : "bg-slate-200 group-hover:bg-violet-300"
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-violet-500">
                    {faq.category}
                  </span>
                  <RoleBadges roles={faq.roles} />
                </div>
                <p className={`text-sm font-semibold leading-snug transition-colors ${
                  isOpen ? "text-violet-700" : "text-slate-800 group-hover:text-violet-700"
                }`}>
                  {faq.question}
                </p>
              </div>

              <div className="flex-shrink-0 mt-0.5">
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-violet-500" />
                  : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                }
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed pl-5 border-l-2 border-violet-200">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}