import { useCallback, useEffect, useState } from "react";

import studentService from "@/services/student.service";

import {
  Student,
  StudentCounts,
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

const initialCounts: StudentCounts = {
  total: 0,
  pending: 0,
  accepted: 0,
  cancelled: 0,
  expired: 0,
};

const initialParams: StudentQueryParams = {
  page: 1,
  limit: 10,
  search: "",
  status: "",
  sortBy: "created_at",
  sortOrder: "desc",
};

export default function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [counts, setCounts] = useState<StudentCounts>(initialCounts);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [params, setParams] =
    useState<StudentQueryParams>(initialParams);

  // Fetch Student Invitations
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await studentService.getStudents(params);

      setStudents(response.data);

      setCounts(response.counts);

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

    counts,

    loading,

    error,

    pagination,

    params,

    fetchStudents,

    changePage,

    changePageSize,

    changeSearch,

    changeStatus,

    changeSorting,
  };
}