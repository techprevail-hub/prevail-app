// app/dashboard/institute/settings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Users, 
  UserCog, 
  Briefcase, 
  TrendingUp, 
  ClipboardList, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Shield, 
  Mail, 
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Services
import {
  getInstituteSettings,
  updateInstituteNotificationSettings,
  updateInstituteFeatureSettings,
} from "@/services/instituteSettingsService";

// Types
import type {
  InstituteSettings,
  NotificationSettings,
  FeatureSettings,
} from "@/types/InstituteSettings";

// ─── Components ──────────────────────────────────────────────────────────────

// ─── Loading Skeleton ──────────────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function InstituteSettingsPage() {
  const router = useRouter();
  
  // ─── State ──────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<InstituteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // ─── Fetch Settings ─────────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getInstituteSettings();

      if (response.success) {
        setSettings(response.data);
      } else {
        toast.error(response.message || "Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to fetch institute settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // ─── Load settings on mount ────────────────────────────────────────────
  useEffect(() => {
    fetchSettings();
  }, []);

  // ─── Handle Notification Change ───────────────────────────────────────
  const handleNotificationChange = async (
    key: keyof NotificationSettings,
    checked: boolean
  ) => {
    if (!settings) return;

    const previousSettings = settings;

    try {
      setUpdating(true);
      setSaveSuccess(false);

      // Update UI immediately
      setSettings({
        ...settings,
        notification_settings: {
          ...settings.notification_settings,
          [key]: checked,
        },
      });

      const response = await updateInstituteNotificationSettings({
        notificationSettings: {
          [key]: checked,
        },
      });

      if (response.success) {
        setSettings(response.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      // Restore old value if API fails
      setSettings(previousSettings);
      console.error("Failed to update notification settings:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setUpdating(false);
    }
  };

  // ─── Handle Feature Change ─────────────────────────────────────────────
  const handleFeatureChange = async (
    key: keyof FeatureSettings,
    checked: boolean
  ) => {
    if (!settings) return;

    const previousSettings = settings;

    try {
      setUpdating(true);
      setSaveSuccess(false);

      // Update UI immediately
      setSettings({
        ...settings,
        feature_settings: {
          ...settings.feature_settings,
          [key]: checked,
        },
      });

      const response = await updateInstituteFeatureSettings({
        featureSettings: {
          [key]: checked,
        },
      });

      if (response.success) {
        setSettings(response.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      // Restore old value if API fails
      setSettings(previousSettings);
      console.error("Failed to update feature settings:", error);
      toast.error("Failed to update feature settings");
    } finally {
      setUpdating(false);
    }
  };

  // ─── Reset to Defaults ─────────────────────────────────────────────────
  const handleResetToDefaults = async () => {
    // Reset all notifications to true
    const defaultNotifications: NotificationSettings = {
      student: true,
      coach: true,
      placement: true,
      careerProgress: true,
      nps: true,
      system: true,
    };

    // Reset all features to true
    const defaultFeatures: FeatureSettings = {
      students: true,
      coaches: true,
      careerProgress: true,
      placement: true,
      nps: true,
      reporting: true,
    };

    try {
      setUpdating(true);
      
      // Update both settings
      await updateInstituteNotificationSettings({
        notificationSettings: defaultNotifications,
      });

      await updateInstituteFeatureSettings({
        featureSettings: defaultFeatures,
      });

      // Refresh settings
      await fetchSettings();
      toast.success("Settings reset to defaults");
      setShowResetDialog(false);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setUpdating(false);
    }
  };

  // ─── Render Loading State ──────────────────────────────────────────────
  if (loading) {
    return <SettingsSkeleton />;
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-violet-500" />
            Institute Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your institute's notifications and feature preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Settings saved
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={updating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50"
            disabled={updating}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* ─── Settings Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Notification Settings ────────────────────────────────────── */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Control which notifications are sent to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Student Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send notifications to students about updates and announcements
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.notification_settings.student ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("student", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Coach Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-emerald-50">
                  <UserCog className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Coach Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send notifications to coaches about student activities
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.notification_settings.coach ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("coach", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Placement Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-amber-50">
                  <Briefcase className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Placement Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send notifications about placement opportunities and updates
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.notification_settings.placement ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("placement", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Career Progress Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-purple-50">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Career Progress Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send notifications about career progress and milestones
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.notification_settings.careerProgress ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("careerProgress", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* NPS Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-rose-50">
                  <ClipboardList className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">NPS Survey Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send notifications for NPS survey requests and reminders
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.notification_settings.nps ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("nps", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* System Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-slate-100">
                  <Shield className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">System Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send system-wide notifications and important alerts
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.notification_settings.system ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("system", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Feature Settings ──────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-lg">Feature Settings</CardTitle>
            </div>
            <CardDescription>
              Enable or disable platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Students Feature */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-700">Students</p>
                <p className="text-sm text-slate-500">Enable student management</p>
              </div>
              <Switch
                checked={settings?.feature_settings.students ?? true}
                onCheckedChange={(checked) =>
                  handleFeatureChange("students", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Coaches Feature */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-700">Coaches</p>
                <p className="text-sm text-slate-500">Enable coach management</p>
              </div>
              <Switch
                checked={settings?.feature_settings.coaches ?? true}
                onCheckedChange={(checked) =>
                  handleFeatureChange("coaches", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Career Progress Feature */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-700">Career Progress</p>
                <p className="text-sm text-slate-500">Enable career tracking features</p>
              </div>
              <Switch
                checked={settings?.feature_settings.careerProgress ?? true}
                onCheckedChange={(checked) =>
                  handleFeatureChange("careerProgress", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Placement Feature */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-700">Placement</p>
                <p className="text-sm text-slate-500">Enable placement management</p>
              </div>
              <Switch
                checked={settings?.feature_settings.placement ?? true}
                onCheckedChange={(checked) =>
                  handleFeatureChange("placement", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* NPS Feature */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-700">NPS Surveys</p>
                <p className="text-sm text-slate-500">Enable NPS survey management</p>
              </div>
              <Switch
                checked={settings?.feature_settings.nps ?? true}
                onCheckedChange={(checked) =>
                  handleFeatureChange("nps", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Reporting Feature */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-700">Reporting</p>
                <p className="text-sm text-slate-500">Enable analytics and reporting</p>
              </div>
              <Switch
                checked={settings?.feature_settings.reporting ?? true}
                onCheckedChange={(checked) =>
                  handleFeatureChange("reporting", checked)
                }
                disabled={updating}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Reset Confirmation Dialog ──────────────────────────────────── */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings to Defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all notification and feature settings to their default values (enabled). 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetToDefaults}
              disabled={updating}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset to Defaults"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}