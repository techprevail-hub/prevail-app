import { api } from "@/utils/apiServices";

import type {
  CoachSession,
  CoachSessionStatus,
  SessionListResponse,
  SessionNotesResponse,
  RescheduleSessionPayload,
  CancelSessionPayload,
} from "@/types/role-coach/session";

const BASE_URL = "/api/role-coach/sessions";

const unwrap = <T>(response: any): T => {
  return response?.success ? response : response.data;
};

export const getCoachSessions = async (
  status?: CoachSessionStatus
): Promise<CoachSession[]> => {
  const url = status
    ? `${BASE_URL}?status=${status}`
    : BASE_URL;

  const response = await api.get(url);
  const result = unwrap<SessionListResponse>(response);

  return result.data.sessions || [];
};

export const getCoachSession = async (
  sessionId: string
): Promise<CoachSession> => {
  const response = await api.get(
    `${BASE_URL}/${sessionId}`
  );

  return unwrap<{
    success: boolean;
    message: string;
    data: CoachSession;
  }>(response).data;
};

export const updateCoachSessionStatus = async (
  sessionId: string,
  status: CoachSessionStatus
): Promise<CoachSession> => {
  const response = await api.patch(
    `${BASE_URL}/${sessionId}/status`,
    { status }
  );

  return unwrap<{
    success: boolean;
    message: string;
    data: CoachSession;
  }>(response).data;
};

export const rescheduleCoachSession = async (
  sessionId: string,
  payload: RescheduleSessionPayload
): Promise<CoachSession> => {
  const response = await api.patch(
    `${BASE_URL}/${sessionId}/reschedule`,
    payload
  );

  return unwrap<{
    success: boolean;
    message: string;
    data: CoachSession;
  }>(response).data;
};

export const cancelCoachSession = async (
  sessionId: string,
  payload: CancelSessionPayload
): Promise<CoachSession> => {
  const response = await api.patch(
    `${BASE_URL}/${sessionId}/cancel`,
    payload
  );

  return unwrap<{
    success: boolean;
    message: string;
    data: CoachSession;
  }>(response).data;
};

export const getCoachSessionNotes = async (
  sessionId: string
) => {
  const response = await api.get(
    `${BASE_URL}/${sessionId}/notes`
  );

  return unwrap<SessionNotesResponse>(response).data;
};

export const updateCoachSessionNotes = async (
  sessionId: string,
  notes: string
): Promise<CoachSession> => {
  const response = await api.put(
    `${BASE_URL}/${sessionId}/notes`,
    { notes }
  );

  return unwrap<{
    success: boolean;
    message: string;
    data: CoachSession;
  }>(response).data;
};