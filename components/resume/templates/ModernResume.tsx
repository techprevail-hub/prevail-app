"use client";

import { Mail, Phone, MapPin, Globe } from "lucide-react";

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

export default function ModernResume({ 
  data, 
  photoUrl 
}: { 
  data: ResumeData; 
  photoUrl?: string;
}) {
  return (
    <div className="bg-white min-h-screen p-8" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header Section */}
      <div className="flex gap-8 mb-8 border-b-2 border-gray-300 pb-8">
        {/* Photo */}
        {photoUrl && (
          <div className="flex-shrink-0">
            <img 
              src={photoUrl} 
              alt={data.personal.fullName}
              className="w-32 h-40 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Personal Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">
            {data.personal.fullName}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {data.personal.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{data.personal.phone}</span>
              </div>
            )}
            {data.personal.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{data.personal.email}</span>
              </div>
            )}
            {data.personal.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{data.personal.location}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {data.personal.summary && (
            <p className="text-gray-700 leading-relaxed">
              {data.personal.summary}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content - Left Side */}
        <div className="col-span-2 space-y-6">
          {/* Experience */}
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-600">
                EXPERIENCE
              </h2>
              <div className="space-y-4">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-sm text-gray-600">{exp.duration}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">{exp.company}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-600">
                EDUCATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900">
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </h3>
                      <span className="text-sm text-gray-600">{edu.year}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-600">
                PROJECTS
              </h2>
              <div className="space-y-4">
                {data.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-gray-900 mb-1">{proj.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Tech:</span> {proj.technologies}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-600">
                SKILLS
              </h2>
              <div className="space-y-2">
                {data.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-600">
                LANGUAGES
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-sm">
                    <p className="font-semibold text-gray-900">{lang.language}</p>
                    <p className="text-gray-600">{lang.proficiency}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-600">
                CERTIFICATIONS
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="text-sm">
                    <p className="font-semibold text-gray-900">{cert.name}</p>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-gray-600">{cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-indigo-600">
                ACHIEVEMENTS
              </h2>
              <div className="space-y-2">
                {data.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}