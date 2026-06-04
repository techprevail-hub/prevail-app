// apiServices.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth headers
const getAuthHeaders = async () => {
  const token = localStorage.getItem("token");
  const expiresAt = localStorage.getItem("expiresAt");

  if (!token) {
    throw new Error("No token found");
  }

  // Check if token is expired
  if (expiresAt && new Date().getTime() > parseInt(expiresAt)) {
    // Try to refresh the token
    const refreshed = await refreshToken();
    if (!refreshed) {
      // Clear localStorage and redirect to login
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  const newToken = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${newToken}`,
  };
};

// Refresh token function
const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) return false;

    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshTokenValue,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("expiresAt", data.expiresAt.toString());
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

// API Service
export const api = {
  async get(endpoint: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers,
      });

      if (response.status === 401) {
        // Token expired, try to refresh once more
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newHeaders = await getAuthHeaders();
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: newHeaders,
          });
          const retryData = await retryResponse.json();
          return retryData;
        } else {
          // Redirect to login
          localStorage.clear();
          window.location.href = "/login";
          throw new Error("Session expired");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API GET error:", error);
      throw error;
    }
  },

  async post(endpoint: string, body: any) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders();
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: newHeaders,
            body: JSON.stringify(body),
          });
          const retryData = await retryResponse.json();
          return retryData;
        } else {
          localStorage.clear();
          window.location.href = "/login";
          throw new Error("Session expired");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API POST error:", error);
      throw error;
    }
  },

  async put(endpoint: string, body: any) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders();
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "PUT",
            headers: newHeaders,
            body: JSON.stringify(body),
          });
          const retryData = await retryResponse.json();
          return retryData;
        } else {
          localStorage.clear();
          window.location.href = "/login";
          throw new Error("Session expired");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders();
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "DELETE",
            headers: newHeaders,
          });
          const retryData = await retryResponse.json();
          return retryData;
        } else {
          localStorage.clear();
          window.location.href = "/login";
          throw new Error("Session expired");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API DELETE error:", error);
      throw error;
    }
  },
};