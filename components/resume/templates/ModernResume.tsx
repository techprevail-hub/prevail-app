"use client";

import { Mail, Phone, MapPin } from "lucide-react";

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

export default function ModernResume({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", maxWidth: "850px", margin: "0 auto" }}>
      {/* Header Section with Dark Blue Background #152C54 */}
      <div className="bg-[#152C54] text-[#F6F3E8] p-8 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-1">
          {data.personal.fullName || "TRACY HALL"}
        </h1>
        <h2 className="text-base font-semibold mb-3">
          {data.personal.summary ? "PROFESSIONAL" : "YOUR PROFESSIONAL TITLE"}
        </h2>
        
        {/* Contact Information */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[#F6F3E8]">
          {data.personal.phone && (
            <span>{data.personal.phone}</span>
          )}
          {data.personal.email && (
            <span>| {data.personal.email}</span>
          )}
          {data.personal.location && (
            <span>| {data.personal.location}</span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {/* Professional Profile / Summary */}
        {data.personal.summary && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Professional Profile
            </h2>
            <p className="text-black leading-relaxed text-sm">
              {data.personal.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Work Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp) => {
                return (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-black text-sm uppercase">
                        {exp.position || "YOUR JOB TITLE HERE"}
                      </h3>
                      <span className="text-xs text-black font-medium">{exp.duration || "2005 – Present"}</span>
                    </div>
                    <p className="text-sm text-black font-semibold mb-2">{exp.company || "Company Name"}</p>
                    <p className="text-black text-sm leading-relaxed">
                      {exp.description || "Explain your responsibilities, achievements and remember to add keywords that are relevant to the job position you are applying for."}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-black text-sm uppercase">
                      {edu.degree || "DEGREE NAME"} {edu.field && `| ${edu.field}`}
                    </h3>
                    <span className="text-xs text-black font-medium">{edu.year || "Year – Year"}</span>
                  </div>
                  <p className="text-black text-sm">{edu.school || "University Name"}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills / Expertise */}
        {data.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Expertise
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-black">
              {data.skills.map((skill, index) => (
                <div key={index} className="flex items-center text-black">
                  <span className="inline-block w-1.5 h-1.5 bg-[#152C54] rounded-full mr-2"></span>
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj) => (
                <div key={proj.id}>
                  <h3 className="font-bold text-black text-sm uppercase">{proj.title}</h3>
                  <p className="text-black text-sm leading-relaxed">{proj.description}</p>
                  {proj.technologies && (
                    <p className="text-black text-xs mt-0.5">
                      <span className="font-semibold">Technologies:</span> {proj.technologies}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Certifications
            </h2>
            <div className="space-y-1 text-sm text-black">
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <span className="font-semibold text-black">{cert.name}</span>
                  {cert.issuer && <span className="text-black"> - {cert.issuer}</span>}
                  {cert.date && <span className="text-black text-xs ml-2">({cert.date})</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Languages
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-black">
              {data.languages.map((lang) => (
                <span key={lang.id} className="text-black">
                  {lang.language} <span className="text-black">({lang.proficiency})</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Achievements / Additional Information */}
        {data.achievements.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#152C54] border-b-2 border-[#152C54] pb-1 mb-3 uppercase tracking-wide">
              Additional Information
            </h2>
            <ul className="list-disc list-inside text-sm text-black space-y-0.5 ml-2">
              {data.achievements.map((achievement, index) => (
                <li key={index} className="text-black">{achievement}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}