"use client";

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, ElementType, ReactNode } from "react";
import {
  UserRound,
  Mail,
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
  Camera,
  Plus,
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

// ---------------- types & constants ----------------

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

const SAVEABLE_FIELDS: EditableField[] = [
  "headline",
  "bio",
  "specialization",
  "experience_years",
  "qualifications",
  "languages",
  "linkedin_url",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// ---------------- helpers ----------------

const getInitials = (name: string) =>
  name?.trim()
    ? name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

function getStoredUser() {
  if (typeof window === "undefined") {
    return { name: "", email: "" };
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user) {
      return {
        name: user.name || user.userName || user.user_name || "",
        email: user.email || user.userEmail || user.user_email || "",
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
    profile_image_url:
      data?.profile_image_url || fallback.profile_image_url || "",
    headline: data?.headline || "",
    bio: data?.bio || "",
    specialization: data?.specialization || "",
    experience_years: Number(data?.experience_years) || 0,
    qualifications: data?.qualifications || "",
    languages: Array.isArray(data?.languages) ? data.languages : [],
    linkedin_url: data?.linkedin_url || "",
    created_at: data?.created_at || "",
    updated_at: data?.updated_at || "",
  };
}

function profileCompletion(p: CoachProfile) {
  const checks = [
    p.profile_image_url,
    p.headline,
    p.bio,
    p.specialization,
    p.qualifications,
  ].map((v) => !!v?.trim());

  checks.push(p.experience_years > 0, p.languages.length > 0);

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );
}

// ---------------- reusable components ----------------

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
}: {
  icon: ElementType;
  label: string;
  value: string;
  editing: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}) {
  const shared = {
    value,
    placeholder: placeholder || label,
    onChange: (
      e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
    ) => onChange?.(e.target.value),
    className: "sp-input",
  };

  return (
    <div className="sp-field">
      <Label className="sp-field-label">
        <Icon size={11} className="sp-field-icon" />
        {label}
      </Label>

      {editing && onChange ? (
        multiline ? (
          <Textarea
            {...shared}
            className="sp-input min-h-28 resize-y"
          />
        ) : (
          <Input
            type={type}
            min={type === "number" ? 0 : undefined}
            {...shared}
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

// ---------------- page ----------------

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

  // Selected image is uploaded only when Save Changes is clicked
  // if the user is currently editing the profile.
  const [selectedProfileImageFile, setSelectedProfileImageFile] =
    useState<File | null>(null);

  // Temporary browser preview URL.
  const [previewImageUrl, setPreviewImageUrl] =
    useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalProfileRef = useRef<CoachProfile>(EMPTY_PROFILE);
  const hasFetchedProfile = useRef(false);

  // ---------- fetch / create ----------

  useEffect(() => {
    if (hasFetchedProfile.current) return;

    hasFetchedProfile.current = true;
    void fetchCoachProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release temporary preview URL when component unmounts.
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const clearSelectedImage = () => {
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }

    setPreviewImageUrl(null);
    setSelectedProfileImageFile(null);
  };

  const applyProfile = (data: CoachProfile) => {
    const normalized = normalizeProfile(data);

    setProfile(normalized);
    setDraft(normalized);

    originalProfileRef.current = structuredClone(normalized);

    setHasChanges(false);
    setImageError(false);
  };

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

    applyProfile(
      normalizeProfile(response.data || fallback, fallback)
    );
  };

  const fetchCoachProfile = async () => {
    setIsLoading(true);

    const fallback = normalizeProfile({
      ...EMPTY_PROFILE,
      ...getStoredUser(),
    });

    try {
      const response = await api.get(
        "/api/role-coach/profile/me"
      );

      if (response?.success && response?.data) {
        applyProfile(
          normalizeProfile(response.data, fallback)
        );
        return;
      }

      if (response?.success || response?.status === 404) {
        await createProfile(fallback);
        return;
      }

      throw new Error(
        response?.message || "Unable to load coach profile."
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "";

      const err = error as {
        response?: { status?: number };
        status?: number;
      };

      const status =
        err?.response?.status ?? err?.status;

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
        message || "Unable to load your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- field changes ----------

  const handleChange = <K extends EditableField>(
    key: K,
    value: CoachProfile[K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));

    setHasChanges(true);
  };

  const addLanguage = () => {
    const language = newLanguage.trim();

    if (!language) {
      return void toast.error("Please enter a language.");
    }

    if (
      draft.languages.some(
        (l) => l.toLowerCase() === language.toLowerCase()
      )
    ) {
      return void toast.error("Language already added.");
    }

    handleChange("languages", [
      ...draft.languages,
      language,
    ]);

    setNewLanguage("");
  };

  const removeLanguage = (language: string) => {
    handleChange(
      "languages",
      draft.languages.filter((l) => l !== language)
    );
  };

  // ---------- profile image selection ----------

  const openFilePicker = () => {
    if (isSaving) return;
    fileInputRef.current?.click();
  };

  // Upload immediately when the user is NOT in edit mode.
  const uploadProfileImageImmediately = async (
    file: File,
    objectUrl: string
  ) => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.put(
        "/api/role-coach/profile/update",
        formData
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to update profile photo."
        );
      }

      // Prefer the updated profile returned by the update API.
      let responseProfile =
        response?.data?.profile ||
        response?.data?.coachProfile ||
        response?.data ||
        {};

      let imageUrl = responseProfile?.profile_image_url;

      // If the update endpoint returns only a success message,
      // fetch the latest profile to get the saved image URL.
      if (!imageUrl) {
        const refreshedResponse = await api.get(
          "/api/role-coach/profile/me"
        );

        if (refreshedResponse?.success && refreshedResponse?.data) {
          responseProfile =
            refreshedResponse.data.profile ||
            refreshedResponse.data.coachProfile ||
            refreshedResponse.data;

          imageUrl = responseProfile?.profile_image_url;
        }
      }

      if (!imageUrl) {
        throw new Error(
          "Photo upload response did not include the updated profile image URL."
        );
      }

      const updatedProfile = normalizeProfile(
        {
          ...profile,
          ...responseProfile,
          profile_image_url: imageUrl,
        },
        profile
      );

      applyProfile(updatedProfile);

      URL.revokeObjectURL(objectUrl);
      setPreviewImageUrl(null);
      setSelectedProfileImageFile(null);

      toast.success("Profile photo updated successfully.");
    } catch (error: unknown) {
      console.error("Error uploading profile photo:", error);

      URL.revokeObjectURL(objectUrl);
      setPreviewImageUrl(null);
      setSelectedProfileImageFile(null);
      setImageError(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile photo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Allow selecting the same image again later.
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must not exceed 5 MB.");
      return;
    }

    // Remove previous temporary preview, if any.
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }

    // Show the selected photo immediately.
    const objectUrl = URL.createObjectURL(file);

    setSelectedProfileImageFile(file);
    setPreviewImageUrl(objectUrl);
    setImageError(false);
    setHasChanges(true);

    if (editing) {
      // During profile editing, upload the image together with
      // other changed fields when Save Changes is clicked.
      toast.success(
        "Photo selected. Click Save Changes to upload it."
      );
      return;
    }

    // Outside edit mode, update the profile photo immediately.
    void uploadProfileImageImmediately(file, objectUrl);
  };

  // ---------- save profile and image together ----------

  const saveProfile = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const original = originalProfileRef.current;

      // Check which profile fields have changed.
      const changedFields = SAVEABLE_FIELDS.filter(
        (field) =>
          JSON.stringify(draft[field]) !==
          JSON.stringify(original[field])
      );

      const hasProfileChanges = changedFields.length > 0;
      const hasImageChanges = !!selectedProfileImageFile;

      if (!hasProfileChanges && !hasImageChanges) {
        toast.info("No changes to save.");
        setEditing(false);
        setHasChanges(false);
        return;
      }

      // Use FormData because the request may contain an image.
      const formData = new FormData();

      // Append only changed profile fields.
      changedFields.forEach((field) => {
        const value = draft[field];

        if (field === "languages") {
          formData.append(
            "languages",
            JSON.stringify(value)
          );
        } else {
          formData.append(field, String(value ?? ""));
        }
      });

      // Multer backend expects the field name "image".
      if (selectedProfileImageFile) {
        formData.append(
          "image",
          selectedProfileImageFile
        );
      }

      const response = await api.put(
        "/api/role-coach/profile/update",
        formData
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update coach profile."
        );
      }

      // Preserve all draft fields if the API returns only
      // the updated fields.
      const updatedData = {
        ...draft,
        ...(response.data || {}),
        profile_image_url:
          response?.data?.profile_image_url ||
          (selectedProfileImageFile
            ? draft.profile_image_url
            : profile.profile_image_url),
      };

      const normalized = normalizeProfile(
        updatedData,
        draft
      );

      applyProfile(normalized);

      clearSelectedImage();

      setEditing(false);
      setHasChanges(false);
      setNewLanguage("");

      toast.success(
        hasImageChanges
          ? "Profile and photo updated successfully."
          : "Coach profile updated successfully."
      );
    } catch (error: unknown) {
      console.error(
        "Error updating coach profile:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update coach profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- cancel edit ----------

  const cancelEdit = () => {
    clearSelectedImage();

    setDraft(
      structuredClone(originalProfileRef.current)
    );

    setHasChanges(false);
    setNewLanguage("");
    setEditing(false);
    setImageError(false);
  };

  // ---------- loading ----------

  if (isLoading) {
    return (
      <div className="sp-root">
        <div className="sp-inner">
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-violet-100 border-t-[#6C5CE7]" />

            <p className="text-sm text-muted-foreground">
              Loading coach profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- display values ----------

  const displayed = editing ? draft : profile;
  const completion = profileCompletion(profile);

  const displayedImage =
    previewImageUrl || displayed.profile_image_url;

  const hasPhoto =
    !!displayedImage && !imageError;

  const stats = [
    {
      icon: BriefcaseBusiness,
      color: "text-[#6C5CE7]",
      value: displayed.experience_years,
      label: "Years Experience",
    },
    {
      icon: Languages,
      color: "text-emerald-600",
      value: displayed.languages.length,
      label: "Languages",
    },
    {
      icon: GraduationCap,
      color: "text-amber-600",
      value: displayed.qualifications ? "✓" : "—",
      label: "Qualifications",
    },
  ];

  return (
    <div className="sp-root">
      <div className="sp-blob sp-blob-1" />
      <div className="sp-blob sp-blob-2" />

      <div className="sp-inner">
        {/* Header */}

        <div className="sp-topbar">
          <div>
            <h1 className="sp-page-title">
              Coach Profile
            </h1>

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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleProfileImageUpload}
                  disabled={isSaving}
                  aria-label="Choose profile photo"
                />

                <div className="relative mx-auto w-fit">
                  <button
                    type="button"
                    className="sp-avatar-circle group relative block overflow-hidden rounded-full border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2"
                    onClick={openFilePicker}
                    disabled={isSaving}
                    aria-label="Change profile photo"
                    title="Change profile photo"
                  >
                    {hasPhoto ? (
                      <img
                        src={displayedImage}
                        alt={`${displayed.name || "Coach"} profile`}
                        className="h-full w-full rounded-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-violet-100 text-2xl font-semibold text-[#6C5CE7]">
                        {getInitials(displayed.name)}
                      </div>
                    )}

                    {/* Hover overlay */}

                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Camera size={19} />
                      Change photo
                    </span>
                  </button>

                  {/* Always-visible upload badge */}

                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={isSaving}
                    aria-label={
                      hasPhoto
                        ? "Change profile photo"
                        : "Add profile photo"
                    }
                    title={
                      hasPhoto ? "Change photo" : "Add photo"
                    }
                    className="absolute bottom-0 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#6C5CE7] text-white shadow-md ring-2 ring-white transition hover:scale-110 hover:bg-[#5b4bd6] disabled:opacity-80"
                  >
                    {!hasPhoto && !isSaving && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#6C5CE7]/40" />
                    )}

                    <span className="relative">
                      {isSaving ? (
                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : hasPhoto ? (
                        <Camera size={15} />
                      ) : (
                        <Plus size={18} strokeWidth={2.5} />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <p className="px-3 pt-2 text-center text-xs text-muted-foreground">
                {isSaving
                  ? "Saving your profile..."
                  : selectedProfileImageFile
                  ? editing
                    ? "Photo selected. Save changes to upload."
                    : "Uploading your new photo..."
                  : hasPhoto
                  ? "Click your photo to change it"
                  : "Add a profile photo so clients can recognize you"}

                <span className="mt-0.5 block text-[11px] opacity-80">
                  JPG, PNG, WEBP · Max 5 MB
                </span>
              </p>

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
              {stats.map(
                ({ icon: Icon, color, value, label }) => (
                  <div key={label} className="sp-stat">
                    <Icon size={14} className={color} />
                    <span className="sp-stat-val">
                      {value}
                    </span>
                    <span className="sp-stat-lbl">
                      {label}
                    </span>
                  </div>
                )
              )}
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
                  onChange={(v) =>
                    handleChange("headline", v)
                  }
                />

                <ProfileField
                  icon={Award}
                  label="Specialization"
                  value={displayed.specialization}
                  editing={editing}
                  placeholder="e.g. Web Development, Interview Preparation"
                  onChange={(v) =>
                    handleChange("specialization", v)
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
                onChange={(v) => handleChange("bio", v)}
              />
            </Section>

            <Section
              icon={GraduationCap}
              title="Experience & Qualifications"
            >
              <div className="sp-fields">
                <ProfileField
                  icon={Clock}
                  label="Years of Experience"
                  type="number"
                  placeholder="0"
                  value={
                    displayed.experience_years > 0
                      ? editing
                        ? String(displayed.experience_years)
                        : `${displayed.experience_years} years`
                      : ""
                  }
                  editing={editing}
                  onChange={(v) =>
                    handleChange(
                      "experience_years",
                      Math.max(
                        0,
                        Math.floor(Number(v) || 0)
                      )
                    )
                  }
                />

                <ProfileField
                  icon={GraduationCap}
                  label="Qualifications & Certifications"
                  value={displayed.qualifications}
                  editing={editing}
                  placeholder="e.g. MCA, AWS Certification"
                  onChange={(v) =>
                    handleChange("qualifications", v)
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
                    onChange={(e) =>
                      setNewLanguage(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
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
                          onClick={() =>
                            removeLanguage(language)
                          }
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
                onChange={(v) =>
                  handleChange("linkedin_url", v)
                }
              />

              {editing && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Add a professional LinkedIn URL so learners
                  can learn more about your background.
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