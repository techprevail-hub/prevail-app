
import type {
  CoachSettings,
  CoachSettingsApiResponse,
  CoachNotificationPreferences,
  CoachSessionPreferences,
  CoachGeneralPreferences,
} from "@/types/role-coach/settings.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const SETTINGS_ENDPOINT = "/api/role-coach/settings";

/* -------------------------------------------------------------------------- */
/* COMMON API REQUEST HELPER                                                  */
/* -------------------------------------------------------------------------- */

async function settingsRequest(
  endpoint: string,
  method: "GET" | "PUT",
  body?: object
): Promise<CoachSettings> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    throw new Error(
      "Authentication token not found. Please log in again."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${SETTINGS_ENDPOINT}${endpoint}`,
    {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    }
  );

  let result: CoachSettingsApiResponse;

  try {
    result = (await response.json()) as CoachSettingsApiResponse;
  } catch {
    throw new Error(
      "Unable to read the settings response from the server."
    );
  }

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message ||
        `Failed to ${method === "GET" ? "fetch" : "update"} coach settings (${response.status}).`
    );
  }

  return result.data;
}

/* -------------------------------------------------------------------------- */
/* GET COACH SETTINGS                                                         */
/* GET /api/role-coach/settings                                               */
/* -------------------------------------------------------------------------- */

export async function getCoachSettings(): Promise<CoachSettings> {
  return settingsRequest("", "GET");
}

/* -------------------------------------------------------------------------- */
/* UPDATE NOTIFICATION PREFERENCES                                            */
/* PUT /api/role-coach/settings/notifications                                 */
/* -------------------------------------------------------------------------- */

export async function updateCoachNotificationSettings(
  preferences: Partial<CoachNotificationPreferences>
): Promise<CoachSettings> {
  return settingsRequest(
    "/notifications",
    "PUT",
    preferences
  );
}

/* -------------------------------------------------------------------------- */
/* UPDATE SESSION PREFERENCES                                                 */
/* PUT /api/role-coach/settings/session-preferences                           */
/* -------------------------------------------------------------------------- */

export async function updateCoachSessionPreferences(
  preferences: Partial<CoachSessionPreferences>
): Promise<CoachSettings> {
  return settingsRequest(
    "/session-preferences",
    "PUT",
    preferences
  );
}

/* -------------------------------------------------------------------------- */
/* UPDATE GENERAL PREFERENCES                                                 */
/* PUT /api/role-coach/settings/general                                       */
/* -------------------------------------------------------------------------- */

export async function updateCoachGeneralPreferences(
  preferences: Partial<CoachGeneralPreferences>
): Promise<CoachSettings> {
  return settingsRequest(
    "/general",
    "PUT",
    preferences
  );
}
