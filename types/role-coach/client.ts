// src/types/role-coach/client.ts

import type { CoachSessionStatus } from "@/types/role-coach/session";

export interface CoachClientSession {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: CoachSessionStatus;
  serviceId: string | null;
  serviceName: string | null;
}

export interface CoachClientLastSession {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: CoachSessionStatus;
}

export interface CoachClient {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string | null;
  headline: string | null;
  careerStage: string | null;
  targetRole: string | null;
  targetIndustry: string | null;
  location: string | null;
  avatarUrl: string | null;

  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;

  lastSession: CoachClientLastSession | null;
}

export interface CoachClientDetails extends CoachClient {
  bio?: string | null;
  linkedinUrl?: string | null;
  sessions: CoachClientSession[];
}

export interface CoachClientsResponse {
  success: boolean;
  message: string;
  data: CoachClient[];
}

export interface CoachClientResponse {
  success: boolean;
  message: string;
  data: CoachClientDetails;
}