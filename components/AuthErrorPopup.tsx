// utils/apiServices.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ────────────────────────────────────────────────────────────
   POPUP (pure DOM — no React, no new files)
   ──────────────────────────────────────────────────────────── */

type PopupType = "session_expired" | "invalid_session" | "permission_denied" | "generic";

const POPUP_CONFIG: Record<PopupType, { title: string; icon: string; bg: string }> = {
  session_expired: { title: "Session Expired", icon: "⏰", bg: "#F0F0FF" },
  invalid_session: { title: "Invalid Session", icon: "🔒", bg: "#F0F0FF" },
  permission_denied: { title: "Permission Denied", icon: "🚫", bg: "#FEF2F2" },
  generic: { title: "Something Went Wrong", icon: "⚠️", bg: "#F0F0FF" },
};

function showAuthErrorPopup(type: PopupType, message?: string) {
  // Prevent duplicate popups
  if (document.getElementById("auth-error-popup")) return;

  const cfg = POPUP_CONFIG[type];
  const isTerminal = type === "session_expired" || type === "invalid_session";
  const finalMessage =
    message ||
    (isTerminal
      ? "Your session has timed out. Please sign in again to continue."
      : type === "permission_denied"
      ? "You don't have permission to perform this action."
      : "An unexpected error occurred. Please try again.");

  const overlay = document.createElement("div");
  overlay.id = "auth-error-popup";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(13,13,43,0.4); backdrop-filter: blur(4px);
    font-family: Inter, system-ui, sans-serif;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
    background:#fff; border-radius:20px; padding:32px 28px;
    max-width:400px; width:90%; text-align:center;
    box-shadow:0 24px 64px rgba(91,91,214,0.2);
  `;

  box.innerHTML = `
    <div style="width:56px;height:56px;border-radius:50%;background:${cfg.bg};
      display:flex;align-items:center;justify-content:center;
      margin:0 auto 16px;font-size:24px;">${cfg.icon}</div>
    <h3 style="font-family:Outfit,system-ui,sans-serif;font-size:20px;
      font-weight:800;color:#0D0D2B;margin:0 0 8px;">${cfg.title}</h3>
    <p style="font-size:14px;color:#9595BB;line-height:1.6;margin:0 0 24px;">
      ${finalMessage}
    </p>
    <button id="auth-error-popup-btn" style="width:100%;padding:12px 20px;
      background:#5B5BD6;color:#fff;border:none;border-radius:12px;
      font-size:14px;font-weight:600;cursor:pointer;">
      ${isTerminal ? "Sign in again" : "OK"}
    </button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const dismiss = () => {
    overlay.remove();
    if (isTerminal) {
      ["token", "refreshToken", "expiresAt", "userId", "userRole"].forEach((k) =>
        localStorage.removeItem(k)
      );
      window.location.href = "/login";
    }
  };

  document.getElementById("auth-error-popup-btn")!.addEventListener("click", dismiss);

  // For non-terminal errors, clicking the backdrop also dismisses
  if (!isTerminal) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) dismiss();
    });
  }
}

/* ────────────────────────────────────────────────────────────
   AUTH HEADERS (unchanged)
   ──────────────────────────────────────────────────────────── */

const getAuthHeaders = async (isFormData = false) => {
  const token = localStorage.getItem("token");
  if (!token) {
    showAuthErrorPopup("session_expired");
    throw new Error("No token found");
  }
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
};

/* ────────────────────────────────────────────────────────────
   CENTRALIZED RESPONSE HANDLER
   ──────────────────────────────────────────────────────────── */

async function handleResponse(response: Response) {
  if (response.ok) {
    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  // Parse backend message if present
  let backendMessage: string | undefined;
  try {
    const body = await response.json();
    backendMessage = body?.message || body?.error;
  } catch {
    /* body wasn't JSON */
  }

  if (response.status === 401) {
    showAuthErrorPopup("session_expired", backendMessage);
  } else if (response.status === 403) {
    showAuthErrorPopup("permission_denied", backendMessage);
  } else if (response.status >= 500) {
    showAuthErrorPopup("generic", backendMessage);
  }

  const err: any = new Error(backendMessage || `Request failed (${response.status})`);
  err.status = response.status;
  throw err;
}

/* ────────────────────────────────────────────────────────────
   PUBLIC API (same shape as before — no page changes needed)
   ──────────────────────────────────────────────────────────── */

export const api = {
  async get(endpoint: string, params?: Record<string, any>) {
    const headers = await getAuthHeaders(false);
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== "")
            .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : "";
    const res = await fetch(`${API_URL}${endpoint}${queryString}`, { headers });
    return handleResponse(res);
  },

  async post(endpoint: string, body: any, options?: { isFormData?: boolean }) {
    const isFormData = options?.isFormData || body instanceof FormData;
    const headers = await getAuthHeaders(isFormData);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async put(endpoint: string, body: any, options?: { isFormData?: boolean }) {
    const isFormData = options?.isFormData || body instanceof FormData;
    const headers = await getAuthHeaders(isFormData);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async patch(endpoint: string, body?: any, options?: { isFormData?: boolean }) {
    const isFormData = options?.isFormData || body instanceof FormData;
    const headers = await getAuthHeaders(isFormData);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
    return handleResponse(res);
  },

  async delete(endpoint: string) {
    const headers = await getAuthHeaders(false);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(res);
  },
};