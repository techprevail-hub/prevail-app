
export interface CoachAnalyticsPeriod {
  months: number;
  startDate: string;
  endDate: string;
}

export interface CoachAnalyticsSummary {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  totalReviews: number;
  averageRating: number;
  totalGrossEarnings: number;
  totalNetEarnings: number;
  currency: string | null;
  mixedCurrencies: boolean;
}

export interface CoachSessionBreakdown {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  noShow: number;
  other: number;
}

export type CoachRating = 1 | 2 | 3 | 4 | 5;

export type CoachRatingDistribution = Record<CoachRating, number>;

export interface CoachMonthlyTrend {
  month: string;
  label: string;
  sessions: number;
  earnings: number;
}

export interface CoachTopService {
  name: string;
  sessions: number;
}

export interface CoachAnalytics {
  period: CoachAnalyticsPeriod;
  summary: CoachAnalyticsSummary;
  sessionBreakdown: CoachSessionBreakdown;
  ratingDistribution: CoachRatingDistribution;
  monthlyTrend: CoachMonthlyTrend[];
  topServices: CoachTopService[];
}

export interface CoachAnalyticsResponse {
  success: boolean;
  message: string;
  data: CoachAnalytics;
}

export type CoachAnalyticsPeriodFilter = 6 | 12;
