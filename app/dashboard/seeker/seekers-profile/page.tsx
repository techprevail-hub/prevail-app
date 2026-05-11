"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, FileText, Briefcase,
  Building2, GraduationCap, UserRound, Globe, Star,
  ChevronRight, Pencil, Check, X, Plus, BadgeCheck,
  Layers, Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

// Import the CSS
import "@/app/globals.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  role: string;
  industry: string;
  experienceLevel: string;
  skills: string[];
  linkedinUrl: string;
  college: string;
  degree: string;
  company: string;
  position: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education",
  "Marketing", "Design", "Engineering", "Sales", "Operations", "Legal",
];

const EXPERIENCE_LEVELS = [
  "Intern", "Entry Level", "Mid Level", "Senior",
  "Lead", "Manager", "Director", "VP", "C-Suite",
];

// Empty initial state - no demo data
const EMPTY_PROFILE: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  role: "",
  industry: "",
  experienceLevel: "",
  skills: [],
  linkedinUrl: "",
  college: "",
  degree: "",
  company: "",
  position: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Labelled field used in view & edit mode */
function Field({
  icon: Icon,
  label,
  value,
  editing,
  name,
  type = "text",
  placeholder,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  editing: boolean;
  name: keyof ProfileData;
  type?: string;
  placeholder?: string;
  onChange: (k: keyof ProfileData, v: string) => void;
}) {
  return (
    <div className="sp-field">
      <p className="sp-field-label">
        <Icon size={11} className="sp-field-icon" />
        {label}
      </p>
      {editing ? (
        <Input
          type={type}
          value={value}
          placeholder={placeholder ?? label}
          onChange={(e) => onChange(name, e.target.value)}
          className="sp-input"
        />
      ) : (
        <span className="sp-field-value">
          {value || <em className="sp-empty">Not set</em>}
        </span>
      )}
    </div>
  );
}

/** Dropdown used in edit mode */
function DropField({
  icon: Icon,
  label,
  value,
  editing,
  options,
  name,
  onChange,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  editing: boolean;
  options: string[];
  name: keyof ProfileData;
  onChange: (k: keyof ProfileData, v: string) => void;
  badge?: boolean;
}) {
  return (
    <div className="sp-field">
      <p className="sp-field-label">
        <Icon size={11} className="sp-field-icon" />
        {label}
      </p>
      {editing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="sp-drop-trigger">
              {value || `Select ${label}`}
              <ChevronRight size={12} className="sp-drop-arrow" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="sp-drop-content">
            {options.map((opt) => (
              <DropdownMenuItem
                key={opt}
                onClick={() => onChange(name, opt)}
                className={value === opt ? "sp-drop-active" : ""}
              >
                {value === opt && <Check size={12} className="mr-2" />}
                {opt}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : badge ? (
        <span className="sp-exp-badge">{value || "Not specified"}</span>
      ) : (
        <span className="sp-field-value">{value || "Not specified"}</span>
      )}
    </div>
  );
}

/** Section wrapper card */
function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={`sp-section ${accent ? "sp-section--accent" : ""}`}>
      <div className="sp-section-head">
        <span className="sp-section-ico">
          <Icon size={14} />
        </span>
        <h3 className="sp-section-title">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SeekerProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(EMPTY_PROFILE);
  const [draftSkills, setDraftSkills] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch profile from backend
  async function fetchProfile() {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (result.success && result.data) {
        // Profile exists - populate with data from backend
        const profileData = {
          fullName: result.data.full_name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          location: result.data.location || "",
          bio: result.data.bio || "",
          role: result.data.role || "",
          industry: result.data.industry || "",
          experienceLevel: result.data.experience_level || "",
          skills: Array.isArray(result.data.skills)
            ? result.data.skills
            : [],
          linkedinUrl: result.data.linkedin_url || "",
          college: result.data.education || "",
          degree: result.data.degree || "",
          company: result.data.company || "",
          position: result.data.position || "",
        };

        setProfile(profileData);
        setDraft(profileData);
        setDraftSkills(profileData.skills);
      } else {
        // No profile found - auto-fill from localStorage
        const userName = localStorage.getItem("userName") || "";
        const userEmail = localStorage.getItem("userEmail") || "";

        const emptyProfile = {
          ...EMPTY_PROFILE,
          fullName: userName,
          email: userEmail,
        };

        setProfile(emptyProfile);
        setDraft(emptyProfile);
        setDraftSkills(emptyProfile.skills);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      
      // On error, also try to auto-fill from localStorage
      const userName = localStorage.getItem("userName") || "";
      const userEmail = localStorage.getItem("userEmail") || "";

      const emptyProfile = {
        ...EMPTY_PROFILE,
        fullName: userName,
        email: userEmail,
      };

      setProfile(emptyProfile);
      setDraft(emptyProfile);
      setDraftSkills(emptyProfile.skills);
    } finally {
      setIsLoading(false);
    }
  }

  // Completion % - only count fields that have real values
  const fields: (keyof ProfileData)[] = [
    "fullName","email","phone","location","bio","role",
    "industry","experienceLevel","linkedinUrl","college","degree","company","position",
  ];
  const filled =
    fields.filter((k) => {
      const value = profile[k];
      return (
        typeof value === "string" &&
        value.trim() !== ""
      );
    }).length +
    (profile.skills.length > 0 ? 1 : 0);
  const totalFields = fields.length + 1;
  const pct = totalFields > 0 ? Math.round((filled / totalFields) * 100) : 0;

  function change(k: keyof ProfileData, v: string) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  // Updated save function with API call
  async function save() {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const payload = {
        user_id: localStorage.getItem("userId"),

        full_name: draft.fullName,
        email: draft.email,
        phone: draft.phone,
        location: draft.location,
        bio: draft.bio,
        role: draft.role,
        industry: draft.industry,
        experience_level: draft.experienceLevel,
        skills: draftSkills,
        linkedin_url: draft.linkedinUrl,
        education: draft.college,
        degree: draft.degree,
        company: draft.company,
        position: draft.position,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (result.success) {
        setProfile({
          ...draft,
          skills: draftSkills,
        });
        setEditing(false);
      } else {
        console.error("Save failed:", result);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  function cancel() {
    setDraft(profile);
    setDraftSkills(profile.skills);
    setEditing(false);
  }

  function addSkill() {
    const s = newSkill.trim();
    if (s && !draftSkills.includes(s)) setDraftSkills((p) => [...p, s]);
    setNewSkill("");
  }

  const dp = editing ? draft : profile;
  const skills = Array.isArray(
    editing ? draftSkills : profile.skills
  )
    ? (editing ? draftSkills : profile.skills)
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="sp-root">
        <div className="sp-inner">
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "60vh" 
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "48px",
                height: "48px",
                border: "3px solid var(--sp-purple-100)",
                borderTopColor: "var(--sp-purple)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px"
              }} />
              <p style={{ color: "var(--sp-txt-m)" }}>Loading your profile...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="sp-root">
        {/* Ambient blobs */}
        <div className="sp-blob sp-blob-1" />
        <div className="sp-blob sp-blob-2" />

        <div className="sp-inner">
          {/* Top bar */}
          <div className="sp-topbar">
            <div>
              <h1 className="sp-page-title">My Profile</h1>
              <p className="sp-page-sub">
                {editing
                  ? "Make your changes below and save when done."
                  : "Keep your profile up to date to attract recruiters."}
              </p>
            </div>
            <div className="sp-actions">
              {editing ? (
                <>
                  <button className="sp-btn-cancel" onClick={cancel} disabled={isSaving}>
                    <X size={13} /> Cancel
                  </button>
                  <button className="sp-btn-save" onClick={save} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <><Check size={13} /> Save Changes</>
                    )}
                  </button>
                </>
              ) : (
                <button className="sp-btn-edit" onClick={() => setEditing(true)}>
                  <Pencil size={13} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Main grid */}
          <div className="sp-grid">
            {/* ══ LEFT SIDEBAR ══ */}
            <aside className="sp-left">
              {/* Avatar card */}
              <div className="sp-avatar-card">
                <div className="sp-avatar-banner" />
                <div className="sp-avatar-wrap">
                  <div className="sp-avatar-circle">{initials(dp.fullName)}</div>
                  {editing && (
                    <button className="sp-avatar-edit">
                      <Pencil size={10} />
                    </button>
                  )}
                </div>
                <p className="sp-avatar-name">{dp.fullName || "Your Name"}</p>
                <p className="sp-avatar-role">{dp.role || "Your Role"}</p>
                <div className="sp-avatar-loc">
                  <MapPin size={11} />
                  <span>{dp.location || "Location"}</span>
                </div>
                {dp.linkedinUrl && (
                  <a href={dp.linkedinUrl} target="_blank" rel="noopener noreferrer" className="sp-li-btn">
                    <UserRound size={13} /> LinkedIn
                  </a>
                )}
              </div>

              {/* Completion */}
              <div className="sp-completion">
                <div className="sp-completion-head">
                  <BadgeCheck size={14} /> Profile Strength
                </div>
                <div className="sp-bar-track">
                  <div className="sp-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="sp-completion-foot">
                  <span className="sp-completion-pct">{pct}%</span>
                  <span className="sp-completion-lbl">
                    {pct >= 90 ? "Excellent!" : pct >= 60 ? "Looking good" : "Keep going"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="sp-stats">
                <div className="sp-stat">
                  <Layers size={14} style={{ color: "var(--sp-purple)" }} />
                  <span className="sp-stat-val">
                    {Array.isArray(profile.skills)
                      ? profile.skills.length
                      : 0}
                  </span>
                  <span className="sp-stat-lbl">Skills</span>
                </div>
                <div className="sp-stat">
                  <Star size={14} style={{ color: "var(--sp-amber)" }} />
                  <span className="sp-stat-val">4.8</span>
                  <span className="sp-stat-lbl">Rating</span>
                </div>
                <div className="sp-stat">
                  <Award size={14} style={{ color: "var(--sp-green)" }} />
                  <span className="sp-stat-val">12</span>
                  <span className="sp-stat-lbl">Applied</span>
                </div>
              </div>
            </aside>

            {/* ══ RIGHT CONTENT ══ */}
            <main className="sp-right">
              {/* Basic Info */}
              <Section icon={User} title="Basic Information">
                <div className="sp-fields">
                  <Field icon={User}    label="Full Name" value={dp.fullName}  editing={editing} name="fullName" onChange={change} placeholder="Your full name" />
                  <Field icon={Mail}    label="Email"     value={dp.email}     editing={editing} name="email"    onChange={change} type="email" placeholder="you@example.com" />
                  <Field icon={Phone}   label="Phone"     value={dp.phone}     editing={editing} name="phone"    onChange={change} placeholder="+91 98765 43210" />
                  <Field icon={MapPin}  label="Location"  value={dp.location}  editing={editing} name="location" onChange={change} placeholder="City, State" />
                </div>
                <div className="sp-bio-wrap">
                  <p className="sp-field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <FileText size={11} className="sp-field-icon" /> Bio
                  </p>
                  {editing ? (
                    <Textarea
                      value={draft.bio}
                      onChange={(e) => change("bio", e.target.value)}
                      rows={3}
                      className="sp-textarea"
                      placeholder="Tell us a bit about yourself..."
                    />
                  ) : (
                    <p className="sp-bio-text">
                      {dp.bio || <em className="sp-empty">No bio yet.</em>}
                    </p>
                  )}
                </div>
              </Section>

              {/* Career Info */}
              <Section icon={Briefcase} title="Career Information" accent>
                <div className="sp-fields">
                  <Field icon={Briefcase}  label="Current Role"  value={dp.role}         editing={editing} name="role"    onChange={change} placeholder="Software Engineer" />
                  <Field icon={Globe}      label="LinkedIn URL"  value={dp.linkedinUrl}  editing={editing} name="linkedinUrl" onChange={change} type="url" placeholder="https://linkedin.com/in/username" />
                  <DropField icon={Building2} label="Industry"         value={dp.industry}        editing={editing} name="industry"         options={INDUSTRIES}        onChange={change} />
                  <DropField icon={Star}      label="Experience Level" value={dp.experienceLevel} editing={editing} name="experienceLevel" options={EXPERIENCE_LEVELS} onChange={change} badge />
                </div>

                <Separator className="sp-sep" />

                {/* Skills */}
                <div>
                  <p className="sp-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                    <Layers size={11} className="sp-field-icon" /> Skills
                  </p>
                  <div className="sp-skills-wrap">
                    {skills.length === 0 && !editing && (
                      <span className="sp-empty">No skills added yet.</span>
                    )}
                    {skills.map((s) => (
                      <span key={s} className="sp-skill">
                        {s}
                        {editing && (
                          <button className="sp-skill-rm" onClick={() => setDraftSkills((p) => p.filter((x) => x !== s))}>
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                    {editing && (
                      <div className="sp-skill-add-wrap">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSkill()}
                          placeholder="Add skill…"
                          className="sp-skill-input"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="sp-skill-add" onClick={addSkill}>
                              <Plus size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Add skill</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Education & Work */}
              <Section icon={GraduationCap} title="Education & Work Experience">
                <div className="sp-eduwork">
                  {/* Education */}
                  <div className="sp-eduwork-block">
                    <div className="sp-eduwork-head">
                      <span className="sp-eduwork-ico sp-ico-purple"><GraduationCap size={13} /></span>
                      Education
                    </div>
                    <Field icon={Building2} label="College / University" value={dp.college} editing={editing} name="college" onChange={change} placeholder="Your University" />
                    <Field icon={Award}     label="Degree"               value={dp.degree}  editing={editing} name="degree"  onChange={change} placeholder="B.Tech Computer Science" />
                  </div>

                  <div className="sp-vert-divider" />

                  {/* Work */}
                  <div className="sp-eduwork-block">
                    <div className="sp-eduwork-head">
                      <span className="sp-eduwork-ico sp-ico-amber"><Briefcase size={13} /></span>
                      Work Experience
                    </div>
                    <Field icon={Building2} label="Company"  value={dp.company}  editing={editing} name="company"  onChange={change} placeholder="Company Name" />
                    <Field icon={Briefcase} label="Position" value={dp.position} editing={editing} name="position" onChange={change} placeholder="Your Position" />
                  </div>
                </div>
              </Section>

              {/* Sticky save bar */}
              {editing && (
                <div className="sp-save-bar">
                  <p className="sp-save-hint">
                    <Check size={13} /> Unsaved changes
                  </p>
                  <div className="sp-actions">
                    <button className="sp-btn-cancel" onClick={cancel} disabled={isSaving}>
                      Cancel
                    </button>
                    <button className="sp-btn-save" onClick={save} disabled={isSaving}>
                      {isSaving ? "Saving..." : <><Check size={13} /> Save Changes</>}
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}