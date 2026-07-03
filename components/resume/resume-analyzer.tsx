"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload, FileText, CheckCircle, AlertCircle, TrendingUp,
  Briefcase, Lightbulb, ArrowRight, RefreshCw,
  Shield, X, ThumbsUp, ThumbsDown, Sparkles, Target,
  Zap, BarChart3, ChevronRight, Brain, ScanSearch, Cpu, BadgeCheck,
  History, Hourglass, Timer, AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/apiServices";

interface ResumeResult {
  id?: string;
  fileName?: string;
  extractedText?: string;
  score: number;
  ats_score: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommendedKeywords: string[];
  ai_summary: string;
  aiGeneratedAt?: string;
}

interface HistoryItem {
  id: string;
  file_name: string;
  extracted_text: string;
  score: number;
  ats_score: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommended_keywords: string[];
  ai_summary: string;
  ai_generated_at: string;
}

const getScoreColor = (s: number) => {
  const score = s || 0;
  return score >= 80 ? "text-emerald-600" : score >= 60 ? "text-violet-600" : "text-amber-500";
};

const getScoreRing = (s: number) => {
  const score = s || 0;
  return score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-violet-500" : "stroke-amber-400";
};

const getScoreLabel = (s: number) => {
  const score = s || 0;
  return score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs Work";
};

const getAtsLabel = (s: number) => {
  const score = s || 0;
  return score >= 80 ? "Highly Compatible" : score >= 60 ? "Moderately Compatible" : score >= 40 ? "Low Compatibility" : "Poor Compatibility";
};

const getScoreBg = (s: number) => {
  const score = s || 0;
  return score >= 80 ? "bg-emerald-100 text-emerald-700" : score >= 60 ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700";
};

const isValidFile = (f: File) =>
  f.type === "application/pdf" ||
  f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Loader steps shown during analysis
const LOADER_STEPS = [
  { icon: Upload,      label: "Uploading resume…",          detail: "Sending your file securely" },
  { icon: ScanSearch,  label: "Scanning document…",         detail: "Extracting text and structure" },
  { icon: Brain,       label: "Running AI analysis…",       detail: "Evaluating content & keywords" },
  { icon: Cpu,         label: "Scoring ATS compatibility…", detail: "Checking recruiter readability" },
  { icon: BadgeCheck,  label: "Finalizing results…",        detail: "Almost ready!" },
];

function AnalysisLoader() {
  const [progress, setProgress]   = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = prev < 40 ? 2 : prev < 70 ? 1.2 : prev < 90 ? 0.6 : 0.2;
        return Math.min(prev + increment, 95);
      });
    }, 120);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    const idx = progress < 20 ? 0 : progress < 45 ? 1 : progress < 65 ? 2 : progress < 85 ? 3 : 4;
    setStepIndex(idx);
  }, [progress]);

  const CurrentIcon = LOADER_STEPS[stepIndex].icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center gap-6">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" fill="none" stroke="#e0e7ff" strokeWidth="6" />
          <circle cx="56" cy="56" r="50" fill="none" stroke="url(#grad)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray="80 235" />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-pulse">
          <CurrentIcon className="w-7 h-7 text-indigo-600" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          {Math.round(progress)}%
        </p>
        <p className="text-base font-semibold text-gray-800 mt-1">{LOADER_STEPS[stepIndex].label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{LOADER_STEPS[stepIndex].detail}</p>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2 w-full justify-between">
        {LOADER_STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const done    = i < stepIndex;
          const active  = i === stepIndex;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                done   ? "bg-indigo-600 text-white shadow-md"
                : active ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400 ring-offset-1"
                : "bg-gray-100 text-gray-300"
              }`}>
                {done
                  ? <CheckCircle className="w-4 h-4" />
                  : <StepIcon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight hidden sm:block ${
                active ? "text-indigo-600" : done ? "text-gray-500" : "text-gray-300"
              }`}>
                {step.label.replace("…", "")}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        This usually takes 20–40 seconds. Please don't close the page.
      </p>
    </div>
  );
}

function CircularScore({ score, label, icon: Icon, sublabel }: {
  score: number; label: string; icon: React.ElementType; sublabel: string;
}) {
  // Validate score to prevent NaN
  const validScore = typeof score === 'number' && !isNaN(score) ? Math.min(Math.max(score, 0), 100) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (validScore / 100) * circ;
  
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-2 w-full">
        <Icon className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 130 130" className="absolute top-0 left-0">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle 
            cx="65" 
            cy="65" 
            r={r} 
            fill="none" 
            strokeWidth="10" 
            strokeLinecap="round"
            strokeDasharray={circ} 
            strokeDashoffset={offset || 0}
            transform="rotate(-90 65 65)" 
            className={getScoreRing(validScore)}
            style={{ transition: "stroke-dashoffset 1s ease" }} 
          />
        </svg>
        <div className="relative flex items-baseline gap-0.5">
          <span className={`text-3xl font-black ${getScoreColor(validScore)}`}>{validScore}</span>
          <span className="text-xs text-gray-400 font-medium">/100</span>
        </div>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getScoreBg(validScore)}`}>{sublabel}</span>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [file, setFile]             = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<ResumeResult | null>(null);
  const [error, setError]           = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory]       = useState<ResumeResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Load cooldown state from localStorage on mount
  useEffect(() => {
    const savedCooldown = localStorage.getItem('resume_cooldown_until');
    
    if (savedCooldown && parseInt(savedCooldown) > Date.now()) {
      setCooldownUntil(parseInt(savedCooldown));
    } else if (savedCooldown) {
      // Clear expired cooldown
      localStorage.removeItem('resume_cooldown_until');
    }
  }, []);

  // Update current time every second for live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check and clear cooldown when expired
  useEffect(() => {
    if (cooldownUntil && cooldownUntil <= Date.now()) {
      setCooldownUntil(null);
      localStorage.removeItem('resume_cooldown_until');
      setError("");
    }
  }, [currentTime, cooldownUntil]);

  // Fetch resume history on page load
  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      setLoadingHistory(true);
      setError("");
      
      const response = await api.get("/api/resume/history");
      
      console.log("History API response:", response);
      
      // Handle different response structures
      let data = response;
      if (response && response.data) {
        data = response.data;
      }
      
      // Check if response has success property
      const isSuccess = response.success !== undefined ? response.success : true;
      
      if (isSuccess && data && Array.isArray(data) && data.length > 0) {
        // Map the backend data to match our interface
        const mappedHistory = data.map((item: HistoryItem) => ({
          id: item.id,
          fileName: item.file_name,
          extractedText: item.extracted_text,
          score: item.score || 0,
          ats_score: item.ats_score || 0,
          skills: item.skills || [],
          strengths: item.strengths || [],
          weaknesses: item.weaknesses || [],
          suggestions: item.suggestions || [],
          recommendedKeywords: item.recommended_keywords || [],
          ai_summary: item.ai_summary || "",
          aiGeneratedAt: item.ai_generated_at,
        }));
        
        setHistory(mappedHistory);
        // Show the latest analysis (first item in array)
        setResult(mappedHistory[0]);
        console.log("Latest resume analysis loaded:", mappedHistory[0]);
        console.log("Total history items:", mappedHistory.length);
        console.log("Keywords in latest:", mappedHistory[0].recommendedKeywords);
      } else if (isSuccess && data && data.length === 0) {
        console.log("No resume history found");
        setHistory([]);
        setResult(null);
      } else {
        console.log("Invalid response format:", response);
        if (response.message) {
          setError(response.message);
        }
      }
    } catch (err: any) {
      console.error("Error fetching resume history:", err);
      // Don't show error for empty history - just log it
      if (err.message && !err.message.includes("Session expired")) {
        console.log("Could not fetch resume history:", err.message);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) isValidFile(f) ? (setFile(f), setError("")) : setError("Please upload a PDF or DOCX file only.");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    isValidFile(f) ? (setFile(f), setError("")) : (setError("Please upload a PDF or DOCX file only."), setFile(null));
  };

  // Check if user is in cooldown period
  const isInCooldown = () => {
    if (!cooldownUntil) return false;
    return Date.now() < cooldownUntil;
  };

  // Get remaining cooldown time in minutes and seconds
  const getRemainingCooldownTime = () => {
    if (!cooldownUntil) return { minutes: 0, seconds: 0, totalSeconds: 0 };
    const remainingSeconds = Math.max(0, Math.floor((cooldownUntil - Date.now()) / 1000));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return { minutes, seconds, totalSeconds: remainingSeconds };
  };

  // Check if error is 503 service unavailable - checks both message and error fields
  const isServiceUnavailableError = (response: any) => {
    const message = response?.message || "";
    const error = response?.error || "";
    const combinedMessage = `${message} ${error}`.toLowerCase();
    
    return combinedMessage.includes("503") || 
           combinedMessage.includes("service unavailable") ||
           combinedMessage.includes("high demand") ||
           combinedMessage.includes("busy") ||
           combinedMessage.includes("unavailable") ||
           combinedMessage.includes("try again later") ||
           combinedMessage.includes("generativeai error");
  };

  const handleUpload = async () => {
    setError(""); 
    setResult(null);
    
    // Check cooldown
    if (isInCooldown()) {
      const { minutes, seconds } = getRemainingCooldownTime();
      setError(`You've hit the rate limit. Please try again after ${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}.`);
      return;
    }
    
    if (!file) return setError("Please select a resume file.");
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("resume", file);
      
      console.log("Uploading file:", file.name, file.type, file.size);
      
      // Use api.post for the upload
      const response = await api.post("/api/resume/upload", formData);
      
      console.log("Upload response:", response);
      
      if (response && response.success && response.data) {
        const data = response.data;
        // Map the response data to match our interface
        const mappedResult = {
          id: data.id,
          fileName: data.file_name,
          extractedText: data.extracted_text,
          score: data.score || 0,
          ats_score: data.ats_score || 0,
          skills: data.skills || [],
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          suggestions: data.suggestions || [],
          recommendedKeywords: data.recommended_keywords || [],
          ai_summary: data.ai_summary || "",
          aiGeneratedAt: data.ai_generated_at,
        };
        setResult(mappedResult);
        console.log("Upload response keywords:", mappedResult.recommendedKeywords);
        
        // Reset cooldown on success
        setCooldownUntil(null);
        localStorage.removeItem('resume_cooldown_until');
        
        // Refresh history after successful upload
        await fetchResumeHistory();
      } else {
        // Check for 503 service unavailable error in response
        if (isServiceUnavailableError(response)) {
          // Set 1-hour cooldown
          const cooldownTime = Date.now() + (60 * 60 * 1000); // 1 hour
          setCooldownUntil(cooldownTime);
          localStorage.setItem('resume_cooldown_until', cooldownTime.toString());
          setError(`The AI service is currently experiencing high demand. You've hit the rate limit. Please try again after 1 hour.`);
        } else {
          setError(response?.message || "Resume upload failed.");
        }
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      
      // Check if the error response contains 503 information
      const errorResponse = err.response?.data || err;
      
      if (isServiceUnavailableError(errorResponse)) {
        // Set 1-hour cooldown
        const cooldownTime = Date.now() + (60 * 60 * 1000); // 1 hour
        setCooldownUntil(cooldownTime);
        localStorage.setItem('resume_cooldown_until', cooldownTime.toString());
        setError(`The AI service is currently experiencing high demand. You've hit the rate limit. Please try again after 1 hour.`);
      } else {
        setError(err.message || "Something went wrong while uploading the resume.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { minutes, seconds } = getRemainingCooldownTime();

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 pt-2 pb-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
                <p className="text-gray-500 ml-12 sm:ml-14 text-xs sm:text-sm">
                Upload your resume and get AI-powered insights to land your dream job
                </p>
            </div>
            
            {/* History Badge */}
            {history.length > 0 && !loadingHistory && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs text-gray-600">{history.length} analyses</span>
              </div>
            )}
          </div>
        </div>

        {/* Cooldown Warning Banner */}
        {isInCooldown() && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Hourglass className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-800 mb-1 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Rate Limit Exceeded
                </h3>
                <p className="text-sm text-red-700 mb-2">
                  The AI service is currently experiencing high demand. You've hit the rate limit.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Time until retry</p>
                    <p className="text-2xl font-bold text-red-600">
                      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${((60*60 - (minutes*60 + seconds)) / (60*60)) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Please wait {minutes} minute{minutes !== 1 ? 's' : ''} before trying again
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Two Column Grid: Only Upload Card and Score Cards ── */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left: Upload Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                Upload Your Resume
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Supported formats: PDF, DOCX · Max 5MB</p>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-2 sm:p-3 text-center transition-all ${
                  dragActive ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <input type="file" accept=".pdf,.docx" onChange={handleFileSelect} className="hidden" id="resume-upload" />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 break-all">
                      {file ? file.name : "Drag & drop or click to upload"}
                    </p>

                    {!file && (
                      <p className="text-xs text-gray-400">
                        PDF or DOCX files only
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-indigo-700 truncate">{file.name}</p>
                      <p className="text-[10px] text-indigo-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setError(""); }} className="p-1 rounded-full hover:bg-indigo-100 transition-colors shrink-0">
                    <X className="w-3 h-3 text-indigo-500" />
                  </button>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading || isInCooldown()}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing…</>
                  : isInCooldown()
                    ? <><Hourglass className="w-4 h-4" />Please wait {minutes}:{seconds.toString().padStart(2, '0')}</>
                    : <>Analyze Resume<ArrowRight className="w-4 h-4" /></>}
              </button>

              {error && !isInCooldown() && (
                <div className={`flex items-start gap-2 px-3 py-2 rounded-xl ${
                  error.includes("rate limit") || error.includes("high demand")
                    ? "bg-red-50 border border-red-200"
                    : "bg-red-50 border border-red-200"
                }`}>
                  {error.includes("high demand") || error.includes("rate limit") ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Pro Tips
                  </p>

                <ul className="space-y-1">
                  {[
                    "Use standard section headings (Experience, Education, Skills)",
                    "Include measurable achievements with numbers & avoid tables and heavy graphics",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Score Cards (only when result exists and not loading) */}
          <div>
            {loading ? (
              <AnalysisLoader />
            ) : result ? (
              <div className="space-y-5">
                {/* File name indicator */}
                {result.fileName && (
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500">
                      Showing analysis for: <span className="font-semibold text-indigo-600">{result.fileName}</span>
                    </p>
                  </div>
                )}

                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white rounded-2xl p-7 sm:p-9 shadow-md border border-gray-100 flex flex-col items-center">
                    <CircularScore 
                      score={result.score || 0} 
                      label="Resume Score" 
                      icon={TrendingUp} 
                      sublabel={getScoreLabel(result.score || 0)} 
                    />
                  </div>
                  <div className="bg-white rounded-2xl p-7 sm:p-9 shadow-md border border-gray-100 flex flex-col items-center">
                    <CircularScore 
                      score={result.ats_score || 0} 
                      label="ATS Score" 
                      icon={Shield} 
                      sublabel={getAtsLabel(result.ats_score || 0)} 
                    />
                  </div>
                </div>
              </div>
            ) : loadingHistory ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Loading your previous analyses...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">No Resume Analyzed Yet</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                    Upload your resume on the left to get AI-powered insights instantly
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  {[["1","Upload file"],["2","Click Analyze"],["3","Get insights"]].map(([n, t], i) => (
                    <div key={n} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{n}</span>
                        {t}
                      </div>
                      {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> {/* End of grid */}

        {/* ── Full Width Sections: AI Summary, Tabs, Suggestions (only when result exists) ── */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* AI Summary */}
            {result.ai_summary && (
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-white shrink-0" />
                  <h3 className="text-base font-bold text-white">AI Summary</h3>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">{result.ai_summary}</p>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-3">
                <TabsTrigger value="skills"     className="flex items-center gap-1 text-sm"><Briefcase  className="w-3.5 h-3.5 shrink-0" />Skills</TabsTrigger>
                <TabsTrigger value="strengths"  className="flex items-center gap-1 text-sm"><ThumbsUp   className="w-3.5 h-3.5 shrink-0" /><span className="hidden sm:inline">Strengths</span></TabsTrigger>
                <TabsTrigger value="weaknesses" className="flex items-center gap-1 text-sm"><ThumbsDown className="w-3.5 h-3.5 shrink-0" /><span className="hidden sm:inline">Weaknesses</span></TabsTrigger>
                <TabsTrigger value="keywords"   className="flex items-center gap-1 text-sm"><Target     className="w-3.5 h-3.5 shrink-0" /><span className="hidden sm:inline">Keywords</span></TabsTrigger>
              </TabsList>

              <TabsContent value="skills">
                <Card className="shadow-md border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />Detected Skills
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {result.skills?.length || 0} skills identified from your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((s, idx) => (
                          <Badge key={`${s}-${idx}`} variant="secondary" className="px-3 py-1 text-sm">{s}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">No skills detected.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strengths">
                <Card className="shadow-md border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.strengths?.length > 0 ? (
                      result.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{s}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">No strengths identified.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weaknesses">
                <Card className="shadow-md border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-orange-500" />Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.weaknesses?.length > 0 ? (
                      result.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{w}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">No weaknesses found. Great job!</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords">
                <Card className="shadow-md border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />Recommended Keywords
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {result.recommendedKeywords?.length || 0} keywords to improve ATS compatibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.recommendedKeywords?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.recommendedKeywords.map((k, idx) => (
                          <Badge key={`${k}-${idx}`} className="px-3 py-1 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0">
                            <Zap className="w-3 h-3 mr-1" />{k}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">No keyword recommendations available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <Card className="shadow-md border-amber-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />Actionable Suggestions
                  </CardTitle>
                  <CardDescription className="text-xs">Specific improvements to enhance your resume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700">{s}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}