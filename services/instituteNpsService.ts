// services/instituteNpsService.ts

import { api } from "@/utils/apiServices";

import {
  Survey,
  SurveyDashboard,
  SurveyQuestion,
  SurveyResponse,
  PaginatedResponse,
} from "@/types/instituteNps";

interface SurveyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ResponseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CreateSurveyPayload {
  title: string;
  description: string;
  selectedQuestions: string[];
  sendAfterDays: number;
  status: string;
}

interface SendSurveyPayload {
  resend: boolean;
  studentIds: string[];
  coachIds: string[];
}

interface UpdateSurveyPayload {
  title?: string;
  description?: string;
  selectedQuestions?: string[];
  isActive?: boolean;
  sendAfterDays?: number;
  status?: string;
}

// ✅ Added: Create Question Payload
// services/instituteNpsService.ts - Update the CreateQuestionPayload interface

// ✅ Updated: Create Question Payload with ratingScale
interface CreateQuestionPayload {
  questionText: string;
  questionType: string;
  category?: string;
  options?: string[];
  isRequired?: boolean;
  ratingScale?: number; // Added for rating questions
}

// ✅ Added: Update Question Payload
interface UpdateQuestionPayload {
  questionText?: string;
  questionType?: string;
  category?: string;
  options?: string[];
  isRequired?: boolean;
  ratingScale?: number; // Added for rating questions
}

const BASE_URL = "/api/role-institute/nps";

export const instituteNpsService = {
  /* -------------------------------------------------------------------------- */
  /*                                Dashboard                                   */
  /* -------------------------------------------------------------------------- */

  async getDashboard(): Promise<SurveyDashboard> {
    return api.get(`${BASE_URL}/dashboard`);
  },

  /* -------------------------------------------------------------------------- */
  /*                                 Surveys                                    */
  /* -------------------------------------------------------------------------- */

  async getSurveys(
    params: SurveyQueryParams = {}
  ): Promise<PaginatedResponse<Survey>> {
    const query = new URLSearchParams();

    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    return api.get(`${BASE_URL}/surveys?${query.toString()}`);
  },

  async getSurvey(id: string): Promise<Survey> {
    return api.get(`${BASE_URL}/surveys/${id}`);
  },

  async createSurvey(payload: CreateSurveyPayload) {
    return api.post(`${BASE_URL}/surveys`, payload);
  },

  async updateSurvey(
    id: string,
    payload: UpdateSurveyPayload
  ) {
    return api.put(`${BASE_URL}/surveys/${id}`, payload);
  },

  async deleteSurvey(id: string) {
    return api.delete(`${BASE_URL}/surveys/${id}`);
  },

  async sendSurvey(
    id: string,
    payload: SendSurveyPayload
  ) {
    return api.post(
      `${BASE_URL}/surveys/${id}/send`,
      payload
    );
  },

  /* -------------------------------------------------------------------------- */
  /*                             Survey Questions                               */
  /* -------------------------------------------------------------------------- */

  async getSurveyQuestions(): Promise<
    PaginatedResponse<SurveyQuestion>
  > {
    return api.get(`${BASE_URL}/questions`);
  },

  // ✅ Added: Get a single question by ID
  async getSurveyQuestion(id: string): Promise<SurveyQuestion> {
    return api.get(`${BASE_URL}/questions/${id}`);
  },

  // ✅ Added: Create a new question
  async createQuestion(payload: CreateQuestionPayload) {
    return api.post(`${BASE_URL}/questions`, payload);
  },

  // ✅ Added: Update an existing question
  async updateQuestion(
    id: string,
    payload: UpdateQuestionPayload
  ) {
    return api.put(`${BASE_URL}/questions/${id}`, payload);
  },

  // ✅ Added: Delete a question
  async deleteQuestion(id: string) {
    return api.delete(`${BASE_URL}/questions/${id}`);
  },

  /* -------------------------------------------------------------------------- */
  /*                              Survey Responses                              */
  /* -------------------------------------------------------------------------- */

  async getSurveyResponses(
    surveyId: string,
    params: ResponseQueryParams = {}
  ): Promise<PaginatedResponse<SurveyResponse>> {
    const query = new URLSearchParams();

    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    return api.get(
      `${BASE_URL}/surveys/${surveyId}/responses?${query.toString()}`
    );
  },

  async getSurveyResponse(id: string): Promise<SurveyResponse> {
    return api.get(`${BASE_URL}/responses/${id}`);
  },
};

export default instituteNpsService;