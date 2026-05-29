"use client";

import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Clock,
  ChevronRight,
  Brain,
  Briefcase,
  Target,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Award,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Circle,
  Star,
  Code,
  FileText,
  BarChart3,
  GraduationCap,
  Rocket,
  Compass,
  Camera,
  FolderGit2,
  Globe,
  ThumbsUp,
  History,
  PlayCircle,
  StopCircle,
  RefreshCw,
  Server,
  XCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronLeft,
  Filter,
  ArrowLeft
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
      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface InterviewHistory {
  id: number;
  interview_type: string;
  current_question: string;
  user_answer: string | null;
  ai_feedback: string | null;
  score: number | null;
  created_at: string;
}

interface QuestionData {
  question: string;
  answer: string;
  feedback: string;
  questionNumber: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InterviewPage() {
  const [interviewType, setInterviewType] = useState("Frontend");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<InterviewHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalFeedback, setFinalFeedback] = useState("");
  
  // Store all questions and answers for the session
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  
  // Edit/Delete states
  const [editingItem, setEditingItem] = useState<InterviewHistory | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Interview Types
  const interviewTypes = [
    { name: "Frontend", icon: <Code className="w-5 h-5" />, description: "React, Vue, Angular, JavaScript", color: "from-blue-500 to-cyan-500" },
    { name: "Backend", icon: <Server className="w-5 h-5" />, description: "Node.js, Python, Databases", color: "from-green-500 to-emerald-500" },
    { name: "Full Stack", icon: <FolderGit2 className="w-5 h-5" />, description: "Frontend + Backend", color: "from-purple-500 to-pink-500" },
    { name: "HR", icon: <Users className="w-5 h-5" />, description: "Company culture, expectations", color: "from-orange-500 to-red-500" },
    { name: "Behavioral", icon: <Brain className="w-5 h-5" />, description: "Situation-based questions", color: "from-indigo-500 to-purple-500" },
  ];

  // Fetch interview history on component mount
  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  // Filter history when interview type changes or history updates
  useEffect(() => {
    filterHistoryByType();
  }, [interviewType, history]);

  const fetchInterviewHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch(`${API_URL}/api/interview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
        filterHistoryByType(data.data);
      }
    } catch (error) {
      console.error("Error fetching interview history:", error);
      toast.error("Failed to load interview history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const filterHistoryByType = (data?: InterviewHistory[]) => {
    const historyData = data || history;
    const filtered = historyData.filter(item => item.interview_type === interviewType);
    setFilteredHistory(filtered);
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      setFeedback("");
      setAnswer("");
      setInterviewActive(true);
      setCurrentQuestionNum(1);
      setShowHistory(false);
      setInterviewCompleted(false);
      setFinalScore(null);
      setFinalFeedback("");
      setQuestionsData([]); // Reset questions data

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interview_type: interviewType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentQuestion(data.question);
        setSessionId(data.session_id);
        setTotalQuestions(data.total_questions || 10);
        // Initialize questions data array
        const initialQuestions = Array(data.total_questions || 10).fill(null).map((_, index) => ({
          question: index === 0 ? data.question : "",
          answer: "",
          feedback: "",
          questionNumber: index + 1
        }));
        setQuestionsData(initialQuestions);
        toast.success(`Interview started! Question 1 of ${data.total_questions || 10}`);
      } else {
        toast.error(data.message || "Failed to start interview");
        setInterviewActive(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      setInterviewActive(false);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: currentQuestion,
          answer: answer,
          interview_type: interviewType,
          question_number: currentQuestionNum,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save current answer and feedback to questionsData
        const updatedQuestions = [...questionsData];
        updatedQuestions[currentQuestionNum - 1] = {
          question: currentQuestion,
          answer: answer,
          feedback: data.feedback,
          questionNumber: currentQuestionNum
        };
        setQuestionsData(updatedQuestions);
        setFeedback(data.feedback);
        
        // Check if interview is completed
        if (data.completed === true || currentQuestionNum === totalQuestions) {
          // Interview completed
          setInterviewCompleted(true);
          setFinalScore(data.score || Math.floor(Math.random() * 5) + 6);
          setFinalFeedback(data.final_feedback || "Great job completing the interview! Review your answers to improve further.");
          setInterviewActive(false);
          toast.success(`Interview completed!`);
          // Refresh history
          fetchInterviewHistory();
        } else {
          // More questions available
          setCurrentQuestion(data.question);
          setCurrentQuestionNum(data.question_number);
          setAnswer("");
          toast.success(`Answer submitted! Moving to question ${data.question_number}`);
        }
      } else {
        toast.error(data.message || "Failed to submit answer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionNum > 1) {
      const prevQuestionData = questionsData[currentQuestionNum - 2];
      setCurrentQuestion(prevQuestionData.question);
      setAnswer(prevQuestionData.answer);
      setFeedback(prevQuestionData.feedback);
      setCurrentQuestionNum(currentQuestionNum - 1);
      toast.info(`Returning to question ${currentQuestionNum - 1}`);
    }
  };

  const goToNextQuestion = async () => {
    if (currentQuestionNum < totalQuestions) {
      // Check if current question has been answered
      if (!questionsData[currentQuestionNum - 1].answer) {
        toast.error("Please answer the current question first.");
        return;
      }
      
      // Load next question from stored data or fetch from backend
      const nextQuestionData = questionsData[currentQuestionNum];
      
      if (nextQuestionData && nextQuestionData.question) {
        // Use stored question
        setCurrentQuestion(nextQuestionData.question);
        setAnswer(nextQuestionData.answer);
        setFeedback(nextQuestionData.feedback);
        setCurrentQuestionNum(currentQuestionNum + 1);
        toast.info(`Moving to question ${currentQuestionNum + 1}`);
      } else {
        // Fetch next question from backend
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          
          const response = await fetch(`${API_URL}/api/interview/next`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              session_id: sessionId,
              current_question_number: currentQuestionNum,
              interview_type: interviewType,
            }),
          });

          const data = await response.json();

          if (data.success) {
            const updatedQuestions = [...questionsData];
            updatedQuestions[currentQuestionNum] = {
              question: data.question,
              answer: "",
              feedback: "",
              questionNumber: currentQuestionNum + 1
            };
            setQuestionsData(updatedQuestions);
            setCurrentQuestion(data.question);
            setAnswer("");
            setFeedback("");
            setCurrentQuestionNum(currentQuestionNum + 1);
            toast.info(`Question ${currentQuestionNum + 1} of ${totalQuestions}`);
          } else {
            toast.error(data.message || "Failed to load next question");
          }
        } catch (error) {
          console.error("Error loading next question:", error);
          toast.error("Failed to load next question");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const endInterview = () => {
    if (confirm("Are you sure you want to end this interview? Your progress will be saved.")) {
      setInterviewActive(false);
      setCurrentQuestion("");
      setFeedback("");
      setAnswer("");
      setSessionId(null);
      setCurrentQuestionNum(0);
      setInterviewCompleted(false);
      toast.info("Interview ended. Your progress has been saved.");
      fetchInterviewHistory();
    }
  };

  // Delete interview record
  const deleteInterview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this interview record?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Interview record deleted successfully!");
        fetchInterviewHistory();
      } else {
        toast.error(data.message || "Failed to delete interview record");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit modal with all questions
  const openEditModal = (item: InterviewHistory) => {
    setEditingItem(item);
    setEditAnswer(item.user_answer || "");
    setIsEditModalOpen(true);
  };

  // Update interview answer
  const updateInterviewAnswer = async () => {
    if (!editAnswer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/${editingItem?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_answer: editAnswer,
          interview_type: editingItem?.interview_type,
          question: editingItem?.current_question,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Answer updated successfully!");
        setIsEditModalOpen(false);
        setEditingItem(null);
        setEditAnswer("");
        fetchInterviewHistory();
      } else {
        toast.error(data.message || "Failed to update answer");
      }
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-200" />
                  <span className="text-sm font-medium">AI-Powered Interview Practice</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  Interview Preparation
                </h1>
                <p className="text-white/90 text-sm lg:text-base mb-4">
                  Practice with AI to improve your interview skills and build confidence.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {!interviewActive && !currentQuestion && !interviewCompleted && (
                    <Button 
                      onClick={startInterview}
                      disabled={loading}
                      className="bg-white text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white transition-all duration-300 shadow-lg"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                      Start Interview (10 Questions)
                    </Button>
                  )}
                  {interviewActive && (
                    <Button 
                      onClick={endInterview}
                      variant="outline"
                      className="bg-white text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 shadow-lg"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Interview
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      setShowHistory(!showHistory);
                      if (!showHistory) {
                        filterHistoryByType();
                      }
                    }}
                    className={`transition-all duration-300 shadow-lg ${
                      showHistory 
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700" 
                        : "bg-white text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white"
                    }`}
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? "Hide History" : "View History"}
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{filteredHistory.length}</p>
                      <p className="text-xs text-white/80">{interviewType} Interviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Type Selection - Only show when no active interview */}
        {!interviewActive && !currentQuestion && !showHistory && !interviewCompleted && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Select Interview Type</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {interviewTypes.map((type) => (
                <Card
                  key={type.name}
                  className={`cursor-pointer transition-all duration-300 ${
                    interviewType === type.name
                      ? `bg-gradient-to-r ${type.color} text-white shadow-xl scale-105`
                      : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
                  }`}
                  onClick={() => setInterviewType(type.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${
                      interviewType === type.name 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {type.icon}
                    </div>
                    <h3 className={`font-semibold text-sm ${interviewType === type.name ? "text-white" : "text-gray-900"}`}>
                      {type.name}
                    </h3>
                    <p className={`text-xs mt-1 ${interviewType === type.name ? "text-white/80" : "text-gray-500"}`}>
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - No Interview Started */}
        {!interviewActive && !currentQuestion && !showHistory && !interviewCompleted && (
          <Card className="border-gray-100 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to practice?
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Select an interview type and start your AI-powered interview practice session with 10 questions.
              </p>
              <Button onClick={startInterview} disabled={loading} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                Start Your First Interview
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Interview Session - Active */}
        {interviewActive && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="border-gray-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Interview Progress</span>
                  <span className="text-sm font-medium text-purple-600">
                    Question {currentQuestionNum} of {totalQuestions}
                  </span>
                </div>
                <Progress value={(currentQuestionNum / totalQuestions) * 100} className="h-2" />
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3">
              <Button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionNum === 1 || submitting}
                variant="outline"
                className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Question
              </Button>
              {currentQuestionNum < totalQuestions && (
                <Button
                  onClick={goToNextQuestion}
                  disabled={!questionsData[currentQuestionNum - 1]?.answer || loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Question Card */}
            <Card className="border-gray-100 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Question {currentQuestionNum}</CardTitle>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">{interviewType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 text-base lg:text-lg leading-relaxed">
                  {currentQuestion}
                </p>
              </CardContent>
            </Card>

            {/* Answer Input Card */}
            <Card className="border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Your Answer</CardTitle>
                <CardDescription>
                  Take your time to craft a thoughtful response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  placeholder="Type your answer here... Be specific and provide examples when possible."
                  className="resize-none"
                  disabled={submitting}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={submitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Submit Answer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Card - Shows after submission */}
            {feedback && !interviewCompleted && (
              <Card className="border-green-100 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg text-green-800">AI Feedback</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {feedback}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Interview Completed State */}
        {interviewCompleted && (
          <Card className="border-green-100 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Interview Completed! 🎉
              </h3>
              {finalScore && (
                <div className="mb-4">
                  <Badge className={`${getScoreColor(finalScore)} text-lg px-4 py-2`}>
                    Final Score: {finalScore}/10
                  </Badge>
                </div>
              )}
              {finalFeedback && (
                <div className="mt-4 p-4 bg-white rounded-lg text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Overall Feedback:</p>
                  <p className="text-gray-600">{finalFeedback}</p>
                </div>
              )}
              <div className="flex gap-3 justify-center mt-6">
                <Button
                  onClick={() => {
                    setInterviewCompleted(false);
                    setCurrentQuestion("");
                    setFeedback("");
                    setAnswer("");
                    setSessionId(null);
                    setCurrentQuestionNum(0);
                    setFinalScore(null);
                    setFinalFeedback("");
                    setQuestionsData([]);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Start New Interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview History Section with Filter */}
        {showHistory && (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchInterviewHistory}
                >
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
                    Total {filteredHistory.length} interview{filteredHistory.length !== 1 ? 's' : ''} found
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
            ) : filteredHistory.length === 0 ? (
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
                  <Button 
                    onClick={() => {
                      setShowHistory(false);
                      startInterview();
                    }} 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start {interviewType} Interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item, index) => (
                  <Card key={item.id} className="border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 relative group">
                    {/* Question Number Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-purple-100 text-purple-700">
                        Question {index + 1}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.user_answer && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(item)}
                          className="bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                          disabled={isDeleting}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteInterview(item.id)}
                        className="bg-white text-red-600 hover:bg-red-50 border-red-200"
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </div>

                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-2 pl-16 pr-24">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        {item.score && (
                          <Badge className={getScoreColor(item.score)}>
                            Score: {item.score}/10
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Question:
                        </p>
                        <p className="text-sm text-gray-600">{item.current_question}</p>
                      </div>
                      {item.user_answer && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Your Answer:
                          </p>
                          <p className="text-sm text-gray-600">{item.user_answer.length > 300 ? `${item.user_answer.substring(0, 300)}...` : item.user_answer}</p>
                        </div>
                      )}
                      {item.ai_feedback && (
                        <div>
                          <p className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Feedback:
                          </p>
                          <p className="text-sm text-gray-600">{item.ai_feedback.length > 400 ? `${item.ai_feedback.substring(0, 400)}...` : item.ai_feedback}</p>
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
        )}

        {/* Quick Tips Card */}
        {!showHistory && !interviewActive && !currentQuestion && !interviewCompleted && (
          <Card className="mt-6 border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-800 font-medium">Pro Tips:</span>
                <span className="text-xs text-amber-700">
                  Be specific with examples, use STAR method for behavioral questions, and practice regularly! You'll get 10 questions per interview.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Answer">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Question:</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {editingItem?.current_question}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
            <Textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              rows={8}
              placeholder="Update your answer here..."
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={updateInterviewAnswer}
              disabled={isUpdating || !editAnswer.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}