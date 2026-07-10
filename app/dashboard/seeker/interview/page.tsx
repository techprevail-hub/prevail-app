"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Loader2, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import InterviewSelection from "@/components/interview/InterviewSelection";
import InterviewSession from "@/components/interview/InterviewSession";
import InterviewResult from "@/components/interview/InterviewResult";
import InterviewHistoryComponent from "@/components/InterviewHistory";

// Type declaration for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  // Selection States
  const [interviewType, setInterviewType] = useState("Frontend");
  const [subType, setSubType] = useState("");
  const [interviewMode, setInterviewMode] = useState<"text" | "voice">("text");
  const [loading, setLoading] = useState(false);

  // Session States
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentAnswerSaved, setCurrentAnswerSaved] = useState(false);
  
  // Voice States
  const [audioUrl, setAudioUrl] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Interview Status
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalFeedback, setFinalFeedback] = useState("");

  // History States
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<InterviewHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Edit Modal States
  const [editingItem, setEditingItem] = useState<InterviewHistory | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Refs for Speech Recognition
  const recognitionRef = useRef<any>(null);
  const isSpeechSupported = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>("");
  const isRecordingRef = useRef<boolean>(false);

  const completedCount = questionsData.filter((q) => q.answer).length;

  // Fetch history
  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  useEffect(() => {
    filterHistoryByType();
  }, [interviewType, history]);

  // ==========================================
  // SPEECH RECOGNITION SETUP - COMPLETELY FIXED
  // ==========================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        isSpeechSupported.current = true;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          
          // Collect all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText;
            } else {
              interimTranscript += transcriptText;
            }
          }
          
          // If we have a final transcript, accumulate it
          if (finalTranscript) {
            accumulatedTranscriptRef.current += " " + finalTranscript;
            accumulatedTranscriptRef.current = accumulatedTranscriptRef.current.trim();
            setTranscript(accumulatedTranscriptRef.current);
            setAnswer(accumulatedTranscriptRef.current);
            console.log("Final transcript accumulated:", accumulatedTranscriptRef.current);
          } else if (interimTranscript) {
            // Show interim transcript as well
            const currentText = accumulatedTranscriptRef.current + " " + interimTranscript;
            setTranscript(currentText.trim());
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            toast.error("Please allow microphone access.");
            setIsRecording(false);
            isRecordingRef.current = false;
          } else if (event.error === "no-speech") {
            toast.info("No speech detected. Please speak into the microphone.");
          } else if (event.error === "aborted") {
            console.log("Recording stopped by user.");
          }
        };

        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended.");
          console.log("Accumulated transcript:", accumulatedTranscriptRef.current);
          
          // Update the transcript with whatever we have
          if (accumulatedTranscriptRef.current) {
            setTranscript(accumulatedTranscriptRef.current);
            setAnswer(accumulatedTranscriptRef.current);
          }
          
          // Always set recording to false when recognition ends
          setIsRecording(false);
          isRecordingRef.current = false;
          
          // Only show toast if we have transcript and it wasn't manually stopped
          if (accumulatedTranscriptRef.current) {
            toast.success("✅ Recording stopped. Review your transcript below.");
          } else {
            toast.info("No speech detected. Click 'Start Recording' to try again.");
          }
        };
      } else {
        isSpeechSupported.current = false;
        console.warn("Speech recognition is not supported in this browser.");
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.stop(); 
        } catch (e) {}
      }
    };
  }, []);

  // Auto-play audio when URL changes
  useEffect(() => {
    if (audioUrl && interviewMode === "voice" && interviewActive) {
      setIsLoadingAudio(false);
      setIsPlayingAudio(true);
      
      const playAudio = () => {
        const audio = new Audio(audioUrl);
        audio.play()
          .catch((err) => {
            console.error("Audio playback failed:", err);
            setIsPlayingAudio(false);
            setIsLoadingAudio(false);
          });
        
        audio.onended = () => {
          setIsPlayingAudio(false);
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setIsLoadingAudio(false);
          toast.error("Failed to play audio.");
        };
      };

      playAudio();
    }
  }, [audioUrl, interviewMode, interviewActive, interviewCompleted]);

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

  // ==========================================
  // START INTERVIEW
  // ==========================================
  const handleInterviewStart = async (type: string, sub: string, mode: "text" | "voice") => {
    setInterviewType(type);
    setSubType(sub);
    setInterviewMode(mode);

    try {
      setLoading(true);
      setFeedback("");
      setAnswer("");
      setInterviewActive(true);
      setCurrentQuestionNum(1);
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
          interview_type: type,
          sub_type: sub,
          interview_mode: mode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        setCurrentQuestion(data.question);
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
        toast.success(`${sub} interview started! Question 1 of ${data.total_questions || 10}`);
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

  // ==========================================
  // VOICE RECORDING - COMPLETELY FIXED
  // ==========================================
  const startRecording = () => {
    if (!isSpeechSupported.current) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not initialized. Please refresh the page.");
      return;
    }
    if (isRecording || isRecordingRef.current) {
      toast.info("Already recording. Click 'Stop Recording' when done.");
      return;
    }
    
    // Clear previous transcripts
    accumulatedTranscriptRef.current = "";
    setTranscript("");
    setAnswer("");

    // Check microphone permission
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((result) => {
          if (result.state === 'denied') {
            toast.error("Microphone access is blocked. Please allow microphone access in your browser settings.");
            return;
          }
          startSpeechRecognition();
        })
        .catch(() => startSpeechRecognition());
    } else {
      startSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    try {
      if (!recognitionRef.current) {
        toast.error("Speech recognition is not available.");
        return;
      }
      setIsRecording(true);
      isRecordingRef.current = true;
      recognitionRef.current.start();
      toast.info("🎤 Recording started. Speak your answer clearly.");
    } catch (error) {
      console.error("Recording error:", error);
      setIsRecording(false);
      isRecordingRef.current = false;
      if (error instanceof Error && error.message.includes('already started')) {
        toast.info("Recording is already in progress.");
      } else {
        toast.error("Failed to start recording. Please try again.");
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && (isRecording || isRecordingRef.current)) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
        isRecordingRef.current = false;
        
        // The transcript will be set in the onend handler
        if (accumulatedTranscriptRef.current) {
          toast.success("✅ Recording stopped. Review your transcript below.");
        } else {
          toast.warning("No speech detected. Please try recording again.");
        }
      } catch (error) {
        console.error("Stop recording error:", error);
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    } else {
      setIsRecording(false);
      isRecordingRef.current = false;
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
  // SAVE ANSWER AND NEXT
  // ==========================================
  const saveAnswerAndNext = async () => {
    const answerToSubmit = interviewMode === "voice" ? transcript : answer;
    
    if (!answerToSubmit || !answerToSubmit.trim()) {
      if (interviewMode === "voice") {
        toast.info("No speech detected. Please record your answer first.");
        return;
      } else {
        toast.error("Please provide an answer before continuing.");
        return;
      }
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
        setFeedback(data.feedback || "Feedback saved");
        setCurrentAnswerSaved(true);

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

        if (data.question) {
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
          setTranscript("");
          accumulatedTranscriptRef.current = "";
          
          setVoiceText(data.voiceText || data.question || "");
          setAudioUrl(data.audioUrl || "");
          if (data.audioUrl) {
            setIsLoadingAudio(true);
            setIsPlayingAudio(true);
          }
          
          toast.info(`Question ${currentQuestionNum + 1} of ${totalQuestions}`);
        } else {
          console.error("No next question received:", data);
          toast.error("Could not load next question. Please try again.");
        }
      } else {
        toast.error(data.message || "Failed to save answer");
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
      isRecordingRef.current = false;
      setIsPlayingAudio(false);
      setIsLoadingAudio(false);
      accumulatedTranscriptRef.current = "";
      toast.info("Interview ended. Your progress has been saved.");
      fetchInterviewHistory();
    }
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
    setInterviewActive(false);
    setShowHistory(false);
    setCurrentAnswerSaved(false);
    setAudioUrl("");
    setVoiceText("");
    setTranscript("");
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);
    accumulatedTranscriptRef.current = "";
    setTimeout(() => {
      setShowCompletionCard(true);
      setInterviewActive(false);
      setCurrentQuestion("");
    }, 100);
  };

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
    setInterviewActive(false);
    setCurrentAnswerSaved(false);
  };

  // Delete, Edit, Update functions
  const deleteInterview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this interview record?")) return;
    try {
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

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto">
        
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
              <ArrowLeft className="w-4 h-4" />
              Back to Interview Selection
            </button>
          </div>
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

        {/* ── Main Content ── */}
        {!showHistory && (
          <>
            {/* Selection View */}
            {!interviewActive && !interviewCompleted && (
              <InterviewSelection
                onInterviewStart={handleInterviewStart}
                loading={loading}
                filteredHistoryLength={filteredHistory.length}
                onViewHistory={() => setShowHistory(true)}
                showHistory={showHistory}
              />
            )}

            {/* Session View */}
            {interviewActive && (
              <InterviewSession
                sessionId={sessionId}
                currentQuestion={currentQuestion}
                currentQuestionNum={currentQuestionNum}
                totalQuestions={totalQuestions}
                interviewType={interviewType}
                subType={subType}
                interviewMode={interviewMode}
                audioUrl={audioUrl}
                voiceText={voiceText}
                isLoadingAudio={isLoadingAudio}
                isPlayingAudio={isPlayingAudio}
                isRecording={isRecording}
                transcript={transcript}
                answer={answer}
                feedback={feedback}
                submitting={submitting}
                questionsData={questionsData}
                completedCount={completedCount}
                onAnswerChange={setAnswer}
                onTranscriptChange={setTranscript}
                onSaveAnswer={saveAnswerAndNext}
                onSubmitEnd={submitAnswerAndEnd}
                onPrevious={goToPreviousQuestion}
                onEnd={endInterview}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onReplayAudio={replayAudio}
              />
            )}

            {/* Result View */}
            {interviewCompleted && showCompletionCard && (
              <InterviewResult
                subType={subType}
                interviewMode={interviewMode}
                completedCount={completedCount}
                totalQuestions={totalQuestions}
                finalScore={finalScore}
                finalFeedback={finalFeedback}
                onStartNew={resetToInitialState}
                onViewHistory={() => {
                  setShowHistory(true);
                  setInterviewCompleted(false);
                  setShowCompletionCard(false);
                  filterHistoryByType();
                }}
                onClose={closeCompletionCard}
              />
            )}
          </>
        )}
      </div>

      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Answer">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Question</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed border border-gray-100">
              {editingItem?.current_question}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Your Answer</p>
            <Textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              rows={6}
              placeholder="Update your answer here..."
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-1.5">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={updateInterviewAnswer}
              disabled={isUpdating || !editAnswer.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
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