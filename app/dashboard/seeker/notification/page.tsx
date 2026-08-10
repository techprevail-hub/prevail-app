"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BellRing,
  CheckCircle,
  Sparkles,
  Briefcase,
  UserPlus,
  Calendar,
  Award,
  MessageCircle,
  ArrowLeft,
  CheckCheck,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/apiServices";
import { supabase } from "@/lib/supabaseClient";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("seeker");

  const notificationsPerPage = 20;

  // ─── Fetch User Role ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Try to get role from users table first
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          if (userData?.role) {
            setUserRole(userData.role);
          } else {
            // Fallback to profiles table
            const { data: profileData } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profileData?.role) {
              setUserRole(profileData.role);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [filter, currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/notifications?page=${currentPage}&limit=${notificationsPerPage}&category=${filter}`);
      
      if (response.success) {
        setNotifications(response.data || []);
        // Calculate total pages based on response total count if available
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.total / notificationsPerPage));
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type?: string, category?: string) => {
    if (category === "job") return <Briefcase className="w-5 h-5 text-blue-500" />;
    if (category === "resume") return <Sparkles className="w-5 h-5 text-amber-500" />;
    if (category === "linkedin") return <UserPlus className="w-5 h-5 text-indigo-500" />;
    if (category === "interview") return <MessageCircle className="w-5 h-5 text-purple-500" />;
    if (category === "coach") return <Award className="w-5 h-5 text-emerald-500" />;
    if (category === "survey") return <FileText className="w-5 h-5 text-violet-500" />;
    if (category === "survey_invitation") return <Mail className="w-5 h-5 text-indigo-500" />;
    if (category === "survey_sent") return <BellRing className="w-5 h-5 text-purple-500" />;
    if (type === "achievement") return <Sparkles className="w-5 h-5 text-amber-500" />;
    if (type === "success") return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (type === "event") return <Calendar className="w-5 h-5 text-pink-500" />;
    if (type === "survey") return <FileText className="w-5 h-5 text-violet-500" />;
    if (type === "survey_invitation") return <Mail className="w-5 h-5 text-indigo-500" />;
    if (type === "survey_sent") return <BellRing className="w-5 h-5 text-purple-500" />;
    return <Bell className="w-5 h-5 text-indigo-500" />;
  };

  const formatDate = (dateString: string) => {
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

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/read/${notificationId}`, {});
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all", {});
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    // Optional: Add delete functionality if your backend supports it
    console.log("Delete selected:", selectedNotifications);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      job: "Job Alert",
      resume: "Resume",
      linkedin: "LinkedIn",
      interview: "Interview",
      coach: "Coaching",
      survey: "Survey",
      survey_invitation: "Survey Invitation",
      survey_sent: "Survey Sent",
    };
    return labels[category] || "General";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      job: "bg-blue-100 text-blue-700",
      resume: "bg-amber-100 text-amber-700",
      linkedin: "bg-indigo-100 text-indigo-700",
      interview: "bg-purple-100 text-purple-700",
      coach: "bg-emerald-100 text-emerald-700",
      survey: "bg-violet-100 text-violet-700",
      survey_invitation: "bg-indigo-100 text-indigo-700",
      survey_sent: "bg-purple-100 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  // ─── Get Dashboard Path Based on Role ──────────────────────────────────
  const getDashboardPath = () => {
    switch (userRole) {
      case "institute":
        return "/dashboard/institute";
      case "coach":
        return "/dashboard/coach";
      case "student":
      case "job_seeker":
      default:
        return "/dashboard/seeker";
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Notifications
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Stay updated with your latest activity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
              <Link href={getDashboardPath()}>
                <Button variant="ghost" className="text-gray-500">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <Bell className="w-8 h-8 text-indigo-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{unreadCount}</p>
                <p className="text-xs text-gray-500">Unread</p>
              </div>
              <BellRing className="w-8 h-8 text-emerald-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.category === "job").length}
                </p>
                <p className="text-xs text-gray-500">Job Alerts</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.category === "interview").length}
                </p>
                <p className="text-xs text-gray-500">Interviews</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "unread"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("job")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "job"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Job Alerts
          </button>
          <button
            onClick={() => setFilter("resume")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "resume"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setFilter("interview")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "interview"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Interviews
          </button>
          <button
            onClick={() => setFilter("coach")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "coach"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Coaching
          </button>
          <button
            onClick={() => setFilter("survey")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "survey"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Surveys
          </button>
        </div>

        {/* Notifications List */}
        <Card className="shadow-md border-gray-100">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Your Notifications
              </CardTitle>
              {selectedNotifications.length > 0 && (
                <Button
                  onClick={deleteSelected}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedNotifications.length})
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-sm text-gray-500">
                  When you receive notifications, they will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 transition-all cursor-pointer ${
                      !notification.is_read
                        ? "bg-gradient-to-r from-indigo-50/30 to-transparent hover:bg-indigo-50/50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className={`text-sm font-semibold ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}>
                            {notification.title}
                          </h4>
                          <Badge className={`text-[10px] ${getCategoryColor(notification.category)} border-0`}>
                            {getCategoryLabel(notification.category)}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="shrink-0">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-6">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              className="border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              className="border-gray-200"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}