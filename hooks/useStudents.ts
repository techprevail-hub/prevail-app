import { useCallback, useEffect, useState } from "react";

import studentService from "@/services/student.service";

import {
  Student,
  StudentQueryParams,
} from "@/types/student";

import { Pagination } from "@/types/pagination";

const initialPagination: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

const initialParams: StudentQueryParams = {
  page: 1,
  limit: 10,
  search: "",
  department: "",
  semester: undefined,
  status: "",
  sortBy: "created_at",
  sortOrder: "desc",
};

export default function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [params, setParams] =
    useState<StudentQueryParams>(initialParams);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await studentService.getStudents(params);

      setStudents(response.data);

      setPagination(response.pagination);

      setError("");

    } catch (err: any) {

      setError(err?.message || "Something went wrong");

    } finally {

      setLoading(false);

    }
  }, [params]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Change Page
  const changePage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      page,
    }));
  };

  // Change Page Size
  const changePageSize = (limit: number) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      limit,
    }));
  };

  // Search
  const changeSearch = (search: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      search,
    }));
  };

  // Department Filter
  const changeDepartment = (department: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      department,
    }));
  };

  // Semester Filter
  const changeSemester = (semester?: number) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      semester,
    }));
  };

  // Status Filter
  const changeStatus = (status: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      status,
    }));
  };

  // Sorting
  const changeSorting = (
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      sortBy,
      sortOrder,
    }));
  };

  return {
    students,

    loading,

    error,

    pagination,

    params,

    fetchStudents,

    changePage,

    changePageSize,

    changeSearch,

    changeDepartment,

    changeSemester,

    changeStatus,

    changeSorting,
  };
}