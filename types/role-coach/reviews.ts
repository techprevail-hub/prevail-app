
export interface CoachReviewClient {
  id: string | null;
  name: string;
  email: string | null;
}

export interface CoachReview {
  id: string;
  sessionId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  client: CoachReviewClient;
}

export interface CoachReviewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CoachReviewsListData {
  reviews: CoachReview[];
  pagination: CoachReviewsPagination;
}

export interface CoachReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CoachReviewsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
