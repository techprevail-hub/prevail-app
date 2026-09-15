// app/dashboard/seeker/placement/page.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  Save,
  User,
  XCircle,
  Award,
  TrendingUp,
  Sparkles,
  GraduationCap,
  BadgeCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

import {
  getStudentPlacement,
  saveStudentPlacement,
  updateStudentPlacement,
} from "@/services/student_placement.service";

import type {
  PlacementStatus,
  PlacementType,
  PlacementRecord,
  StudentPlacementData,
} from "@/types/student_Placement";

// ─── Status Badge Component ──────────────────────────────────────────────────

function PlacementStatusBadge({ status }: { status: string }) {
  const configs = {
    placed: {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
      label: "Placed",
    },
    not_placed: {
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      label: "Not Placed",
    },
  };

  const config =
    configs[status as keyof typeof configs] || configs.not_placed;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} border-0 px-3 py-1.5 font-medium flex items-center gap-1.5 rounded-xl`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}

// ─── Placement Type Badge ────────────────────────────────────────────────────

function PlacementTypeBadge({ type }: { type: string | null }) {
  if (!type) return null;

  const configs = {
    campus: {
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Building2,
      label: "Campus",
    },
    off_campus: {
      className: "bg-purple-50 text-purple-700 border-purple-200",
      icon: MapPin,
      label: "Off-Campus",
    },
  };

  const config = configs[type as keyof typeof configs] || configs.campus;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} border-0 px-2.5 py-1 font-medium flex items-center gap-1 rounded-lg text-xs`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ─── Info Card Component ────────────────────────────────────────────────────

function InfoCard({ icon: Icon, label, value, className = "" }: any) {
  return (
    <div
      className={`group flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="rounded-lg bg-indigo-50 p-2 group-hover:bg-indigo-100 transition-colors duration-200">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

// ─── Info Card Skeleton ─────────────────────────────────────────────────────

function InfoCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SeekerPlacementPage() {
  // Guard to prevent duplicate GET API calls in React Strict Mode
  const hasFetchedPlacement = useRef(false);

  const [placementData, setPlacementData] =
    useState<StudentPlacementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state — only editable fields (studentName, course, branch are read-only)
  const [formData, setFormData] = useState({
    placementStatus: "" as PlacementStatus | "",
    placementType: "" as PlacementType | "",
    companyName: "",
    jobRole: "",
    package: "",
    placementDate: "",
  });

  // ─── GET: Fetch placement data ────────────────────────────────────────────
  const fetchPlacement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching student placement...");

      const response = await getStudentPlacement();

      console.log(
        "Fetched student placement response:",
        response
      );

      if (!response || response.success !== true) {
        throw new Error(
          response?.message ||
            "Failed to fetch placement data."
        );
      }

      if (!response.data) {
        throw new Error(
          "Placement data was not returned by the server."
        );
      }

      console.log(
        "Placement data:",
        response.data
      );

      setPlacementData(response.data);

      if (response.data.placement) {
        const placement =
          response.data.placement;

        setFormData({
          placementStatus:
            placement.placement_status || "",

          placementType:
            placement.placement_type || "",

          companyName:
            placement.company_name || "",

          jobRole:
            placement.job_role || "",

          package:
            placement.package !== null &&
            placement.package !== undefined
              ? String(placement.package)
              : "",

          placementDate:
            placement.placement_date
              ? placement.placement_date.substring(0, 10)
              : "",
        });
      } else {
        setFormData({
          placementStatus: "",
          placementType: "",
          companyName: "",
          jobRole: "",
          package: "",
          placementDate: "",
        });
      }

      console.log(
        "Student placement loaded successfully:",
        {
          studentId: response.data.studentId,
          studentName: response.data.studentName,
          course: response.data.course,
          branch: response.data.branch,
          instituteId: response.data.instituteId,
          invitationId: response.data.invitationId,
          placement: response.data.placement,
          submitted: response.data.submitted,
        }
      );

      toast.success(
        "Placement data loaded successfully"
      );
    } catch (err: any) {
      console.error(
        "Failed to fetch placement:",
        err
      );

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch placement data.";

      setPlacementData(null);
      setError(errorMessage);

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent duplicate GET API call in React Strict Mode (dev only)
    if (hasFetchedPlacement.current) return;

    hasFetchedPlacement.current = true;
    fetchPlacement();
  }, [fetchPlacement]);

  // ─── Form Handlers ────────────────────────────────────────────────────────
  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // If student selects "Not Placed",
      // clear all placement-specific fields.
      if (
        field === "placementStatus" &&
        value === "not_placed"
      ) {
        return {
          ...updated,
          placementType: "",
          companyName: "",
          jobRole: "",
          package: "",
          placementDate: "",
        };
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    // Placement status validation
    if (!formData.placementStatus) {
      toast.error("Please select your placement status");
      return;
    }

    // Additional validation only for placed students
    if (formData.placementStatus === "placed") {
      if (!formData.placementType) {
        toast.error("Please select placement type");
        return;
      }

      if (!formData.companyName.trim()) {
        toast.error("Please enter the company name");
        return;
      }

      if (!formData.jobRole.trim()) {
        toast.error("Please enter your job role");
        return;
      }

      if (!formData.package) {
        toast.error("Please enter your package");
        return;
      }

      if (!formData.placementDate) {
        toast.error("Please select placement date");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        placementStatus:
          formData.placementStatus as PlacementStatus,

        ...(formData.placementStatus === "placed" && {
          placementType:
            formData.placementType as PlacementType,

          companyName:
            formData.companyName.trim(),

          jobRole:
            formData.jobRole.trim(),

          package:
            parseFloat(formData.package),

          placementDate:
            formData.placementDate,
        }),
      };

      let response;

      if (placementData?.placement) {
        response = await updateStudentPlacement(payload);
      } else {
        response = await saveStudentPlacement(payload);
      }

      console.log(
        "Save placement response:",
        response
      );

      if (response?.success === true) {
        toast.success(
          placementData?.placement
            ? "Placement details updated successfully!"
            : "Placement details submitted successfully!"
        );

        setIsEditing(false);

        await fetchPlacement();
      } else {
        toast.error(
          response?.message ||
            "Failed to save placement details"
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to save placement:",
        err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save placement details"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);

    if (placementData?.placement) {
      const placement = placementData.placement;

      setFormData({
        placementStatus:
          placement.placement_status || "",

        placementType:
          placement.placement_type || "",

        companyName:
          placement.company_name || "",

        jobRole:
          placement.job_role || "",

        package:
          placement.package !== null &&
          placement.package !== undefined
            ? String(placement.package)
            : "",

        placementDate:
          placement.placement_date
            ? placement.placement_date.substring(0, 10)
            : "",
      });

      return;
    }

    setFormData({
      placementStatus: "",
      placementType: "",
      companyName: "",
      jobRole: "",
      package: "",
      placementDate: "",
    });
  };

  // ─── Derived Values ───────────────────────────────────────────────────────
  const placement = placementData?.placement;
  const hasPlacement = !!placement;

  const placementProgress =
    placement?.placement_status === "placed"
      ? 100
      : placement?.placement_status === "not_placed"
        ? 50
        : 0;

  // ─── Render (Always Visible) ──────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Placement Details
            </h1>
            <Sparkles className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your placement information and status
          </p>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <Edit className="h-3.5 w-3.5" />
              {hasPlacement ? "Edit" : "Add Placement"}
            </Button>
          </div>
        )}
      </motion.div>

      {/* ─── Status Card ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-3">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Placement Status
                  </p>
                  {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-6 w-24 rounded-xl" />
                      <Skeleton className="h-6 w-24 rounded-xl" />
                    </div>
                  ) : placement ? (
                    <div className="flex items-center gap-3 mt-1">
                      <PlacementStatusBadge
                        status={placement.placement_status}
                      />
                      {placement.placement_type && (
                        <PlacementTypeBadge type={placement.placement_type} />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-600 mt-1">
                      Not submitted yet
                    </p>
                  )}
                </div>
              </div>
              {!loading && placement && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Last updated</p>
                  <p className="text-xs font-medium text-slate-700">
                    {new Date(placement.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Edit Form / View Mode ────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ─── Placement Details ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-600" />
                    Placement Details
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    {isEditing
                      ? "Update your placement information"
                      : "Your placement information"}
                  </CardDescription>
                </div>
                {!isEditing && !loading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setIsEditing(true)}
                    title="Edit placement"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Student Information (read-only) */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Student Name
                      </Label>
                      <Input
                        value={placementData?.studentName || ""}
                        readOnly
                        disabled
                        placeholder="Student name"
                        className="h-10 bg-slate-50 text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Course
                      </Label>
                      <Input
                        value={placementData?.course || ""}
                        readOnly
                        disabled
                        placeholder="Course"
                        className="h-10 bg-slate-50 text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700">
                        Branch
                      </Label>
                      <Input
                        value={placementData?.branch || ""}
                        readOnly
                        disabled
                        placeholder="Branch"
                        className="h-10 bg-slate-50 text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Placement Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Placement Status *
                    </Label>
                    <Select
                      value={formData.placementStatus}
                      onValueChange={(value) =>
                        handleInputChange("placementStatus", value)
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select placement status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placed">Placed</SelectItem>
                        <SelectItem value="not_placed">Not Placed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.placementStatus === "placed" && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Placement Type *
                        </Label>
                        <Select
                          value={formData.placementType}
                          onValueChange={(value) =>
                            handleInputChange("placementType", value)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select placement type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="campus">
                              Campus Placement
                            </SelectItem>
                            <SelectItem value="off_campus">
                              Off-Campus Placement
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Company Name *
                        </Label>
                        <Input
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleInputChange("companyName", e.target.value)
                          }
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Job Role *
                        </Label>
                        <Input
                          placeholder="Enter job role"
                          value={formData.jobRole}
                          onChange={(e) =>
                            handleInputChange("jobRole", e.target.value)
                          }
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Package (LPA) *
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter package in LPA"
                          value={formData.package}
                          onChange={(e) =>
                            handleInputChange("package", e.target.value)
                          }
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Placement Date *
                        </Label>
                        <Input
                          type="date"
                          value={formData.placementDate}
                          onChange={(e) =>
                            handleInputChange("placementDate", e.target.value)
                          }
                          className="h-10"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
                    >
                      {saving ? (
                        <>
                          <Save className="h-4 w-4 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {hasPlacement ? "Update Changes" : "Save Changes"}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                      className="border-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : loading ? (
                <div className="space-y-3">
                  <InfoCardSkeleton />
                  <InfoCardSkeleton />
                  <InfoCardSkeleton />
                  <InfoCardSkeleton />
                  <InfoCardSkeleton />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-destructive/10 p-4 mb-3">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    Failed to Load
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {error}
                  </p>
                </div>
              ) : placement ? (
                <div className="space-y-3">
                  <InfoCard
                    icon={User}
                    label="Student Name"
                    value={placementData?.studentName}
                  />

                  <InfoCard
                    icon={GraduationCap}
                    label="Course"
                    value={placementData?.course}
                  />

                  <InfoCard
                    icon={Briefcase}
                    label="Branch"
                    value={placementData?.branch}
                  />

                  {placement.company_name && (
                    <InfoCard
                      icon={Building2}
                      label="Company"
                      value={placement.company_name}
                    />
                  )}

                  {placement.job_role && (
                    <InfoCard
                      icon={Briefcase}
                      label="Job Role"
                      value={placement.job_role}
                    />
                  )}

                  {placement.package !== null &&
                    placement.package !== undefined && (
                      <InfoCard
                        icon={DollarSign}
                        label="Package"
                        value={`₹${placement.package} LPA`}
                      />
                    )}

                  {placement.placement_date && (
                    <InfoCard
                      icon={Calendar}
                      label="Placement Date"
                      value={new Date(
                        placement.placement_date
                      ).toLocaleDateString()}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-gradient-to-br from-slate-100 to-slate-50 p-4 mb-3">
                    <Briefcase className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    No Placement Data
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    You haven&apos;t submitted your placement details yet.
                    Click &quot;Add Placement&quot; to get started.
                  </p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
                  >
                    <Edit className="h-4 w-4" />
                    Add Placement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Summary Card ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-600" />
                Placement Summary
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Overview of your placement status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Current Status */}
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    Current Status
                  </p>
                  <div className="mt-1.5">
                    {loading ? (
                      <Skeleton className="h-6 w-28 rounded-xl" />
                    ) : placement ? (
                      <PlacementStatusBadge
                        status={placement.placement_status}
                      />
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">
                        Not submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white p-4 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs text-emerald-600 font-medium">
                        Status
                      </p>
                    </div>
                    <p className="text-lg font-bold text-emerald-700 mt-1">
                      {loading
                        ? "..."
                        : placement?.placement_status === "placed"
                          ? "Placed"
                          : placement?.placement_status === "not_placed"
                            ? "Not Placed"
                            : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white p-4 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium">
                        Progress
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-700 mt-1">
                      {loading ? "..." : `${placementProgress}%`}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 font-medium">
                      Profile Completion
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {loading ? "..." : `${placementProgress}%`}
                    </p>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    {loading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${placementProgress}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] rounded-full"
                      />
                    )}
                  </div>
                </div>

                {/* Tips / Messages */}
                {!loading && !placement && (
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white p-4 border border-amber-100">
                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Quick Tip
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Please fill in your placement details to help us track
                      your career progress.
                    </p>
                  </div>
                )}

                {!loading &&
                  placement &&
                  placement.placement_status === "placed" && (
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white p-4 border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Congratulations!
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        You&apos;ve been placed! Keep updating your profile for
                        better opportunities.
                      </p>
                    </div>
                  )}

                {!loading &&
                  placement &&
                  placement.placement_status === "not_placed" && (
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white p-4 border border-blue-100">
                      <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Keep Trying!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Don&apos;t give up! Keep applying and improving your
                        skills. Update your resume and LinkedIn profile.
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}