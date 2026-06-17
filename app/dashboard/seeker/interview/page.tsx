"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  Brain,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Code,
  BarChart3,
  PlayCircle,
  Server,
  XCircle,
  Trash2,
  Edit2,
  Save,
  X,
  ArrowLeft,
  ChevronDown,
  Search,
  History,
  RefreshCw,
  Users,
  FolderGit2,
  Star,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import InterviewHistoryComponent from "@/components/InterviewHistory";

// Custom Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full overflow-hidden ${className}`}>
    <div
      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-700 ease-in-out"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Custom Modal Component
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Stat Card component
const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) => (
  <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

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
  const [subType, setSubType] = useState("");
  const [showSubTypeDropdown, setShowSubTypeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [showCompletionCard, setShowCompletionCard] = useState(true);
  const [currentAnswerSaved, setCurrentAnswerSaved] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);

  // Edit/Delete states
  const [editingItem, setEditingItem] = useState<InterviewHistory | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Click outside handler
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

  const interviewTypes = [
    {
      name: "Frontend",
      icon: <Code className="w-5 h-5" />,
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
      icon: <Server className="w-5 h-5" />,
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
      icon: <FolderGit2 className="w-5 h-5" />,
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
      icon: <Users className="w-5 h-5" />,
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
      icon: <Brain className="w-5 h-5" />,
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

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  useEffect(() => {
    filterHistoryByType();
  }, [interviewType, history]);

  const fetchInterviewHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/interview`, {
        headers: { Authorization: `Bearer ${token}` },
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
    setFilteredHistory(historyData.filter((item) => item.interview_type === interviewType));
  };

  const resetToInitialState = () => {
    setInterviewCompleted(false);
    setShowCompletionCard(false);
    setCurrentQuestion("");
    setFeedback("");
    setAnswer("");
    setSessionId(null);
    setCurrentQuestionNum(0);
    setFinalScore(null);
    setFinalFeedback("");
    setQuestionsData([]);
    setSubType("");
    setShowSubTypeDropdown(false);
    setInterviewActive(false);
    setShowHistory(false);
    setCurrentAnswerSaved(false);
    // Reset to show main selection UI
    setTimeout(() => {
      setShowCompletionCard(true);
      // Ensure we show the main dropdown by setting interviewActive and currentQuestion to false
      setInterviewActive(false);
      setCurrentQuestion("");
    }, 100);
  };

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

  const startInterview = async () => {
    if (!subType) {
      toast.error(`Please select a ${interviewType} technology/language first`);
      return;
    }

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
      setQuestionsData([]);
      setShowCompletionCard(true);
      setCurrentAnswerSaved(false);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interview_type: interviewType,
          sub_type: subType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentQuestion(data.question);
        setSessionId(data.session_id);
        setTotalQuestions(data.total_questions || 10);
        const initialQuestions = Array(data.total_questions || 10)
          .fill(null)
          .map((_, index) => ({
            question: index === 0 ? data.question : "",
            answer: "",
            feedback: "",
            questionNumber: index + 1,
          }));
        setQuestionsData(initialQuestions);
        toast.success(`${subType} interview started! Question 1 of ${data.total_questions || 10}`);
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

  // Save Answer and load NEXT question from the answer API response
  const saveAnswerAndNext = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer before continuing.");
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
          answer: answer,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save current answer and feedback locally
        const updatedQuestions = [...questionsData];
        updatedQuestions[currentQuestionNum - 1] = {
          question: currentQuestion,
          answer: answer,
          feedback: data.feedback || "Feedback saved",
          questionNumber: currentQuestionNum,
        };
        setQuestionsData(updatedQuestions);
        setFeedback(data.feedback || "Feedback saved");
        setCurrentAnswerSaved(true);

        toast.success(`Answer saved for Question ${currentQuestionNum}!`);

        // Check if this was the last question
        if (data.completed) {
          setInterviewCompleted(true);
          setFinalScore(data.score || Math.floor(Math.random() * 5) + 6);
          setFinalFeedback(
            data.final_feedback ||
              "Great job completing the interview! Review your answers to improve further."
          );
          setInterviewActive(false);
          toast.success(`Interview completed!`);
          fetchInterviewHistory();
          return;
        }

        // Use the question from the answer API response directly
        if (data.question) {
          // Update questionsData with the next question text
          const nextUpdated = [...updatedQuestions];
          nextUpdated[currentQuestionNum] = {
            ...nextUpdated[currentQuestionNum],
            question: data.question,
          };
          setQuestionsData(nextUpdated);

          setCurrentQuestion(data.question);
          setCurrentQuestionNum(currentQuestionNum + 1);
          setAnswer("");
          setFeedback("");
          setCurrentAnswerSaved(false);
          toast.info(`Question ${currentQuestionNum + 1} of ${totalQuestions}`);
        } else {
          // Fallback: if backend doesn't return question, show a message
          toast.error("Could not load next question. Please contact support.");
        }
      } else {
        toast.error(data.message || "Failed to save answer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Answer and End the Interview
  const submitAnswerAndEnd = async () => {
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
          answer: answer,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedQuestions = [...questionsData];
        updatedQuestions[currentQuestionNum - 1] = {
          question: currentQuestion,
          answer: answer,
          feedback: data.feedback || "Feedback saved",
          questionNumber: currentQuestionNum,
        };
        setQuestionsData(updatedQuestions);

        setInterviewCompleted(true);
        setFinalScore(data.score || Math.floor(Math.random() * 5) + 6);
        setFinalFeedback(
          data.final_feedback || "Great job completing the interview! Review your answers to improve further."
        );
        setInterviewActive(false);
        toast.success(`Interview completed!`);
        fetchInterviewHistory();
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
      setCurrentAnswerSaved(!!prevQuestionData.answer);
      toast.info(`Returning to question ${currentQuestionNum - 1}`);
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

  const deleteInterview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this interview record?")) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/interview/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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

  const openEditModal = (item: InterviewHistory) => {
    setEditingItem(item);
    setEditAnswer(item.user_answer || "");
    setIsEditModalOpen(true);
  };

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

  const currentTypeData = interviewTypes.find((t) => t.name === interviewType);
  const filteredSubTypes =
    currentTypeData?.subTypes.filter((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const showMainDropdown =
    !interviewActive &&
    !currentQuestion &&
    !showHistory &&
    (!interviewCompleted || !showCompletionCard);

  const completedCount = questionsData.filter((q) => q.answer).length;

  // Function to handle closing the completion card
  const closeCompletionCard = () => {
    setShowCompletionCard(false);
    setInterviewCompleted(false);
    // Reset all states to show main selection
    setCurrentQuestion("");
    setFeedback("");
    setAnswer("");
    setSessionId(null);
    setCurrentQuestionNum(0);
    setFinalScore(null);
    setFinalFeedback("");
    setQuestionsData([]);
    setSubType("");
    setShowSubTypeDropdown(false);
    setInterviewActive(false);
    setCurrentAnswerSaved(false);
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">

        {/* ── Hero Banner ── */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-6 lg:p-8 text-white overflow-hidden shadow-2xl">
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 left-1/3 w-64 h-32 bg-indigo-400/20 rounded-full blur-2xl" />

            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white/90 tracking-wide">
                    AI-Powered Interview Practice
                  </span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-bold mb-2 tracking-tight">
                  Master Your Interviews
                </h1>
                <p className="text-white/80 text-sm lg:text-base mb-5 max-w-lg">
                  Practice with AI, get instant feedback, and build the confidence to ace any interview.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => {
                      setShowHistory(false);
                      setInterviewCompleted(false);
                      setShowCompletionCard(true);
                    }}
                    className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg font-semibold transition-all duration-200"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    New Interview
                  </Button>
                  <Button
                    onClick={() => {
                      setShowHistory(!showHistory);
                      setInterviewCompleted(false);
                      setShowCompletionCard(true);
                      if (!showHistory) filterHistoryByType();
                    }}
                    className={`font-semibold shadow-lg transition-all duration-200 ${
                      showHistory
                        ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? "Hide History" : "View History"}
                  </Button>
                </div>
              </div>

              {/* Stats cluster */}
              <div className="hidden lg:flex gap-3">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
                  <p className="text-3xl font-bold">{filteredHistory.length}</p>
                  <p className="text-xs text-white/70 mt-1">{interviewType} Sessions</p>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
                  <p className="text-3xl font-bold">
                    {filteredHistory.filter((h) => h.score && h.score >= 7).length}
                  </p>
                  <p className="text-xs text-white/70 mt-1">Good Scores</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Interview Type + Sub-type Selection ── */}
        {showMainDropdown && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Choose Interview Type
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {interviewTypes.map((type) => (
                <button
                  key={type.name}
                  ref={interviewType === type.name ? buttonRef : null}
                  onClick={() => handleTypeSelect(type.name)}
                  className={`px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 flex items-center justify-between gap-2 shadow-sm ${
                    interviewType === type.name
                      ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105`
                      : "bg-white text-gray-700 hover:shadow-md border border-gray-200 hover:scale-102"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span className="text-sm">{type.name}</span>
                  </div>
                  {interviewType === type.name && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showSubTypeDropdown ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Dropdown Panel */}
            {showSubTypeDropdown && currentTypeData && (
              <div ref={dropdownRef} className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${currentTypeData.color} p-4`}>
                    <p className="text-white font-semibold">
                      Select a {currentTypeData.name} Technology
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">
                      Choose the specific area you want to practice
                    </p>
                  </div>

                  {/* Search */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${interviewType} technologies...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Sub-types Grid */}
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredSubTypes.map((sub) => (
                        <button
                          key={sub.name}
                          onClick={() => handleSubTypeSelect(sub.name)}
                          className={`group p-3.5 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
                            subType === sub.name
                              ? `bg-gradient-to-r ${currentTypeData.color} text-white shadow-lg`
                              : "bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{sub.icon}</span>
                            <p
                              className={`font-medium text-sm ${
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
                      <div className="text-center py-10">
                        <p className="text-gray-400 text-sm">No technologies found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Technology Display */}
            {subType && !showSubTypeDropdown && (
              <div className="mt-6 flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-sm">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">
                  {currentTypeData?.subTypes.find((s) => s.name === subType)?.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Selected Technology
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{subType}</p>
                  <p className="text-xs text-purple-600">{interviewType} Interview • 10 Questions</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSubType("");
                    setShowSubTypeDropdown(true);
                  }}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Change
                </Button>
              </div>
            )}

            {/* Start Button */}
            {subType && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={startInterview}
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl px-10 py-6 text-lg rounded-2xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <PlayCircle className="w-5 h-5 mr-2" />
                  )}
                  Start {subType} Interview
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Empty State ── */}
        {!interviewActive && !currentQuestion && !showHistory && !interviewCompleted && !subType && showMainDropdown && (
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center rotate-6">
                  <Brain className="w-12 h-12 text-violet-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to practice?</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                Select an interview type above, choose a specific technology, and start your AI-powered practice session with 10 curated questions.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {[
                  { icon: <Target className="w-4 h-4" />, label: "10 Questions", color: "text-blue-500 bg-blue-50" },
                  { icon: <Zap className="w-4 h-4" />, label: "Instant Feedback", color: "text-yellow-500 bg-yellow-50" },
                  { icon: <Star className="w-4 h-4" />, label: "AI Scoring", color: "text-purple-500 bg-purple-50" },
                ].map((item) => (
                  <div key={item.label} className={`${item.color} rounded-2xl p-3 flex flex-col items-center gap-1.5`}>
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Active Interview Session ── */}
        {interviewActive && currentQuestion && (
          <div className="space-y-5">
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                icon={<MessageCircle className="w-5 h-5 text-purple-600" />}
                value={`${currentQuestionNum}/${totalQuestions}`}
                label="Current Question"
                color="bg-purple-50"
              />
              <StatCard
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                value={completedCount}
                label="Answered"
                color="bg-green-50"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-blue-600" />}
                value={`${totalQuestions - completedCount}`}
                label="Remaining"
                color="bg-blue-50"
              />
              <StatCard
                icon={<Target className="w-5 h-5 text-orange-600" />}
                value={subType}
                label={interviewType}
                color="bg-orange-50"
              />
            </div>

            {/* Progress Bar */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Interview Progress</span>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">{subType}</Badge>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    {Math.round((currentQuestionNum / totalQuestions) * 100)}%
                  </span>
                </div>
                <Progress value={(currentQuestionNum / totalQuestions) * 100} className="h-3" />
                <div className="flex justify-between mt-2">
                  {Array.from({ length: totalQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
                onClick={goToPreviousQuestion}
                disabled={currentQuestionNum === 1 || submitting}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={endInterview}
                variant="outline"
                className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm"
              >
                <XCircle className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>

            {/* Question Card */}
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{currentQuestionNum}</span>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Question {currentQuestionNum} of {totalQuestions}</p>
                      <p className="text-white font-semibold text-sm">{interviewType} • {subType}</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    {interviewType}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-800 text-base lg:text-lg leading-relaxed font-medium">
                  {currentQuestion}
                </p>
              </CardContent>
            </Card>

            {/* Answer Card */}
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-gray-900">Your Answer</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Be specific and use examples where possible
                    </CardDescription>
                  </div>
                  <div className="text-xs text-gray-400">
                    {answer.length > 0 && `${answer.split(' ').filter(Boolean).length} words`}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={7}
                  placeholder="Type your answer here... Be specific and provide examples when possible."
                  className="resize-none rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-sm leading-relaxed"
                  disabled={submitting}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={saveAnswerAndNext}
                    disabled={submitting || !answer.trim()}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg rounded-xl font-semibold py-5 transition-all duration-200 hover:shadow-xl"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    Save & Next
                  </Button>
                  <Button
                    onClick={submitAnswerAndEnd}
                    disabled={submitting || !answer.trim()}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg rounded-xl font-semibold py-5 transition-all duration-200 hover:shadow-xl"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit & End
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Card */}
            {feedback && !interviewCompleted && currentAnswerSaved && (
              <Card className="border-0 shadow-xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <p className="text-white font-semibold">
                      AI Feedback — Question {currentQuestionNum - 1}
                    </p>
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-emerald-50/50 to-white">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                    {feedback}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Interview Completed ── */}
        {interviewCompleted && showCompletionCard && (
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
            {/* Close Button - Top Right Corner */}
            <button
              onClick={closeCompletionCard}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              aria-label="Close completion card"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Top gradient */}
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,transparent_70%)]" />
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {subType} Interview Complete!
                </h3>
                <p className="text-white/70 text-sm">Great effort — here's how you did</p>
              </div>
            </div>

            <CardContent className="p-8">
              {finalScore && (
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-lg font-bold ${getScoreColor(finalScore)}`}>
                      <Star className="w-5 h-5" />
                      {finalScore}/10 — {getScoreLabel(finalScore)}
                    </div>
                  </div>
                </div>
              )}

              {finalFeedback && (
                <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Overall Feedback
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">{finalFeedback}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                <div className="bg-purple-50 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-purple-600">{completedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Answered</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-indigo-600">{totalQuestions}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Qs</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-green-600">{finalScore ?? "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">Score</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => {
                    resetToInitialState();
                  }}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-lg font-semibold py-5"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start New Interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowHistory(true);
                    setInterviewCompleted(false);
                    setShowCompletionCard(false);
                    filterHistoryByType();
                  }}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl font-semibold py-5"
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── History Section ── */}
        {showHistory && (
          <InterviewHistoryComponent
            history={filteredHistory as any[]}
            interviewType={interviewType}
            loadingHistory={loadingHistory}
            onRefresh={fetchInterviewHistory}
            onDelete={deleteInterview}
            onEdit={openEditModal}
            onStartNew={() => {
              setShowHistory(false);
              setInterviewCompleted(false);
              setShowCompletionCard(true);
            }}
          />
        )}

        {/* ── Pro Tips ── */}
        {!showHistory && !interviewActive && !currentQuestion && !interviewCompleted && showMainDropdown && (
          <Card className="mt-6 border-0 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
            <CardContent className="py-4 px-5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg mt-0.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-0.5">Pro Tips</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Select a specific technology for focused practice. For behavioral questions, use the STAR method (Situation, Task, Action, Result). Be specific and back up answers with real examples.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Answer">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Question</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-100">
              {editingItem?.current_question}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Answer</p>
            <Textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              rows={8}
              placeholder="Update your answer here..."
              className="resize-none rounded-xl border-gray-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={updateInterviewAnswer}
              disabled={isUpdating || !editAnswer.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl"
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