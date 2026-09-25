export type SessionType =
  | "one_on_one"
  | "group"
  | "chat"
  | "video"
  | "phone";

/**
 * Coach Service
 * Matches the formatted response returned by the backend
 */
export interface CoachService {
  id: string;
  coachId: string;
  name: string;
  description: string | null;
  sessionType: SessionType;
  durationMinutes: number;
  price: number;
  currency: string;
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Coach Service
 * Matches the payload expected by the backend controller/validation
 */
export interface CreateCoachServicePayload {
  name: string;
  description?: string;
  sessionType: SessionType;
  durationMinutes: number;
  price: number;
  currency?: string;
  isFree?: boolean;
  isActive?: boolean;
}

/**
 * Update Coach Service
 */
export interface UpdateCoachServicePayload {
  name?: string;
  description?: string;
  sessionType?: SessionType;
  durationMinutes?: number;
  price?: number;
  currency?: string;
  isFree?: boolean;
  isActive?: boolean;
}

/**
 * Pagination
 */
export interface CoachServicesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * GET all services response
 */
export interface CoachServicesResponse {
  success: boolean;
  message: string;
  data: {
    services: CoachService[];
    pagination: CoachServicesPagination;
  };
}

/**
 * Single service response
 */
export interface CoachServiceResponse {
  success: boolean;
  message: string;
  data: CoachService;
}