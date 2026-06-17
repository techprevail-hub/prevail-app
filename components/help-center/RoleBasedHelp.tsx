"use client";

import { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Users,
  Building,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  FileText,
  MessageCircle,
  Layout,
  Star,
  Shield,
  BarChart3,
  Code
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoleBasedHelpProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

const roleData: Record<string, any> = {
  student: {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "Prepare for campus placements and academic interviews",
    guides: [
      { title: "How to prepare for campus placements", icon: Target, description: "Step-by-step guide to ace your campus interviews" },
      { title: "Common interview questions for freshers", icon: FileText, description: "Most frequently asked questions for entry-level positions" },
      { title: "Time management during interviews", icon: Clock, description: "Tips to manage your time effectively" },
    ],
    tips: [
      "Practice daily with mock interviews",
      "Focus on fundamentals and core concepts",
      "Learn to structure your answers using STAR method",
      "Review your performance after each session"
    ],
    resources: [
      { label: "Placement Preparation Guide", icon: BookOpen },
      { label: "Resume Writing Tips", icon: FileText },
      { label: "Interview Etiquette", icon: Shield }
    ]
  },
  "job-seeker": {
    id: "job-seeker",
    label: "Job Seeker",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "Ace your job interviews and land your dream role",
    guides: [
      { title: "Mastering technical interviews", icon: Code, description: "Strategies for technical interview success" },
      { title: "Behavioral interview preparation", icon: Users, description: "Master behavioral questions with confidence" },
      { title: "Negotiating salary and offers", icon: TrendingUp, description: "Tips for successful salary negotiation" },
    ],
    tips: [
      "Research the company thoroughly before interviews",
      "Prepare specific examples from your experience",
      "Practice with role-specific questions",
      "Follow up after interviews professionally"
    ],
    resources: [
      { label: "Job Search Strategies", icon: Briefcase },
      { label: "LinkedIn Profile Optimization", icon: Users },
      { label: "Cover Letter Templates", icon: FileText }
    ]
  },
  coach: {
    id: "coach",
    label: "Coach",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "Guide and mentor students through mock interviews",
    guides: [
      { title: "How to conduct effective mock interviews", icon: Users, description: "Best practices for coaching interviews" },
      { title: "Providing constructive feedback", icon: MessageCircle, description: "How to give feedback that drives improvement" },
      { title: "Tracking student progress", icon: BarChart3, description: "Monitor and measure student improvement" },
    ],
    tips: [
      "Create a supportive and encouraging environment",
      "Focus on actionable feedback over generic comments",
      "Help students develop their own interview style",
      "Track progress to identify improvement areas"
    ],
    resources: [
      { label: "Coaching Best Practices", icon: Award },
      { label: "Feedback Templates", icon: FileText },
      { label: "Student Evaluation Tools", icon: BarChart3 }
    ]
  },
  institute: {
    id: "institute",
    label: "Institute",
    icon: Building,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    description: "Implement placement training programs for your students",
    guides: [
      { title: "Setting up placement training programs", icon: Layout, description: "Organize and manage placement preparation" },
      { title: "Bulk student management", icon: Users, description: "Handle large groups of students efficiently" },
      { title: "Analytics and reporting", icon: BarChart3, description: "Track performance metrics across students" },
    ],
    tips: [
      "Structure programs by difficulty levels",
      "Regular assessments to track progress",
      "Customize training based on student needs",
      "Celebrate milestones and achievements"
    ],
    resources: [
      { label: "Training Program Templates", icon: Layout },
      { label: "Student Assessment Guide", icon: BarChart3 },
      { label: "Batch Management Tips", icon: Users }
    ]
  },
  company: {
    id: "company",
    label: "Company",
    icon: Award,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    description: "Hire top talent with effective interview processes",
    guides: [
      { title: "Creating effective interview questions", icon: FileText, description: "Design questions that identify the best candidates" },
      { title: "Evaluating candidate responses", icon: Star, description: "Framework for consistent candidate evaluation" },
      { title: "Bulk hiring strategies", icon: Users, description: "Streamline large-scale recruitment processes" },
    ],
    tips: [
      "Standardize interview evaluation criteria",
      "Use data to improve your hiring process",
      "Train interviewers on fair evaluation",
      "Ensure diversity in candidate selection"
    ],
    resources: [
      { label: "Interview Question Bank", icon: FileText },
      { label: "Evaluation Templates", icon: Star },
      { label: "Hiring Best Practices", icon: Shield }
    ]
  }
};

export default function RoleBasedHelp({ selectedRole, setSelectedRole }: RoleBasedHelpProps) {
  const data = roleData[selectedRole];
  
  if (!data) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl p-8 text-center">
        <p className="text-gray-500">No role-specific content available.</p>
      </Card>
    );
  }

  const Icon = data.icon;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${data.color} p-6 text-white`}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{data.label} Resources</h3>
              <p className="text-white/80 text-sm mt-0.5">{data.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guides */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500" />
              Essential Guides
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.guides.map((guide: any, idx: number) => {
                const GuideIcon = guide.icon;
                return (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-violet-100 rounded-lg">
                        <GuideIcon className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{guide.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{guide.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pro Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.tips.map((tip: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 bg-amber-50/50 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Recommended Resources
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.resources.map((resource: any, idx: number) => {
                const ResourceIcon = resource.icon;
                return (
                  <Badge
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 cursor-pointer text-xs"
                  >
                    <ResourceIcon className="w-3 h-3 mr-1.5" />
                    {resource.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button className={`bg-gradient-to-r ${data.color} hover:opacity-90 rounded-xl shadow-lg`}>
              <Target className="w-4 h-4 mr-2" />
              View All {data.label} Resources
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}