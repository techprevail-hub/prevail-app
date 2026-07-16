"use client";

import { useEffect, useState } from "react";
import { Clock, XCircle, CheckCircle, TrendingUp, Award, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Stage {
  name: string;
  questions: string[];
}

interface InterviewSidebarProps {
  timer: number;
  stages: Stage[];
  currentStageIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  onEndInterview: () => void;
  isCompleted: boolean;
}

export default function InterviewSidebar({
  timer,
  stages,
  currentStageIndex,
  currentQuestionIndex,
  totalQuestions,
  answeredQuestions,
  onEndInterview,
  isCompleted,
}: InterviewSidebarProps) {
  const [formattedTime, setFormattedTime] = useState("00:00");

  useEffect(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    setFormattedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }, [timer]);

  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const currentStage = stages[currentStageIndex]?.name || "Loading...";
  const totalStages = stages.length;

  return (
    <div className="space-y-4 sticky top-8">
      {/* Timer Card */}
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-center text-white">
          <Clock className="w-6 h-6 mx-auto mb-1 opacity-80" />
          <p className="text-3xl font-bold tracking-wider">{formattedTime}</p>
          <p className="text-xs text-white/70 mt-0.5">Time Remaining</p>
        </div>
      </Card>

      {/* Question Progress */}
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Questions</p>
              <p className="text-xs text-gray-500">
                {answeredQuestions} of {totalQuestions} answered
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* End Interview Button */}
      {!isCompleted && (
        <Button
          onClick={onEndInterview}
          variant="outline"
          className="w-full border-red-200 text-red-500 hover:bg-red-50 rounded-xl"
        >
          <XCircle className="w-4 h-4 mr-2" />
          End Interview
        </Button>
      )}
    </div>
  );
}