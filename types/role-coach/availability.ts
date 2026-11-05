
export type OverrideType = "available" | "blocked";

export interface CoachAvailability {
  id: string;
  coachId: string;

  serviceId: string | null;
  serviceName?: string | null;

  dayOfWeek: number;
  startTime: string;
  endTime: string;

  capacity: number;

  timezone: string;
  isActive: boolean;

  validFrom?: string | null;
  validUntil?: string | null;

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

/* -------------------------------------------------------------------------- */
/* WEEKLY AVAILABILITY PAYLOADS                                               */
/* -------------------------------------------------------------------------- */

// Create multiple weekdays in one API request.
export interface CreateAvailabilityPayload {
  serviceId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timezone: string;
  capacity: number;
}

// Update one existing availability record.
export interface UpdateAvailabilityPayload {
  serviceId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  capacity?: number;
}

/* -------------------------------------------------------------------------- */
/* DATE OVERRIDE PAYLOADS                                                     */
/* -------------------------------------------------------------------------- */

export interface CreateOverridePayload {
  overrideDate: string;
  startTime?: string | null;
  endTime?: string | null;
  overrideType: OverrideType;
  timezone: string;
  note?: string | null;
}

export type UpdateOverridePayload =
  Partial<CreateOverridePayload>;

/* -------------------------------------------------------------------------- */
/* API RESPONSES                                                              */
/* -------------------------------------------------------------------------- */

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

export interface AvailabilityBulkResponse {
  success: boolean;
  message: string;
  data: CoachAvailability[];
}

export interface OverrideResponse {
  success: boolean;
  message: string;
  data: CoachAvailabilityOverride[];
}

export interface OverrideItemResponse {
  success: boolean;
  message: string;
  data: CoachAvailabilityOverride;
}
