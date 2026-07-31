// services/coachService.ts
import { api } from "@/utils/apiServices";
import {
  CoachListResponse,
  CoachResponse,
  UpdateCoachPayload,
} from "@/types/coaches";

interface CoachQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  specialization?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const BASE_URL = "/api/role-institute/coach-invitations";

export const coachService = {
  async getCoaches(params: CoachQueryParams = {}): Promise<CoachListResponse> {
    const query = new URLSearchParams();

    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.specialization) query.append("specialization", params.specialization);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    const url = `${BASE_URL}?${query.toString()}`;
    console.log("🔍 Fetching coaches from:", url);
    
    const response = await api.get(url);
    console.log("📦 Coach API Response:", response);
    
    return response;
  },

  async getCoach(id: string): Promise<CoachResponse> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async updateCoach(id: string, payload: UpdateCoachPayload) {
    return api.put(`${BASE_URL}/${id}`, payload);
  },

  async cancelCoach(id: string) {
    return api.patch(`${BASE_URL}/${id}/cancel`);
  },

  // ✅ No POST method - removed resendCoach as well since it uses POST
  // If you need resend functionality, uncomment below but it requires POST
  // async resendCoach(id: string) {
  //   return api.post(`${BASE_URL}/${id}/resend`);
  // },
};

export default coachService;