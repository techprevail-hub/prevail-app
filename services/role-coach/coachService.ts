import { api } from "@/utils/apiServices";

import type {
  CoachService,
  CoachServicesResponse,
  CoachServiceResponse,
  CreateCoachServicePayload,
  UpdateCoachServicePayload,
} from "@/types/role-coach/service";

const BASE_URL = "/api/role-coach/services";

/**
 * Get all coach services
 */
export const getCoachServices = async (): Promise<CoachServicesResponse> => {
  const response = await api.get(BASE_URL);

  console.log("Coach Services API Response:", response);

  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as CoachServicesResponse;
  }

  return response.data as CoachServicesResponse;
};

/**
 * Get coach service by ID
 */
export const getCoachServiceById = async (
  serviceId: string
): Promise<CoachServiceResponse> => {
  const response = await api.get(`${BASE_URL}/${serviceId}`);

  console.log("Coach Service By ID API Response:", response);

  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as CoachServiceResponse;
  }

  return response.data as CoachServiceResponse;
};

/**
 * Create coach service
 */
export const createCoachService = async (
  payload: CreateCoachServicePayload
): Promise<CoachServiceResponse> => {
  const response = await api.post(BASE_URL, payload);

  console.log("Create Coach Service API Response:", response);

  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as CoachServiceResponse;
  }

  return response.data as CoachServiceResponse;
};

/**
 * Update coach service
 */
export const updateCoachService = async (
  serviceId: string,
  payload: UpdateCoachServicePayload
): Promise<CoachServiceResponse> => {
  const response = await api.put(
    `${BASE_URL}/${serviceId}`,
    payload
  );

  console.log("Update Coach Service API Response:", response);

  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as CoachServiceResponse;
  }

  return response.data as CoachServiceResponse;
};

/**
 * Toggle coach service active/inactive status
 */
export const toggleCoachService = async (
  serviceId: string,
  isActive: boolean
): Promise<CoachServiceResponse> => {
  const response = await api.patch(
    `${BASE_URL}/${serviceId}/status`,
    {
      isActive,
    }
  );

  console.log("Toggle Coach Service API Response:", response);

  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as CoachServiceResponse;
  }

  return response.data as CoachServiceResponse;
};

/**
 * Delete coach service
 */
export const deleteCoachService = async (
  serviceId: string
): Promise<CoachServiceResponse> => {
  const response = await api.delete(
    `${BASE_URL}/${serviceId}`
  );

  console.log("Delete Coach Service API Response:", response);

  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as CoachServiceResponse;
  }

  return response.data as CoachServiceResponse;
};