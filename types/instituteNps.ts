// types/instituteNps.ts

/* -------------------------------------------------------------------------- */
/*                                  Dashboard                                 */
/* -------------------------------------------------------------------------- */

export interface DashboardCard {
  surveyCount: number;
  totalResponses: number;
  averageRating: number;
  completedResponses: number;
  pendingResponses: number;
}

export interface ReferralSummary {
  totalReferrals: number;
  totalClicks: number;
  totalSignups: number;
  totalEnrollments: number;
  rewardPoints: number;
}

export interface DashboardAnalytics {
  totalResponses: number;
  averageRating: number;
  recommendationPercentage: number;
  satisfactionPercentage: number;
}

export interface SurveyDashboard {
  surveyCount: number;
  totalResponses: number;
  averageRating: number;
  completedResponses: number;
  pendingResponses: number;
  referralSummary: ReferralSummary;
  analytics: DashboardAnalytics;
  surveys: Survey[];
}

/* -------------------------------------------------------------------------- */
/*                               Survey Questions                             */
/* -------------------------------------------------------------------------- */

export interface SurveyQuestion {
  id: string;
  question: string;                    // Main question field (API returns 'question')
  question_text?: string;              // For backwards compatibility
  question_type:
    | "rating"
    | "text"
    | "multiple_choice"
    | "recommendation"
    | "satisfaction"
    | "email"
    | "phone"
    | "name";
  category?: string | null;
  options?: string[] | null;
  is_required?: boolean;               // Made optional
  display_order?: number;              // For ordering questions
  created_at?: string;
  updated_at?: string;
  institute_id?: string | null;
  is_active?: boolean;
  ratingScale?: number;                     // Added for rating questions
}

/* -------------------------------------------------------------------------- */
/*                                   Survey                                   */
/* -------------------------------------------------------------------------- */

export interface Survey {
  id: string;
  title: string;
  description: string;
  question_ids: string[];
  questions?: SurveyQuestion[];        // Populated questions

  send_after_days: number;

  status:
    | "draft"
    | "scheduled"
    | "sent"
    | "completed";

  is_active: boolean;

  created_at: string;
  updated_at?: string;
  sent_at?: string;

  eligibleCount?: number;
  completedCount?: number;
  pendingCount?: number;
  responseRate?: number;
}

/* -------------------------------------------------------------------------- */
/*                              Survey Response                               */
/* -------------------------------------------------------------------------- */

export interface SurveyResponse {
  id: string;

  survey_id: string;
  student_id: string;
  institute_id: string;

  submitted_at: string;

  answers: Record<string, any>;
}

/* -------------------------------------------------------------------------- */
/*                           Survey Response with Details                    */
/* -------------------------------------------------------------------------- */

export interface AnswerWithQuestion {
  question: string;
  answer: string;
  npsScore?: number; // Optional NPS score for rating questions
}

export interface SurveyResponseWithDetails extends SurveyResponse {
  student_name?: string;
  email?: string;
  score?: number;
  answers_with_questions?: AnswerWithQuestion[];
  category?: string;
}

/* -------------------------------------------------------------------------- */
/*                           Survey Response Analytics                       */
/* -------------------------------------------------------------------------- */

export interface SurveyResponseAnalytics {
  averageRating: number;
  recommendationPercentage: number;
  satisfactionPercentage: number;
  totalResponses: number;
  totalRatingQuestions?: number;
  totalRecommendationQuestions?: number;
  totalSatisfactionQuestions?: number;
  promoters?: number;
  passives?: number;
  detractors?: number;
}

/* -------------------------------------------------------------------------- */
/*                           Survey Responses Response                       */
/* -------------------------------------------------------------------------- */

export interface SurveyResponsesResponse {
  success: boolean;
  message?: string;
  data: SurveyResponseWithDetails[];
  analytics?: SurveyResponseAnalytics;
  pagination?: Pagination;
}

/* -------------------------------------------------------------------------- */
/*                                Pagination                                  */
/* -------------------------------------------------------------------------- */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                 API Result                                 */
/* -------------------------------------------------------------------------- */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  pagination: Pagination;
  data: T[];
}

/* -------------------------------------------------------------------------- */
/*                              Create Survey Payload                        */
/* -------------------------------------------------------------------------- */

export interface CreateSurveyPayload {
  title: string;
  description: string;
  selectedQuestions: string[];
  sendAfterDays: number;
  status: 'draft' | 'scheduled';
}

export interface UpdateSurveyPayload extends Partial<CreateSurveyPayload> {
  isActive?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Survey Token                                 */
/* -------------------------------------------------------------------------- */

export interface SurveyToken {
  id: string;
  survey_id: string;
  student_id: string;
  institute_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  used_at?: string;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/*                              Send Survey Response                         */
/* -------------------------------------------------------------------------- */

export interface SendSurveyResponse {
  success: boolean;
  message: string;
  data: {
    surveyId: string;
    sentCount: number;
    skippedCount: number;
    totalEligible: number;
    tokens?: SurveyToken[];
    emails?: Array<{
      studentId: string;
      email: string;
      token: string;
      surveyLink: string;
      status: string;
    }>;
  };
}