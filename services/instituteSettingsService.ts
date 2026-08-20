// services/instituteSettingsService.ts

import { api } from "@/utils/apiServices";

import {
  InstituteSettingsResponse,
  UpdateNotificationSettingsRequest,
  UpdateFeatureSettingsRequest,
} from "@/types/InstituteSettings";

/**
 * GET INSTITUTE SETTINGS
 * ✅ FIX: Added /api prefix to match backend routes
 */
export const getInstituteSettings =
  async (): Promise<InstituteSettingsResponse> => {
    return api.get(
      "/api/role-institute/settings"
    );
  };

/**
 * UPDATE NOTIFICATION SETTINGS
 * ✅ FIX: Added /api prefix to match backend routes
 */
export const updateInstituteNotificationSettings =
  async (
    notificationSettings: UpdateNotificationSettingsRequest
  ): Promise<InstituteSettingsResponse> => {
    return api.put(
      "/api/role-institute/settings/notifications",
      notificationSettings
    );
  };

/**
 * UPDATE FEATURE SETTINGS
 * ✅ FIX: Added /api prefix to match backend routes
 */
export const updateInstituteFeatureSettings =
  async (
    featureSettings: UpdateFeatureSettingsRequest
  ): Promise<InstituteSettingsResponse> => {
    return api.put(
      "/api/role-institute/settings/features",
      featureSettings
    );
  };