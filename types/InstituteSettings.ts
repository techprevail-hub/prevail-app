// types/InstituteSettings.ts

export interface NotificationSettings {
  student: boolean;
  coach: boolean;
  placement: boolean;
  careerProgress: boolean;
  nps: boolean;
  system: boolean;
}

export interface FeatureSettings {
  students: boolean;
  coaches: boolean;
  careerProgress: boolean;
  placement: boolean;
  nps: boolean;
  reporting: boolean;
}

export interface InstituteSettings {
  id: string;
  institute_id: string;
  notification_settings: NotificationSettings;
  feature_settings: FeatureSettings;
  created_at: string;
  updated_at: string;
}

export interface InstituteSettingsResponse {
  success: boolean;
  data: InstituteSettings;
  message?: string;
}

export interface UpdateNotificationSettingsRequest {
  notificationSettings: Partial<NotificationSettings>;
}

export interface UpdateFeatureSettingsRequest {
  featureSettings: Partial<FeatureSettings>;
}