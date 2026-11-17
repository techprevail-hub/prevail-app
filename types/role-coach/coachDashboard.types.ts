
/* -------------------------------------------------------------------------- */
/* COACH PROFILE                                                              */
/* -------------------------------------------------------------------------- */

export interface CoachDashboardCoach {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  headline: string | null;
  specialization: string | null;
  experienceYears: number;
  profileCompletion: number;
}

/* -------------------------------------------------------------------------- */
/* CURRENCY                                                                   */
/* -------------------------------------------------------------------------- */

export interface CurrencyAmount {
  currency: string;
  amount: number;
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD OVERVIEW                                                         */
/* -------------------------------------------------------------------------- */

export interface CoachDashboardOverview {
  totalClients: number;
  totalServices: number;
  activeServices: number;

  totalSessions: number;
  completedSessions: number;
  confirmedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  upcomingSessions: number;

  totalEarnings: CurrencyAmount[];
  monthlyEarnings: CurrencyAmount[];

  averageRating: number;
  totalReviews: number;
}

/* -------------------------------------------------------------------------- */
/* UPCOMING SESSIONS                                                          */
/* -------------------------------------------------------------------------- */

export interface UpcomingCoachSession {
  id: string;

  clientId: string | null;
  clientName: string;

  serviceId: string | null;
  serviceName: string | null;
  sessionType: string | null;

  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  timezone: string | null;

  durationMinutes: number | null;

  status: string;

  meetingUrl: string | null;

  groupSessionId: string | null;
  groupCapacity: number | null;
}

/* -------------------------------------------------------------------------- */
/* RECENT CLIENTS                                                             */
/* -------------------------------------------------------------------------- */

export interface RecentCoachClient {
  id: string;
  name: string;

  email: string | null;
  location: string | null;

  position: string | null;
  company: string | null;
  industry: string | null;
  experienceLevel: string | null;

  totalSessions: number;
  completedSessions: number;

  lastSession: {
    id: string;
    date: string;
    startTime: string | null;
    status: string;
    serviceName: string | null;
  } | null;
}

/* -------------------------------------------------------------------------- */
/* MONTHLY EARNINGS                                                           */
/* -------------------------------------------------------------------------- */

export interface MonthlyEarning {
  month: string;
  label: string;
  earnings: CurrencyAmount[];
}

/* -------------------------------------------------------------------------- */
/* EARNINGS OVERVIEW                                                          */
/* -------------------------------------------------------------------------- */

export interface CoachEarningsOverview {
  currentMonth: CurrencyAmount[];
  previousMonth: CurrencyAmount[];
  monthlyBreakdown: MonthlyEarning[];
}

/* -------------------------------------------------------------------------- */
/* PERFORMANCE OVERVIEW                                                       */
/* -------------------------------------------------------------------------- */

export interface CoachPerformanceOverview {
  completionRate: number;
  cancellationRate: number;
}

/* -------------------------------------------------------------------------- */
/* RECENT REVIEWS                                                             */
/* -------------------------------------------------------------------------- */

export interface RecentCoachReview {
  id: string;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  clientName: string;
}

/* -------------------------------------------------------------------------- */
/* COMPLETE DASHBOARD DATA                                                    */
/* -------------------------------------------------------------------------- */

export interface CoachDashboardData {
  coach: CoachDashboardCoach;

  overview: CoachDashboardOverview;

  upcomingSessions: UpcomingCoachSession[];

  recentClients: RecentCoachClient[];

  earningsOverview: CoachEarningsOverview;

  performanceOverview: CoachPerformanceOverview;

  recentReviews: RecentCoachReview[];
}

/* -------------------------------------------------------------------------- */
/* API RESPONSE                                                               */
/* -------------------------------------------------------------------------- */

export interface CoachDashboardApiResponse {
  success: boolean;
  message?: string;

  // Backend controller execution time in milliseconds
  executionTime?: number;

  data?: CoachDashboardData;
}
