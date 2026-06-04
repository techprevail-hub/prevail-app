"use client";

import { useState } from "react";
import { 
  History, 
  RefreshCw, 
  Filter, 
  MessageCircle, 
  User, 
  Sparkles, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InterviewAnswer {
  answer: string;
  question: string;
}

interface InterviewSession {
  id: number;
  created_at: string;
  user_id: string;
  interview_type: string;
  current_question: string;
  user_answer: string | null;
  ai_feedback: string | null;
  score: number | null;
  questions: string[];
  answers: InterviewAnswer[];
  current_index: number;
  total_questions: number;
  is_completed: boolean;
  final_feedback: string | null;
  sub_type: string | null;
  answers_data: any | null;
}

interface InterviewHistoryProps {
  history: any[];
  interviewType: string;
  loadingHistory: boolean;
  onRefresh: () => void;
  onDelete: (id: number) => void;
  onEdit: (item: any) => void;
  onStartNew: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InterviewHistoryComponent({
  history,
  interviewType,
  loadingHistory,
  onRefresh,
  onDelete,
  onEdit,
  onStartNew
}: InterviewHistoryProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

  const toggleSession = (sessionId: number) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score >= 8) return "bg-green-100 text-green-700";
    if (score >= 6) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return "Not scored";
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 5) return "Average";
    return "Needs Work";
  };

  // Filter history by selected interview type
  const filteredHistory = history.filter(session => session.interview_type === interviewType);

  // Sort by created_at descending (newest first)
  const sortedSessions = [...filteredHistory].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate completed answers count
  const getCompletedCount = (session: any) => {
    return session.answers?.length || 0;
  };

  // Calculate average score for completed session
  const getAverageScore = (session: any) => {
    if (session.score) return session.score;
    return null;
  };

  // Handle edit for a specific question
  const handleEditQuestion = (session: any, questionIndex: number) => {
    const editItem = {
      id: session.id,
      interview_type: session.interview_type,
      current_question: session.questions[questionIndex],
      user_answer: session.answers[questionIndex]?.answer || null,
      ai_feedback: session.ai_feedback,
      score: session.score,
      created_at: session.created_at,
    };
    onEdit(editItem);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Interview History</h2>
          <Badge className="bg-purple-100 text-purple-700 ml-2">
            {interviewType}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Info Bar */}
      <Card className="border-gray-100 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-700">Showing interviews for:</span>
              <Badge className="bg-purple-600 text-white">{interviewType}</Badge>
            </div>
            <p className="text-xs text-gray-500">
              Total {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </CardContent>
      </Card>

      {loadingHistory ? (
        <Card className="border-gray-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading history...</p>
          </CardContent>
        </Card>
      ) : sortedSessions.length === 0 ? (
        <Card className="border-gray-100 shadow-lg">
          <CardContent className="p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {interviewType} Interviews Yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't completed any {interviewType} interviews yet. 
              Start your first {interviewType} interview to see your progress here.
            </p>
            <Button onClick={onStartNew} className="bg-gradient-to-r from-purple-600 to-indigo-600">
              Start {interviewType} Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((session, sessionIndex) => {
            const isExpanded = expandedSessions.has(session.id);
            const completedCount = getCompletedCount(session);
            const avgScore = getAverageScore(session);
            
            return (
              <Card key={session.id} className="border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Session Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div 
                      className="flex items-center gap-3 flex-wrap cursor-pointer flex-1"
                      onClick={() => toggleSession(session.id)}
                    >
                      <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
                        {interviewType} Interview {sessionIndex + 1}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(session.created_at)}
                      </span>
                      <Badge className={`${completedCount === session.total_questions ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {completedCount}/{session.total_questions} Questions Answered
                      </Badge>
                      {avgScore && (
                        <Badge className={getScoreColor(avgScore)}>
                          Score: {avgScore}/10 • {getScoreLabel(avgScore)}
                        </Badge>
                      )}
                      {session.is_completed && (
                        <Badge className="bg-blue-100 text-blue-700">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* Delete Session Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this interview session?")) {
                            onDelete(session.id);
                          }
                        }}
                        className="bg-white text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      {/* Expand/Collapse Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSession(session.id);
                        }}
                        className="text-gray-500 hover:text-purple-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Session Content - Shows all questions when expanded */}
                {isExpanded && (
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {session.questions.map((question, qIndex) => {
                        const answer = session.answers?.find(a => a.question === question);
                        const hasAnswer = !!answer?.answer;
                        
                        return (
                          <div key={qIndex} className="p-4 hover:bg-gray-50 transition-colors">
                            {/* Question Header with Edit button */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Question {qIndex + 1}
                                </Badge>
                              </div>
                              {/* Edit Button for individual question */}
                              {hasAnswer && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditQuestion(session, qIndex)}
                                  className="bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit Answer
                                </Button>
                              )}
                            </div>
                            
                            {/* Question */}
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                Question:
                              </p>
                              <p className="text-sm text-gray-600">{question}</p>
                            </div>
                            
                            {/* Answer */}
                            {hasAnswer ? (
                              <div className="mb-3">
                                <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Your Answer:
                                </p>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                                  {answer.answer}
                                </p>
                              </div>
                            ) : (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 text-yellow-700">
                                  <AlertCircle className="w-4 h-4" />
                                  <p className="text-sm">Not answered yet</p>
                                </div>
                              </div>
                            )}
                            
                            {/* AI Feedback - only show for completed sessions or if feedback exists */}
                            {(session.ai_feedback || session.final_feedback) && hasAnswer && (
                              <div>
                                <p className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  AI Feedback:
                                </p>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
                                  {session.final_feedback || session.ai_feedback || "Feedback will be available after completion"}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}