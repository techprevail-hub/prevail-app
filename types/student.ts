import { Pagination } from "./pagination";

export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  department: string;
  semester: number;
  readiness_score: number;
  placement_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResponse {
  success: boolean;
  pagination: Pagination;
  data: Student[];
}

export interface StudentQueryParams {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  semester?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}