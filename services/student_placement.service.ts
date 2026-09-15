import { api } from "@/utils/apiServices";

import type {
  SavePlacementPayload,
  SavePlacementResponse,
  StudentPlacementResponse,
} from "@/types/student_Placement";

/**
 * Get logged-in student's placement details
 *
 * IMPORTANT:
 * api.get() already returns the API response body.
 *
 * Therefore DO NOT use:
 * return response.data;
 *
 * because that would remove the success/message wrapper.
 */
export const getStudentPlacement =
  async (): Promise<StudentPlacementResponse> => {
    const response = await api.get(
      "/api/role-seeker/placement"
    );

    return response as StudentPlacementResponse;
  };

/**
 * Create student placement details
 *
 * Backend automatically:
 * - inserts if record does not exist
 * - updates if record already exists
 */
export const saveStudentPlacement =
  async (
    payload: SavePlacementPayload
  ): Promise<SavePlacementResponse> => {
    const response = await api.post(
      "/api/role-seeker/placement",
      payload
    );

    return response as SavePlacementResponse;
  };

/**
 * Update student placement details
 */
export const updateStudentPlacement =
  async (
    payload: SavePlacementPayload
  ): Promise<SavePlacementResponse> => {
    const response = await api.put(
      "/api/role-seeker/placement",
      payload
    );

    return response as SavePlacementResponse;
  };