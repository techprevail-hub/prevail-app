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