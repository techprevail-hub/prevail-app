
import { api } from "@/utils/apiServices";

import type {
  CoachEarning,
  CoachEarningsSummary,
  CoachPayoutInfo,
  MonthlyEarning,
  ApiResponse,
} from "@/types/role-coach/earnings";

const BASE_URL = "/api/role-coach/earnings";

/**
 * Normalize API response.
 * Supports both direct API responses and responses wrapped in data.
 */
const normalizeResponse = <T,>(response: unknown): T => {
  if (
    response &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as T;
  }

  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }

  return response as T;
};

/**
 * Get all coach earnings
 */
export const getCoachEarnings =
  async (): Promise<ApiResponse<CoachEarning[]>> => {
    const response = await api.get(BASE_URL);

    console.log("Coach Earnings API Response:", response);

    return normalizeResponse<ApiResponse<CoachEarning[]>>(
      response
    );
  };

/**
 * Get coach earnings summary
 */
export const getCoachEarningsSummary =
  async (): Promise<ApiResponse<CoachEarningsSummary>> => {
    const response = await api.get(`${BASE_URL}/summary`);

    console.log("Coach Earnings Summary API Response:", response);

    return normalizeResponse<ApiResponse<CoachEarningsSummary>>(
      response
    );
  };

/**
 * Get monthly coach earnings
 */
export const getMonthlyEarnings = async (
  months = 6
): Promise<ApiResponse<MonthlyEarning[]>> => {
  const response = await api.get(
    `${BASE_URL}/monthly?months=${months}`
  );

  console.log("Monthly Earnings API Response:", response);

  return normalizeResponse<ApiResponse<MonthlyEarning[]>>(
    response
  );
};

/**
 * Get coach payout information
 */
export const getCoachPayoutInfo =
  async (): Promise<ApiResponse<CoachPayoutInfo>> => {
    const response = await api.get(`${BASE_URL}/payout`);

    console.log("Coach Payout Info API Response:", response);

    return normalizeResponse<ApiResponse<CoachPayoutInfo>>(
      response
    );
  };
