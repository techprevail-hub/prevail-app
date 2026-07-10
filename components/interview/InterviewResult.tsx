"use client";

import {
  CheckCircle,
  Star,
  PlayCircle,
  History,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InterviewResultProps {
  subType: string;
  interviewMode: "text" | "voice";
  completedCount: number;
  totalQuestions: number;
  finalScore: number | null;
  finalFeedback: string;
  onStartNew: () => void;
  onViewHistory: () => void;
  onClose: () => void;
}

const getScoreColor = (score: number | null) => {
  if (!score) return "bg-gray-100 text-gray-600";
  if (score >= 8) return "bg-green-100 text-green-700";
  if (score >= 6) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getScoreLabel = (score: number | null) => {
  if (!score) return "N/A";
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  return "Needs Work";
};

export default function InterviewResult({
  subType,
  interviewMode,
  completedCount,
  totalQuestions,
  finalScore,
  finalFeedback,
  onStartNew,
  onViewHistory,
  onClose,
}: InterviewResultProps) {
  return (
    <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
        aria-label="Close completion card"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <div className="relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-0.5">
            {subType} {interviewMode === "voice" ? "Voice" : "Text"} Interview Complete!
          </h3>
          <p className="text-white/70 text-xs">Great effort — here's how you did</p>
        </div>
      </div>

      <CardContent className="p-6">
        {finalScore && (
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${getScoreColor(finalScore)}`}>
                <Star className="w-4 h-4" />
                {finalScore}/10 — {getScoreLabel(finalScore)}
              </div>
            </div>
          </div>
        )}

        {finalFeedback && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Overall Feedback
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{finalFeedback}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="bg-purple-50 rounded-xl p-2.5">
            <p className="text-xl font-bold text-purple-600">{completedCount}</p>
            <p className="text-[9px] text-gray-500 mt-0.5">Answered</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-2.5">
            <p className="text-xl font-bold text-indigo-600">{totalQuestions}</p>
            <p className="text-[9px] text-gray-500 mt-0.5">Total Qs</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5">
            <p className="text-xl font-bold text-green-600">{finalScore ?? "—"}</p>
            <p className="text-[9px] text-gray-500 mt-0.5">Score</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Button
            onClick={onStartNew}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-lg font-semibold py-4 text-xs"
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
            Start New Interview
          </Button>
          <Button
            variant="outline"
            onClick={onViewHistory}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold py-4 text-xs"
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}