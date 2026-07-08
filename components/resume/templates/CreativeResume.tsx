"use client";

import { Mail, Phone, MapPin, Calendar, Briefcase, Award, Languages, Code, Sparkles } from "lucide-react";

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

export default function CreativeResume({ data }: { data: ResumeData }) {
  // Helper to split description into bullet points
  const getBulletPoints = (description: string) => {
    if (!description) return [];
    return description.split('.').filter(s => s.trim());
  };

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", maxWidth: "850px", margin: "0 auto" }}>
      {/* Header Section with Pink Background #D25B9F */}
      <div className="bg-[#D25B9F] text-white p-8">
        <h1 className="text-4xl font-bold mb-1">
          {data.personal.fullName || "Mali Roberts"}
        </h1>
        <h2 className="text-xl font-medium mb-3 text-white/90">
          {data.personal.summary ? "Professional" : "Marketing Assistant"}
        </h2>
        
        <p className="text-white/90 leading-relaxed text-sm max-w-2xl">
          {data.personal.summary || "A Marketing Assistant with seven years of experience providing support for the development and execution of marketing campaigns for industry-leading brands. A proven track record of defining social media strategies to increase user engagement and grow brand awareness."}
        </p>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Professional Experience */}
          <div className="col-span-2 space-y-6">
            {/* Professional Experience */}
            {data.experience.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Professional Experience
                </h2>
                <div className="space-y-5">
                  {data.experience.map((exp) => {
                    const bulletPoints = getBulletPoints(exp.description);
                    return (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-gray-900 text-base">
                            {exp.position || "Marketing Assistant"}
                          </h3>
                          <span className="text-sm text-gray-600 font-medium">
                            {exp.duration || "September 2016 - Present"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {exp.company || "Sampson Construction, Lincoln, NE"}
                        </p>
                        {bulletPoints.length > 0 ? (
                          <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed space-y-1 ml-2">
                            {bulletPoints.map((point, idx) => (
                              <li key={idx} className="text-sm">
                                {point.trim()}.
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Education
                </h2>
                <div className="space-y-4">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-900">
                          {edu.degree || "Degree"}
                          {edu.field && ` in ${edu.field}`}
                        </h3>
                        <span className="text-sm text-gray-600">{edu.year || "Year"}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{edu.school || "University"}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Projects
                </h2>
                <div className="space-y-4">
                  {data.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-bold text-gray-900">{proj.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{proj.description}</p>
                      {proj.technologies && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Technologies:</span> {proj.technologies}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Contact Info */}
            <section>
              <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                Contact
              </h2>
              <div className="space-y-3">
                {data.personal.location && (
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-[#D25B9F] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{data.personal.location}</span>
                  </div>
                )}
                {data.personal.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-[#D25B9F] shrink-0" />
                    <span className="text-sm text-gray-700">{data.personal.phone}</span>
                  </div>
                )}
                {data.personal.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-[#D25B9F] shrink-0" />
                    <span className="text-sm text-gray-700">{data.personal.email}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Skills */}
            {data.skills.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Skills
                </h2>
                <ul className="space-y-2">
                  {data.skills.map((skill, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-[#D25B9F] rounded-full mt-1.5 shrink-0"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Languages
                </h2>
                <div className="space-y-2">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="text-sm text-gray-700">
                      <span className="font-semibold">{lang.language}</span>
                      <span className="text-gray-600"> - {lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Certifications
                </h2>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="text-sm text-gray-700">
                      <p className="font-semibold">{cert.name}</p>
                      <p className="text-gray-600 text-xs">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            {data.achievements.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#D25B9F] uppercase tracking-wider mb-3 border-b-2 border-[#D25B9F]/30 pb-2">
                  Achievements
                </h2>
                <ul className="space-y-2">
                  {data.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-[#D25B9F] rounded-full mt-1.5 shrink-0"></span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}