// utils/userData.ts

import { api } from "@/utils/apiServices";
import { UserProfileData } from "@/types/resume";

export async function fetchUserProfileData(): Promise<UserProfileData | null> {
  try {
    // Use the correct settings/me endpoint
    const response = await api.get("/api/settings/me");
    
    // Check if response is successful and has data
    if (response && response.success && response.data) {
      const userData = response.data;
      
      // Map the response data to our UserProfileData format
      return {
        fullName: userData.account?.name || "",
        email: userData.account?.email || "",
        phone: "", // Not available in current response
        location: "", // Not available in current response
        summary: userData.preferences?.careerGoal || "",
        skills: userData.skills || [],
        experience: userData.experience || [],
        education: userData.education || [],
      };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    // Don't throw error, just return null so the form can still be used
    return null;
  }
}