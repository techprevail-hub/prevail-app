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
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InterviewHistory {
  id: number;
  interview_type: string;
  current_question: string;
  user_answer: string | null;
  ai_feedback: string | null;
  score: number | null;
  created_at: string;
}

interface InterviewHistoryProps {
  history: InterviewHistory[];
  interviewType: string;
  loadingHistory: boolean;
  onRefresh: () => void;
  onDelete: (id: number) => void;
  onEdit: (item: InterviewHistory) => void;
  onStartNew: () => void;
}

export default function InterviewHistoryComponent({
  history,
  interviewType,
  loadingHistory,
  onRefresh,
  onDelete,
  onEdit,
  onStartNew
}: InterviewHistoryProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
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

  // Group questions by session (assuming consecutive questions belong to same session)
  // For now, we'll show each question individually with numbering
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
              Total {sortedHistory.length} question{sortedHistory.length !== 1 ? 's' : ''} found
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
      ) : sortedHistory.length === 0 ? (
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
          {sortedHistory.map((item, index) => (
            <Card key={item.id} className="border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Header with Question Number and Actions */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
                      Question {index + 1}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </span>
                    {item.score && (
                      <Badge className={getScoreColor(item.score)}>
                        Score: {item.score}/10
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {item.user_answer && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(item)}
                        className="bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item.id)}
                      className="bg-white text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(item.id)}
                      className="text-gray-500 hover:text-purple-600"
                    >
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content - Always visible summary */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Question:
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.current_question}</p>
                </div>
                
                {item.user_answer && (
                  <div className={!expandedItems.has(item.id) ? "line-clamp-2" : ""}>
                    <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Your Answer:
                    </p>
                    <p className="text-sm text-gray-600">{item.user_answer}</p>
                  </div>
                )}

                {/* Expanded content */}
                {expandedItems.has(item.id) && item.ai_feedback && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Feedback:
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.ai_feedback}</p>
                  </div>
                )}

                {!item.user_answer && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">Incomplete - No answer provided</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}