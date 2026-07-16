"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Loader2, 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Video,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import VideoInterviewPanel, { VideoInterviewPanelRef } from "./VideoInterviewPanel";
import InterviewSidebar from "./InterviewSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProfessionalInterviewProps {
  onComplete: () => void;
  onBack: () => void;
}

interface DIDMessage {
  role: "assistant" | "user" | "system";
  content: string;
  text?: string;
  timestamp?: string;
}

const interviewTypes = [
  { name: "Frontend", icon: "⚛️" },
  { name: "Backend", icon: "⚙️" },
  { name: "Full Stack", icon: "📦" },
  { name: "HR", icon: "👥" },
  { name: "Behavioral", icon: "🧠" },
];

const techStacks: Record<string, string[]> = {
  "Frontend": ["React.js", "Next.js", "Vue.js", "Angular", "TypeScript", "Tailwind CSS"],
  "Backend": ["Node.js", "Python", "Java", "PHP", "Django", "Spring Boot"],
  "Full Stack": ["MERN Stack", "MEAN Stack", "JAMstack", "LAMP Stack", "Serverless", "Microservices"],
  "HR": ["General HR", "Recruitment", "Employee Relations", "Performance Management", "Compensation", "HR Analytics"],
  "Behavioral": ["Leadership", "Teamwork", "Problem Solving", "Conflict Resolution", "Time Management", "Adaptability"],
};

const difficultyLevels = ["Fresher", "Junior", "Mid", "Senior", "Lead"];

// ============================================================
// FIX 1: Updated duration options
// ============================================================
const durations = [5, 15, 30, 45];

export default function ProfessionalInterview({
  onComplete,
  onBack,
}: ProfessionalInterviewProps) {
  // ============================================================
  // SELECTION STATE
  // ============================================================

  const [showSelection, setShowSelection] = useState(true);
  const [selectedType, setSelectedType] = useState("Frontend");
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Junior");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  // ============================================================
  // INTERVIEW STATE (Simplified)
  // ============================================================

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timer, setTimer] = useState(30 * 60);
  const [isTimerEnding, setIsTimerEnding] = useState(false);
  
  // Results
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalFeedback, setFinalFeedback] = useState<string | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<DIDMessage[]>([]);

  const videoPanelRef = useRef<VideoInterviewPanelRef>(null);

  // ============================================================
  // TIMER
  // ============================================================

  useEffect(() => {
    if (isCompleted || isLoading || showSelection) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // ============================================================
          // FIX 2: Handle timer reaching 0
          // ============================================================
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted, isLoading, showSelection]);

  // ============================================================
  // START INTERVIEW
  // ============================================================

  const startInterview = async () => {
    if (!selectedTech) {
      toast.error("Please select a technology/language");
      return;
    }

    setIsLoading(true);
    setShowSelection(false);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interview_type: selectedType,
          sub_type: selectedTech,
          interview_mode: "video",
          duration: selectedDuration,
          company: company || "",
          job_title: jobTitle || "",
          job_description: "",
          tech_stack: selectedTech,
          difficulty: selectedDifficulty,
          candidate_experience: selectedDifficulty,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        setTimer(data.interview_duration * 60 || selectedDuration * 60);
        toast.success("Interview started successfully!");
      } else {
        toast.error(data.message || "Failed to start interview");
        setShowSelection(true);
      }
    } catch (error) {
      console.error("Start interview error:", error);
      toast.error("Something went wrong. Please try again.");
      setShowSelection(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // FIX 2: Handle Timer End
  // ============================================================

  const handleTimerEnd = async () => {
    if (isTimerEnding || isCompleted) return;
    setIsTimerEnding(true);

    console.log("⏰ Interview timer ended. Finishing interview...");
    toast.warning("Time's up! Your interview is being completed.");

    try {
      // Get the current transcript and messages
      const messages = videoPanelRef.current?.getMessages() || [];
      
      // Build conversation data
      const conversation = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));

      // Complete the interview via API
      await completeInterview(messages, conversation);
      
    } catch (error) {
      console.error("Error completing interview on timer end:", error);
      toast.error("Failed to complete interview. Please try again.");
      setIsTimerEnding(false);
    }
  };

  // ============================================================
  // COMPLETE INTERVIEW
  // ============================================================

  const completeInterview = async (messages: DIDMessage[], conversation?: any[]) => {
    try {
      const token = localStorage.getItem("token");
      
      // Build the payload
      const payload = {
        session_id: sessionId,
        transcript: messages,
        conversation: conversation || messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
        })),
        messages: messages,
        ended_by: isTimerEnding ? "timeout" : "candidate",
      };

      console.log("Completing interview with payload:", payload);

      const response = await fetch(`${API_URL}/api/interview/complete-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setTranscript(messages);
        setFinalScore(data.score || 8);
        setFinalFeedback(
          data.final_feedback || 
          "Great job! You demonstrated strong technical knowledge and communication skills."
        );
        setStrengths(data.strengths || ["Communication", "Technical Knowledge", "Problem Solving"]);
        setImprovements(data.improvements || ["System Design", "Code Optimization"]);
        
        setIsCompleted(true);
        setIsTimerEnding(false);
        
        // Disconnect the avatar
        await videoPanelRef.current?.disconnect();
        
        toast.success(isTimerEnding ? "Interview completed (Time's up!)" : "Interview completed successfully!");
        
        // Navigate to result
        onComplete();
      } else {
        toast.error(data.message || "Failed to complete interview");
        setIsTimerEnding(false);
      }
    } catch (error) {
      console.error("Complete interview error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsTimerEnding(false);
      throw error;
    }
  };

  // ============================================================
  // INTERVIEW COMPLETE HANDLER - Called when DIDAvatar finishes
  // ============================================================

  const handleInterviewFinished = async () => {
    console.log("🎯 Interview finished by avatar");
    // Don't auto-complete here - let the flow handle it
    // The avatar's onInterviewFinished callback triggers this
    // but we want to wait for the user to explicitly end or timer to end
  };

  // ============================================================
  // END INTERVIEW EARLY
  // ============================================================

  const endInterview = async () => {
    if (confirm("Are you sure you want to end this interview? Your progress will be saved.")) {
      const messages = videoPanelRef.current?.getMessages() || [];
      await completeInterview(messages);
    }
  };

  // ============================================================
  // SELECTION SCREEN
  // ============================================================

  if (showSelection) {
    const techOptions = techStacks[selectedType] || [];

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Video className="w-8 h-8" />
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <h2 className="text-2xl font-bold">Professional Video Interview</h2>
            <p className="text-white/80 text-sm mt-1">
              AI-powered avatar interview with structured stages and personalized feedback
            </p>
          </div>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Interview Type */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Interview Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {interviewTypes.map((type) => (
                    <button
                      key={type.name}
                      onClick={() => {
                        setSelectedType(type.name);
                        setSelectedTech("");
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        selectedType === type.name
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <span className="mr-1">{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technology Stack */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Technology / Language</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {techOptions.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTech(tech)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        selectedTech === tech
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:shadow-md"
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                  {techOptions.length === 0 && (
                    <p className="text-xs text-gray-400 col-span-3">No technologies available for this type</p>
                  )}
                </div>
              </div>

              {/* Duration & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {durations.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                          selectedDuration === dur
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:shadow-md"
                        }`}
                      >
                        {dur} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {difficultyLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                          selectedDifficulty === level
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:shadow-md"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company & Job Title (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Job Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startInterview}
                disabled={isLoading || !selectedTech}
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Video Interview
                  </>
                )}
              </Button>

              {/* Back button */}
              <button
                onClick={onBack}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (isLoading && !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Starting your professional interview...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // COMPLETED STATE
  // ============================================================

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold">Interview Complete!</h2>
            <p className="text-white/80">Great job completing your professional interview</p>
          </div>

          <CardContent className="p-6">
            {finalScore && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 rounded-xl">
                  <span className="text-3xl font-bold text-purple-600">{finalScore}/10</span>
                  <span className="text-sm text-gray-500">Final Score</span>
                </div>
              </div>
            )}

            {finalFeedback && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">Overall Feedback</p>
                <p className="text-gray-600">{finalFeedback}</p>
              </div>
            )}

            {strengths.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-purple-600 mb-2">Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((s, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700 border-purple-200">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {improvements.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-amber-700 mb-2">Areas for Improvement</p>
                <div className="flex flex-wrap gap-2">
                  {improvements.map((s, i) => (
                    <Badge key={i} className="bg-amber-50 text-amber-700 border-amber-200">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {transcript.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conversation Transcript</p>
                <div className="space-y-1.5">
                  {transcript.map((msg, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className={`font-semibold min-w-[35px] ${
                        msg.role === "assistant" ? "text-purple-600" : "text-emerald-600"
                      }`}>
                        {msg.role === "assistant" ? "AI:" : "You:"}
                      </span>
                      <span className="text-gray-700">{msg.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={onComplete} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                Start New Interview
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // INTERVIEW SESSION - Simplified
  // ============================================================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Panel - 3/4 width */}
      <div className="lg:col-span-3">
        <VideoInterviewPanel
          ref={videoPanelRef}
          isLoading={isLoading}
        />
      </div>

      {/* Sidebar - 1/4 width */}
      <div className="lg:col-span-1">
        <InterviewSidebar
          timer={timer}
          stages={[]}
          currentStageIndex={0}
          currentQuestionIndex={0}
          totalQuestions={0}
          answeredQuestions={0}
          onEndInterview={endInterview}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
}