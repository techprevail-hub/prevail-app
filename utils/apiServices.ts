// apiServices.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth headers
const getAuthHeaders = async (isFormData: boolean = false) => {
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
  
  // For FormData, don't set Content-Type - let the browser set it with boundary
  const headers: Record<string, string> = {
    Authorization: `Bearer ${newToken}`,
  };
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
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

// API Service with only HTTP methods
export const api = {
  async get(endpoint: string, params?: Record<string, any>) {
    try {
      const headers = await getAuthHeaders(false);

      const queryString = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([_, value]) => value !== undefined && value !== null && value !== "")
              .map(([key, value]) => [key, String(value)])
          ).toString()}`
        : "";

      const response = await fetch(`${API_URL}${endpoint}${queryString}`, {
        method: "GET",
        headers,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders(false);
          const retryResponse = await fetch(
            `${API_URL}${endpoint}${queryString}`,
            {
              method: "GET",
              headers: newHeaders,
            }
          );
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
      console.error("API GET error:", error);
      throw error;
    }
  },

  async post(endpoint: string, body: any, options?: { isFormData?: boolean; headers?: Record<string, string> }) {
    const isFormData = options?.isFormData || body instanceof FormData;
    
    try {
      const headers = await getAuthHeaders(isFormData);
      const finalHeaders = options?.headers ? { ...headers, ...options.headers } : headers;
      const requestBody = isFormData ? body : JSON.stringify(body);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: finalHeaders,
        body: requestBody,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders(isFormData);
          const finalRetryHeaders = options?.headers ? { ...newHeaders, ...options.headers } : newHeaders;
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: finalRetryHeaders,
            body: requestBody,
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

  async put(endpoint: string, body: any, options?: { isFormData?: boolean; headers?: Record<string, string> }) {
    const isFormData = options?.isFormData || body instanceof FormData;
    
    try {
      const headers = await getAuthHeaders(isFormData);
      const finalHeaders = options?.headers ? { ...headers, ...options.headers } : headers;
      const requestBody = isFormData ? body : JSON.stringify(body);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: finalHeaders,
        body: requestBody,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders(isFormData);
          const finalRetryHeaders = options?.headers ? { ...newHeaders, ...options.headers } : newHeaders;
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "PUT",
            headers: finalRetryHeaders,
            body: requestBody,
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

  async patch(endpoint: string, body?: any, options?: { isFormData?: boolean; headers?: Record<string, string> }) {
    const isFormData = options?.isFormData || body instanceof FormData;
    
    try {
      const headers = await getAuthHeaders(isFormData);
      const finalHeaders = options?.headers ? { ...headers, ...options.headers } : headers;
      let requestBody = undefined;
      if (body) {
        requestBody = isFormData ? body : JSON.stringify(body);
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        headers: finalHeaders,
        body: requestBody,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders(isFormData);
          const finalRetryHeaders = options?.headers ? { ...newHeaders, ...options.headers } : newHeaders;
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            method: "PATCH",
            headers: finalRetryHeaders,
            body: requestBody,
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
      console.error("API PATCH error:", error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const headers = await getAuthHeaders(false);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newHeaders = await getAuthHeaders(false);
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