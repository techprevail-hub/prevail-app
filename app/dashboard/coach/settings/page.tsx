
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCoachSettings,
  updateCoachNotificationSettings,
  updateCoachSessionPreferences,
  updateCoachGeneralPreferences,
} from "@/services/role-coach/settingsService";

import type {
  CoachSettings,
  CoachNotificationPreferences,
  CoachSessionPreferences,
  CoachGeneralPreferences,
} from "@/types/role-coach/settings.types";

type SettingsSection = "notifications" | "sessions" | "general";

type NotificationKey =
  | "newBooking"
  | "bookingCancellation"
  | "sessionReminder"
  | "paymentUpdates"
  | "newReview"
  | "platformUpdates";

const notificationItems: {
  key: NotificationKey;
  label: string;
  description: string;
}[] = [
  {
    key: "newBooking",
    label: "New booking",
    description: "Get notified when someone books a session with you.",
  },
  {
    key: "bookingCancellation",
    label: "Booking cancellation",
    description: "Know when a scheduled session is cancelled.",
  },
  {
    key: "sessionReminder",
    label: "Session reminders",
    description: "Receive reminders before your scheduled sessions.",
  },
  {
    key: "paymentUpdates",
    label: "Payment updates",
    description: "Receive updates about session payments.",
  },
  {
    key: "newReview",
    label: "New reviews",
    description: "Get notified when a client leaves a review.",
  },
  {
    key: "platformUpdates",
    label: "Platform updates",
    description: "Hear about new features and important announcements.",
  },
];

const defaultSettings: CoachSettings = {
  coach_id: "",
  notification_preferences: {
    email: {
      newBooking: true,
      bookingCancellation: true,
      sessionReminder: true,
      paymentUpdates: true,
      newReview: true,
      platformUpdates: false,
    },
    inApp: {
      newBooking: true,
      bookingCancellation: true,
      sessionReminder: true,
      paymentUpdates: true,
      newReview: true,
      platformUpdates: true,
    },
  },
  session_preferences: {
    defaultDurationMinutes: 60,
    bufferMinutes: 10,
    minimumNoticeHours: 24,
  },
  general_preferences: {
    language: "en",
    timezone: "Asia/Kolkata",
  },
};

const sections: {
  id: SettingsSection;
  label: string;
  description: string;
}[] = [
  {
    id: "notifications",
    label: "Notifications",
    description: "Choose which updates you receive.",
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "Configure your default session preferences.",
  },
  {
    id: "general",
    label: "General",
    description: "Manage your language and time zone.",
  },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default function CoachSettingsPage() {
  const [settings, setSettings] = useState<CoachSettings>(defaultSettings);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("notifications");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingSection, setSavingSection] =
    useState<SettingsSection | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await getCoachSettings();

      if (!data) {
        throw new Error("Unable to load coach settings.");
      }

      setSettings({
        ...defaultSettings,
        ...data,
        notification_preferences: {
          email: {
            ...defaultSettings.notification_preferences.email,
            ...data.notification_preferences?.email,
          },
          inApp: {
            ...defaultSettings.notification_preferences.inApp,
            ...data.notification_preferences?.inApp,
          },
        },
        session_preferences: {
          ...defaultSettings.session_preferences,
          ...data.session_preferences,
        },
        general_preferences: {
          ...defaultSettings.general_preferences,
          ...data.general_preferences,
        },
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading settings."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateNotification = (
    channel: "email" | "inApp",
    key: NotificationKey,
    checked: boolean
  ) => {
    setSettings((current) => ({
      ...current,
      notification_preferences: {
        ...current.notification_preferences,
        [channel]: {
          ...current.notification_preferences[channel],
          [key]: checked,
        },
      },
    }));

    setSuccessMessage("");
    setSaveError("");
  };

  const updateSession = (
    key: keyof CoachSessionPreferences,
    value: number
  ) => {
    setSettings((current) => ({
      ...current,
      session_preferences: {
        ...current.session_preferences,
        [key]: value,
      },
    }));

    setSuccessMessage("");
    setSaveError("");
  };

  const updateGeneral = (
    key: keyof CoachGeneralPreferences,
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      general_preferences: {
        ...current.general_preferences,
        [key]: value,
      },
    }));

    setSuccessMessage("");
    setSaveError("");
  };

  const saveSection = async (section: SettingsSection) => {
    setSavingSection(section);
    setSaveError("");
    setSuccessMessage("");

    try {
      let updatedSettings: CoachSettings;

      if (section === "notifications") {
        const preferences: CoachNotificationPreferences = {
          email: { ...settings.notification_preferences.email },
          inApp: { ...settings.notification_preferences.inApp },
        };

        updatedSettings =
          await updateCoachNotificationSettings(preferences);
      } else if (section === "sessions") {
        const preferences: CoachSessionPreferences = {
          ...settings.session_preferences,
        };

        updatedSettings =
          await updateCoachSessionPreferences(preferences);
      } else {
        const preferences: CoachGeneralPreferences = {
          ...settings.general_preferences,
        };

        updatedSettings =
          await updateCoachGeneralPreferences(preferences);
      }

      setSettings((current) => ({
        ...current,
        ...updatedSettings,
        notification_preferences: {
          email: {
            ...current.notification_preferences.email,
            ...updatedSettings.notification_preferences?.email,
          },
          inApp: {
            ...current.notification_preferences.inApp,
            ...updatedSettings.notification_preferences?.inApp,
          },
        },
        session_preferences: {
          ...current.session_preferences,
          ...updatedSettings.session_preferences,
        },
        general_preferences: {
          ...current.general_preferences,
          ...updatedSettings.general_preferences,
        },
      }));

      setSuccessMessage("Your settings have been saved successfully.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save settings. Please try again."
      );
    } finally {
      setSavingSection(null);
    }
  };

  const activeLabel =
    sections.find((section) => section.id === activeSection)?.label ??
    "Settings";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 3.12-.08-.02a1.7 1.7 0 0 0-1.77.6l-.05.07h-3.6l-.04-.08a1.7 1.7 0 0 0-1.52-.92 1.7 1.7 0 0 0-.7.15l-.08.04-3.12-1.8.02-.08a1.7 1.7 0 0 0-.6-1.77l-.07-.05v-3.6l.08-.04a1.7 1.7 0 0 0 .77-2.22l-.04-.08 1.8-3.12.08.02a1.7 1.7 0 0 0 1.77-.6l.05-.07h3.6l.04.08a1.7 1.7 0 0 0 2.22.77l.08-.04 3.12 1.8-.02.08a1.7 1.7 0 0 0 .6 1.77l.07.05v3.6l-.08.04a1.7 1.7 0 0 0-1.13.59Z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your coach account preferences and notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {loadError && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="self-start rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {saveError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {saveError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Preferences
            </p>

            <nav
              aria-label="Settings sections"
              className="flex gap-2 overflow-x-auto lg:flex-col"
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(section.id);
                    setSaveError("");
                    setSuccessMessage("");
                  }}
                  className={`flex min-w-fit flex-1 items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors lg:flex-none ${
                    activeSection === section.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mt-0.5 text-lg" aria-hidden="true">
                    {section.id === "notifications"
                      ? "◉"
                      : section.id === "sessions"
                        ? "◷"
                        : "⚙"}
                  </span>

                  <span>
                    <span className="block text-sm font-semibold">
                      {section.label}
                    </span>
                    <span
                      className={`mt-1 hidden text-xs leading-5 lg:block ${
                        activeSection === section.id
                          ? "text-indigo-600"
                          : "text-gray-500"
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main settings panel */}
          <main className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div
                className="space-y-6 p-6 sm:p-8"
                aria-label="Loading settings"
              >
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                  <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                    Coach preferences
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {activeLabel}
                  </h2>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Notifications */}
                  {activeSection === "notifications" && (
                    <div>
                      <SectionHeading
                        title="Notification preferences"
                        description="Control how you receive updates about your coaching activity."
                      />

                      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
                        <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 bg-gray-50 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_100px_100px]">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Notification
                          </span>
                          <span className="text-center text-xs font-semibold text-gray-600">
                            Email
                          </span>
                          <span className="text-center text-xs font-semibold text-gray-600">
                            In-app
                          </span>
                        </div>

                        {notificationItems.map((item, index) => (
                          <div
                            key={item.key}
                            className={`grid grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_100px_100px] ${
                              index !== notificationItems.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex justify-center">
                              <Toggle
                                label={`${item.label} email notifications`}
                                checked={
                                  settings.notification_preferences.email[
                                    item.key
                                  ]
                                }
                                onChange={(checked) =>
                                  updateNotification(
                                    "email",
                                    item.key,
                                    checked
                                  )
                                }
                              />
                            </div>

                            <div className="flex justify-center">
                              <Toggle
                                label={`${item.label} in-app notifications`}
                                checked={
                                  settings.notification_preferences.inApp[
                                    item.key
                                  ]
                                }
                                onChange={(checked) =>
                                  updateNotification(
                                    "inApp",
                                    item.key,
                                    checked
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <p className="text-xs text-gray-500">
                          Changes take effect after you save.
                        </p>
                        <button
                          type="button"
                          disabled={savingSection !== null}
                          onClick={() => void saveSection("notifications")}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingSection === "notifications"
                            ? "Saving..."
                            : "Save notifications"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Session preferences */}
                  {activeSection === "sessions" && (
                    <div>
                      <SectionHeading
                        title="Session preferences"
                        description="Set the default duration, buffer time, and advance notice for your sessions."
                      />

                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="session-duration"
                            className="block text-sm font-semibold text-gray-800"
                          >
                            Default session duration
                          </label>
                          <p className="mt-1 text-sm text-gray-500">
                            The default length for a coaching session.
                          </p>
                          <select
                            id="session-duration"
                            value={
                              settings.session_preferences
                                .defaultDurationMinutes
                            }
                            onChange={(event) =>
                              updateSession(
                                "defaultDurationMinutes",
                                Number(event.target.value)
                              )
                            }
                            className="mt-3 block w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-sm"
                          >
                            {[15, 30, 45, 60, 90, 120, 180, 240].map(
                              (minutes) => (
                                <option key={minutes} value={minutes}>
                                  {minutes} minutes
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <label
                            htmlFor="buffer-time"
                            className="block text-sm font-semibold text-gray-800"
                          >
                            Buffer between sessions
                          </label>
                          <p className="mt-1 text-sm text-gray-500">
                            Keep some time free between consecutive sessions.
                          </p>
                          <select
                            id="buffer-time"
                            value={
                              settings.session_preferences.bufferMinutes
                            }
                            onChange={(event) =>
                              updateSession(
                                "bufferMinutes",
                                Number(event.target.value)
                              )
                            }
                            className="mt-3 block w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-sm"
                          >
                            {[0, 5, 10, 15, 20, 30, 45, 60, 90, 120].map(
                              (minutes) => (
                                <option key={minutes} value={minutes}>
                                  {minutes === 0
                                    ? "No buffer"
                                    : `${minutes} minutes`}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <label
                            htmlFor="minimum-notice"
                            className="block text-sm font-semibold text-gray-800"
                          >
                            Minimum advance notice
                          </label>
                          <p className="mt-1 text-sm text-gray-500">
                            How early a client must book a session.
                          </p>
                          <select
                            id="minimum-notice"
                            value={
                              settings.session_preferences.minimumNoticeHours
                            }
                            onChange={(event) =>
                              updateSession(
                                "minimumNoticeHours",
                                Number(event.target.value)
                              )
                            }
                            className="mt-3 block w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-sm"
                          >
                            {[
                              { value: 0, label: "No minimum notice" },
                              { value: 1, label: "1 hour" },
                              { value: 2, label: "2 hours" },
                              { value: 6, label: "6 hours" },
                              { value: 12, label: "12 hours" },
                              { value: 24, label: "24 hours" },
                              { value: 48, label: "48 hours" },
                              { value: 72, label: "72 hours" },
                              { value: 168, label: "1 week" },
                            ].map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end border-t border-gray-100 pt-5">
                        <button
                          type="button"
                          disabled={savingSection !== null}
                          onClick={() => void saveSection("sessions")}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingSection === "sessions"
                            ? "Saving..."
                            : "Save session preferences"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* General preferences */}
                  {activeSection === "general" && (
                    <div>
                      <SectionHeading
                        title="General preferences"
                        description="Choose the language and time zone used for your coach experience."
                      />

                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="language"
                            className="block text-sm font-semibold text-gray-800"
                          >
                            Language
                          </label>
                          <p className="mt-1 text-sm text-gray-500">
                            Select your preferred language.
                          </p>
                          <select
                            id="language"
                            value={settings.general_preferences.language}
                            onChange={(event) =>
                              updateGeneral("language", event.target.value)
                            }
                            className="mt-3 block w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-sm"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="mr">Marathi</option>
                          </select>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <label
                            htmlFor="timezone"
                            className="block text-sm font-semibold text-gray-800"
                          >
                            Time zone
                          </label>
                          <p className="mt-1 text-sm text-gray-500">
                            Used for displaying your session times.
                          </p>
                          <select
                            id="timezone"
                            value={settings.general_preferences.timezone}
                            onChange={(event) =>
                              updateGeneral("timezone", event.target.value)
                            }
                            className="mt-3 block w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-sm"
                          >
                            <option value="Asia/Kolkata">
                              India Standard Time (Asia/Kolkata)
                            </option>
                            <option value="UTC">UTC</option>
                            <option value="Asia/Dubai">
                              Gulf Standard Time (Asia/Dubai)
                            </option>
                            <option value="Europe/London">
                              United Kingdom (Europe/London)
                            </option>
                            <option value="America/New_York">
                              Eastern Time (America/New_York)
                            </option>
                            <option value="America/Los_Angeles">
                              Pacific Time (America/Los_Angeles)
                            </option>
                            <option value="Asia/Singapore">
                              Singapore (Asia/Singapore)
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end border-t border-gray-100 pt-5">
                        <button
                          type="button"
                          disabled={savingSection !== null}
                          onClick={() => void saveSection("general")}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingSection === "general"
                            ? "Saving..."
                            : "Save general settings"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
