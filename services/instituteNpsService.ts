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

  async updateSurvey(id: string, payload: Partial<Survey>) {
    return api.put(`${BASE_URL}/surveys/${id}`, payload);
  },

  async deleteSurvey(id: string) {
    return api.delete(`${BASE_URL}/surveys/${id}`);
  },

  // ✅ Fixed
  async sendSurvey(
    id: string,
    payload: SendSurveyPayload = { resend: false }
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

    return api.get(
      `${BASE_URL}/surveys/${surveyId}/responses?${query.toString()}`
    );
  },

  async getSurveyResponse(id: string): Promise<SurveyResponse> {
    return api.get(`${BASE_URL}/responses/${id}`);
  },
};

export default instituteNpsService;