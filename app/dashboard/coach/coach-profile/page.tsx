
"use client";

import { useState, useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Globe,
  Pencil,
  Check,
  X,
  BadgeCheck,
  Award,
  BriefcaseBusiness,
  GraduationCap,
  User,
  Languages,
  FileText,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/utils/apiServices";
import "@/app/globals.css";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface CoachProfile {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  role?: string;
  profile_image_url: string;
  headline: string;
  bio: string;
  specialization: string;
  experience_years: number;
  qualifications: string;
  languages: string[];
  linkedin_url: string;
  created_at?: string;
  updated_at?: string;
}

type EditableField =
  | "profile_image_url"
  | "headline"
  | "bio"
  | "specialization"
  | "experience_years"
  | "qualifications"
  | "languages"
  | "linkedin_url";

const EMPTY_PROFILE: CoachProfile = {
  name: "",
  email: "",
  role: "coach",
  profile_image_url: "",
  headline: "",
  bio: "",
  specialization: "",
  experience_years: 0,
  qualifications: "",
  languages: [],
  linkedin_url: "",
};

const PROFILE_FIELDS: {
  key: EditableField;
  label: string;
  weight: number;
}[] = [
  { key: "profile_image_url", label: "Profile image", weight: 1 },
  { key: "headline", label: "Professional headline", weight: 1 },
  { key: "bio", label: "About you", weight: 1 },
  { key: "specialization", label: "Specialization", weight: 1 },
  { key: "experience_years", label: "Experience", weight: 1 },
  { key: "qualifications", label: "Qualifications", weight: 1 },
  { key: "languages", label: "Languages", weight: 1 },
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getInitials(name: string) {
  if (!name?.trim()) return "?";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStoredUser() {
  if (typeof window === "undefined") {
    return { name: "", email: "" };
  }

  try {
    const stored = localStorage.getItem("user");

    if (stored) {
      const user = JSON.parse(stored);

      return {
        name:
          user.name ||
          user.userName ||
          user.user_name ||
          "",
        email:
          user.email ||
          user.userEmail ||
          user.user_email ||
          "",
      };
    }
  } catch (error) {
    console.error("Error reading stored user:", error);
  }

  return {
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
  };
}

function normalizeProfile(
  data: Partial<CoachProfile> | null | undefined,
  fallback = EMPTY_PROFILE
): CoachProfile {
  return {
    id: data?.id || "",
    user_id: data?.user_id || "",
    name: data?.name || fallback.name || "",
    email: data?.email || fallback.email || "",
    role: data?.role || "coach",
    profile_image_url: data?.profile_image_url || "",
    headline: data?.headline || "",
    bio: data?.bio || "",
    specialization: data?.specialization || "",
    experience_years: Number(data?.experience_years) || 0,
    qualifications: data?.qualifications || "",
    languages: Array.isArray(data?.languages)
      ? data.languages
      : [],
    linkedin_url: data?.linkedin_url || "",
    created_at: data?.created_at || "",
    updated_at: data?.updated_at || "",
  };
}

function profileCompletion(profile: CoachProfile) {
  const completed = PROFILE_FIELDS.filter(({ key }) => {
    const value = profile[key];

    if (key === "experience_years") {
      return Number(value) > 0;
    }

    if (key === "languages") {
      return Array.isArray(value) && value.length > 0;
    }

    return typeof value === "string" && value.trim().length > 0;
  }).length;

  return Math.round((completed / PROFILE_FIELDS.length) * 100);
}

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="sp-section">
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

function ProfileField({
  icon: Icon,
  label,
  value,
  editing,
  onChange,
  placeholder,
  multiline = false,
  type = "text",
  disabled = false,
}: {
  icon: ElementType;
  label: string;
  value: string;
  editing: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="sp-field">
      <Label className="sp-field-label">
        <Icon size={11} className="sp-field-icon" />
        {label}
      </Label>

      {editing && !disabled ? (
        multiline ? (
          <Textarea
            value={value}
            placeholder={placeholder || label}
            onChange={(event) => onChange?.(event.target.value)}
            className="sp-input min-h-28 resize-y"
          />
        ) : (
          <Input
            type={type}
            value={value}
            placeholder={placeholder || label}
            onChange={(event) => onChange?.(event.target.value)}
            className="sp-input"
          />
        )
      ) : (
        <span className="sp-field-value break-words">
          {value || <em className="sp-empty">Not set</em>}
        </span>
      )}
    </div>
  );
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function CoachProfilePage() {
  const [profile, setProfile] =
    useState<CoachProfile>(EMPTY_PROFILE);

  const [draft, setDraft] =
    useState<CoachProfile>(EMPTY_PROFILE);

  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");

  const originalProfileRef = useRef<CoachProfile>(EMPTY_PROFILE);
  const hasFetchedProfile = useRef(false);

  // --------------------------------------------------
  // FETCH PROFILE
  // --------------------------------------------------

  useEffect(() => {
    if (hasFetchedProfile.current) return;

    hasFetchedProfile.current = true;
    void fetchCoachProfile();

    // Fetch only once for this mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyProfile = (data: CoachProfile) => {
    const normalized = normalizeProfile(data);

    setProfile(normalized);
    setDraft(normalized);
    originalProfileRef.current = structuredClone(normalized);
    setHasChanges(false);
    setImageError(false);
  };

  const fetchCoachProfile = async () => {
    setIsLoading(true);

    const storedUser = getStoredUser();

    const fallback = normalizeProfile({
      ...EMPTY_PROFILE,
      name: storedUser.name,
      email: storedUser.email,
    });

    try {
      let response = await api.get(
        "/api/role-coach/profile/me"
      );

      // A 404 means the profile hasn't been created yet.
      // Some API clients throw instead of returning 404;
      // that case is handled in catch below.
      if (response?.success && response?.data) {
        applyProfile(normalizeProfile(response.data, fallback));
        return;
      }

      if (response?.success && !response?.data) {
        await createProfile(fallback);
        return;
      }

      // If the API returns a regular unsuccessful response,
      // attempt profile creation only for an explicit not-found.
      if (response?.status === 404) {
        await createProfile(fallback);
        return;
      }

      throw new Error(
        response?.message || "Unable to load coach profile."
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "";

      // The current API wrapper may reject HTTP 404 requests.
      // Only attempt creation when the error indicates not found.
      const status = (
        error as { response?: { status?: number }; status?: number }
      )?.response?.status ?? (
        error as { status?: number }
      )?.status;

      if (
        status === 404 ||
        /profile not found/i.test(message)
      ) {
        try {
          await createProfile(fallback);
          return;
        } catch (createError) {
          console.error(
            "Unable to initialize coach profile:",
            createError
          );
        }
      }

      console.error("Error fetching coach profile:", error);

      applyProfile(fallback);

      toast.error(
        message ||
          "Unable to load your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // CREATE PROFILE
  // --------------------------------------------------

  const createProfile = async (fallback: CoachProfile) => {
    const response = await api.post(
      "/api/role-coach/profile/create",
      {}
    );

    if (!response?.success) {
      throw new Error(
        response?.message || "Unable to create coach profile."
      );
    }

    const data = normalizeProfile(
      response.data || fallback,
      fallback
    );

    applyProfile(data);
  };

  // --------------------------------------------------
  // FIELD CHANGES
  // --------------------------------------------------

  const handleChange = <K extends EditableField>(
    key: K,
    value: CoachProfile[K]
  ) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));

    setHasChanges(true);
  };

  const addLanguage = () => {
    const language = newLanguage.trim();

    if (!language) {
      toast.error("Please enter a language.");
      return;
    }

    if (
      draft.languages.some(
        (item) => item.toLowerCase() === language.toLowerCase()
      )
    ) {
      toast.error("Language already added.");
      return;
    }

    handleChange("languages", [...draft.languages, language]);
    setNewLanguage("");
  };

  const removeLanguage = (language: string) => {
    handleChange(
      "languages",
      draft.languages.filter((item) => item !== language)
    );
  };

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const saveProfile = async () => {
    try {
      setIsSaving(true);

      const original = originalProfileRef.current;
      const payload: Partial<
        Pick<CoachProfile, EditableField>
      > = {};

      const fields: EditableField[] = [
        "profile_image_url",
        "headline",
        "bio",
        "specialization",
        "experience_years",
        "qualifications",
        "languages",
        "linkedin_url",
      ];

      fields.forEach((field) => {
        if (
          JSON.stringify(draft[field]) !==
          JSON.stringify(original[field])
        ) {
          (payload as Record<string, unknown>)[field] =
            draft[field];
        }
      });

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save.");
        setEditing(false);
        return;
      }

      const response = await api.put(
        "/api/role-coach/profile/update",
        payload
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to update coach profile."
        );
      }

      const updatedProfile = normalizeProfile(
        response.data || { ...draft },
        draft
      );

      applyProfile(updatedProfile);
      setEditing(false);

      toast.success("Coach profile updated successfully.");
    } catch (error: unknown) {
      console.error("Error updating coach profile:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update coach profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------
  // CANCEL EDIT
  // --------------------------------------------------

  const cancelEdit = () => {
    const original = structuredClone(
      originalProfileRef.current
    );

    setDraft(original);
    setHasChanges(false);
    setNewLanguage("");
    setEditing(false);
    setImageError(false);
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="sp-root">
        <div className="sp-inner">
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
            <p className="text-sm text-muted-foreground">
              Loading coach profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DISPLAY VALUES
  // --------------------------------------------------

  const displayed = editing ? draft : profile;
  const completion = profileCompletion(profile);

  return (
    <div className="sp-root">
      <div className="sp-blob sp-blob-1" />
      <div className="sp-blob sp-blob-2" />

      <div className="sp-inner">
        {/* Header */}
        <div className="sp-topbar">
          <div>
            <h1 className="sp-page-title">Coach Profile</h1>
            <p className="sp-page-sub">
              {editing
                ? "Update your professional information and save your changes."
                : "Manage your professional profile and coaching expertise."}
            </p>
          </div>

          <div className="sp-actions">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <X size={14} />
                  Cancel
                </Button>

                <Button
                  onClick={saveProfile}
                  disabled={isSaving || !hasChanges}
                  className="gap-2"
                >
                  <Check size={14} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditing(true)}
                className="gap-2"
              >
                <Pencil size={14} />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="sp-grid">
          {/* LEFT SIDEBAR */}
          <aside className="sp-left">
            <Card className="sp-avatar-card">
              <div className="sp-avatar-banner" />

              <div className="sp-avatar-wrap">
                <div className="sp-avatar-circle">
                  {displayed.profile_image_url && !imageError ? (
                    <img
                      src={displayed.profile_image_url}
                      alt={`${displayed.name || "Coach"} profile`}
                      className="h-full w-full rounded-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
                      {getInitials(displayed.name)}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pb-5 text-center">
                <h2 className="sp-avatar-name">
                  {displayed.name || "Coach Name"}
                </h2>

                <p className="sp-avatar-role">
                  Professional Coach
                </p>

                <p className="sp-avatar-loc justify-center">
                  <Mail size={11} />
                  <span className="break-all">
                    {displayed.email || "Email not available"}
                  </span>
                </p>

                {displayed.specialization && (
                  <p className="sp-avatar-loc justify-center mt-2">
                    <Sparkles size={11} />
                    <span>{displayed.specialization}</span>
                  </p>
                )}
              </div>
            </Card>

            {/* Profile strength */}
            <Card className="sp-completion">
              <div className="sp-completion-head">
                <BadgeCheck size={14} />
                Profile Strength
              </div>

              <div className="sp-bar-track">
                <div
                  className="sp-bar-fill"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <div className="sp-completion-foot">
                <span className="sp-completion-pct">
                  {completion}%
                </span>
                <span className="sp-completion-lbl">
                  {completion === 100
                    ? "Excellent!"
                    : completion >= 60
                    ? "Looking good"
                    : "Keep going"}
                </span>
              </div>
            </Card>

            {/* Quick stats */}
            <Card className="sp-stats">
              <div className="sp-stat">
                <BriefcaseBusiness
                  size={14}
                  className="text-indigo-600"
                />
                <span className="sp-stat-val">
                  {displayed.experience_years}
                </span>
                <span className="sp-stat-lbl">
                  Years Experience
                </span>
              </div>

              <div className="sp-stat">
                <Languages
                  size={14}
                  className="text-emerald-600"
                />
                <span className="sp-stat-val">
                  {displayed.languages.length}
                </span>
                <span className="sp-stat-lbl">Languages</span>
              </div>

              <div className="sp-stat">
                <GraduationCap
                  size={14}
                  className="text-amber-600"
                />
                <span className="sp-stat-val">
                  {displayed.qualifications ? "✓" : "—"}
                </span>
                <span className="sp-stat-lbl">
                  Qualifications
                </span>
              </div>
            </Card>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="sp-right">
            <Section
              icon={UserRound}
              title="Basic Information"
            >
              <div className="sp-fields">
                <ProfileField
                  icon={UserRound}
                  label="Full Name"
                  value={displayed.name}
                  editing={false}
                />

                <ProfileField
                  icon={Mail}
                  label="Email Address"
                  value={displayed.email}
                  editing={false}
                />

                <ProfileField
                  icon={BriefcaseBusiness}
                  label="Professional Headline"
                  value={displayed.headline}
                  editing={editing}
                  placeholder="e.g. Full Stack Developer & Career Coach"
                  onChange={(value) =>
                    handleChange("headline", value)
                  }
                />

                <ProfileField
                  icon={Award}
                  label="Specialization"
                  value={displayed.specialization}
                  editing={editing}
                  placeholder="e.g. Web Development, Interview Preparation"
                  onChange={(value) =>
                    handleChange("specialization", value)
                  }
                />
              </div>

              <Separator className="sp-sep" />

              <ProfileField
                icon={FileText}
                label="About Me"
                value={displayed.bio}
                editing={editing}
                multiline
                placeholder="Describe your coaching experience, expertise, and how you help learners."
                onChange={(value) => handleChange("bio", value)}
              />
            </Section>

            <Section
              icon={GraduationCap}
              title="Experience & Qualifications"
            >
              <div className="sp-fields">
                <div className="sp-field">
                  <Label className="sp-field-label">
                    <Clock size={11} className="sp-field-icon" />
                    Years of Experience
                  </Label>

                  {editing ? (
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={String(displayed.experience_years)}
                      className="sp-input"
                      onChange={(event) => {
                        const value = event.target.value;

                        if (value === "") {
                          handleChange("experience_years", 0);
                          return;
                        }

                        handleChange(
                          "experience_years",
                          Math.max(0, Math.floor(Number(value) || 0))
                        );
                      }}
                    />
                  ) : (
                    <span className="sp-field-value">
                      {displayed.experience_years > 0
                        ? `${displayed.experience_years} years`
                        : <em className="sp-empty">Not set</em>}
                    </span>
                  )}
                </div>

                <ProfileField
                  icon={GraduationCap}
                  label="Qualifications & Certifications"
                  value={displayed.qualifications}
                  editing={editing}
                  placeholder="e.g. MCA, AWS Certification"
                  onChange={(value) =>
                    handleChange("qualifications", value)
                  }
                />
              </div>
            </Section>

            <Section
              icon={Languages}
              title="Languages"
            >
              {editing && (
                <div className="mb-4 flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(event) =>
                      setNewLanguage(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addLanguage();
                      }
                    }}
                    placeholder="Enter a language (e.g. English)"
                    className="sp-input flex-1"
                    disabled={isSaving}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLanguage}
                    disabled={isSaving}
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="sp-skills-wrap">
                {displayed.languages.length === 0 ? (
                  <span className="sp-empty">
                    No languages added yet.
                  </span>
                ) : (
                  displayed.languages.map((language) => (
                    <span
                      key={language}
                      className="sp-skill"
                    >
                      <Globe
                        size={12}
                        className="mr-1"
                      />
                      {language}

                      {editing && (
                        <button
                          type="button"
                          className="sp-skill-rm"
                          onClick={() => removeLanguage(language)}
                          aria-label={`Remove ${language}`}
                          disabled={isSaving}
                        >
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </Section>

            <Section
              icon={Globe}
              title="Professional Links"
            >
              <ProfileField
                icon={User}
                label="LinkedIn Profile URL"
                value={displayed.linkedin_url}
                editing={editing}
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                onChange={(value) =>
                  handleChange("linkedin_url", value)
                }
              />

              {editing && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Add a professional LinkedIn URL so learners can
                  learn more about your background.
                </p>
              )}
            </Section>

            <Card className="sp-section">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Profile privacy
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your account name and email come from your
                    platform account. Only your coach profile
                    fields can be edited on this page.
                  </p>
                </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
