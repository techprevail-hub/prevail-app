"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronRight, FileText, Download, Edit, 
  Check, X, Plus, Trash2, Eye, Zap, Sparkles, ArrowRight,
  CheckCircle, Calendar, Briefcase, BookOpen, Code, Award,
  Globe, Music, AlertCircle, ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/apiServices";
import { generatePDF, generateDOCX } from "@/utils/resumeDownload";
import ResumeRenderer from "./ResumeRenderer";
import Image from "next/image";

// ============================================================
// INTERFACES
// ============================================================

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

// ============================================================
// CONSTANTS
// ============================================================

const TEMPLATES = [
  {
    id: "ats",
    name: "ATS Professional",
    description: "Optimized for ATS and corporate hiring",
    image: "/resume-templates/Ats-template.jpg",
  },
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean and recruiter-friendly layout",
    image: "/resume-templates/Modern-template.jpg",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Modern two-column design for creative professionals",
    image: "/resume-templates/creative-templates.jpg",
  },
];

const SECTION_ICONS = {
  personal: <FileText className="w-4 h-4" />,
  education: <BookOpen className="w-4 h-4" />,
  experience: <Briefcase className="w-4 h-4" />,
  projects: <Code className="w-4 h-4" />,
  skills: <Zap className="w-4 h-4" />,
  certifications: <Award className="w-4 h-4" />,
  achievements: <Sparkles className="w-4 h-4" />,
  languages: <Globe className="w-4 h-4" />,
};

const SECTION_LABELS = {
  personal: "Personal Information",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
};

// ============================================================
// INITIAL DATA
// ============================================================

const INITIAL_DATA: ResumeData = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  languages: [],
};

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StepIndicator({ currentStep, onBack }: { currentStep: number; onBack?: () => void }) {
  const steps = ["Template", "Form", "Success"];
  
  return (
    <div className="flex items-center gap-2 mb-8">
      {/* Back Button */}
      {onBack && currentStep > 0 && (
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}
      
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            i < currentStep
              ? "bg-emerald-500 text-white"
              : i === currentStep
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white ring-2 ring-indigo-300 ring-offset-2"
                : "bg-gray-200 text-gray-500"
          }`}>
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs sm:text-sm font-semibold transition-colors ${
            i <= currentStep ? "text-gray-900" : "text-gray-400"
          }`}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-1 rounded-full mx-2 transition-all ${
              i < currentStep ? "bg-emerald-500" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function TemplateGallery({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Pick a template that matches your style and industry</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((template) => {
          return (
            <div
              key={template.id}
              onClick={() => onSelect(template.id)}
              className="group cursor-pointer"
            >
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 hover:border-indigo-600 transition-all duration-300 hover:shadow-xl transform hover:scale-105 bg-white">
                {/* Image Preview - Smaller height */}
                <div className="relative w-full h-72 bg-gray-100 overflow-hidden">
                  <Image
                    src={template.image}
                    alt={template.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay gradient for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Section - Smaller padding */}
                <div className="p-3.5 bg-white">
                  <h3 className="font-bold text-gray-900 text-base mb-0.5">{template.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                  
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg flex items-center justify-center gap-2">
                    Choose Template
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelectedTemplateCard({ template, onChange }: { template: string; onChange: () => void }) {
  const templateInfo = TEMPLATES.find(t => t.id === template);

  return (
    <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-indigo-200">
            <Image
              src={templateInfo?.image || ""}
              alt={templateInfo?.name || ""}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Selected Template</p>
            <h3 className="text-lg font-bold text-gray-900">
              {templateInfo?.name}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {templateInfo?.description}
            </p>
          </div>
        </div>
        <button
          onClick={onChange}
          className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex items-center gap-1 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <Edit className="w-4 h-4" />
          Change Template
        </button>
      </div>
    </div>
  );
}

function Accordion({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-indigo-600">{Icon}</div>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      
      {open && (
        <div className="px-4 py-4 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function ResumeForm({ data, onDataChange }: { data: ResumeData; onDataChange: (data: ResumeData) => void }) {
  const updatePersonal = (key: keyof ResumeData['personal'], value: string) => {
    onDataChange({
      ...data,
      personal: { ...data.personal, [key]: value }
    });
  };

  const updateField = (section: keyof ResumeData, index: number, field: string, value: string) => {
    const updated = [...(data[section] as any[])];
    updated[index] = { ...updated[index], [field]: value };
    onDataChange({ ...data, [section]: updated });
  };

  const addItem = (section: keyof ResumeData) => {
    const newItem: any = {
      id: Math.random().toString(36).substr(2, 9),
    };
    
    if (section === "education") {
      newItem.school = "";
      newItem.degree = "";
      newItem.field = "";
      newItem.year = "";
    } else if (section === "experience") {
      newItem.company = "";
      newItem.position = "";
      newItem.duration = "";
      newItem.description = "";
    } else if (section === "projects") {
      newItem.title = "";
      newItem.description = "";
      newItem.technologies = "";
    } else if (section === "certifications") {
      newItem.name = "";
      newItem.issuer = "";
      newItem.date = "";
    } else if (section === "languages") {
      newItem.language = "";
      newItem.proficiency = "";
    }
    
    onDataChange({ ...data, [section]: [...(data[section] as any[]), newItem] });
  };

  const removeItem = (section: keyof ResumeData, id: string) => {
    onDataChange({
      ...data,
      [section]: (data[section] as any[]).filter(item => item.id !== id)
    });
  };

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <Accordion title={SECTION_LABELS.personal} icon={SECTION_ICONS.personal} defaultOpen>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={data.personal.fullName}
              onChange={(e) => updatePersonal("fullName", e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={data.personal.email}
              onChange={(e) => updatePersonal("email", e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={data.personal.phone}
              onChange={(e) => updatePersonal("phone", e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={data.personal.location}
              onChange={(e) => updatePersonal("location", e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <textarea
            placeholder="Professional Summary"
            value={data.personal.summary}
            onChange={(e) => updatePersonal("summary", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Accordion>

      {/* Education */}
      <Accordion title={SECTION_LABELS.education} icon={SECTION_ICONS.education}>
        <div className="space-y-4">
          {(data.education as any[]).map((edu, idx) => (
            <div key={edu.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="School/University"
                value={edu.school}
                onChange={(e) => updateField("education", idx, "school", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => updateField("education", idx, "degree", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={edu.field}
                  onChange={(e) => updateField("education", idx, "field", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="text"
                  placeholder="Year (e.g., 2020-2024)"
                  value={edu.year}
                  onChange={(e) => updateField("education", idx, "year", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onClick={() => removeItem("education", edu.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => addItem("education")}
            className="w-full py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
      </Accordion>

      {/* Experience */}
      <Accordion title={SECTION_LABELS.experience} icon={SECTION_ICONS.experience}>
        <div className="space-y-4">
          {(data.experience as any[]).map((exp, idx) => (
            <div key={exp.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Company"
                value={exp.company}
                onChange={(e) => updateField("experience", idx, "company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => updateField("experience", idx, "position", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={exp.duration}
                  onChange={(e) => updateField("experience", idx, "duration", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <textarea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) => updateField("experience", idx, "description", e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onClick={() => removeItem("experience", exp.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => addItem("experience")}
            className="w-full py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>
      </Accordion>

      {/* Projects */}
      <Accordion title={SECTION_LABELS.projects} icon={SECTION_ICONS.projects}>
        <div className="space-y-4">
          {(data.projects as any[]).map((proj, idx) => (
            <div key={proj.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Project Title"
                value={proj.title}
                onChange={(e) => updateField("projects", idx, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <textarea
                placeholder="Description"
                value={proj.description}
                onChange={(e) => updateField("projects", idx, "description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Technologies (comma-separated)"
                  value={proj.technologies}
                  onChange={(e) => updateField("projects", idx, "technologies", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onClick={() => removeItem("projects", proj.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => addItem("projects")}
            className="w-full py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </Accordion>

      {/* Skills */}
      <Accordion title={SECTION_LABELS.skills} icon={SECTION_ICONS.skills}>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Add skills separated by commas (e.g., Python, React, AWS)"
            defaultValue={data.skills.join(", ")}
            onChange={(e) => onDataChange({ ...data, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {data.skills.map((skill, idx) => (
                <Badge key={idx} className="bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200">
                  {skill}
                  <button onClick={() => onDataChange({ ...data, skills: data.skills.filter((_, i) => i !== idx) })} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Accordion>

      {/* Certifications */}
      <Accordion title={SECTION_LABELS.certifications} icon={SECTION_ICONS.certifications}>
        <div className="space-y-4">
          {(data.certifications as any[]).map((cert, idx) => (
            <div key={cert.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Certification Name"
                value={cert.name}
                onChange={(e) => updateField("certifications", idx, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Issuer"
                  value={cert.issuer}
                  onChange={(e) => updateField("certifications", idx, "issuer", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Date"
                  value={cert.date}
                  onChange={(e) => updateField("certifications", idx, "date", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <button
                onClick={() => removeItem("certifications", cert.id)}
                className="w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem("certifications")}
            className="w-full py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        </div>
      </Accordion>

      {/* Achievements */}
      <Accordion title={SECTION_LABELS.achievements} icon={SECTION_ICONS.achievements}>
        <div className="space-y-3">
          <textarea
            placeholder="Add achievements separated by new lines"
            defaultValue={data.achievements.join("\n")}
            onChange={(e) => onDataChange({ ...data, achievements: e.target.value.split("\n").filter(Boolean) })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Accordion>

      {/* Languages */}
      <Accordion title={SECTION_LABELS.languages} icon={SECTION_ICONS.languages}>
        <div className="space-y-4">
          {(data.languages as any[]).map((lang, idx) => (
            <div key={lang.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Language"
                  value={lang.language}
                  onChange={(e) => updateField("languages", idx, "language", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateField("languages", idx, "proficiency", e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Select Proficiency</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Fluent">Fluent</option>
                </select>
              </div>
              <button
                onClick={() => removeItem("languages", lang.id)}
                className="w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => addItem("languages")}
            className="w-full py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </button>
        </div>
      </Accordion>
    </div>
  );
}

// In the SuccessScreen component, remove the hidden preview div
function SuccessScreen({ resumeId, onEdit, onDownloadPDF, onDownloadDOCX, loading, onBack }: { 
  resumeId: string | null; 
  onEdit: () => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  loading: boolean;
  onBack: () => void;
}) {
  return (
    <div className="text-center space-y-6 py-8 relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Go back to main"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center animate-bounce">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Resume Created Successfully! 🎉</h2>
        <p className="text-gray-600">Your resume is ready to download and use</p>
        {resumeId && (
          <p className="text-xs text-gray-400 mt-2">Resume ID: {resumeId}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
        <button 
          onClick={onDownloadPDF}
          disabled={loading}
          className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF
            </>
          )}
        </button>
        <button 
          onClick={onDownloadDOCX}
          disabled={loading}
          className="py-3 px-4 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Generating DOCX...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Download DOCX
            </>
          )}
        </button>
      </div>

      <button 
        onClick={onEdit}
        className="py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mx-auto"
      >
        <Edit className="w-4 h-4" />
        Edit Resume
      </button>
    </div>
  );
}
// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep(2);
  };

  const handleChangeTemplate = () => {
    setStep(1);
  };

  const handleEditResume = () => {
    setIsEditMode(true);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 1) {
      window.location.href = '/dashboard/seeker/resume';
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      window.location.href = '/dashboard/seeker/resume';
    }
  };

  const handleCreateResume = async () => {
    // Validate data
    if (!resumeData.personal.fullName) {
      alert("Please fill in your full name");
      return;
    }

    try {
      setLoading(true);

      // Prepare payload
      const payload = {
        template: selectedTemplate || "modern",
        resume_title: `${resumeData.personal.fullName}'s Resume`,
        resume_data: resumeData,
      };

      let response;

      if (isEditMode && resumeId) {
        // Update existing resume
        response = await api.put(`/api/resume-builder/${resumeId}`, payload);
      } else {
        // Create new resume
        response = await api.post("/api/resume-builder/create", payload);
      }

      // Handle different response structures
      let data = response;
      if (response && response.data) {
        data = response.data;
      }

      const isSuccess = response.success !== undefined ? response.success : true;

      if (isSuccess && data && data.id) {
        setResumeId(data.id);
        setLoading(false);
        setStep(3);
      } else {
        throw new Error(response?.message || "Failed to save resume");
      }

    } catch (error: any) {
      setLoading(false);
      console.error("Error creating/updating resume:", error);
      alert(error?.message || "Failed to save resume. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await generatePDF(resumeData, selectedTemplate || "modern");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error("PDF generation error:", error);
      alert(error?.message || "Failed to generate PDF. Please try again.");
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      setLoading(true);
      await generateDOCX(resumeData, selectedTemplate || "modern");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error("DOCX generation error:", error);
      alert(error?.message || "Failed to generate DOCX. Please try again.");
    }
  };

  const handleDeleteResume = async () => {
    if (!resumeId) {
      alert("No resume found to delete");
      return;
    }

    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/api/resume-builder/${resumeId}`);
      
      let data = response;
      if (response && response.data) {
        data = response.data;
      }

      const isSuccess = response.success !== undefined ? response.success : true;

      if (isSuccess) {
        setResumeId(null);
        setResumeData(INITIAL_DATA);
        setIsEditMode(false);
        setStep(1);
        alert("Resume deleted successfully!");
      } else {
        throw new Error(response?.message || "Failed to delete resume");
      }
    } catch (error: any) {
      setLoading(false);
      alert(error?.message || "Failed to delete resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator with Back Button */}
      <StepIndicator currentStep={step - 1} onBack={step > 1 ? handleBack : undefined} />

      {/* Step 1: Template Selection */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TemplateGallery onSelect={handleSelectTemplate} />
        </div>
      )}

      {/* Step 2: Resume Form */}
      {step === 2 && selectedTemplate && (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
          {/* Selected Template Card */}
          <SelectedTemplateCard 
            template={selectedTemplate} 
            onChange={handleChangeTemplate} 
          />
          
          <div className="space-y-4">
            <ResumeForm data={resumeData} onDataChange={setResumeData} />
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCreateResume}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isEditMode ? "Update Resume" : "Create Resume"}
                  </>
                )}
              </button>
            </div>

            {/* Delete button when in edit mode */}
            {isEditMode && resumeId && (
              <button
                onClick={handleDeleteResume}
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Resume
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SuccessScreen 
            resumeId={resumeId} 
            onEdit={handleEditResume}
            onDownloadPDF={handleDownloadPDF}
            onDownloadDOCX={handleDownloadDOCX}
            loading={loading}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}