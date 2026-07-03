"use client";

import React from "react";
import ATSResume from "./templates/ATSResume";
import ModernResume from "./templates/ModernResume";
import CreativeResume from "./templates/CreativeResume";

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  achievements: string[];
  languages: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
}

interface Props {
  template: string;
  data: ResumeData;
}

export default function ResumeRenderer({ template, data }: Props) {
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