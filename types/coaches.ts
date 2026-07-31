// types/coaches.ts
export interface Coach {
  id: string;
  coach_name: string;
  email: string;
  specialization: string;
  experience: string;
  status: "pending" | "accepted" | "cancelled" | "expired";
  invited_at: string;
  accepted_at?: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  invite_token?: string;
  institute_id?: string;
  invited_by?: string;
  cancelled_by?: string;
  accepted_by?: string;
  resent_at?: string;
  resent_count?: number;
}

export interface CoachCounts {
  total: number;
  pending: number;
  accepted: number;
  cancelled: number;
  expired: number;
}

export interface CoachPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CoachListResponse {
  success: boolean;
  counts: CoachCounts;
  pagination: CoachPagination;
  data: Coach[];
  message?: string; // ✅ Added optional message field
}

export interface CoachResponse {
  success: boolean;
  data: Coach;
  message?: string;
}

export interface CreateCoachPayload {
  coachName: string;
  email: string;
  specialization: string;
  experience: string;
}

export interface UpdateCoachPayload {
  coachName?: string;
  email?: string;
  specialization?: string;
  experience?: string;
}