// services/progressReportService.ts

import { api } from "@/utils/apiServices";

import type {
  ProgressReportResponse,
} from "@/types/ProgressReport";

/**
 * Fetch progress report data for the institute
 * @returns Promise with progress report data
 */
export const getProgressReport = async (): Promise<ProgressReportResponse> => {
  const response = await api.get(
    "/api/role-institute/progress-report"
  );

  console.log("Progress Report API Full Response:", response);
  console.log("Progress Report API Response.data:", response.data);

  // The response from api.get might be wrapped in a data property
  // or might be the direct response
  // Check if response has the success property
  if (response && typeof response === "object" && "success" in response) {
    // If response already has success property, return it directly
    return response as ProgressReportResponse;
  } else if (response && response.data && typeof response.data === "object" && "success" in response.data) {
    // If response.data has the success property
    return response.data as ProgressReportResponse;
  } else {
    // If neither has success, assume response.data is the data we want
    // and wrap it in the expected structure
    return {
      success: true,
      message: "Progress report fetched successfully.",
      data: response.data || response
    } as ProgressReportResponse;
  }
};