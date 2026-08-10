// app/dashboard/seeker/nps-survey/SurveyContent.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  const {
    user,
    session,
    accessToken,
    loading: authLoading,
  } = useAuth();
  
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

  // Helper function to safely encode parameters
  const safeEncode = (value: string | null): string => {
    if (!value) return '';
    return encodeURIComponent(value);
  };

  // ✅ FIXED: Authentication useEffect - uses Supabase session directly
  useEffect(() => {
    if (authLoading) {
      return;
    }

    // User is logged in with valid Supabase session
    if (user && session) {
      console.log("✅ Survey user authenticated:", user.id);
      setIsAuthenticated(true);
      setAuthToken(accessToken);
      return;
    }

    // User is not logged in - redirect to login
    if (!user) {
      const redirectUrl =
        `/dashboard/seeker/nps-survey` +
        `?surveyId=${safeEncode(surveyId)}` +
        `&token=${safeEncode(token)}` +
        `&studentId=${safeEncode(studentId)}`;

      router.push(
        `/login?redirect=${encodeURIComponent(redirectUrl)}`
      );
      return;
    }
  }, [
    user,
    session,
    accessToken,
    authLoading,
    router,
    surveyId,
    token,
    studentId,
  ]);

  // ✅ Validate URL parameters
  useEffect(() => {
    if (!surveyId) {
      setError("Invalid survey link. Survey ID is missing.");
      setLoading(false);
      return;
    }

    if (
      !studentId ||
      studentId === "undefined" ||
      studentId === "null"
    ) {
      setError("Invalid survey link. Student ID is missing.");
      setLoading(false);
      return;
    }

    if (
      !token ||
      token === "undefined" ||
      token === "null"
    ) {
      setError("Invalid survey link. Survey token is missing.");
      setLoading(false);
      return;
    }
  }, [surveyId, token, studentId]);

  // ✅ Fetch survey data - only when authenticated
  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !authToken ||
      !surveyId ||
      !token ||
      !studentId
    ) {
      return;
    }

    fetchSurvey();
  }, [
    authLoading,
    isAuthenticated,
    authToken,
    surveyId,
    token,
    studentId,
  ]);

  // ✅ Updated fetchSurvey - uses accessToken from Supabase session
  const fetchSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching survey with:', {
        surveyId,
        token: token ? 'present' : 'missing',
        studentId,
        authToken: authToken ? 'present' : 'missing'
      });

      // ✅ Use accessToken from Supabase session
      if (!accessToken) {
        throw new Error('Authentication session is not available. Please log in again.');
      }

      // ✅ Safely encode URL parameters
      const encodedToken = encodeURIComponent(token as string);
      const encodedStudentId = encodeURIComponent(studentId as string);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}?token=${encodedToken}&studentId=${encodedStudentId}`;

      console.log('📡 API URL:', apiUrl);

      // ✅ Use accessToken from Supabase session in Authorization header
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        // ✅ Token expired - redirect to login
        const redirectUrl =
          `/dashboard/seeker/nps-survey` +
          `?surveyId=${safeEncode(surveyId)}` +
          `&token=${safeEncode(token)}` +
          `&studentId=${safeEncode(studentId)}`;

        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
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

      // ✅ Use accessToken from Supabase session
      if (!accessToken) {
        throw new Error('Authentication session is not available. Please log in again.');
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

      // ✅ Use accessToken from Supabase session in Authorization header
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.status === 401) {
        // ✅ Redirect to login on token expiry
        const redirectUrl =
          `/dashboard/seeker/nps-survey` +
          `?surveyId=${safeEncode(surveyId)}` +
          `&token=${safeEncode(token)}` +
          `&studentId=${safeEncode(studentId)}`;

        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
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

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || '';

    switch (question.question_type) {
      case 'rating':
        return (
          <div className="flex gap-3 mt-3 flex-wrap">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  value === rating
                    ? 'border-[#1a73e8] bg-[#1a73e8] text-white shadow-md transform scale-110'
                    : 'border-gray-300 hover:border-[#1a73e8] hover:bg-blue-50'
                }`}
              >
                {rating}
              </button>
            ))}
            <div className="w-full flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      case 'recommendation':
        return (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, i)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    value === i
                      ? 'border-[#1a73e8] bg-[#1a73e8] text-white shadow-md transform scale-110'
                      : 'border-gray-300 hover:border-[#1a73e8] hover:bg-blue-50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="w-full flex justify-between text-xs text-gray-500 mt-2 px-1">
              <span>Not likely at all</span>
              <span>Extremely likely</span>
            </div>
          </div>
        );

      case 'satisfaction':
        return (
          <div className="flex flex-wrap gap-3 mt-3">
            {['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswerChange(question.id, option)}
                className={`px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                  value === option
                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8] shadow-sm'
                    : 'border-gray-300 hover:border-[#1a73e8] hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            className="w-full mt-3 p-3 border-b-2 border-gray-300 focus:border-[#1a73e8] focus:outline-none transition-colors duration-200 resize-y min-h-[80px] bg-transparent"
            rows={3}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer..."
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2 mt-3">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((option) => (
              <label key={option} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-[#1a73e8] focus:ring-[#1a73e8] focus:ring-offset-0"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className="w-full mt-3 p-3 border-b-2 border-gray-300 focus:border-[#1a73e8] focus:outline-none transition-colors duration-200 bg-transparent"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer..."
          />
        );
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cannot Access Survey</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/seeker')}
            className="px-6 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access this survey.</p>
          <button
            onClick={() => {
              const redirectUrl = `/dashboard/seeker/nps-survey?surveyId=${surveyId}&token=${token}&studentId=${studentId}`;
              router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            }}
            className="px-6 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // Survey submitted successfully
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your survey response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">We appreciate your valuable feedback!</p>
          <button
            onClick={() => router.push('/dashboard/seeker')}
            className="mt-6 px-6 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main survey form - Google Forms style
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        {survey && survey.questions && survey.questions.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {survey.questions.filter(q => 
                  answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
                ).length} / {survey.questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1a73e8] transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${(survey.questions.filter(q => 
                    answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
                  ).length / survey.questions.length) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Survey Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border-b border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-medium text-gray-800">
            {survey?.title || 'Feedback Survey'}
          </h1>
          {survey?.description && (
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              {survey.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>{survey?.questions?.length || 0} questions</span>
            <span>•</span>
            <span>Required questions marked with *</span>
          </div>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-sm p-6 md:p-8 space-y-6">
          {survey?.questions.map((question, index) => (
            <div key={question.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-400 min-w-[24px]">
                  {index + 1}.
                </span>
                <label className="block text-sm font-medium text-gray-700 flex-1">
                  {question.question}
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {renderQuestion(question)}
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 bg-[#1a73e8] text-white font-medium rounded-lg hover:bg-[#1557b0] disabled:bg-gray-400 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </button>
            <p className="mt-3 text-xs text-gray-400 text-center md:text-left">
              Your responses will be kept confidential and used to improve our services.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}