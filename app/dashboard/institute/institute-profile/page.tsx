"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Globe,
  Star,
  Pencil,
  Check,
  X,
  Plus,
  BadgeCheck,
  Layers,
  Award,
  User,
  BookOpen,
  BookMarked,
  GraduationCap,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ─── Import API Service ────────────────────────────────────────────────────
import { api } from "@/utils/apiServices";

// ─── Import CSS ────────────────────────────────────────────────────────────
import "@/app/globals.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface InstituteProfile {
  id?: string;
  user_id?: string;
  institute_name: string;
  email: string;
  logo_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  courses: string[];
  created_at?: string;
  updated_at?: string;
}

// ─── Empty Profile ───────────────────────────────────────────────────────────
const EMPTY_PROFILE: InstituteProfile = {
  institute_name: "",
  email: "",
  logo_url: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  courses: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  editing: boolean;
  name: keyof InstituteProfile;
  type?: string;
  placeholder?: string;
  onChange: (k: keyof InstituteProfile, v: string) => void;
  disabled?: boolean;
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
          disabled={disabled}
        />
      ) : (
        <span className="sp-field-value">
          {value || <em className="sp-empty">Not set</em>}
        </span>
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
export default function InstituteProfilePage() {
  const [profile, setProfile] = useState<InstituteProfile>(EMPTY_PROFILE);
  const [draft, setDraft] = useState<InstituteProfile>(EMPTY_PROFILE);
  const [draftCourses, setDraftCourses] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [newCourse, setNewCourse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedProfile = useRef(false);

  // ─── Fetch Profile ──────────────────────────────────────────────────────
  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedProfile.current) {
      return;
    }
    hasFetchedProfile.current = true;
    
    fetchInstituteProfile();
  }, []);

  const fetchInstituteProfile = async () => {
    try {
      setIsLoading(true);

      // Get logged-in user data from localStorage
      const storedUser = localStorage.getItem("user");
      let userName = "";
      let userEmail = "";

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userName = user.name || user.userName || user.user_name || "";
          userEmail = user.email || user.userEmail || user.user_email || "";
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      // If no user in localStorage, try individual keys
      if (!userName) {
        userName = localStorage.getItem("userName") || "";
      }
      if (!userEmail) {
        userEmail = localStorage.getItem("userEmail") || "";
      }

      // Get institute profile from backend
      const response = await api.get("/api/role-institute/profile/me");

      // If institute profile exists in database
      if (response?.success && response?.data) {
        const profileData: InstituteProfile = {
          id: response.data.id || "",
          user_id: response.data.user_id || "",
          institute_name: response.data.institute_name || userName,
          email: response.data.email || userEmail,
          logo_url: response.data.logo_url || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          city: response.data.city || "",
          state: response.data.state || "",
          country: response.data.country || "",
          courses: Array.isArray(response.data.courses)
            ? response.data.courses
            : [],
          created_at: response.data.created_at || "",
          updated_at: response.data.updated_at || "",
        };

        setProfile(profileData);
        setDraft(profileData);
        setDraftCourses(profileData.courses);
      } else {
        // No institute_profile record yet.
        // Use logged-in user's data from localStorage.
        const profileData: InstituteProfile = {
          ...EMPTY_PROFILE,
          institute_name: userName,
          email: userEmail,
        };

        setProfile(profileData);
        setDraft(profileData);
        setDraftCourses([]);
      }
    } catch (error) {
      console.error("Error fetching institute profile:", error);

      // Even if profile API has no data,
      // still try to show logged-in user's information.
      const storedUser = localStorage.getItem("user");
      let userName = "";
      let userEmail = "";

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userName = user.name || user.userName || user.user_name || "";
          userEmail = user.email || user.userEmail || user.user_email || "";
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      // If no user in localStorage, try individual keys
      if (!userName) {
        userName = localStorage.getItem("userName") || "";
      }
      if (!userEmail) {
        userEmail = localStorage.getItem("userEmail") || "";
      }

      const profileData: InstituteProfile = {
        ...EMPTY_PROFILE,
        institute_name: userName,
        email: userEmail,
      };

      setProfile(profileData);
      setDraft(profileData);
      setDraftCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Handle File Selection ─────────────────────────────────────────────
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WEBP, or SVG).");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      console.log("Uploading institute logo:", file.name);

      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post(
        "/api/role-institute/profile/logo",
        formData,
        {
          isFormData: true,
        }
      );

      console.log("Logo upload response:", response);

      const logoUrl = response?.data?.logo_url || response?.logo_url;

      if (!logoUrl) {
        throw new Error("Logo URL was not returned by the server.");
      }

      // Save actual URL in local draft
      setDraft((prev) => ({
        ...prev,
        logo_url: logoUrl,
      }));

      toast.success("Institute logo uploaded successfully.");

    } catch (error: any) {
      console.error("❌ Logo upload failed:", error);
      toast.error(error?.message || "Failed to upload institute logo.");
    } finally {
      setIsUploading(false);
      // Allow selecting the same file again
      event.target.value = "";
    }
  };

  // ─── Save Profile ──────────────────────────────────────────────────────
  const saveProfile = async () => {
    try {
      setIsSaving(true);

      const payload = {
        institute_name: draft.institute_name,
        email: draft.email,
        logo_url: draft.logo_url || "",
        phone: draft.phone || "",
        address: draft.address || "",
        city: draft.city || "",
        state: draft.state || "",
        country: draft.country || "",
        courses: draftCourses,
      };

      const response = await api.put("/api/role-institute/profile/update", payload);

      if (response?.success) {
        toast.success("Profile updated successfully.");

        if (response.data) {
          const updatedProfile: InstituteProfile = {
            id: response.data.id || "",
            user_id: response.data.user_id || "",
            institute_name: response.data.institute_name || "",
            email: response.data.email || draft.email || "",
            logo_url: response.data.logo_url || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            city: response.data.city || "",
            state: response.data.state || "",
            country: response.data.country || "",
            courses: Array.isArray(response.data.courses)
              ? response.data.courses
              : [],
            created_at: response.data.created_at || "",
            updated_at: response.data.updated_at || "",
          };

          setProfile(updatedProfile);
          setDraft(updatedProfile);
          setDraftCourses(updatedProfile.courses);
        }

        setEditing(false);
      } else {
        toast.error(response?.message || "Failed to update institute profile.");
      }
    } catch (error) {
      console.error("Error updating institute profile:", error);
      toast.error("Failed to update institute profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Cancel Edit ──────────────────────────────────────────────────────
  const cancelEdit = () => {
    setDraft(profile);
    setDraftCourses(profile.courses);
    setEditing(false);
  };

  // ─── Handle Input Change ──────────────────────────────────────────────
  const handleChange = (key: keyof InstituteProfile, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ─── Courses Management ──────────────────────────────────────────────
  const addCourse = () => {
    const course = newCourse.trim();
    if (!course) {
      toast.error("Please enter a course name.");
      return;
    }
    if (draftCourses.includes(course)) {
      toast.error("Course already added.");
      return;
    }
    setDraftCourses((prev) => [...prev, course]);
    setNewCourse("");
  };

  const removeCourse = (courseToRemove: string) => {
    setDraftCourses((prev) => prev.filter((c) => c !== courseToRemove));
  };

  // ─── Completion % ──────────────────────────────────────────────────────
  const fields: (keyof InstituteProfile)[] = [
    "institute_name",
    "email",
    "logo_url",
    "phone",
    "address",
    "city",
    "state",
    "country",
  ];

  const filled =
    fields.filter((k) => {
      const value = profile[k];
      return typeof value === "string" && value.trim() !== "";
    }).length + (profile.courses.length > 0 ? 1 : 0);

  const totalFields = fields.length + 1;
  const pct = totalFields > 0 ? Math.round((filled / totalFields) * 100) : 0;

  // ─── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="sp-root">
        <div className="sp-inner">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "3px solid var(--sp-purple-100)",
                  borderTopColor: "var(--sp-purple)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }}
              />
              <p style={{ color: "var(--sp-txt-m)" }}>
                Loading institute profile...
              </p>
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

  // ─── Render ──────────────────────────────────────────────────────────────
  const dp = editing ? draft : profile;
  const courses = editing ? draftCourses : profile.courses;

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
              <h1 className="sp-page-title">Institute Profile</h1>
              <p className="sp-page-sub">
                {editing
                  ? "Make your changes below and save when done."
                  : "Manage your institute's information and courses."}
              </p>
            </div>
            <div className="sp-actions">
              {editing ? (
                <>
                  <button
                    className="sp-btn-cancel"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    <X size={13} /> Cancel
                  </button>
                  <button
                    className="sp-btn-save"
                    onClick={saveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Check size={13} /> Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  className="sp-btn-edit"
                  onClick={() => setEditing(true)}
                >
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
                  <div className="sp-avatar-circle">
                    {dp.logo_url ? (
                      <img
                        src={dp.logo_url}
                        alt={dp.institute_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        onError={(e) => {
                          // If image fails to load, show initials
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.textContent = getInitials(dp.institute_name);
                          }
                        }}
                      />
                    ) : (
                      getInitials(dp.institute_name)
                    )}
                  </div>
                  {editing && (
                    <>
                      <button
                        className="sp-avatar-edit"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={10} />
                        )}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        className="hidden"
                        disabled={isUploading}
                      />
                    </>
                  )}
                </div>
                <p className="sp-avatar-name">
                  {dp.institute_name || "Institute Name"}
                </p>
                <p className="sp-avatar-role">Educational Institute</p>
                <div className="sp-avatar-loc">
                  <MapPin size={11} />
                  <span>
                    {dp.city && dp.state
                      ? `${dp.city}, ${dp.state}`
                      : dp.city || dp.state || "Location"}
                  </span>
                </div>
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
                    {pct >= 90
                      ? "Excellent!"
                      : pct >= 60
                      ? "Looking good"
                      : "Keep going"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="sp-stats">
                <div className="sp-stat">
                  <BookOpen size={14} style={{ color: "var(--sp-purple)" }} />
                  <span className="sp-stat-val">{courses.length}</span>
                  <span className="sp-stat-lbl">Courses</span>
                </div>
                <div className="sp-stat">
                  <Building2 size={14} style={{ color: "var(--sp-amber)" }} />
                  <span className="sp-stat-val">
                    {dp.address ? "✓" : "—"}
                  </span>
                  <span className="sp-stat-lbl">Address</span>
                </div>
                <div className="sp-stat">
                  <Phone size={14} style={{ color: "var(--sp-green)" }} />
                  <span className="sp-stat-val">
                    {dp.phone ? "✓" : "—"}
                  </span>
                  <span className="sp-stat-lbl">Phone</span>
                </div>
              </div>
            </aside>

            {/* ══ RIGHT CONTENT ══ */}
            <main className="sp-right">
              {/* Basic Information */}
              <Section icon={Building2} title="Institute Information">
                <div className="sp-fields">
                  <Field
                    icon={Building2}
                    label="Institute Name"
                    value={dp.institute_name}
                    editing={editing}
                    name="institute_name"
                    onChange={handleChange}
                    placeholder="Enter institute name"
                  />
                  <Field
                    icon={Mail}
                    label="Email"
                    value={dp.email || ""}
                    editing={editing}
                    name="email"
                    onChange={handleChange}
                    placeholder="Enter institute email"
                    disabled={true}
                  />
                  <Field
                    icon={Phone}
                    label="Phone Number"
                    value={dp.phone || ""}
                    editing={editing}
                    name="phone"
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <Separator className="sp-sep" />

                {/* Address */}
                <div className="sp-fields">
                  <Field
                    icon={MapPin}
                    label="Address"
                    value={dp.address || ""}
                    editing={editing}
                    name="address"
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                  <Field
                    icon={MapPin}
                    label="City"
                    value={dp.city || ""}
                    editing={editing}
                    name="city"
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                  <Field
                    icon={MapPin}
                    label="State"
                    value={dp.state || ""}
                    editing={editing}
                    name="state"
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                  <Field
                    icon={Globe}
                    label="Country"
                    value={dp.country || ""}
                    editing={editing}
                    name="country"
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </div>
              </Section>

              {/* Logo Upload Section */}
              <Section icon={ImageIcon} title="Institute Logo">
                <div className="sp-field">
                  <p className="sp-field-label">
                    <Upload size={11} className="sp-field-icon" />
                    Upload Logo
                  </p>
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="sp-btn-edit"
                      style={{ whiteSpace: "nowrap" }}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={13} className="mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={isUploading}
                    />
                    <span className="text-xs text-gray-400">
                      Max 5MB (JPEG, PNG, GIF, WEBP, SVG)
                    </span>
                  </div>
                  {dp.logo_url && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Logo uploaded successfully
                    </p>
                  )}
                </div>
              </Section>

              {/* Courses Section */}
              <Section icon={GraduationCap} title="Courses Provided" accent>
                <div>
                  <p className="sp-field-label" style={{ marginBottom: 8 }}>
                    <BookMarked size={11} className="sp-field-icon" /> Manage
                    Courses
                  </p>

                  {editing ? (
                    <>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newCourse}
                          onChange={(e) => setNewCourse(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCourse();
                            }
                          }}
                          placeholder="Enter course name (e.g., MCA)"
                          className="sp-input flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addCourse}
                          className="sp-btn-edit"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <Plus size={13} /> Add
                        </Button>
                      </div>
                    </>
                  ) : null}

                  <div className="sp-skills-wrap">
                    {courses.length === 0 && !editing && (
                      <span className="sp-empty">No courses added yet.</span>
                    )}
                    {courses.map((course) => (
                      <span key={course} className="sp-skill">
                        <GraduationCap size={12} style={{ marginRight: 4 }} />
                        {course}
                        {editing && (
                          <button
                            className="sp-skill-rm"
                            onClick={() => removeCourse(course)}
                          >
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                    {editing && courses.length === 0 && (
                      <span className="sp-empty">
                        Add your first course above.
                      </span>
                    )}
                  </div>

                  {editing && (
                    <p className="text-xs text-gray-400 mt-2">
                      Press Enter or click Add to add a course.
                    </p>
                  )}
                </div>
              </Section>

              {/* Sticky save bar */}
              {editing && (
                <div className="sp-save-bar">
                  <p className="sp-save-hint">
                    <Check size={13} /> Unsaved changes
                  </p>
                  <div className="sp-actions">
                    <button
                      className="sp-btn-cancel"
                      onClick={cancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      className="sp-btn-save"
                      onClick={saveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Check size={13} /> Save Changes
                        </>
                      )}
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