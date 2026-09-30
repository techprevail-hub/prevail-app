export type OverrideType = "available" | "blocked";

export interface CoachAvailability {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoachAvailabilityOverride {
  id: string;
  coachId: string;
  overrideDate: string;
  startTime: string | null;
  endTime: string | null;
  overrideType: OverrideType;
  timezone: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export type UpdateAvailabilityPayload = CreateAvailabilityPayload;

export interface CreateOverridePayload {
  overrideDate: string;
  startTime?: string | null;
  endTime?: string | null;
  overrideType: OverrideType;
  timezone: string;
  note?: string | null;
}

export type UpdateOverridePayload = CreateOverridePayload;

export interface AvailabilityResponse {
  success: boolean;
  message: string;
  data: CoachAvailability[];
}

export interface AvailabilityItemResponse {
  success: boolean;
  message: string;
  data: CoachAvailability;
}

export interface OverrideResponse {
  success: boolean;
  message: string;
  data: {
    overrides: CoachAvailabilityOverride[];
  };
}

export interface OverrideItemResponse {
  success: boolean;
  message: string;
  data: CoachAvailabilityOverride;
}