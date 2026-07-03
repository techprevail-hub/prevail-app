"use client";

import { useState } from "react";
import {
  Users, Search, SlidersHorizontal, X,
  GraduationCap, Building2, Calendar,
} from "lucide-react";
import { toast } from "sonner";

import useStudents from "@/hooks/useStudents";
import studentService from "@/services/student.service";

import StudentTable from "@/components/role-institute/student/StudentTable";
import StudentDrawer from "@/components/role-institute/student/StudentDrawer";
import EntityFormDialog, { FormFieldConfig } from "@/components/role-institute/FormDialog";

import { Student } from "@/types/student";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Field definitions for the Add / Edit Student form ────────────────────────
// This lives in the page, NOT inside the reusable component, so the same
// EntityFormDialog can be reused for Companies, Coaches, Jobs, etc.
const studentFormFields: FormFieldConfig[] = [
  { name: "full_name",     label: "Full Name",   type: "text",  required: true, placeholder: "e.g. Aarav Sharma",         span: 2 },
  { name: "student_id",    label: "Student ID",  type: "text",  required: true, placeholder: "e.g. STU2025001" },
  { name: "email",         label: "Email",       type: "email", required: true, placeholder: "student@email.com",
    validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email") },
  { name: "phone",         label: "Phone",       type: "tel",   placeholder: "+91 98765 43210" },
  {
    name: "department", label: "Department", type: "select", required: true,
    options: [
      { label: "Computer Science", value: "Computer Science" },
      { label: "Mechanical",       value: "Mechanical" },
      { label: "Civil",            value: "Civil" },
    ],
  },
  {
    name: "semester", label: "Semester", type: "select", required: true,
    options: [
      { label: "Semester 1", value: "1" },
      { label: "Semester 2", value: "2" },
      { label: "Semester 3", value: "3" },
      { label: "Semester 4", value: "4" },
    ],
  },
  {
    name: "status", label: "Status", type: "select", required: true,
    options: [
      { label: "Active",   value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
  {
    name: "placement_status", label: "Placement Status", type: "select",
    options: [
      { label: "Placed",     value: "Placed" },
      { label: "Not Placed", value: "Not Placed" },
    ],
  },
];

export default function StudentPage() {
  const {
    students,
    loading,
    pagination,
    fetchStudents,
    changePage,
    changePageSize,
    changeSearch,
    changeDepartment,
    changeSemester,
    changeStatus,
    changeSorting,
  } = useStudents();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add / Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<{ department?: string; semester?: string; status?: string }>({});

  // ── View (drawer) ──
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  // ── Open Add dialog ──
  const handleAddClick = () => {
    setFormMode("create");
    setEditingStudent(null);
    setFormOpen(true);
  };

  // ── Open Edit dialog (from table row action) ──
  const handleEdit = (student: Student) => {
    setFormMode("edit");
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleDelete = (student: Student) => {
    console.log(student);
  };

  // ── Submit handler — shared for create + edit ──
  const handleFormSubmit = async (values: Record<string, string>) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await studentService.createStudent(values);
        toast.success("Student added successfully");
      } else if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, values);
        toast.success("Student updated successfully");
      }
      setFormOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    changeSearch(value);
  };

  const handleDepartmentChange = (value: string) => {
    setActiveFilters(prev => ({ ...prev, department: value }));
    changeDepartment(value);
  };

  const handleSemesterChange = (value: string) => {
    setActiveFilters(prev => ({ ...prev, semester: value }));
    changeSemester(Number(value));
  };

  const handleStatusChange = (value: string) => {
    setActiveFilters(prev => ({ ...prev, status: value }));
    changeStatus(value);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
    changeSearch("");
    changeDepartment("");
    changeSemester(undefined);
    changeStatus("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length + (searchValue ? 1 : 0);

  // Convert the selected student into string values the form can consume
  const editInitialValues: Record<string, string> | undefined = editingStudent
    ? {
        full_name:        editingStudent.full_name ?? "",
        student_id:       editingStudent.student_id ?? "",
        email:            editingStudent.email ?? "",
        phone:            editingStudent.phone ?? "",
        department:       editingStudent.department ?? "",
        semester:         String(editingStudent.semester ?? ""),
        status:           editingStudent.status ?? "",
        placement_status: editingStudent.placement_status ?? "",
      }
    : undefined;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Students</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your institute's students
              {pagination?.totalRecords ? (
                <span className="ml-1.5 font-semibold text-violet-600">· {pagination.totalRecords} total</span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">

          {/* Search bar */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search by name, ID, or email…"
              value={searchValue}
              className="pl-10 pr-9 rounded-xl border-slate-200 focus-visible:ring-violet-400"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter divider (desktop only) */}
          <div className="hidden lg:flex items-center gap-2 text-slate-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 flex-1">
            <Select onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-[170px] rounded-xl border-slate-200 text-sm">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleSemesterChange}>
              <SelectTrigger className="w-[140px] rounded-xl border-slate-200 text-sm">
                <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] rounded-xl border-slate-200 text-sm">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-700 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-violet-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Student Table ── */}
      <StudentTable
        students={students}
        loading={loading}
        pagination={pagination}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
        onSort={(sortBy, sortOrder) => changeSorting(sortBy, sortOrder)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ── Student Drawer (view) ── */}
      <StudentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        student={selectedStudent}
      />

      {/* ── Add / Edit Student Dialog — reusable across pages ── */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        entityLabel="Student"
        fields={studentFormFields}
        initialValues={editInitialValues}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  );
}