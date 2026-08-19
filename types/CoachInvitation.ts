// types/CoachInvitation.ts

export interface CoachInvitation {
  id: string;
  coach_name: string;
  email: string;
  specialization: string;
  experience: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  cancelledAt?: string;
  created_at: string;
  updatedAt: string;
  invite_token?: string;
  institute_id?: string;
  cancelled_by?: string;
  accepted_by?: string;
  resent_at?: string;
  resent_count?: number;
}

export interface CreateCoachInvitationRequest {
  coachName: string;
  email: string;
  specialization: string;
  experience: string;
}

export interface UpdateCoachInvitationRequest {
  coachName?: string;
  email?: string;
  specialization?: string;
  experience?: string;
  status?: 'pending' | 'cancelled';
}

export interface CoachInvitationResponse {
  success: boolean;
  data: CoachInvitation;
  message?: string;
}

export interface CoachInvitationListResponse {
  success: boolean;
  data: {
    invitations: CoachInvitation[];
    pagination: Pagination;
  };
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CoachInvitationFilters {
  search?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'all';
  specialization?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Bulk Invitation Types ──────────────────────────────────────────────

/**
 * Bulk coach invitation row result
 */
export interface BulkCoachInvitationResult {
  row: number;
  coachName?: string;
  email?: string;
  status: 'sent' | 'skipped' | 'failed' | 'email_failed';
  invitationId?: string;
  reason?: string;
}

/**
 * Bulk coach invitation summary
 */
export interface BulkCoachInvitationSummary {
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  emailFailed: number;
}

/**
 * Bulk coach invitation API response
 */
export interface BulkCoachInvitationResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    sent: number;
    skipped: number;
    failed: number;
    emailFailed: number;
    details: BulkCoachInvitationResult[];
  };
}

/**
 * Excel file upload request
 */
export interface BulkCoachInvitationRequest {
  file: File;
}

// ─── Excel Template Types ──────────────────────────────────────────────

/**
 * Excel row structure for coach invitation template
 */
export interface CoachExcelRow {
  coachName: string;
  email: string;
  specialization: string;
  experience: string;
}

// ─── Helper Types for API Responses ──────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

// ─── Status Constants ─────────────────────────────────────────────────────

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type InvitationStatus = typeof INVITATION_STATUS[keyof typeof INVITATION_STATUS];

// ─── Validation Helpers ──────────────────────────────────────────────────

export const isValidInvitationStatus = (status: string): status is InvitationStatus => {
  return Object.values(INVITATION_STATUS).includes(status as InvitationStatus);
};

export const getInvitationStatuses = (): InvitationStatus[] => {
  return Object.values(INVITATION_STATUS);
};

// ─── Form Data Types ─────────────────────────────────────────────────────

export interface CoachInvitationFormData {
  coachName: string;
  email: string;
  specialization: string;
  experience: string;
}

export interface CoachInvitationFormErrors {
  coachName?: string;
  email?: string;
  specialization?: string;
  experience?: string;
}

// ─── Export Column Types ──────────────────────────────────────────────────

/**
 * Export column configuration for coach invitations
 */
export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: any, row?: Record<string, any>) => string;
}

/**
 * Export data row for coach invitations
 */
export interface CoachExportData {
  coach_name: string;
  email: string;
  specialization: string;
  experience: string;
  status: string;
  created_at: string;
}

// ─── Dialog Mode Types ──────────────────────────────────────────────────

export type InvitationMode = 'single' | 'bulk';

// ─── File Upload Types ──────────────────────────────────────────────────

export interface FileUploadState {
  file: File | null;
  uploading: boolean;
  progress?: number;
  error?: string;
}

// ─── API Error Types ─────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  details?: any;
}