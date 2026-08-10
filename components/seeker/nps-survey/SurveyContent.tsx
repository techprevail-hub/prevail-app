// app/dashboard/seeker/nps-survey/SurveyContent.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ArrowRight, ChevronUp } from "lucide-react";

interface Question {
  id: string;
  question: string;
  question_type: string;
}

interface SurveyData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  total_questions: number;
  expires_at: string;
  submitted: boolean;
  institute_id: string;
  student_name?: string;
}

export default function SurveyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const surveyId = searchParams.get('surveyId');
  const token = searchParams.get('token');
  const studentId = searchParams.get('studentId');
  
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // ✅ FIX: Get auth token and check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading) {
        // First check if user exists from useAuth
        if (!user) {
          // Try to get session directly from supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // User is authenticated via supabase session
            setIsAuthenticated(true);
            setAuthToken(session.access_token);
            return;
          }
          
          // No user found, redirect to login
          const redirectUrl = `/dashboard/seeker/nps-survey?surveyId=${surveyId}&token=${token}&studentId=${studentId}`;
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
          return;
        }

        // User exists from useAuth, get the token
        setIsAuthenticated(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
        } else {
          // Try to refresh the session
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          if (refreshedSession?.access_token) {
            setAuthToken(refreshedSession.access_token);
          } else {
            setError('Unable to get authentication token. Please log in again.');
            setIsAuthenticated(false);
          }
        }
      }
    };

    checkAuth();
  }, [user, authLoading, router, surveyId, token, studentId]);

  // Validate URL parameters
  useEffect(() => {
    if (!surveyId || !token || !studentId) {
      setError('Invalid survey link. Missing required parameters.');
      setLoading(false);
      return;
    }

    if (studentId === 'undefined' || studentId === 'null' || studentId === '') {
      setError('Invalid student ID. Please check your survey link.');
      setLoading(false);
      return;
    }
  }, [surveyId, token, studentId]);

  // Fetch survey data
  useEffect(() => {
    if (!isAuthenticated || !authToken || !surveyId || !token || !studentId || studentId === 'undefined') {
      return;
    }

    fetchSurvey();
  }, [isAuthenticated, authToken, surveyId, token, studentId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching survey with:', {
        surveyId,
        token,
        studentId,
        authToken: authToken ? 'present' : 'missing'
      });

      // ✅ FIX: Make sure authToken is valid
      if (!authToken) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}?token=${token}&studentId=${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        // Token expired, try to refresh
        const { data: { session } } = await supabase.auth.refreshSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
          // Retry the request
          return fetchSurvey();
        } else {
          throw new Error('Your session has expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch survey');
      }

      const result = await response.json();
      console.log('📋 Survey result:', result);
      
      if (result.success) {
        setSurvey(result.data);
        if (result.data.submitted) {
          setSubmitted(true);
        }
      } else {
        setError(result.message || 'Failed to load survey');
      }
    } catch (err: any) {
      console.error('Error fetching survey:', err);
      setError(err.message || 'Failed to load survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey || !user?.id) {
      setError('Please log in to submit the survey');
      return;
    }

    // Validate all questions are answered
    const allAnswered = survey.questions.every(q => 
      answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
    );
    
    if (!allAnswered) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (!authToken) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      // ✅ Use institute_id from survey data
      const instituteId = survey.institute_id;
      
      if (!instituteId) {
        console.error('❌ No institute_id found in survey data:', survey);
        setError('Survey configuration error. Please contact support.');
        setSubmitting(false);
        return;
      }

      console.log('📋 Submitting with institute_id:', instituteId);

      const requestBody = {
        institute_id: instituteId,
        studentId: studentId || user.id,
        answers: answers,
        token: token,
      };

      console.log('📋 Request body:', requestBody);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.status === 401) {
        const { data: { session } } = await supabase.auth.refreshSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
          return handleSubmit(e);
        } else {
          throw new Error('Your session has expired. Please log in again.');
        }
      }

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        if (data.errors) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ');
          setError(`Validation failed: ${errorMessages}`);
        } else {
          setError(data.message || 'Failed to submit survey');
        }
      }
    } catch (err: any) {
      console.error('Error submitting survey:', err);
      setError(err.message || 'Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!survey) return 0;
    const answeredCount = survey.questions.filter(q => 
      answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
    ).length;
    return Math.round((answeredCount / survey.questions.length) * 100);
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || '';

    switch (question.question_type) {
      case 'rating':
        return (
          <div className="flex gap-2 mt-4 flex-wrap">
            {[1, 2, 3, 4, 5].map((rating) => (
              <motion.button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-12 h-12 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                  value === rating
                    ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white shadow-lg'
                    : 'border-gray-200 text-gray-700 hover:border-[#6C5CE7] hover:bg-[#F5F3FF]'
                }`}
              >
                {rating}
              </motion.button>
            ))}
          </div>
        );

      case 'recommendation':
        return (
          <div className="mt-4">
            <div className="flex gap-1.5 flex-wrap justify-center md:justify-start">
              {Array.from({ length: 11 }, (_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-full border-2 font-semibold text-xs transition-all duration-200 ${
                    value === i
                      ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white shadow-md'
                      : 'border-gray-200 text-gray-700 hover:border-[#6C5CE7] hover:bg-[#F5F3FF]'
                  }`}
                >
                  {i}
                </motion.button>
              ))}
            </div>
            <div className="w-full flex justify-between text-xs text-gray-500 mt-3 px-1">
              <span className="font-medium">Not likely</span>
              <span className="font-medium">Very likely</span>
            </div>
          </div>
        );

      case 'satisfaction':
        return (
          <div className="space-y-2 mt-4">
            {['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'].map((option, idx) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleAnswerChange(question.id, option)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                  value === option
                    ? 'border-[#6C5CE7] bg-[#F5F3FF] text-[#6C5CE7]'
                    : 'border-gray-200 text-gray-700 hover:border-[#6C5CE7] hover:bg-[#F5F3FF]'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'text':
        return (
          <motion.textarea
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-4 p-4 border-2 border-gray-200 rounded-lg focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all outline-none resize-none"
            rows={4}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Share your thoughts..."
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2 mt-4">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((option) => (
              <motion.label
                key={option}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-[#6C5CE7] hover:bg-[#F5F3FF] cursor-pointer transition-all duration-200"
              >
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-[#6C5CE7] accent-[#6C5CE7] cursor-pointer"
                />
                <span className="font-medium text-gray-700">{option}</span>
              </motion.label>
            ))}
          </div>
        );

      default:
        return (
          <motion.input
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            type="text"
            className="w-full mt-4 p-4 border-2 border-gray-200 rounded-lg focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all outline-none font-medium"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer..."
          />
        );
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6C5CE7] border-r-[#6C5CE7]"
            />
          </div>
          <p className="text-gray-600 font-medium">Loading survey...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <AlertCircle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Cannot Access Survey
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/seeker')}
            className="w-full px-6 py-3 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5B4BC0] transition-colors font-semibold"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <AlertCircle className="w-16 h-16 text-yellow-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Please Login
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">You need to be logged in to access this survey.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const redirectUrl = `/dashboard/seeker/nps-survey?surveyId=${surveyId}&token=${token}&studentId=${studentId}`;
              router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            }}
            className="w-full px-6 py-3 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5B4BC0] transition-colors font-semibold"
          >
            Login Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Survey submitted successfully
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Thank You!
          </h2>
          <p className="text-gray-600 mb-2 leading-relaxed">
            Your survey response has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            We appreciate your valuable feedback!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/seeker')}
            className="w-full px-6 py-3 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5B4BC0] transition-colors font-semibold"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main survey form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 md:py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6C5CE7]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#AC5D00]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Header with progress */}
          <div className="bg-gradient-to-r from-[#6C5CE7]/5 to-[#AC5D00]/5 p-8 md:p-10 border-b border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Plus Jakarta Sans' }}
                >
                  {survey?.title || 'Feedback Survey'}
                </h1>
                <p className="text-gray-600 max-w-lg leading-relaxed">
                  {survey?.description || 'Please share your feedback with us.'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm font-bold text-[#6C5CE7]">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#AC5D00]"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {survey?.questions.filter(q => 
                    answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
                  ).length || 0} of {survey?.questions.length || 0} answered
                </span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {survey?.questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined && 
                                answers[question.id] !== '' && 
                                answers[question.id] !== null;

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`pb-8 border-b border-gray-100 last:border-0 transition-all duration-200 ${
                    expandedQuestion === question.id ? 'bg-gray-50 p-6 rounded-xl -mx-8 px-8' : ''
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="flex items-center justify-center min-w-max mt-1">
                          <motion.div
                            animate={{
                              background: isAnswered 
                                ? 'linear-gradient(135deg, #6C5CE7, #AC5D00)' 
                                : '#f3f4f6'
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          >
                            <span className={isAnswered ? 'text-white' : 'text-gray-700'}>
                              {index + 1}
                            </span>
                          </motion.div>
                        </div>
                        <span 
                          className="text-lg md:text-lg font-semibold text-gray-900 leading-snug group-hover:text-[#6C5CE7] transition-colors"
                          style={{ fontFamily: 'Plus Jakarta Sans' }}
                        >
                          {question.question}
                          {!isAnswered && (
                            <span className="text-red-500 ml-1.5">*</span>
                          )}
                        </span>
                      </label>
                    </div>
                    {isAnswered && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      </motion.div>
                    )}
                  </div>

                  {/* Question content */}
                  <div className="ml-11">
                    {renderQuestion(question)}
                  </div>
                </motion.div>
              );
            })}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={submitting || getProgressPercentage() < 100}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-[#6C5CE7] to-[#5B4BC0] text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Response
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Footer message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500 leading-relaxed"
            >
              Your responses will be kept confidential and used to improve our services.
            </motion.p>
          </form>
        </motion.div>

        {/* Footer branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-[#6C5CE7]">Prevail</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}