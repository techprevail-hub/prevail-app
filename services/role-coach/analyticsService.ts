import type {
  CoachAnalytics,
  CoachAnalyticsPeriodFilter,
  CoachAnalyticsResponse,
} from "@/types/role-coach/analytics";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCoachAnalytics(
  period: CoachAnalyticsPeriodFilter = 6
): Promise<CoachAnalytics> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/role-coach/analytics?period=${period}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  let result: CoachAnalyticsResponse;

  try {
    result = (await response.json()) as CoachAnalyticsResponse;
  } catch {
    throw new Error("Unable to read the analytics response from the server.");
  }

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message || `Failed to fetch analytics (${response.status}).`
    );
  }

  return result.data;
}