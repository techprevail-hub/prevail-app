// types/StudentInvitation.ts

export interface StudentInvitation {
  id: string;
  student_name: string;
  email: string;
  course: string;
  branch: string;
  batch: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  cancelledAt?: string;
  created_at: string;
  updatedAt: string;
}

export interface CreateStudentInvitationRequest {
  studentName: string;
  email: string;
  course: string;
  branch: string;
  batch: string;
}

export interface UpdateStudentInvitationRequest {
  studentName?: string;
  email?: string;
  course?: string;
  branch?: string;
  batch?: string;
  status?: "pending" | "cancelled";
}

export interface StudentInvitationResponse {
  success: boolean;
  data: StudentInvitation;
  message?: string;
}

export interface StudentInvitationListResponse {
  success: boolean;
  data: {
    invitations: StudentInvitation[];
    pagination: Pagination;
  };
  message?: string;
}

/**
 * Bulk student invitation row result
 */
export interface BulkStudentInvitationResult {
  row: number;
  studentName?: string;
  email?: string;
  status:
    | "sent"
    | "skipped"
    | "failed"
    | "email_failed";
  invitationId?: string;
  reason?: string;
}

/**
 * Bulk student invitation summary
 */
export interface BulkStudentInvitationSummary {
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  emailFailed: number;
}

/**
 * Bulk student invitation API response
 */
export interface BulkStudentInvitationResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    sent: number;
    skipped: number;
    failed: number;
    emailFailed: number;
    details: BulkStudentInvitationResult[];
  };
}

/**
 * Excel file upload request
 */
export interface BulkStudentInvitationRequest {
  file: File;
}

/**
 * Pagination
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Student invitation filters
 */
export interface StudentInvitationFilters {
  search?: string;
  status?:
    | "pending"
    | "accepted"
    | "expired"
    | "cancelled"
    | "all";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}