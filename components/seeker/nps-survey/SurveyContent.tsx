// app/dashboard/seeker/nps-survey/SurveyContent.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
  
  const surveyId = searchParams.get('surveyId');
  const token = searchParams.get('token');
  const studentId = searchParams.get('studentId');
  
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Validate URL parameters immediately
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

    // If all parameters are valid, fetch the survey
    fetchSurvey();
  }, [surveyId, token, studentId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching survey with:', { 
        surveyId, 
        token: token ? 'present' : 'missing', 
        studentId 
      });

      // ✅ FIX: Don't use Authorization header with survey token
      // The survey token is passed as a query parameter, not as a Bearer token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}?token=${token}&studentId=${studentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Response status:', response.status);

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

  // Calculate progress when answers change
  useEffect(() => {
    if (survey?.questions) {
      const total = survey.questions.length;
      const answered = survey.questions.filter(q => 
        answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null
      ).length;
      setProgress(total > 0 ? Math.round((answered / total) * 100) : 0);
    }
  }, [answers, survey]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey) {
      setError('Survey not loaded. Please refresh the page.');
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

      const instituteId = survey.institute_id;
      
      if (!instituteId) {
        setError('Survey configuration error. Please contact support.');
        setSubmitting(false);
        return;
      }

      const requestBody = {
        institute_id: instituteId,
        studentId: studentId,
        answers: answers,
        token: token,
      };

      console.log('📋 Submitting survey:', requestBody);

      // ✅ FIX: Don't use Authorization header for survey submission
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

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
  if (loading) {
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
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1a73e8] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

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