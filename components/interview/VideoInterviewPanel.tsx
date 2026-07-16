"use client";

import { forwardRef, useState, useEffect, useRef, useImperativeHandle } from "react";
import { Video, VideoOff, Loader2, Mic, MicOff, MessageSquare, LogOut, RefreshCw, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { DIDAvatarRef } from "./video/DIDAvatar";

// Dynamically import DIDAvatar with SSR disabled
const DIDAvatar = dynamic(
  () => import("./video/DIDAvatar"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-slate-900/50">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    ),
  }
);

// ============================================================
// INTERFACES
// ============================================================

interface DIDMessage {
  role: "assistant" | "user" | "system";
  content: string;
  text?: string;
  timestamp?: string;
}

interface VideoInterviewPanelProps {
  // Pure UI props - only what's needed for rendering
  connectionState?: "connecting" | "connected" | "disconnected" | "error";
  activityState?: "idle" | "listening" | "thinking" | "speaking";
  currentQuestion?: string;
  transcript?: DIDMessage[];
  isAvatarReady?: boolean;
  isInterviewEnding?: boolean;
  isLoading?: boolean;
  
  // Callbacks - UI events only
  onWebcamToggle?: (enabled: boolean) => void;
  onReconnect?: () => void;
  onEndInterview?: () => void;
  
  // Optional for customization
  className?: string;
}

export interface VideoInterviewPanelRef {
  disconnect: () => Promise<void>;
  interrupt: () => Promise<void>;
  reconnect: () => Promise<void>;
  getMessages: () => DIDMessage[];
  getCurrentQuestion: () => string;
  isConnected: () => boolean;
  isMicPublished: () => boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const VideoInterviewPanel = forwardRef<VideoInterviewPanelRef, VideoInterviewPanelProps>(({
  // UI State Props
  connectionState = "connecting",
  activityState = "idle",
  currentQuestion = "",
  transcript = [],
  isAvatarReady = false,
  isInterviewEnding = false,
  isLoading = false,
  
  // Callbacks
  onWebcamToggle,
  onReconnect,
  onEndInterview,
  
  // Styling
  className = "",
}, ref) => {
  // ============================================================
  // LOCAL UI STATE (PURE UI ONLY)
  // ============================================================

  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const didAvatarRef = useRef<DIDAvatarRef>(null);

  // ============================================================
  // WEBCAM (PURE UI)
  // ============================================================

  useEffect(() => {
    if (isWebcamOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Webcam error:", error);
          toast.error("Failed to access webcam");
          setIsWebcamOn(false);
          onWebcamToggle?.(false);
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamOn]);

  // ============================================================
  // UI ACTIONS (PURE UI - Just emit events)
  // ============================================================

  const handleWebcamToggle = () => {
    const newState = !isWebcamOn;
    setIsWebcamOn(newState);
    onWebcamToggle?.(newState);
  };

  const handleEndInterview = () => {
    if (confirm("Are you sure you want to end this interview?")) {
      onEndInterview?.();
    }
  };

  const handleReconnect = () => {
    toast.info("Reconnecting...");
    onReconnect?.();
  };

  // ============================================================
  // EXPOSE METHODS TO PARENT
  // ============================================================

  useImperativeHandle(ref, () => ({
    disconnect: async () => {
      await didAvatarRef.current?.disconnect();
    },
    interrupt: async () => {
      await didAvatarRef.current?.interrupt();
    },
    reconnect: async () => {
      await didAvatarRef.current?.reconnect();
    },
    getMessages: () => didAvatarRef.current?.getMessages() || [],
    getCurrentQuestion: () => didAvatarRef.current?.getCurrentQuestion() || "",
    isConnected: () => didAvatarRef.current?.isConnected() || false,
    isMicPublished: () => didAvatarRef.current?.isMicPublished() || false,
  }));

  // ============================================================
  // RENDER HELPERS (PURE UI)
  // ============================================================

  const getConnectionIcon = () => {
    switch (connectionState) {
      case "connected":
        return "🟢";
      case "connecting":
        return "🟡";
      case "disconnected":
        return "🔴";
      case "error":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getConnectionLabel = () => {
    switch (connectionState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getActivityIcon = () => {
    switch (activityState) {
      case "listening":
        return "🎤";
      case "thinking":
        return "🧠";
      case "speaking":
        return "🗣️";
      default:
        return "⏳";
    }
  };

  const getActivityLabel = () => {
    switch (activityState) {
      case "listening":
        return "Listening";
      case "thinking":
        return "Thinking";
      case "speaking":
        return "Speaking";
      default:
        return "Ready";
    }
  };

  const getActivityColor = () => {
    switch (activityState) {
      case "listening":
        return "text-emerald-400";
      case "thinking":
        return "text-yellow-400";
      case "speaking":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  // Get last few messages for preview
  const getLastMessages = (count: number = 3) => {
    return transcript.slice(-count);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Panel */}
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 aspect-video">
          {/* Main video area with DID Avatar */}
          <div className="absolute inset-0">
            <DIDAvatar
              ref={didAvatarRef}
              onConnected={() => {}} // Handled by parent
              onDisconnected={() => {}} // Handled by parent
              onQuestionChange={() => {}} // Handled by parent
              onInterviewFinished={() => {}} // Handled by parent
              onTranscript={() => {}} // Handled by parent
              onActivityChange={() => {}} // Handled by parent
              onError={() => {}} // Handled by parent
            />
          </div>

          {/* Webcam overlay */}
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
            {isWebcamOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-white/40" />
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm flex items-center gap-1.5">
              <span className="text-base">{getConnectionIcon()}</span>
              {getConnectionLabel()}
            </Badge>
            {connectionState === "connected" && (
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm flex items-center gap-1.5">
                <span className="text-base">{getActivityIcon()}</span>
                <span className={getActivityColor()}>{getActivityLabel()}</span>
              </Badge>
            )}
          </div>

          {/* Microphone status */}
          {connectionState === "connected" && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Mic className="w-3 h-3 text-emerald-400" />
              <span className="text-white text-xs font-medium">Mic Active</span>
            </div>
          )}

          {/* Loading overlay for avatar */}
          {!isAvatarReady && connectionState === "connecting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-10">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-3" />
                <p className="text-white text-sm font-medium">Loading AI Interviewer...</p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* AI Interviewer Status & Current Question */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <p className="text-xs font-semibold text-gray-500">AI Interviewer</p>
              </div>
              {connectionState === "connected" && (
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            
            {currentQuestion ? (
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <p className="text-gray-800 text-base font-medium leading-relaxed">
                  {currentQuestion}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-400 text-sm italic">
                  {connectionState === "connected" 
                    ? "Waiting for the first question..." 
                    : connectionState === "connecting" 
                    ? "Connecting to AI interviewer..." 
                    : "AI interviewer is not connected"}
                </p>
              </div>
            )}
          </div>

          {/* Conversation Transcript Preview */}
          {transcript.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Conversation
                </p>
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 text-gray-400">
                  {transcript.length} messages
                </Badge>
              </div>
              <div className="space-y-1.5">
                {getLastMessages(4).map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className={`font-semibold min-w-[35px] ${
                      msg.role === "assistant" ? "text-violet-600" : "text-emerald-600"
                    }`}>
                      {msg.role === "assistant" ? "AI:" : "You:"}
                    </span>
                    <span className="text-gray-700 truncate">{msg.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Webcam Toggle */}
            <Button
              variant={isWebcamOn ? "default" : "outline"}
              size="sm"
              onClick={handleWebcamToggle}
              className={isWebcamOn ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              {isWebcamOn ? <Video className="w-4 h-4 mr-1.5" /> : <VideoOff className="w-4 h-4 mr-1.5" />}
              {isWebcamOn ? "Webcam On" : "Webcam Off"}
            </Button>

            {/* Reconnect Button - Only show when disconnected */}
            {(connectionState === "disconnected" || connectionState === "error") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                className="border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Reconnect
              </Button>
            )}

            {/* End Interview Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndInterview}
              disabled={connectionState !== "connected" || isInterviewEnding}
              className="border-red-200 text-red-500 hover:bg-red-50 ml-auto disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              End Interview
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="mt-3 flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

VideoInterviewPanel.displayName = "VideoInterviewPanel";

export default VideoInterviewPanel;