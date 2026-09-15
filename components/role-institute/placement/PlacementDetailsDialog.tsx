// components/role-institute/placement/PlacementDetailsDialog.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Check,
  ChevronsUpDown,
  Clock,
  DollarSign,
  Edit,
  GraduationCap,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  User,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  getInstituteStudentPlacement,
  getInstituteStudentInvitations,
  saveInstitutePlacement,
  updateInstitutePlacement,
  type StudentInvitation,
} from "@/services/institute_placement.service";

import type {
  PlacementStatus,
  PlacementType,
  InstituteStudentPlacementData,
} from "@/types/institute_Placement";

// ─── Status Badge ────────────────────────────────────────────────────────────

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

// ─── Info Card (wraps long values) ───────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: any;
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 ${className}`}
    >
      <div className="rounded-lg bg-indigo-50 p-2 shrink-0">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-words">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PlacementDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string;
  /** "view" → read-only first; "edit" → straight to edit form; "add" → create new. */
  mode?: "view" | "add" | "edit";
  onUpdated?: () => void;
}

// ─── Main Dialog Component ───────────────────────────────────────────────────

export default function PlacementDetailsDialog({
  open,
  onOpenChange,
  studentId = "",
  mode = "view",
  onUpdated,
}: PlacementDetailsDialogProps) {
  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";

  const [placementData, setPlacementData] =
    useState<InstituteStudentPlacementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Start in edit state for BOTH "add" and "edit" modes.
  const [isEditing, setIsEditing] = useState(isAddMode || isEditMode);

  // ─── Student picker state (add mode) ──────────────────────────────────────
  const [students, setStudents] = useState<StudentInvitation[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    course: "",
    branch: "",
    placementStatus: "" as PlacementStatus | "",
    placementType: "" as PlacementType | "",
    companyName: "",
    jobRole: "",
    package: "",
    placementDate: "",
  });

  // ─── Load student placement (view + edit modes only) ──────────────────────
  const loadStudentPlacement = useCallback(async () => {
    if (isAddMode) return;
    if (!studentId) return;

    try {
      setLoading(true);

      const response = await getInstituteStudentPlacement(studentId);

      if (response && response.success === true && response.data) {
        setPlacementData(response.data);

        const placement = response.data.placement;

        setFormData({
          studentId,
          studentName:
            response.data.studentName ||
            placement?.student_name ||
            "",
          course:
            response.data.course || placement?.course || "",
          branch:
            response.data.branch || placement?.branch || "",
          placementStatus: placement?.placement_status || "",
          placementType: placement?.placement_type || "",
          companyName: placement?.company_name || "",
          jobRole: placement?.job_role || "",
          package:
            placement?.package !== null &&
            placement?.package !== undefined
              ? String(placement.package)
              : "",
          placementDate: placement?.placement_date
            ? placement.placement_date.substring(0, 10)
            : "",
        });
      } else {
        setPlacementData(null);
      }
    } catch (error) {
      console.error("Failed to fetch student placement:", error);
      toast.error("Failed to fetch student placement data");
    } finally {
      setLoading(false);
    }
  }, [studentId, isAddMode]);

  useEffect(() => {
    if (!open) return;
    if (isAddMode) return;
    if (!studentId) return;

    loadStudentPlacement();
  }, [open, studentId, isAddMode, loadStudentPlacement]);

  // ─── Load student invitations (add mode — on first picker open) ───────────
  const loadStudents = useCallback(async () => {
    if (studentsLoaded || studentsLoading) return;

    try {
      setStudentsLoading(true);

      const response = await getInstituteStudentInvitations();

      const list: StudentInvitation[] = Array.isArray(response)
        ? response
        : response?.data ?? [];

      setStudents(list);
      setStudentsLoaded(true);
    } catch (error) {
      console.error(
        "Failed to fetch student invitations:",
        error
      );
      toast.error("Failed to load student list");
    } finally {
      setStudentsLoading(false);
    }
  }, [studentsLoaded, studentsLoading]);

  useEffect(() => {
    if (isAddMode && open && pickerOpen && !studentsLoaded) {
      loadStudents();
    }
  }, [isAddMode, open, pickerOpen, studentsLoaded, loadStudents]);

  // ─── Reset state when dialog closes / reopens ─────────────────────────────
  useEffect(() => {
    if (!open) {
      setPlacementData(null);
      setIsEditing(mode === "add" || mode === "edit");
      setPickerOpen(false);
      setFormData({
        studentId: "",
        studentName: "",
        course: "",
        branch: "",
        placementStatus: "",
        placementType: "",
        companyName: "",
        jobRole: "",
        package: "",
        placementDate: "",
      });
    } else if (mode === "add" || mode === "edit") {
      setIsEditing(true);
    }
  }, [open, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Pick a student from the combobox ─────────────────────────────────────
  const handleSelectStudent = (s: StudentInvitation) => {
    setFormData((prev) => ({
      ...prev,
      studentId: s.student_id,
      studentName: s.student_name,
      course: prev.course || s.course || "",
      branch: prev.branch || s.branch || "",
    }));
    setPickerOpen(false);
  };

  const handleSubmit = async () => {
    const effectiveStudentId = isAddMode
      ? formData.studentId.trim()
      : studentId;

    if (!effectiveStudentId) {
      toast.error("Please select a student");
      return;
    }

    if (!formData.studentName.trim()) {
      toast.error("Student name is missing");
      return;
    }

    if (!formData.placementStatus) {
      toast.error("Please select the placement status");
      return;
    }

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
        toast.error("Please enter the job role");
        return;
      }
      if (!formData.package) {
        toast.error("Please enter the package");
        return;
      }
      if (!formData.placementDate) {
        toast.error("Please select the placement date");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        studentId: effectiveStudentId,
        studentName: formData.studentName || undefined,
        course: formData.course || undefined,
        branch: formData.branch || undefined,
        placementStatus: formData.placementStatus as PlacementStatus,
        placementType: formData.placementType
          ? (formData.placementType as PlacementType)
          : undefined,
        companyName: formData.companyName || undefined,
        jobRole: formData.jobRole || undefined,
        package: formData.package || undefined,
        placementDate: formData.placementDate || undefined,
      };

      let response;

      if (isAddMode || !placementData?.placement) {
        response = await saveInstitutePlacement(payload);
      } else {
        response = await updateInstitutePlacement(payload);
      }

      if (response && response.success === true) {
        toast.success(
          isAddMode
            ? "Placement added successfully!"
            : "Placement details saved successfully!"
        );

        await onUpdated?.();
        onOpenChange(false);
      } else {
        toast.error(
          response?.message || "Failed to save placement details"
        );
      }
    } catch (err: any) {
      console.error("Failed to save placement:", err);
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
    // In add/edit mode, Cancel closes the dialog entirely.
    if (isAddMode || isEditMode) {
      onOpenChange(false);
      return;
    }

    // In view mode, Cancel returns to the read-only view.
    setIsEditing(false);

    const placement = placementData?.placement;

    setFormData({
      studentId,
      studentName:
        placement?.student_name ||
        placementData?.studentName ||
        "",
      course: placement?.course || placementData?.course || "",
      branch: placement?.branch || placementData?.branch || "",
      placementStatus: placement?.placement_status || "",
      placementType: placement?.placement_type || "",
      companyName: placement?.company_name || "",
      jobRole: placement?.job_role || "",
      package:
        placement?.package !== null &&
        placement?.package !== undefined
          ? String(placement.package)
          : "",
      placementDate: placement?.placement_date
        ? placement.placement_date.substring(0, 10)
        : "",
    });
  };

  const placement = placementData?.placement;
  const hasPlacement = !!placement;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isAddMode ? (
              <>
                <Plus className="h-5 w-5 text-indigo-600" />
                Add Placement
              </>
            ) : isEditMode ? (
              <>
                <Edit className="h-5 w-5 text-indigo-600" />
                Edit Placement
              </>
            ) : (
              <>
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Student Placement Details
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isAddMode
              ? "Create a new placement record for a student"
              : isEditMode
              ? "Update the placement information for this student"
              : isEditing
              ? "Update the placement information for this student"
              : "View placement information for this student"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* ─── Status Summary (view mode only) ─────────────────────── */}
            {!isAddMode && !isEditMode && (
              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Placement Status
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {placement ? (
                        <>
                          <PlacementStatusBadge
                            status={placement.placement_status}
                          />
                          {placement.placement_type && (
                            <PlacementTypeBadge
                              type={placement.placement_type}
                            />
                          )}
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">
                          Not submitted
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      {hasPlacement ? "Edit" : "Add Placement"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ─── EDIT / ADD FORM ─────────────────────────────────────── */}
            {isEditing ? (
              <div className="space-y-5">
                {/* Student Info */}
                <div className="pb-4 border-b border-slate-100 space-y-4">
                  {isAddMode ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Student *
                      </Label>

                      <Popover
                        open={pickerOpen}
                        onOpenChange={setPickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={pickerOpen}
                            className="w-full h-10 justify-between font-normal border-slate-200"
                          >
                            {formData.studentId ? (
                              <span className="truncate text-slate-800">
                                {formData.studentName}
                                <span className="text-slate-400 ml-1.5 text-xs">
                                  ({formData.studentId})
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Select a student
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          className="w-[--radix-popover-trigger-width] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Search student..." />
                            <CommandList>
                              {studentsLoading ? (
                                <div className="py-6 text-center text-sm text-slate-500">
                                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                                  Loading students...
                                </div>
                              ) : students.length === 0 ? (
                                <CommandEmpty>
                                  No students found.
                                </CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {students.map((s) => (
                                    <CommandItem
                                      key={s.student_id}
                                      value={`${s.student_name} ${s.student_id}`}
                                      onSelect={() =>
                                        handleSelectStudent(s)
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.studentId ===
                                            s.student_id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-800 truncate">
                                          {s.student_name}
                                        </span>
                                        <span className="text-[11px] text-slate-400 truncate">
                                          {s.student_id}
                                          {s.course
                                            ? ` • ${s.course}`
                                            : ""}
                                          {s.branch
                                            ? ` • ${s.branch}`
                                            : ""}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Student Name
                      </Label>
                      <Input
                        value={formData.studentName}
                        disabled
                        className="h-10 bg-slate-50"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Course
                      </Label>
                      <Input
                        placeholder={
                          isAddMode ? "e.g. B.Tech" : undefined
                        }
                        value={formData.course}
                        disabled={!isAddMode}
                        onChange={(e) =>
                          handleInputChange("course", e.target.value)
                        }
                        className={`h-10 ${
                          isAddMode ? "" : "bg-slate-50"
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Branch
                      </Label>
                      <Input
                        placeholder={
                          isAddMode ? "e.g. CSE" : undefined
                        }
                        value={formData.branch}
                        disabled={!isAddMode}
                        onChange={(e) =>
                          handleInputChange("branch", e.target.value)
                        }
                        className={`h-10 ${
                          isAddMode ? "" : "bg-slate-50"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Placement Status + Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placed">Placed</SelectItem>
                        <SelectItem value="not_placed">
                          Not Placed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.placementStatus === "placed" && (
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
                          <SelectValue placeholder="Select type" />
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
                  )}
                </div>

                {/* Company + Job Role */}
                {formData.placementStatus === "placed" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Company Name *
                        </Label>
                        <Input
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleInputChange(
                              "companyName",
                              e.target.value
                            )
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            handleInputChange(
                              "placementDate",
                              e.target.value
                            )
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isAddMode ? (
                      <>
                        <Save className="h-4 w-4" />
                        Add Placement
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Changes
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
            ) : placement ? (
              // ─── VIEW MODE ─────────────────────────────────────────────
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard
                    icon={User}
                    label="Student Name"
                    value={
                      placement?.student_name ||
                      placementData?.studentName
                    }
                  />
                  <InfoCard
                    icon={GraduationCap}
                    label="Course"
                    value={placement?.course || placementData?.course}
                  />
                </div>

                {/* Branch — full width so "Computer Science" fits */}
                <InfoCard
                  icon={GraduationCap}
                  label="Branch"
                  value={placement?.branch || placementData?.branch}
                />

                {placement.company_name && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoCard
                      icon={Building2}
                      label="Company"
                      value={placement.company_name}
                    />
                  </div>
                )}

                {/* Job Role — full width so "Business Analyst" fits */}
                {placement.job_role && (
                  <InfoCard
                    icon={Briefcase}
                    label="Job Role"
                    value={placement.job_role}
                  />
                )}

                {(placement.package || placement.placement_date) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {placement.package && (
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
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-slate-100 p-4 mb-3">
                  <Briefcase className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">
                  No Placement Data
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  This student hasn&apos;t submitted placement details
                  yet. Click &quot;Add Placement&quot; to record one.
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}