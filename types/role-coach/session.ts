export type CoachSessionStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface CoachSession {
  id: string;
  coachId: string;
  seekerId: string;
  serviceId: string;

  sessionDate: string;
  startTime: string;
  endTime: string;
  timezone: string;

  durationMinutes: number;

  serviceName: string;
  sessionType: string;

  price: number;
  currency: string;

  status: CoachSessionStatus;
  paymentStatus: PaymentStatus;

  meetingUrl: string | null;
  cancellationReason: string | null;
  coachNotes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface SessionListResponse {
  success: boolean;
  message: string;
  data: {
    sessions: CoachSession[];
  };
}

export interface SessionResponse {
  success: boolean;
  message: string;
  data: CoachSession;
}

export interface SessionNotesResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    notes: string;
  };
}

export interface RescheduleSessionPayload {
  sessionDate: string;
  startTime: string;
  endTime: string;
}

export interface CancelSessionPayload {
  reason: string;
}

export interface UpdateSessionStatusPayload {
  status: CoachSessionStatus;
}

export interface UpdateSessionNotesPayload {
  notes: string;
}