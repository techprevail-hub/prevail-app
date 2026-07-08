"use client";

import { ResumeData } from "@/types/resume";
import { Calendar, MapPin, Mail, Phone, Briefcase, GraduationCap, Code, Award, Globe, Star } from "lucide-react";
import ATSResume from "./templates/ATSResume";
import ModernResume from "./templates/ModernResume";
import CreativeResume from "./templates/CreativeResume";

interface ResumePreviewProps {
  data: ResumeData;
  template?: string;
}

export default function ResumePreview({ data, template = "modern" }: ResumePreviewProps) {
  // Check if there's any data to display
  const hasData = data.personal?.fullName || 
    data.education?.length > 0 || 
    data.experience?.length > 0 ||
    data.skills?.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileTextIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Resume Data</h3>
          <p className="text-sm text-gray-500">Fill in the form on the left to see your resume preview here</p>
        </div>
      </div>
    );
  }

  // Render the appropriate template based on selection
  switch (template) {
    case "ats":
      return <ATSResume data={data} />;
    case "creative":
      return <CreativeResume data={data} />;
    case "modern":
    default:
      return <ModernResume data={data} />;
  }
}

// Helper component for empty state
function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}