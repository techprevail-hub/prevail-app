import { api } from "@/utils/apiServices";

import type {
  InstituteDashboardResponse,
} from "@/types/institute_Dashboard";

/**
 * GET Institute Dashboard
 *
 * Endpoint:
 * GET /api/role-institute/dashboard
 */
export const getInstituteDashboard =
  async (): Promise<InstituteDashboardResponse> => {
    const response = await api.get(
      "/api/role-institute/dashboard"
    );

    console.log(
      "📡 GET institute dashboard response:",
      response
    );

    return response as InstituteDashboardResponse;
  };
  