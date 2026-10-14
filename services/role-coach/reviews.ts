
import { api } from "@/utils/apiServices";

import type {
  CoachReviewsApiResponse,
  CoachReviewsListData,
  CoachReviewsSummary,
} from "@/types/role-coach/reviews";

const BASE_URL = "/api/role-coach/reviews";

function normalizeResponse<T>(
  response: unknown
): CoachReviewsApiResponse<T> {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid API response");
  }

  const result = response as Record<string, unknown>;

  if (typeof result.success === "boolean") {
    return result as unknown as CoachReviewsApiResponse<T>;
  }

  if (result.data && typeof result.data === "object") {
    const nested = result.data as Record<string, unknown>;

    if (typeof nested.success === "boolean") {
      return nested as unknown as CoachReviewsApiResponse<T>;
    }
  }

  throw new Error("Unable to read the API response");
}

export interface GetCoachReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}

export const getCoachReviews = async (
  params: GetCoachReviewsParams = {}
): Promise<CoachReviewsApiResponse<CoachReviewsListData>> => {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));

  if (params.rating) {
    query.set("rating", String(params.rating));
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  const response = await api.get(
    `${BASE_URL}?${query.toString()}`
  );

  return normalizeResponse<CoachReviewsListData>(response);
};

export const getCoachReviewsSummary =
  async (): Promise<
    CoachReviewsApiResponse<CoachReviewsSummary>
  > => {
    const response = await api.get(`${BASE_URL}/summary`);

    return normalizeResponse<CoachReviewsSummary>(response);
  };
