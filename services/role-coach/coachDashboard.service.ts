
import { api } from "@/utils/apiServices";

import type {
  CoachDashboardApiResponse,
  CoachDashboardData,
} from "@/types/role-coach/coachDashboard.types";

/* -------------------------------------------------------------------------- */
/* API CONFIGURATION                                                          */
/* -------------------------------------------------------------------------- */

const COACH_DASHBOARD_ENDPOINT =
  "/api/role-coach/dashboard";

/* -------------------------------------------------------------------------- */
/* RESPONSE VALIDATION                                                        */
/* -------------------------------------------------------------------------- */

const isCoachDashboardData = (
  value: unknown
): value is CoachDashboardData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dashboard = value as Partial<CoachDashboardData>;

  return Boolean(
    dashboard.coach &&
    dashboard.overview &&
    Array.isArray(dashboard.upcomingSessions) &&
    Array.isArray(dashboard.recentClients) &&
    dashboard.earningsOverview &&
    dashboard.performanceOverview &&
    Array.isArray(dashboard.recentReviews)
  );
};

/* -------------------------------------------------------------------------- */
/* GET COACH DASHBOARD                                                        */
/* -------------------------------------------------------------------------- */

export const getCoachDashboard =
  async (): Promise<CoachDashboardData> => {
    try {
      const response = await api.get(
        COACH_DASHBOARD_ENDPOINT
      ) as CoachDashboardApiResponse & {
        coach?: CoachDashboardData["coach"];
        overview?: CoachDashboardData["overview"];
        upcomingSessions?: CoachDashboardData["upcomingSessions"];
        recentClients?: CoachDashboardData["recentClients"];
        earningsOverview?: CoachDashboardData["earningsOverview"];
        performanceOverview?: CoachDashboardData["performanceOverview"];
        recentReviews?: CoachDashboardData["recentReviews"];
      };

      /* -------------------------------------------------------------------- */
      /* HANDLE API ERRORS                                                    */
      /* -------------------------------------------------------------------- */

      if (response?.success === false) {
        throw new Error(
          response.message ||
          "Failed to load coach dashboard."
        );
      }

      /* -------------------------------------------------------------------- */
      /* SUPPORT WRAPPED AND DIRECT RESPONSES                                 */
      /* -------------------------------------------------------------------- */

      const dashboardData =
        response?.data ?? response;

      /* -------------------------------------------------------------------- */
      /* VALIDATE DASHBOARD RESPONSE                                          */
      /* -------------------------------------------------------------------- */

      if (!isCoachDashboardData(dashboardData)) {
        throw new Error(
          "Invalid coach dashboard response received from server."
        );
      }

      /* -------------------------------------------------------------------- */
      /* RETURN DASHBOARD DATA                                                */
      /* -------------------------------------------------------------------- */

      return dashboardData;

    } catch (error: unknown) {
      console.error(
        "Get Coach Dashboard API Error:",
        error
      );

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Something went wrong while loading coach dashboard."
      );
    }
  };
