"use client";

import React from "react";
import ATSResume from "./templates/ATSResume";
import ModernResume from "./templates/ModernResume";
import CreativeResume from "./templates/CreativeResume";
import { ResumeData } from "@/types/resume";

interface ResumeRendererProps {
  template: string;
  data: ResumeData;
}

export default function ResumeRenderer({ template, data }: ResumeRendererProps) {
  // Validate that data exists
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No resume data available</p>
      </div>
    );
  }

  // Check if there's any content to display
  const hasContent = 
    data.personal?.fullName || 
    data.education?.length > 0 || 
    data.experience?.length > 0 ||
    data.skills?.length > 0;

  if (!hasContent) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Fill in your details to see the preview</p>
      </div>
    );
  }

  // Render the appropriate template based on selection
  switch (template) {
    case "ats":
      return <ATSResume data={data} />;
    case "modern":
      return <ModernResume data={data} />;
    case "creative":
      return <CreativeResume data={data} />;
    default:
      return <ModernResume data={data} />;
  }
}