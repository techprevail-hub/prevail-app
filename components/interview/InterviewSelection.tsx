"use client";

import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Code,
  PlayCircle,
  Server,
  Users,
  FolderGit2,
  ChevronDown,
  Search,
  History,
  RefreshCw,
  Loader2,
  Lightbulb,
  Target,
  Zap,
  Star,
  MessageCircle,
  Volume2,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InterviewSelectionProps {
  onInterviewStart: (type: string, subType: string, mode: "text" | "voice") => void;
  loading: boolean;
  filteredHistoryLength: number;
  onViewHistory: () => void;
  showHistory: boolean;
}

const interviewTypes = [
  {
    name: "Frontend",
    icon: <Code className="w-4 h-4" />,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    subTypes: [
      { name: "HTML/CSS", icon: "🌐", color: "orange" },
      { name: "JavaScript", icon: "🟡", color: "yellow" },
      { name: "React.js", icon: "⚛️", color: "blue" },
      { name: "Vue.js", icon: "💚", color: "green" },
      { name: "Angular", icon: "🔴", color: "red" },
      { name: "Next.js", icon: "▲", color: "black" },
      { name: "TypeScript", icon: "📘", color: "blue" },
      { name: "Tailwind CSS", icon: "🎨", color: "teal" },
    ],
  },
  {
    name: "Backend",
    icon: <Server className="w-4 h-4" />,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    subTypes: [
      { name: "Node.js", icon: "🟢", color: "green" },
      { name: "Python", icon: "🐍", color: "blue" },
      { name: "Java", icon: "☕", color: "red" },
      { name: "PHP", icon: "🐘", color: "purple" },
      { name: "Ruby on Rails", icon: "💎", color: "red" },
      { name: "Django", icon: "🎸", color: "green" },
      { name: "Spring Boot", icon: "🍃", color: "green" },
      { name: "APIs", icon: "🔗", color: "blue" },
    ],
  },
  {
    name: "Full Stack",
    icon: <FolderGit2 className="w-4 h-4" />,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    subTypes: [
      { name: "MERN Stack", icon: "⚛️", color: "blue" },
      { name: "MEAN Stack", icon: "🅰️", color: "red" },
      { name: "JAMstack", icon: "📦", color: "purple" },
      { name: "LAMP Stack", icon: "🐧", color: "orange" },
      { name: "Serverless", icon: "☁️", color: "blue" },
      { name: "Microservices", icon: "🔧", color: "gray" },
    ],
  },
  {
    name: "HR",
    icon: <Users className="w-4 h-4" />,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    subTypes: [
      { name: "General HR", icon: "📋", color: "blue" },
      { name: "Recruitment", icon: "🎯", color: "green" },
      { name: "Employee Relations", icon: "🤝", color: "purple" },
      { name: "Performance Management", icon: "📊", color: "orange" },
      { name: "Compensation", icon: "💰", color: "green" },
      { name: "HR Analytics", icon: "📈", color: "blue" },
    ],
  },
  {
    name: "Behavioral",
    icon: <Brain className="w-4 h-4" />,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    subTypes: [
      { name: "Leadership", icon: "👑", color: "purple" },
      { name: "Teamwork", icon: "🤝", color: "green" },
      { name: "Problem Solving", icon: "🧩", color: "blue" },
      { name: "Conflict Resolution", icon: "⚖️", color: "red" },
      { name: "Time Management", icon: "⏰", color: "orange" },
      { name: "Adaptability", icon: "🔄", color: "teal" },
      { name: "Communication", icon: "💬", color: "blue" },
    ],
  },
];

export default function InterviewSelection({
  onInterviewStart,
  loading,
  filteredHistoryLength,
  onViewHistory,
  showHistory,
}: InterviewSelectionProps) {
  const [interviewType, setInterviewType] = useState("Frontend");
  const [subType, setSubType] = useState("");
  const [showSubTypeDropdown, setShowSubTypeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [interviewMode, setInterviewMode] = useState<"text" | "voice">("text");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentTypeData = interviewTypes.find((t) => t.name === interviewType);
  const filteredSubTypes =
    currentTypeData?.subTypes.filter((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowSubTypeDropdown(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeSelect = (typeName: string) => {
    if (interviewType === typeName) {
      setShowSubTypeDropdown(!showSubTypeDropdown);
      if (!showSubTypeDropdown) setSearchTerm("");
    } else {
      setInterviewType(typeName);
      setSubType("");
      setShowSubTypeDropdown(true);
      setSearchTerm("");
    }
  };

  const handleSubTypeSelect = (selectedSubType: string) => {
    setSubType(selectedSubType);
    setShowSubTypeDropdown(false);
    setSearchTerm("");
    toast.success(`${selectedSubType} selected for ${interviewType} interview`);
  };

  const handleStart = () => {
    if (!subType) {
      toast.error(`Please select a ${interviewType} technology/language first`);
      return;
    }
    onInterviewStart(interviewType, subType, interviewMode);
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="mb-6">
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-5 lg:p-6 text-white overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 left-1/3 w-64 h-32 bg-indigo-400/20 rounded-full blur-2xl" />

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-white/90 tracking-wide">
                  AI-Powered Interview Practice
                </span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold mb-1.5 tracking-tight">
                Master Your Interviews
              </h1>
              <p className="text-white/80 text-sm lg:text-sm mb-4 max-w-lg">
                Practice with AI, get instant feedback, and build the confidence to ace any interview.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleStart}
                  disabled={loading || !subType}
                  className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg font-semibold transition-all duration-200 text-xs px-4 py-2"
                >
                  <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                  Start Interview
                </Button>
                <Button
                  onClick={onViewHistory}
                  className={`font-semibold shadow-lg transition-all duration-200 text-xs px-4 py-2 ${
                    showHistory
                      ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
                >
                  <History className="w-3.5 h-3.5 mr-1.5" />
                  {showHistory ? "Hide History" : "View History"}
                </Button>
              </div>
            </div>

            <div className="hidden lg:flex gap-2">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[80px]">
                <p className="text-xl font-bold">{filteredHistoryLength}</p>
                <p className="text-[9px] text-white/70 mt-0.5">{interviewType} Sessions</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[80px]">
                <p className="text-xl font-bold">10</p>
                <p className="text-[9px] text-white/70 mt-0.5">Questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interview Mode Selector ── */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Interview Mode
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setInterviewMode("text")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              interviewMode === "text"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:shadow-md"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Text Interview
          </button>
          <button
            onClick={() => setInterviewMode("voice")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              interviewMode === "voice"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:shadow-md"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Voice Interview
          </button>
        </div>
        {interviewMode === "voice" && (
          <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Speak your answers using your microphone
          </p>
        )}
      </div>

      {/* ── Interview Type + Sub-type Selection ── */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Choose Interview Type
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {interviewTypes.map((type) => (
            <button
              key={type.name}
              ref={interviewType === type.name ? buttonRef : null}
              onClick={() => handleTypeSelect(type.name)}
              className={`px-3 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-between gap-1.5 shadow-sm text-xs ${
                interviewType === type.name
                  ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105`
                  : "bg-white text-gray-700 hover:shadow-md border border-gray-200 hover:scale-102"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {type.icon}
                <span className="text-xs">{type.name}</span>
              </div>
              {interviewType === type.name && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showSubTypeDropdown ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          ))}
        </div>

        {showSubTypeDropdown && currentTypeData && (
          <div ref={dropdownRef} className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${currentTypeData.color} p-3`}>
                <p className="text-white font-semibold text-sm">
                  Select a {currentTypeData.name} Technology
                </p>
                <p className="text-white/70 text-[10px] mt-0.5">
                  Choose the specific area you want to practice
                </p>
              </div>

              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${interviewType} technologies...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredSubTypes.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => handleSubTypeSelect(sub.name)}
                      className={`group p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 text-xs ${
                        subType === sub.name
                          ? `bg-gradient-to-r ${currentTypeData.color} text-white shadow-lg`
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{sub.icon}</span>
                        <p
                          className={`font-medium text-xs ${
                            subType === sub.name ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {sub.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredSubTypes.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-xs">No technologies found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {subType && !showSubTypeDropdown && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 shadow-sm">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
              {currentTypeData?.subTypes.find((s) => s.name === subType)?.icon}
            </div>
            <div className="flex-1">
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">
                Selected Technology
              </p>
              <p className="font-bold text-gray-900 text-sm">{subType}</p>
              <p className="text-[10px] text-purple-600">{interviewType} Interview • 10 Questions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubType("");
                setShowSubTypeDropdown(true);
              }}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg text-xs px-3 py-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Change
            </Button>
          </div>
        )}

        {subType && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleStart}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl px-8 py-5 text-sm rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4 mr-2" />
              )}
              Start {subType} {interviewMode === "voice" ? "Voice" : "Text"} Interview
            </Button>
          </div>
        )}
      </div>

      {/* ── Empty State ── */}
      {!subType && (
        <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center rotate-6">
                <Brain className="w-10 h-10 text-violet-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to practice?</h3>
            <p className="text-gray-500 max-w-md mx-auto text-xs leading-relaxed">
              Select an interview type above, choose a specific technology, and start your AI-powered practice session with 10 curated questions.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[
                { icon: <Target className="w-3.5 h-3.5" />, label: "10 Questions", color: "text-blue-500 bg-blue-50" },
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant Feedback", color: "text-yellow-500 bg-yellow-50" },
                { icon: <Star className="w-3.5 h-3.5" />, label: "AI Scoring", color: "text-purple-500 bg-purple-50" },
              ].map((item) => (
                <div key={item.label} className={`${item.color} rounded-xl p-2.5 flex flex-col items-center gap-1`}>
                  {item.icon}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Pro Tips ── */}
      <Card className="mt-4 border-0 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2.5">
            <div className="p-1 bg-amber-100 rounded-lg mt-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Pro Tips</p>
              <p className="text-[10px] text-amber-700 leading-relaxed">
                Select a specific technology for focused practice. For behavioral questions, use the STAR method (Situation, Task, Action, Result). Be specific and back up answers with real examples.
                {interviewMode === "voice" && " For voice interviews, speak clearly and at a moderate pace. The AI will transcribe your answers automatically."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}