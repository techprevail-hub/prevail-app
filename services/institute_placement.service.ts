import { api } from "@/utils/apiServices";

import type {
  InstitutePlacementPayload,
  InstitutePlacementResponse,
  InstitutePlacementsResponse,
  InstituteStudentPlacementResponse,
} from "@/types/institute_Placement";

/**
 * Student invitation information
 *
 * Used by the "Add Placement" dialog picker.
 */
export interface StudentInvitation {
  student_id: string;
  student_name: string;
  course?: string;
  branch?: string;
}

/**
 * GET /api/role-institute/student-invitations
 *
 * Returns the list of students invited to / accepted by this institute.
 * Used by the "Add Placement" dialog picker.
 */
export async function getInstituteStudentInvitations() {
  const response = await api.get(
    "/api/role-institute/student-invitations"
  );

  console.log(
    "📡 GET institute student invitations response:",
    response
  );

  return response;
}

/**
 * Get overall institute placement dashboard
 *
 * GET /api/role-institute/placement
 *
 * Returns:
 * - statistics
 * - placement records
 */
export const getInstitutePlacements =
  async (): Promise<InstitutePlacementsResponse> => {
    const response = await api.get(
      "/api/role-institute/placement"
    );

    console.log(
      "📡 GET institute placements response:",
      response
    );

    return response as InstitutePlacementsResponse;
  };

/**
 * Get placement details for one student
 *
 * GET /api/role-institute/placement/student/:studentId
 */
export const getInstituteStudentPlacement =
  async (
    studentId: string
  ): Promise<InstituteStudentPlacementResponse> => {
    const response = await api.get(
      `/api/role-institute/placement/student/${studentId}`
    );

    console.log(
      "📡 GET student placement response:",
      response
    );

    return response as InstituteStudentPlacementResponse;
  };

/**
 * Save placement details
 *
 * POST /api/role-institute/placement
 */
export const saveInstitutePlacement =
  async (
    payload: InstitutePlacementPayload
  ): Promise<InstitutePlacementResponse> => {
    const response = await api.post(
      "/api/role-institute/placement",
      payload
    );

    return response as InstitutePlacementResponse;
  };

/**
 * Update placement details
 *
 * PUT /api/role-institute/placement
 */
export const updateInstitutePlacement =
  async (
    payload: InstitutePlacementPayload
  ): Promise<InstitutePlacementResponse> => {
    const response = await api.put(
      "/api/role-institute/placement",
      payload
    );

    return response as InstitutePlacementResponse;
  };