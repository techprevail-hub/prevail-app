"use client";

import { useEffect, useState } from "react";
import {
  Bell, User, Settings as SettingsIcon, Mail, BellRing, Briefcase,
  Target, Globe, GraduationCap, CreditCard, Shield, Save, AlertCircle,
  CheckCircle, TrendingUp, Sparkles, Zap, Lock, Eye, Moon, Sun,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/apiServices";

interface SettingsData {
  account?: {
    name: string;
    email: string;
    role: string;
  };
  notifications?: {
    email: boolean;
    push: boolean;
    jobAlerts: boolean;
    marketingEmails: boolean;
  };
  preferences?: {
    careerStage: string;
    careerGoal: string;
    targetIndustry: string;
    interestedInCoaching: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    jobAlerts: true,
    marketingEmails: false,
  });

  const [preferences, setPreferences] = useState({
    careerStage: "",
    careerGoal: "",
    targetIndustry: "",
    interestedInCoaching: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/settings/me");

      if (response.success && response.data) {
        setSettings(response.data);

        if (response.data.notifications) {
          setNotifications(response.data.notifications);
        }

        if (response.data.preferences) {
          setPreferences(response.data.preferences);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSavingNotifications(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.put("/api/settings/notifications", {
        notifications,
      });

      if (response.success) {
        setSuccessMessage("Notifications updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.message || "Failed to update notifications");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setSavingNotifications(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSavingPreferences(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.put("/api/settings/preferences", {
        preferences,
      });

      if (response.success) {
        setSuccessMessage("Preferences updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.message || "Failed to update preferences");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setSavingPreferences(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md shrink-0">
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Settings
            </h1>
          </div>
          <p className="text-gray-500 ml-12 sm:ml-14 text-xs sm:text-sm">
            Manage your account preferences and notification settings
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Section - Left Column */}
          <Card className="shadow-md border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Account Information
              </CardTitle>
              <CardDescription className="text-xs">
                Your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-base font-semibold text-gray-900">
                    {settings?.account?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                  <p className="text-base font-semibold text-gray-900">
                    {settings?.account?.email || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Account Role</p>
                  <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0 px-3 py-1">
                    {settings?.account?.role || "N/A"}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Member Since</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section - Right Column */}
          <Card className="shadow-md border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Choose how you want to receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3">
                    <BellRing className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Push Notifications</p>
                      <p className="text-xs text-gray-500">Instant notifications in browser</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Job Alerts</p>
                      <p className="text-xs text-gray-500">New job matches and recommendations</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.jobAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, jobAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Marketing Emails</p>
                      <p className="text-xs text-gray-500">Tips, updates, and special offers</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <Button
                onClick={saveNotifications}
                disabled={savingNotifications}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                {savingNotifications ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Section - Full Width */}
          <Card className="shadow-md border-gray-100 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Career Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Customize your career journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Career Stage
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., Entry Level, Mid-Level, Senior, Executive"
                    value={preferences.careerStage}
                    onChange={(e) =>
                      setPreferences({ ...preferences, careerStage: e.target.value })
                    }
                    className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" />
                    Career Goal
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., Become a Tech Lead, Start a Business"
                    value={preferences.careerGoal}
                    onChange={(e) =>
                      setPreferences({ ...preferences, careerGoal: e.target.value })
                    }
                    className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Target Industry
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={preferences.targetIndustry}
                    onChange={(e) =>
                      setPreferences({ ...preferences, targetIndustry: e.target.value })
                    }
                    className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Interested in Coaching</p>
                      <p className="text-xs text-gray-600">Get personalized career coaching</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.interestedInCoaching}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, interestedInCoaching: checked })
                    }
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <Button
                onClick={savePreferences}
                disabled={savingPreferences}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                {savingPreferences ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Billing Section - Full Width */}
          <Card className="shadow-md border-gray-100 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Billing & Plan
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-3 py-1 mb-2">
                      Current Plan
                    </Badge>
                    <p className="text-xl font-bold text-gray-900">Free Plan</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Basic features included. Upgrade for premium access.
                    </p>
                  </div>
                  <Button
                    disabled
                    className="bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-2xl font-bold text-indigo-600">0</p>
                  <p className="text-xs text-gray-500">Analyses Used</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-2xl font-bold text-indigo-600">Unlimited</p>
                  <p className="text-xs text-gray-500">AI Analyses</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-2xl font-bold text-indigo-600">Free</p>
                  <p className="text-xs text-gray-500">Monthly Cost</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Billing Coming Soon</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Premium plans with advanced features will be available soon. Stay tuned!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            Your data is encrypted and secure
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <Shield className="w-3 h-3" />
            Protected by Prevail AI security
          </p>
        </div>

      </div>
    </div>
  );
}