// services/placementReportService.ts

import { api } from "@/utils/apiServices";

import type {
  PlacementReportResponse,
} from "@/types/PlacementReport";

/**
 * Get Placement Report
 */
export const getPlacementReport = async (): Promise<PlacementReportResponse> => {
  const response = await api.get(
    "/api/role-institute/reports/placement"
  );

  console.log("Placement Report API Response:", response);

  // Check if the response already has the expected structure
  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as PlacementReportResponse;
  }

  // If not, return the data property
  return response.data as PlacementReportResponse;
};