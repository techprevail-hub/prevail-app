import { Pagination } from "./pagination";

export interface Student {
  id: string;

  student_name: string;

  email: string;

  course: string;

  branch: string;

  batch: string;

  status: "pending" | "accepted" | "cancelled" | "expired";

  invited_at: string;

  accepted_at?: string | null;

  expires_at: string;

  created_at: string;

  updated_at: string;
}

export interface StudentCounts {
  total: number;
  pending: number;
  accepted: number;
  cancelled: number;
  expired: number;
}

export interface StudentResponse {
  success: boolean;

  counts: StudentCounts;

  pagination: Pagination;

  data: Student[];
}

export interface StudentQueryParams {
  page: number;

  limit: number;

  search?: string;

  status?: string;

  sortBy?: string;

  sortOrder?: "asc" | "desc";
}