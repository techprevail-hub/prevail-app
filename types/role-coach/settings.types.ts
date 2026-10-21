
export interface NotificationChannelPreferences {
  newBooking: boolean;
  bookingCancellation: boolean;
  sessionReminder: boolean;
  paymentUpdates: boolean;
  newReview: boolean;
  platformUpdates: boolean;
}

export interface CoachNotificationPreferences {
  email: NotificationChannelPreferences;
  inApp: NotificationChannelPreferences;
}

export interface CoachSessionPreferences {
  defaultDurationMinutes: number;
  bufferMinutes: number;
  minimumNoticeHours: number;
}

export interface CoachGeneralPreferences {
  language: string;
  timezone: string;
}

export interface CoachSettings {
  id?: string;
  coach_id: string;
  notification_preferences: CoachNotificationPreferences;
  session_preferences: CoachSessionPreferences;
  general_preferences: CoachGeneralPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface CoachSettingsApiResponse {
  success: boolean;
  message: string;
  data: CoachSettings;
}

export interface CoachSettingsErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export type NotificationChannel = "email" | "inApp";

export type NotificationSettingKey =
  keyof NotificationChannelPreferences;
