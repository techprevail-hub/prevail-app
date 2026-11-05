
import { api } from "@/utils/apiServices";

import type {
  CoachAvailability,
  CoachAvailabilityOverride,
  CreateAvailabilityPayload,
  UpdateAvailabilityPayload,
  CreateOverridePayload,
  UpdateOverridePayload,
  AvailabilityResponse,
  AvailabilityItemResponse,
  AvailabilityBulkResponse,
  OverrideResponse,
  OverrideItemResponse,
  OverrideType,
} from "@/types/role-coach/availability";

const BASE_URL = "/api/role-coach/availability";

/* -------------------------------------------------------------------------- */
/* RESPONSE HELPER                                                            */
/* -------------------------------------------------------------------------- */

const unwrap = <T>(response: any): T => {
  return response?.success ? response : response.data;
};

/* -------------------------------------------------------------------------- */
/* WEEKLY AVAILABILITY                                                        */
/* -------------------------------------------------------------------------- */

export const getCoachAvailability = async (): Promise<
  CoachAvailability[]
> => {
  const response = await api.get(BASE_URL);
  const result = unwrap<AvailabilityResponse>(response);

  return result.data;
};

/**
 * Creates availability for multiple weekdays in one API request.
 *
 * Example:
 * {
 *   serviceId: "service-id",
 *   daysOfWeek: [1, 2, 3, 4, 5],
 *   startTime: "09:00",
 *   endTime: "17:00",
 *   timezone: "Asia/Kolkata",
 *   capacity: 10
 * }
 */
export const createCoachAvailability = async (
  payload: CreateAvailabilityPayload
): Promise<CoachAvailability[]> => {
  const response = await api.post(BASE_URL, payload);

  const result = unwrap<AvailabilityBulkResponse>(response);

  return result.data;
};

/**
 * Updates one existing availability record.
 */
export const updateCoachAvailability = async (
  id: string,
  payload: UpdateAvailabilityPayload
): Promise<CoachAvailability> => {
  const response = await api.put(`${BASE_URL}/${id}`, payload);

  return unwrap<AvailabilityItemResponse>(response).data;
};

export const toggleCoachAvailability = async (
  id: string,
  isActive: boolean
): Promise<CoachAvailability> => {
  const response = await api.patch(`${BASE_URL}/${id}/status`, {
    isActive,
  });

  return unwrap<AvailabilityItemResponse>(response).data;
};

export const deleteCoachAvailability = async (
  id: string
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/* -------------------------------------------------------------------------- */
/* DATE OVERRIDES                                                             */
/* -------------------------------------------------------------------------- */

export const getCoachOverrides = async (): Promise<
  CoachAvailabilityOverride[]
> => {
  const response = await api.get(`${BASE_URL}/overrides`);
  const result = unwrap<OverrideResponse>(response);

  return result.data;
};

export const createCoachOverride = async (
  payload: CreateOverridePayload
): Promise<CoachAvailabilityOverride> => {
  const response = await api.post(
    `${BASE_URL}/overrides`,
    payload
  );

  return unwrap<OverrideItemResponse>(response).data;
};

export const updateCoachOverride = async (
  id: string,
  payload: UpdateOverridePayload
): Promise<CoachAvailabilityOverride> => {
  const response = await api.put(
    `${BASE_URL}/overrides/${id}`,
    payload
  );

  return unwrap<OverrideItemResponse>(response).data;
};

export const deleteCoachOverride = async (
  id: string
): Promise<void> => {
  await api.delete(`${BASE_URL}/overrides/${id}`);
};

/* -------------------------------------------------------------------------- */
/* MONTHLY AVAILABILITY                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Creates date-specific available overrides for selected weekdays
 * in a particular month.
 *
 * This continues to use the existing date override API.
 */
export const createMonthlyAvailability = async (
  payload: {
    month: number;
    year: number;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    timezone: string;
    note?: string | null;
  }
): Promise<CoachAvailabilityOverride[]> => {
  const {
    month,
    year,
    daysOfWeek,
    startTime,
    endTime,
    timezone,
    note,
  } = payload;

  if (
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11
  ) {
    throw new Error("Invalid month selected.");
  }

  if (
    !Number.isInteger(year) ||
    year < new Date().getFullYear()
  ) {
    throw new Error("Invalid year selected.");
  }

  if (
    !Array.isArray(daysOfWeek) ||
    daysOfWeek.length === 0
  ) {
    throw new Error("Please select at least one weekday.");
  }

  if (
    daysOfWeek.some(
      (day) =>
        !Number.isInteger(day) ||
        day < 0 ||
        day > 6
    )
  ) {
    throw new Error("Invalid weekday selected.");
  }

  if (new Set(daysOfWeek).size !== daysOfWeek.length) {
    throw new Error("Duplicate weekdays are not allowed.");
  }

  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    if (daysOfWeek.includes(date.getDay())) {
      const dateString = [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0"),
      ].join("-");

      dates.push(dateString);
    }
  }

  const results: CoachAvailabilityOverride[] = [];
  const errors: string[] = [];

  // Monthly date overrides are still created individually.
  for (const date of dates) {
    try {
      const created = await createCoachOverride({
        overrideDate: date,
        overrideType: "available",
        startTime,
        endTime,
        timezone,
        note: note || "Monthly availability",
      });

      results.push(created);
    } catch (error: any) {
      errors.push(
        `${date}: ${
          error?.message || "Failed to create availability"
        }`
      );
    }
  }

  if (errors.length > 0) {
    const error = new Error(
      `${results.length} dates created successfully. ` +
      `${errors.length} dates failed. ${errors.join("; ")}`
    );

    Object.assign(error, {
      created: results,
      failed: errors,
    });

    throw error;
  }

  return results;
};

export type { OverrideType };
