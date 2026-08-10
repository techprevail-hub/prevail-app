"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/apiServices";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  CheckCircle, 
  Sparkles, 
  Briefcase, 
  UserPlus,
  FileText,   // ← ADD THIS
  Mail,       // ← ADD THIS
  BellRing    // ← You already have this
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  action_url: string;
  category: string;
  created_at: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // GET /api/notifications (matches your backend route)
      const response = await api.get("/api/notifications");

      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error("Notification Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "job_alert":
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case "achievement":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "connection":
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "survey":           // ← ADD THIS
        return <FileText className="w-4 h-4 text-violet-500" />;
      case "survey_invitation": // ← ADD THIS
        return <Mail className="w-4 h-4 text-indigo-500" />;
      case "survey_sent":      // ← ADD THIS
        return <BellRing className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // PUT /api/notifications/read/:id (matches your backend route)
      await api.put(`/api/notifications/read/${notificationId}`, {});
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // PUT /api/notifications/read-all (matches your backend route)
      await api.put("/api/notifications/read-all", {});
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="navbar-icon-btn navbar-notif-btn relative"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <span className="navbar-notif-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-xl"
        sideOffset={8}
      >
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={async () => {
                  if (!item.is_read) {
                    await markAsRead(item.id);
                  }
                  if (item.action_url) {
                    window.location.href = item.action_url;
                  }
                }}
                className={`p-4 border-b border-gray-50 transition-all cursor-pointer ${
                  !item.is_read
                    ? "bg-gradient-to-r from-indigo-50/50 to-transparent hover:bg-indigo-50/70"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${!item.is_read ? "text-gray-900" : "text-gray-700"}`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  {!item.is_read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              onClick={() => window.location.href = "/dashboard/seeker/notification"}
            >
              View all notifications →
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}