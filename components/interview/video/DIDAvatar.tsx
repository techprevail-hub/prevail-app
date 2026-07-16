"use client";

import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from "react";
import { Loader2, Mic, MicOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================
// ENUMS
// ============================================================

enum ActivityState {
  IDLE = "idle",
  LISTENING = "listening",
  THINKING = "thinking",
  SPEAKING = "speaking",
}

// ============================================================
// INTERFACES
// ============================================================

interface DIDMessage {
  role: "assistant" | "user" | "system";
  content: string;
  text?: string;
  timestamp?: string;
}

interface DIDAvatarProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onQuestionChange?: (question: string) => void;
  onInterviewFinished?: () => void;
  onTranscript?: (messages: DIDMessage[]) => void;
  onActivityChange?: (state: "idle" | "listening" | "thinking" | "speaking") => void;
  onError?: (error: Error) => void;
}

export interface DIDAvatarRef {
  disconnect: () => Promise<void>;
  interrupt: () => Promise<void>;
  reconnect: () => Promise<void>;
  getMessages: () => DIDMessage[];
  getCurrentQuestion: () => string;
  isConnected: () => boolean;
  isMicPublished: () => boolean;
}

// ============================================================
// LOGGER
// ============================================================

const log = (...args: any[]) => {
  console.log("[D-ID]", ...args);
};

const logError = (...args: any[]) => {
  console.error("[D-ID ERROR]", ...args);
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DIDAvatar = forwardRef<DIDAvatarRef, DIDAvatarProps>(({
  onConnected,
  onDisconnected,
  onQuestionChange,
  onInterviewFinished,
  onTranscript,
  onActivityChange,
  onError,
}, ref) => {
  // ============================================================
  // REFS
  // ============================================================

  const videoRef = useRef<HTMLVideoElement>(null);
  const agentRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const initializedRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const messagesRef = useRef<DIDMessage[]>([]);
  const micPublishedRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const currentQuestionRef = useRef<string>("");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInterviewFinishedRef = useRef<boolean>(false); // Track if interview already finished
  const isDisconnectingRef = useRef<boolean>(false); // Track if we're intentionally disconnecting

  // ============================================================
  // STATE
  // ============================================================

  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(true);
  const [activityState, setActivityState] = useState<ActivityState>(ActivityState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  // ============================================================
  // CONSTANTS
  // ============================================================

  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 3000;

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const handleError = (error: Error | string) => {
    const errorMsg = typeof error === "string" ? error : error.message;
    setError(errorMsg);
    
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      toast.error(errorMsg);
    }, 100);
    
    onError?.(new Error(errorMsg));
    logError(errorMsg);
  };

  const getLatestAssistantMessage = (messages: DIDMessage[]): string => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    if (assistantMessages.length === 0) return "";
    const latest = assistantMessages[assistantMessages.length - 1];
    return latest.content || latest.text || "";
  };

  const isInterviewComplete = (messages: DIDMessage[]): boolean => {
    return messages.some(
      (m) =>
        m.content?.toLowerCase().includes("interview complete") ||
        m.content?.toLowerCase().includes("thank you for attending")
    );
  };

  const convertSDKMessages = (sdkMessages: any[]): DIDMessage[] => {
    return sdkMessages.map((msg) => ({
      role: msg.role === "assistant" || msg.role === "user" || msg.role === "system" 
        ? msg.role 
        : "system",
      content: msg.content || msg.text || "",
      text: msg.text || msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
    }));
  };

  // ============================================================
  // SDK WRAPPER FUNCTIONS
  // ============================================================

  const connectAgent = async () => {
    if (!agentRef.current) {
      throw new Error("Agent not initialized");
    }
    if (typeof agentRef.current.connect !== "function") {
      throw new Error("connect() method not available");
    }
    await agentRef.current.connect();
    log("Connect() called successfully");
  };

  const disconnectAgent = async () => {
    if (!agentRef.current) return;
    if (typeof agentRef.current.disconnect !== "function") {
      logError("disconnect() method not available");
      return;
    }
    await agentRef.current.disconnect();
    log("Disconnect() called successfully");
  };

  const interruptAgent = async () => {
    if (!agentRef.current) return;
    if (typeof agentRef.current.interrupt !== "function") {
      logError("interrupt() method not available");
      return;
    }
    await agentRef.current.interrupt(true);
    log("Interrupt() called successfully");
  };

  const reconnectAgent = async () => {
    if (!agentRef.current) return;
    if (typeof agentRef.current.reconnect !== "function") {
      throw new Error("reconnect() method not available");
    }
    await agentRef.current.reconnect();
    log("Reconnect() called successfully");
  };

  const publishMicrophone = async () => {
    if (!agentRef.current) {
      throw new Error("Agent not initialized");
    }
    if (typeof agentRef.current.publishMicrophoneStream !== "function") {
      throw new Error("publishMicrophoneStream() method not available");
    }
    if (!micStreamRef.current) {
      throw new Error("No microphone stream available");
    }

    await agentRef.current.publishMicrophoneStream(micStreamRef.current);
    micPublishedRef.current = true;
    log("Microphone published successfully");
  };

  const unpublishMicrophone = async () => {
    if (!agentRef.current) return;
    if (typeof agentRef.current.unpublishMicrophoneStream !== "function") {
      logError("unpublishMicrophoneStream() method not available");
      return;
    }
    if (!micPublishedRef.current) return;

    await agentRef.current.unpublishMicrophoneStream();
    micPublishedRef.current = false;
    log("Microphone unpublished successfully");
  };

  // ============================================================
  // MICROPHONE SETUP
  // ============================================================

  const setupMicrophone = async (): Promise<boolean> => {
    try {
      log("Requesting microphone access...");

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = micStream;
      log("Microphone access granted");
      return true;
    } catch (error: any) {
      logError("Microphone setup error:", error);

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        handleError("Microphone access denied. Please allow microphone access.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        handleError("No microphone found. Please connect a microphone.");
      } else {
        handleError(error.message || "Failed to access microphone.");
      }

      return false;
    }
  };

  const cleanupMicrophone = async () => {
    await unpublishMicrophone();
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      log("Microphone tracks stopped");
    }
  };

  // ============================================================
  // RECONNECT LOGIC
  // ============================================================

  const attemptReconnect = async () => {
    // Don't attempt reconnect if interview is finished or we're disconnecting
    if (isInterviewFinishedRef.current || isDisconnectingRef.current) {
      log("⏭️ Skipping reconnect - interview finished or disconnecting");
      return;
    }

    if (isReconnecting) {
      log("⏭️ Already reconnecting");
      return;
    }

    setIsReconnecting(true);
    reconnectAttemptsRef.current = 0;

    for (let attempt = 1; attempt <= MAX_RECONNECT_ATTEMPTS; attempt++) {
      // Check again before each attempt
      if (isInterviewFinishedRef.current || isDisconnectingRef.current) {
        log(`⏭️ Stopping reconnect attempts - interview finished or disconnecting`);
        setIsReconnecting(false);
        return;
      }

      log(`Reconnect attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`);

      try {
        await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));

        // Check again after delay
        if (isInterviewFinishedRef.current || isDisconnectingRef.current) {
          log(`⏭️ Stopping reconnect - state changed during delay`);
          setIsReconnecting(false);
          return;
        }

        if (agentRef.current) {
          await reconnectAgent();
          reconnectAttemptsRef.current = 0;
          setIsReconnecting(false);
          log("✅ Reconnect successful");
          return;
        }
      } catch (error) {
        logError(`Reconnect attempt ${attempt} failed:`, error);

        if (attempt === MAX_RECONNECT_ATTEMPTS) {
          handleError("Unable to reconnect to AI avatar. Please refresh the page.");
          setIsReconnecting(false);
        }
      }
    }
  };

  // ============================================================
  // AGENT INITIALIZATION
  // ============================================================

  const initializeAgent = async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const agentId = process.env.NEXT_PUBLIC_DID_AGENT_ID;

    log("Initializing D-ID Agent...");
    log("Agent ID:", agentId);

    if (!agentId) {
      handleError("NEXT_PUBLIC_DID_AGENT_ID is missing.");
      setConnecting(false);
      return;
    }

    try {
      setConnecting(true);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/interview/client-key`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.clientKey) {
        throw new Error(data.message || "Unable to get D-ID Client Key.");
      }

      log("Client Key received successfully");

      const did = await import("@d-id/client-sdk");

      const callbacks = {
        onSrcObjectReady: (srcObject: MediaStream) => {
          log("Stream ready - Audio:", srcObject.getAudioTracks().length, "Video:", srcObject.getVideoTracks().length);

          if (!videoRef.current) return;

          videoRef.current.srcObject = srcObject;
          videoRef.current.muted = false;
          videoRef.current.defaultMuted = false;
          videoRef.current.volume = 1;

          videoRef.current
            .play()
            .then(() => log("Video playing successfully"))
            .catch((err: any) => logError("Play error:", err));
        },

        onConnectionStateChange: (state: string) => {
          log("Connection State:", state);

          if (state === "connected") {
            log("✅ D-ID Connected Successfully");
            setConnecting(false);
            setError(null);
            reconnectAttemptsRef.current = 0;
            handleConnectedState();
          }

          if (state === "disconnected") {
            log("❌ D-ID Disconnected");
            setConnected(false);
            onDisconnected?.();

            // ⭐ FIX: Only attempt reconnect if:
            // 1. Interview is NOT finished
            // 2. We are NOT intentionally disconnecting
            // 3. We haven't exceeded max attempts
            const shouldReconnect = 
              !isInterviewFinishedRef.current &&
              !isDisconnectingRef.current &&
              !isReconnecting &&
              reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS;

            if (shouldReconnect) {
              log("🔄 Attempting reconnect...");
              attemptReconnect();
            } else {
              if (isInterviewFinishedRef.current) {
                log("✅ Interview finished - no reconnect needed");
              }
              if (isDisconnectingRef.current) {
                log("🛑 Intentional disconnect - no reconnect");
              }
              if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                log("❌ Max reconnect attempts reached");
              }
            }
          }

          if (state === "error") {
            log("⚠️ D-ID Connection Error");
            // Don't auto-reconnect on error if interview is finished
            if (!isInterviewFinishedRef.current && !isDisconnectingRef.current) {
              handleError("Connection error occurred");
            }
          }
        },

        onVideoStateChange: (state: string) => {
          log("Video State:", state);
        },

        onActivityStateChange: (state: string) => {
          log("Activity State:", state);

          const activityMap: Record<string, "idle" | "listening" | "thinking" | "speaking"> = {
            thinking: "thinking",
            listening: "listening",
            speaking: "speaking",
            idle: "idle",
          };

          const mappedState = activityMap[state] || "idle";
          setActivityState(mappedState as ActivityState);
          
          // Emit activity change to parent
          if (onActivityChange) {
            onActivityChange(mappedState);
          }
        },

        onNewMessage: (messages: any[], type?: string) => {
          log("New Messages:", messages.length, "Type:", type);

          const convertedMessages = convertSDKMessages(messages);
          messagesRef.current = [...convertedMessages];

          const question = getLatestAssistantMessage(convertedMessages);
          if (question) {
            currentQuestionRef.current = question;
            onQuestionChange?.(question);
          }

          // Check if interview is complete and not already finished
          if (isInterviewComplete(convertedMessages) && !isInterviewFinishedRef.current) {
            isInterviewFinishedRef.current = true;
            onInterviewFinished?.();
          }

          onTranscript?.([...convertedMessages]);
        },

        onError: (error: any) => {
          logError("D-ID Error:", error);
          
          // Don't attempt reconnect on error if interview is finished or disconnecting
          if (!isInterviewFinishedRef.current && !isDisconnectingRef.current) {
            handleError(error.message || "An error occurred with the AI avatar");

            if (!isReconnecting && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              attemptReconnect();
            }
          } else {
            log("⏭️ Skipping reconnect on error - interview finished or disconnecting");
          }
        },
      };

      agentRef.current = await did.createAgentManager(agentId, {
        auth: {
          type: "key",
          clientKey: data.clientKey,
        },
        callbacks,
      });

      log("Agent Manager Created Successfully");

      await connectAgent();
    } catch (error: any) {
      logError("Initialization error:", error);
      handleError(error.message || "Failed to connect AI avatar");
      setConnecting(false);
    }
  };

  // ============================================================
  // HANDLE CONNECTED STATE
  // ============================================================

  const handleConnectedState = async () => {
    // Don't proceed if interview is finished or disconnecting
    if (isInterviewFinishedRef.current || isDisconnectingRef.current) {
      log("⏭️ Skipping connected state setup - interview finished or disconnecting");
      return;
    }

    try {
      const micSetupSuccess = await setupMicrophone();
      if (!micSetupSuccess) {
        setConnected(false);
        return;
      }

      await publishMicrophone();

      setConnected(true);
      onConnected?.();
      log("✅ Fully connected with microphone published");
    } catch (error: any) {
      logError("Connected state setup error:", error);
      handleError(error.message || "Failed to complete connection setup");
      setConnected(false);
    }
  };

  // ============================================================
  // CLEANUP
  // ============================================================

  const cleanup = async () => {
    log("Starting cleanup...");
    
    // Mark that we're intentionally disconnecting
    isDisconnectingRef.current = true;

    try {
      await interruptAgent();
      await cleanupMicrophone();
      await disconnectAgent();

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setConnected(false);
      setActivityState(ActivityState.IDLE);
      setError(null);

      messagesRef.current = [];
      currentQuestionRef.current = "";
      agentRef.current = null;
      initializedRef.current = false;
      micPublishedRef.current = false;

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }

      // ✅ Call onInterviewFinished when cleanup finishes
      // Only call if interview hasn't been marked as finished yet
      if (!isInterviewFinishedRef.current) {
        isInterviewFinishedRef.current = true;
        onInterviewFinished?.();
      }

      log("✅ Cleanup complete");
    } catch (error) {
      logError("Cleanup error:", error);
    } finally {
      // Reset disconnecting flag after cleanup
      isDisconnectingRef.current = false;
    }
  };

  // ============================================================
  // LIFECYCLE
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;
    initializeAgent();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  // ============================================================
  // EXPOSE METHODS
  // ============================================================

  useImperativeHandle(ref, () => ({
    disconnect: async () => {
      await cleanup();
    },
    interrupt: async () => {
      await interruptAgent();
    },
    reconnect: async () => {
      // Only allow manual reconnect if interview isn't finished
      if (isInterviewFinishedRef.current) {
        log("⏭️ Cannot reconnect - interview already finished");
        toast.error("Cannot reconnect after interview is finished");
        return;
      }
      await attemptReconnect();
    },
    getMessages: () => [...messagesRef.current],
    getCurrentQuestion: () => currentQuestionRef.current,
    isConnected: () => connected,
    isMicPublished: () => micPublishedRef.current,
  }));

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const getActivityIcon = () => {
    switch (activityState) {
      case ActivityState.LISTENING:
        return "🟢";
      case ActivityState.THINKING:
        return "🟡";
      case ActivityState.SPEAKING:
        return "🔵";
      default:
        return "⚪";
    }
  };

  const getActivityLabel = () => {
    switch (activityState) {
      case ActivityState.LISTENING:
        return "Listening";
      case ActivityState.THINKING:
        return "Thinking";
      case ActivityState.SPEAKING:
        return "Speaking";
      default:
        return "Ready";
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900">
      {connecting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-slate-900/80">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="font-semibold">Connecting AI Interviewer...</p>
          <p className="text-xs text-gray-300 mt-1">Please wait while the avatar starts.</p>
        </div>
      )}

      {error && !connecting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-slate-900/80">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="font-semibold text-red-400">Connection Error</p>
          <p className="text-sm text-gray-300 mt-1 max-w-md text-center">{error}</p>
          <button
            onClick={async () => {
              await cleanup();
              initializedRef.current = false;
              initializeAgent();
            }}
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {connected && !connecting && !error && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-base">{getActivityIcon()}</span>
            <span className="text-white text-xs font-medium">
              {getActivityLabel()}
            </span>
          </div>
        </div>
      )}

      {connected && !connecting && !error && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {micPublishedRef.current ? (
              <>
                <Mic className="w-3 h-3 text-emerald-400" />
                <span className="text-white text-xs">Mic Active</span>
              </>
            ) : (
              <>
                <MicOff className="w-3 h-3 text-red-400" />
                <span className="text-white text-xs">Mic Off</span>
              </>
            )}
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
      />
    </div>
  );
});

DIDAvatar.displayName = "DIDAvatar";

export default DIDAvatar;