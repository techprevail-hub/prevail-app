"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register fonts (optional but recommended)
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf",
});

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

// ATS PDF Template
export const ATSPDF = ({ data }: { data: ResumeData }) => {
  const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: "#ffffff" },
    name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
    contact: { fontSize: 10, color: "#444", marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 12, marginBottom: 6, borderBottom: "1px solid #ccc", paddingBottom: 4 },
    text: { fontSize: 10, marginBottom: 4, lineHeight: 1.4 },
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    small: { fontSize: 9, color: "#555" },
    skillBadge: { fontSize: 9, backgroundColor: "#f0f0f0", padding: "4 8", marginRight: 4, marginBottom: 4 },
    section: { marginBottom: 8 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
        <Text style={styles.contact}>
          {[data.personal.email, data.personal.phone, data.personal.location]
            .filter(Boolean)
            .join(" | ")}
        </Text>

        {/* Summary */}
        {data.personal.summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.text}>{data.personal.summary}</Text>
          </>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.section}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...styles.text, ...styles.bold }}>{exp.position}</Text>
                  <Text style={{ ...styles.text, ...styles.italic, ...styles.small }}>{exp.duration}</Text>
                </View>
                <Text style={{ ...styles.text, ...styles.bold }}>{exp.company}</Text>
                {exp.description && <Text style={styles.text}>{exp.description}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.section}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...styles.text, ...styles.bold }}>
                    {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                  </Text>
                  <Text style={{ ...styles.text, ...styles.italic, ...styles.small }}>{edu.year}</Text>
                </View>
                <Text style={styles.text}>{edu.school}</Text>
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {data.skills.map((skill, i) => (
                <Text key={i} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

// Modern PDF Template
export const ModernPDF = ({ data }: { data: ResumeData }) => {
  const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: "#ffffff" },
    header: { backgroundColor: "#4f46e5", padding: 20, margin: -40, marginBottom: 20 },
    name: { fontSize: 26, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
    contact: { fontSize: 10, color: "#e0e0e0" },
    sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#4f46e5", marginTop: 12, marginBottom: 6, borderBottom: "2px solid #4f46e5", paddingBottom: 4 },
    text: { fontSize: 10, marginBottom: 4, lineHeight: 1.4, color: "#333" },
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    small: { fontSize: 9, color: "#666" },
    section: { marginBottom: 8 },
    skillBadge: { fontSize: 9, backgroundColor: "#eef2ff", color: "#4f46e5", padding: "4 10", marginRight: 4, marginBottom: 4, borderRadius: 4 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with gradient effect */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
          <Text style={styles.contact}>
            {[data.personal.email, data.personal.phone, data.personal.location]
              .filter(Boolean)
              .join(" | ")}
          </Text>
        </View>

        {/* Summary */}
        {data.personal.summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.text}>{data.personal.summary}</Text>
          </>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.section}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...styles.text, ...styles.bold }}>{exp.position}</Text>
                  <Text style={{ ...styles.text, ...styles.italic, ...styles.small }}>{exp.duration}</Text>
                </View>
                <Text style={{ ...styles.text, ...styles.bold, color: "#4f46e5" }}>{exp.company}</Text>
                {exp.description && <Text style={styles.text}>{exp.description}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.section}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...styles.text, ...styles.bold }}>
                    {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                  </Text>
                  <Text style={{ ...styles.text, ...styles.italic, ...styles.small }}>{edu.year}</Text>
                </View>
                <Text style={styles.text}>{edu.school}</Text>
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {data.skills.map((skill, i) => (
                <Text key={i} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

// Creative PDF Template
export const CreativePDF = ({ data }: { data: ResumeData }) => {
  const styles = StyleSheet.create({
    page: { padding: 0, backgroundColor: "#ffffff" },
    header: { backgroundColor: "#ec4899", padding: 30, flexDirection: "row", alignItems: "center" },
    headerLeft: { flex: 2 },
    name: { fontSize: 28, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
    contact: { fontSize: 10, color: "#fce7f3" },
    content: { padding: 30 },
    row: { flexDirection: "row", gap: 20 },
    leftColumn: { flex: 1 },
    rightColumn: { flex: 2 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#ec4899", marginBottom: 6, borderBottom: "2px solid #fbcfe8", paddingBottom: 4 },
    text: { fontSize: 10, marginBottom: 4, lineHeight: 1.4, color: "#333" },
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    small: { fontSize: 9, color: "#666" },
    section: { marginBottom: 8 },
    skillBadge: { fontSize: 9, backgroundColor: "#fce7f3", color: "#be185d", padding: "4 10", marginRight: 4, marginBottom: 4, borderRadius: 20 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Creative */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
            <Text style={styles.contact}>
              {[data.personal.email, data.personal.phone, data.personal.location]
                .filter(Boolean)
                .join(" | ")}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            {/* Left Column - Skills, Languages, Certifications */}
            <View style={styles.leftColumn}>
              {/* Skills */}
              {data.skills.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  {data.skills.map((skill, i) => (
                    <Text key={i} style={styles.skillBadge}>{skill}</Text>
                  ))}
                  <View style={{ marginBottom: 12 }} />
                </>
              )}

              {/* Languages */}
              {data.languages.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Languages</Text>
                  {data.languages.map((lang, i) => (
                    <View key={i} style={{ marginBottom: 4 }}>
                      <Text style={{ ...styles.text, ...styles.bold }}>{lang.language}</Text>
                      <Text style={styles.small}>{lang.proficiency}</Text>
                    </View>
                  ))}
                  <View style={{ marginBottom: 12 }} />
                </>
              )}

              {/* Certifications */}
              {data.certifications.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Certifications</Text>
                  {data.certifications.map((cert, i) => (
                    <View key={i} style={{ marginBottom: 4 }}>
                      <Text style={{ ...styles.text, ...styles.bold }}>{cert.name}</Text>
                      <Text style={styles.small}>{cert.issuer}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* Right Column - Experience, Education, Projects */}
            <View style={styles.rightColumn}>
              {/* Summary */}
              {data.personal.summary && (
                <>
                  <Text style={styles.sectionTitle}>About Me</Text>
                  <Text style={styles.text}>{data.personal.summary}</Text>
                  <View style={{ marginBottom: 12 }} />
                </>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {data.experience.map((exp, i) => (
                    <View key={i} style={styles.section}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ ...styles.text, ...styles.bold }}>{exp.position}</Text>
                        <Text style={{ ...styles.text, ...styles.italic, ...styles.small }}>{exp.duration}</Text>
                      </View>
                      <Text style={{ ...styles.text, ...styles.bold, color: "#ec4899" }}>{exp.company}</Text>
                      {exp.description && <Text style={styles.text}>{exp.description}</Text>}
                    </View>
                  ))}
                </>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {data.education.map((edu, i) => (
                    <View key={i} style={styles.section}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ ...styles.text, ...styles.bold }}>
                          {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                        </Text>
                        <Text style={{ ...styles.text, ...styles.italic, ...styles.small }}>{edu.year}</Text>
                      </View>
                      <Text style={styles.text}>{edu.school}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Projects */}
              {data.projects.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Projects</Text>
                  {data.projects.map((proj, i) => (
                    <View key={i} style={styles.section}>
                      <Text style={{ ...styles.text, ...styles.bold }}>{proj.title}</Text>
                      {proj.description && <Text style={styles.text}>{proj.description}</Text>}
                      {proj.technologies && <Text style={styles.small}>Tech: {proj.technologies}</Text>}
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Main PDF Renderer
export const PDFRenderer = ({ template, data }: { template: string; data: ResumeData }) => {
  switch (template) {
    case "ats":
      return <ATSPDF data={data} />;
    case "modern":
      return <ModernPDF data={data} />;
    case "creative":
      return <CreativePDF data={data} />;
    default:
      return <ModernPDF data={data} />;
  }
};