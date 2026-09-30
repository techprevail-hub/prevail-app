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
  OverrideResponse,
  OverrideItemResponse,
} from "@/types/role-coach/availability";

const BASE_URL = "/api/role-coach/availability";

const unwrap = <T>(response: any): T => {
  return response?.success ? response : response.data;
};

/* -------------------------------------------------------------------------- */
/* Weekly Availability                                                        */
/* -------------------------------------------------------------------------- */

export const getCoachAvailability = async (): Promise<
  CoachAvailability[]
> => {
  const response = await api.get(BASE_URL);
  const result = unwrap<AvailabilityResponse>(response);

  return result.data;
};

export const createCoachAvailability = async (
  payload: CreateAvailabilityPayload
): Promise<CoachAvailability> => {
  const response = await api.post(BASE_URL, payload);
  return unwrap<AvailabilityItemResponse>(response).data;
};

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
/* Date Overrides                                                             */
/* -------------------------------------------------------------------------- */

export const getCoachOverrides = async (): Promise<
  CoachAvailabilityOverride[]
> => {
  const response = await api.get(`${BASE_URL}/overrides`);
  const result = unwrap<OverrideResponse>(response);

  return result.data.overrides;
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