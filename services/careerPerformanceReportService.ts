import { api } from "@/utils/apiServices";

import type {
  CareerPerformanceReportResponse,
} from "@/types/CareerPerformanceReport";

export const getCareerPerformanceReport =
  async (): Promise<CareerPerformanceReportResponse> => {
    const response = await api.get(
      "/api/role-institute/reports/career-performance"
    );

    console.log(
      "Career Performance API Response:",
      response
    );

    if (
      response &&
      typeof response === "object" &&
      "success" in response
    ) {
      return response as CareerPerformanceReportResponse;
    }

    return response.data as CareerPerformanceReportResponse;
  };