"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  RotateCw,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// Custom Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full overflow-hidden ${className}`}>
    <div
      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-700 ease-in-out"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Stat Card component
const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) => (
  <div className={`bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3`}>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  </div>
);

interface QuestionData {
  question: string;
  answer: string;
  feedback: string;
  questionNumber: number;
}

interface InterviewSessionProps {
  sessionId: number | null;
  currentQuestion: string;
  currentQuestionNum: number;
  totalQuestions: number;
  interviewType: string;
  subType: string;
  interviewMode: "text" | "voice";
  audioUrl: string;
  voiceText: string;
  isLoadingAudio: boolean;
  isPlayingAudio: boolean;
  isRecording: boolean;
  transcript: string;
  answer: string;
  feedback: string;
  submitting: boolean;
  questionsData: QuestionData[];
  completedCount: number;
  onAnswerChange: (answer: string) => void;
  onTranscriptChange: (transcript: string) => void;
  onSaveAnswer: () => void;
  onSubmitEnd: () => void;
  onPrevious: () => void;
  onEnd: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplayAudio: () => void;
}

export default function InterviewSession({
  sessionId,
  currentQuestion,
  currentQuestionNum,
  totalQuestions,
  interviewType,
  subType,
  interviewMode,
  audioUrl,
  voiceText,
  isLoadingAudio,
  isPlayingAudio,
  isRecording,
  transcript,
  answer,
  feedback,
  submitting,
  questionsData,
  completedCount,
  onAnswerChange,
  onTranscriptChange,
  onSaveAnswer,
  onSubmitEnd,
  onPrevious,
  onEnd,
  onStartRecording,
  onStopRecording,
  onReplayAudio,
}: InterviewSessionProps) {
  // Log to debug
  useEffect(() => {
    console.log("InterviewSession - transcript:", transcript);
    console.log("InterviewSession - isRecording:", isRecording);
  }, [transcript, isRecording]);

  return (
    <div className="space-y-4">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          icon={<MessageCircle className="w-4 h-4 text-purple-600" />}
          value={`${currentQuestionNum}/${totalQuestions}`}
          label="Current Question"
          color="bg-purple-50"
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
          value={completedCount}
          label="Answered"
          color="bg-green-50"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-blue-600" />}
          value={`${totalQuestions - completedCount}`}
          label="Remaining"
          color="bg-blue-50"
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-orange-600" />}
          value={subType}
          label={interviewType}
          color="bg-orange-50"
        />
      </div>

      {/* Progress Bar */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-700">Interview Progress</span>
              <Badge className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0">{subType}</Badge>
              {interviewMode === "voice" && (
                <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Voice
                </Badge>
              )}
            </div>
            <span className="text-xs font-bold text-purple-600">
              {Math.round((currentQuestionNum / totalQuestions) * 100)}%
            </span>
          </div>
          <Progress value={(currentQuestionNum / totalQuestions) * 100} className="h-2" />
          <div className="flex justify-between mt-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i < completedCount
                    ? "bg-purple-500 scale-110"
                    : i === currentQuestionNum - 1
                    ? "bg-indigo-400 animate-pulse"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onPrevious}
          disabled={currentQuestionNum === 1 || submitting}
          variant="outline"
          className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg text-xs px-3 py-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Previous
        </Button>
        <Button
          onClick={onEnd}
          variant="outline"
          className="border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs px-3 py-1.5"
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          End Interview
        </Button>
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">{currentQuestionNum}</span>
              </div>
              <div>
                <p className="text-white/70 text-[10px]">Question {currentQuestionNum} of {totalQuestions}</p>
                <p className="text-white font-semibold text-xs">{interviewType} • {subType}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-[9px] px-2 py-0">
              {interviewType}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5">
          <p className="text-gray-800 text-sm lg:text-base leading-relaxed font-medium">
            {currentQuestion}
          </p>
          {interviewMode === "voice" && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-blue-700 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    AI Interviewer is speaking...
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">{voiceText || currentQuestion}</p>
                </div>
                {audioUrl && (
                  <Button
                    onClick={onReplayAudio}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg text-xs px-2 py-1"
                    disabled={isPlayingAudio}
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1" />
                    Replay
                  </Button>
                )}
              </div>
              {isLoadingAudio && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-[10px] text-blue-500">Generating voice...</span>
                </div>
              )}
              {isPlayingAudio && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-blue-400 animate-pulse"></div>
                    <div className="w-1 h-4 bg-blue-500 animate-pulse delay-75"></div>
                    <div className="w-1 h-2 bg-blue-400 animate-pulse delay-150"></div>
                    <div className="w-1 h-4 bg-blue-500 animate-pulse delay-100"></div>
                    <div className="w-1 h-3 bg-blue-400 animate-pulse delay-50"></div>
                  </div>
                  <span className="text-[10px] text-blue-500">Playing audio...</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Card */}
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm text-gray-900">
                {interviewMode === "voice" ? "Voice Answer" : "Your Answer"}
              </CardTitle>
              <CardDescription className="text-[10px] text-gray-400 mt-0.5">
                {interviewMode === "voice" 
                  ? isRecording 
                      ? "🔴 Recording... Click 'Stop Recording' when done" 
                      : transcript 
                        ? "✅ Answer recorded - Click 'Submit' to continue" 
                        : "Click 'Start Recording' to speak your answer"
                  : "Be specific and use examples where possible"}
              </CardDescription>
            </div>
            {interviewMode === "voice" && transcript && (
              <div className="text-[10px] text-gray-400">
                {transcript.split(' ').filter(Boolean).length} words
              </div>
            )}
            {interviewMode === "text" && answer.length > 0 && (
              <div className="text-[10px] text-gray-400">
                {answer.split(' ').filter(Boolean).length} words
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-2 pb-5">
          {interviewMode === "voice" ? (
            <div className="space-y-3">
              <div className="flex gap-2.5">
                {!isRecording ? (
                  <Button
                    onClick={onStartRecording}
                    disabled={submitting || isPlayingAudio || isLoadingAudio}
                    className={`flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      transcript ? 'opacity-50' : ''
                    }`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {transcript ? '✅ Already Recorded' : '🎤 Start Recording'}
                  </Button>
                ) : (
                  <Button
                    onClick={onStopRecording}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 animate-pulse"
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    🔴 Stop Recording
                  </Button>
                )}
              </div>
              
              {isRecording && (
                <div className="flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-4 bg-red-500 animate-pulse"></div>
                    <div className="w-1.5 h-6 bg-red-500 animate-pulse delay-75"></div>
                    <div className="w-1.5 h-3 bg-red-500 animate-pulse delay-150"></div>
                    <div className="w-1.5 h-5 bg-red-500 animate-pulse delay-100"></div>
                    <div className="w-1.5 h-4 bg-red-500 animate-pulse delay-50"></div>
                  </div>
                  <span className="text-xs text-red-600 font-medium">Recording... Click "Stop Recording" when done</span>
                </div>
              )}
              
              {transcript && !isRecording && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-[10px] font-semibold text-green-600 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Transcript:
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{transcript}</p>
                </div>
              )}

              {/* Show buttons for voice mode when transcript is available */}
              {transcript && !isRecording && (
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <Button
                    onClick={onSaveAnswer}
                    disabled={submitting || !transcript.trim()}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 hover:shadow-xl"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Submit & Next
                  </Button>
                  <Button
                    onClick={onSubmitEnd}
                    disabled={submitting || !transcript.trim()}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 hover:shadow-xl"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Submit & End
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                rows={6}
                placeholder="Type your answer here... Be specific and provide examples when possible."
                className="resize-none rounded-lg border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-sm leading-relaxed"
                disabled={submitting}
              />
              {/* Buttons - Only show for Text mode */}
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <Button
                  onClick={onSaveAnswer}
                  disabled={submitting || !answer.trim()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 hover:shadow-xl"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Save & Next
                </Button>
                <Button
                  onClick={onSubmitEnd}
                  disabled={submitting || !answer.trim()}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 hover:shadow-xl"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Submit & End
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback Card */}
      {feedback && (
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-white" />
              <p className="text-white font-semibold text-xs">
                AI Feedback — Question {currentQuestionNum - 1}
              </p>
            </div>
          </div>
          <CardContent className="p-5 bg-gradient-to-b from-emerald-50/50 to-white">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
              {feedback}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}