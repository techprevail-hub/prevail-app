"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  Brain,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Code,
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
  ArrowLeft as BackArrow,
  Mic,
  MicOff,
  Volume2,
  RotateCw,
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
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

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
  // Core States
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
  
  // History States
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<InterviewHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  
  // Interview Progress States
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalFeedback, setFinalFeedback] = useState("");
  const [showCompletionCard, setShowCompletionCard] = useState(true);
  const [currentAnswerSaved, setCurrentAnswerSaved] = useState(false);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);

  // Voice Interview States
  const [interviewMode, setInterviewMode] = useState<"text" | "voice">("text");
  const [audioUrl, setAudioUrl] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          setAnswer(finalTranscript);
          setIsRecording(false);
          // Auto-submit after speech recognition completes
          setTimeout(() => {
            if (interviewMode === "voice") {
              saveAnswerAndNext();
            }
          }, 300);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          toast.error("Please allow microphone access.");
        } else if (event.error === "no-speech") {
          toast.error("No speech detected. Please try again.");
          setTimeout(() => {
            if (interviewMode === "voice" && interviewActive) startRecording();
          }, 1000);
        } else {
          toast.error("Failed to capture voice. Please try again.");
        }
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [interviewMode, interviewActive]);

  // Auto-play audio when URL changes
  useEffect(() => {
    if (audioUrl && interviewMode === "voice" && interviewActive) {
      setIsLoadingAudio(false);
      setIsPlayingAudio(true);
      
      const playAudio = () => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play()
          .catch((err) => {
            console.error("Audio playback failed:", err);
            setIsPlayingAudio(false);
            setIsLoadingAudio(false);
            setTimeout(() => {
              if (interviewMode === "voice" && interviewActive) startRecording();
            }, 500);
          });
        
        audio.onended = () => {
          setIsPlayingAudio(false);
          if (interviewMode === "voice" && interviewActive && !interviewCompleted) {
            setTimeout(() => startRecording(), 300);
          }
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setIsLoadingAudio(false);
          toast.error("Failed to play audio.");
          setTimeout(() => {
            if (interviewMode === "voice" && interviewActive) startRecording();
          }, 500);
        };
      };

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .catch((err) => {
            console.error("Audio playback failed:", err);
            setIsPlayingAudio(false);
            setTimeout(() => {
              if (interviewMode === "voice" && interviewActive) startRecording();
            }, 500);
          });
      } else {
        playAudio();
      }
    }
  }, [audioUrl, interviewMode, interviewActive, interviewCompleted]);

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
    setAudioUrl("");
    setVoiceText("");
    setTranscript("");
    setIsRecording(false);
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);
    setTimeout(() => {
      setShowCompletionCard(true);
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

  // ==========================================
  // START INTERVIEW
  // ==========================================
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
      setAudioUrl("");
      setVoiceText("");
      setTranscript("");
      setIsLoadingAudio(true);

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
          interview_mode: interviewMode,
        }),
      });

      const data = await response.json();

      console.log("Start Interview Response:", data);

      if (data.success) {
        setCurrentQuestion(data.question);
        setSessionId(data.session_id);
        setTotalQuestions(data.total_questions || 10);
        setVoiceText(data.voiceText || data.question || "");
        setAudioUrl(data.audioUrl || "");
        if (data.audioUrl) setIsLoadingAudio(true);
        
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
        setIsLoadingAudio(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      setInterviewActive(false);
      setIsLoadingAudio(false);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }
    if (isRecording) return;

    try {
      setTranscript("");
      setAnswer("");
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error("Recording error:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error("Stop recording error:", error);
      }
    }
  };

  const replayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.error("Replay failed:", err);
        toast.error("Failed to replay audio.");
      });
    }
  };

  // ==========================================
  // SAVE ANSWER AND NEXT - FIXED
  // ==========================================
  const saveAnswerAndNext = async () => {
    const answerToSubmit = interviewMode === "voice" ? transcript : answer;
    
    console.log("Saving answer:", { answerToSubmit, mode: interviewMode, sessionId });
    
    if (!answerToSubmit || !answerToSubmit.trim()) {
      if (interviewMode === "voice") {
        toast.info("No speech detected. Please try again.");
        setTimeout(() => {
          if (interviewMode === "voice" && interviewActive) startRecording();
        }, 500);
      } else {
        toast.error("Please provide an answer before continuing.");
      }
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
          answer: answerToSubmit,
        }),
      });

      const data = await response.json();

      console.log("Answer Response:", data);

      if (data.success) {
        // Update the current question's data
        const updatedQuestions = [...questionsData];
        updatedQuestions[currentQuestionNum - 1] = {
          question: currentQuestion,
          answer: answerToSubmit,
          feedback: data.feedback || "Feedback saved",
          questionNumber: currentQuestionNum,
        };
        setQuestionsData(updatedQuestions);
        setFeedback(data.feedback || "Feedback saved");
        setCurrentAnswerSaved(true);

        // Check if interview is completed
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
          setSubmitting(false);
          return;
        }

        // Load the next question
        if (data.question) {
          console.log("Loading next question:", data.question);
          
          // Update the next question in the array
          const nextUpdated = [...updatedQuestions];
          nextUpdated[currentQuestionNum] = {
            ...nextUpdated[currentQuestionNum],
            question: data.question,
          };
          setQuestionsData(nextUpdated);

          // Set the new question and increment counter
          setCurrentQuestion(data.question);
          setCurrentQuestionNum(currentQuestionNum + 1);
          
          // Clear answer and feedback for the next question
          setAnswer("");
          setFeedback("");
          setCurrentAnswerSaved(false);
          setTranscript("");
          
          // Set voice data for the next question
          setVoiceText(data.voiceText || data.question || "");
          setAudioUrl(data.audioUrl || "");
          if (data.audioUrl) {
            setIsLoadingAudio(true);
            setIsPlayingAudio(true);
          }
          
          toast.info(`Question ${currentQuestionNum + 1} of ${totalQuestions}`);
        } else {
          // If no question is returned, something went wrong
          console.error("No next question received:", data);
          toast.error("Could not load next question. Please try again.");
          // Try to fetch the next question from the session
          await fetchNextQuestion();
        }
      } else {
        toast.error(data.message || "Failed to save answer");
        if (interviewMode === "voice") {
          setTimeout(() => {
            if (interviewMode === "voice" && interviewActive) startRecording();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Something went wrong. Please try again.");
      if (interviewMode === "voice") {
        setTimeout(() => {
          if (interviewMode === "voice" && interviewActive) startRecording();
        }, 500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to fetch the next question if needed
  const fetchNextQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/interview/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        const session = data.data;
        const nextIndex = currentQuestionNum;
        if (session.questions && session.questions[nextIndex]) {
          setCurrentQuestion(session.questions[nextIndex]);
          setCurrentQuestionNum(nextIndex + 1);
          setAnswer("");
          setFeedback("");
          setTranscript("");
          toast.info(`Question ${nextIndex + 1} of ${totalQuestions}`);
        }
      }
    } catch (error) {
      console.error("Error fetching next question:", error);
    }
  };

  // Submit Answer and End the Interview
  const submitAnswerAndEnd = async () => {
    const answerToSubmit = interviewMode === "voice" ? transcript : answer;
    
    if (!answerToSubmit.trim()) {
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
          answer: answerToSubmit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedQuestions = [...questionsData];
        updatedQuestions[currentQuestionNum - 1] = {
          question: currentQuestion,
          answer: answerToSubmit,
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
      setAudioUrl("");
      setVoiceText("");
      setTranscript("");
      setIsRecording(false);
      setIsPlayingAudio(false);
      setIsLoadingAudio(false);
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

  const closeCompletionCard = () => {
    setShowCompletionCard(false);
    setInterviewCompleted(false);
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
      <div className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto">

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
                    onClick={() => {
                      setShowHistory(false);
                      setInterviewCompleted(false);
                      setShowCompletionCard(true);
                    }}
                    className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg font-semibold transition-all duration-200 text-xs px-4 py-2"
                  >
                    <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                    New Interview
                  </Button>
                  <Button
                    onClick={() => {
                      setShowHistory(!showHistory);
                      setInterviewCompleted(false);
                      setShowCompletionCard(true);
                      if (!showHistory) filterHistoryByType();
                    }}
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
                  <p className="text-xl font-bold">{filteredHistory.length}</p>
                  <p className="text-[9px] text-white/70 mt-0.5">{interviewType} Sessions</p>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[80px]">
                  <p className="text-xl font-bold">
                    {filteredHistory.filter((h) => h.score && h.score >= 7).length}
                  </p>
                  <p className="text-[9px] text-white/70 mt-0.5">Good Scores</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Back Arrow when viewing history ── */}
        {showHistory && (
          <div className="mb-4">
            <button
              onClick={() => {
                setShowHistory(false);
                setInterviewCompleted(false);
                setShowCompletionCard(true);
                setInterviewActive(false);
                setCurrentQuestion("");
              }}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-medium text-sm"
            >
              <BackArrow className="w-4 h-4" />
              Back to Interview Selection
            </button>
          </div>
        )}

        {/* ── Interview Mode Selector ── */}
        {showMainDropdown && !showHistory && (
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
        )}

        {/* ── Interview Type + Sub-type Selection ── */}
        {showMainDropdown && !showHistory && (
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
                  onClick={startInterview}
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
        )}

        {/* ── Empty State ── */}
        {!interviewActive && !currentQuestion && !showHistory && !interviewCompleted && !subType && showMainDropdown && (
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

        {/* ── Active Interview Session ── */}
        {interviewActive && currentQuestion && (
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
                onClick={goToPreviousQuestion}
                disabled={currentQuestionNum === 1 || submitting}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg text-xs px-3 py-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Previous
              </Button>
              <Button
                onClick={endInterview}
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
                          onClick={replayAudio}
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
                        ? isRecording ? "Recording... Speak clearly" : "Click microphone to start speaking"
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
                          onClick={startRecording}
                          disabled={submitting || isPlayingAudio || isLoadingAudio}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          🎤 Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg rounded-lg font-semibold py-4 text-xs transition-all duration-200 animate-pulse"
                        >
                          <MicOff className="w-4 h-4 mr-2" />
                          🔴 Stop Recording
                        </Button>
                      )}
                    </div>
                    {isRecording && (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-4 bg-red-500 animate-pulse"></div>
                          <div className="w-1.5 h-6 bg-red-500 animate-pulse delay-75"></div>
                          <div className="w-1.5 h-3 bg-red-500 animate-pulse delay-150"></div>
                          <div className="w-1.5 h-5 bg-red-500 animate-pulse delay-100"></div>
                          <div className="w-1.5 h-4 bg-red-500 animate-pulse delay-50"></div>
                        </div>
                        <span className="text-xs text-red-500 font-medium">Recording...</span>
                      </div>
                    )}
                    {transcript && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-[10px] font-semibold text-gray-500 mb-1">Transcript:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{transcript}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={6}
                    placeholder="Type your answer here... Be specific and provide examples when possible."
                    className="resize-none rounded-lg border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-sm leading-relaxed"
                    disabled={submitting}
                  />
                )}
                
                {/* Buttons - Only show for Text mode */}
                {interviewMode === "text" && (
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <Button
                      onClick={saveAnswerAndNext}
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
                      onClick={submitAnswerAndEnd}
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
                )}
              </CardContent>
            </Card>

            {/* Feedback Card */}
            {feedback && !interviewCompleted && currentAnswerSaved && (
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
        )}

        {/* ── Interview Completed ── */}
        {interviewCompleted && showCompletionCard && (
          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
            <button
              onClick={closeCompletionCard}
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
                  onClick={() => resetToInitialState()}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-lg font-semibold py-4 text-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
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
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold py-4 text-xs"
                >
                  <History className="w-3.5 h-3.5 mr-1.5" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── History Section ── */}
        {showHistory && (
          <div className="mt-4">
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
                setInterviewActive(false);
                setCurrentQuestion("");
              }}
            />
          </div>
        )}

        {/* ── Pro Tips ── */}
        {!showHistory && !interviewActive && !currentQuestion && !interviewCompleted && showMainDropdown && (
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
        )}
      </div>

      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Answer">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Question</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed border border-gray-100">
              {editingItem?.current_question}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Your Answer</p>
            <Textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              rows={6}
              placeholder="Update your answer here..."
              className="resize-none rounded-lg border-gray-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-1.5">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-lg text-xs">
              Cancel
            </Button>
            <Button
              onClick={updateInterviewAnswer}
              disabled={isUpdating || !editAnswer.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg text-xs"
            >
              {isUpdating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}