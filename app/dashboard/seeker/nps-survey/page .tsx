// app/dashboard/seeker/nps-survey/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
}

export default function NpsSurveyPage() {
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

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        const redirectUrl = `/dashboard/seeker/nps-survey?surveyId=${surveyId}&token=${token}&studentId=${studentId}`;
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
      setIsAuthenticated(true);
    }
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

    // Check if studentId matches the logged-in user
    if (user && user.id && studentId !== user.id) {
      setError('You are not authorized to take this survey. The survey is for a different student.');
      setLoading(false);
      return;
    }
  }, [surveyId, token, studentId, user]);

  // Fetch survey data
  useEffect(() => {
    if (!isAuthenticated || !surveyId || !token || !studentId || studentId === 'undefined') {
      return;
    }

    fetchSurvey();
  }, [isAuthenticated, surveyId, token, studentId]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use your existing backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}?token=${token}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch survey');
      }

      const result = await response.json();
      
      if (result.success) {
        setSurvey(result.data);
        // If survey already submitted, show submitted state
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

      // Use your existing backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-seeker/nps/surveys/${surveyId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            institutionId: 'b723fa25-24f2-4981-b7d1-a8c82edcb037', // You might need to pass this dynamically
            answers: answers,
            token: token,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit survey');
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
          <div className="flex gap-3 mt-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  value === rating
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg transform scale-110'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'recommendation':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswerChange(question.id, i)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  value === i
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg transform scale-110'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {i}
              </button>
            ))}
            <div className="w-full flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
          </div>
        );

      case 'satisfaction':
        return (
          <div className="flex flex-wrap gap-3 mt-2">
            {['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswerChange(question.id, option)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  value === option
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
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
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            rows={4}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2 mt-2">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((option) => (
              <label key={option} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
          />
        );
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Survey Link</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access this survey.</p>
          <button
            onClick={() => {
              const redirectUrl = `/dashboard/seeker/nps-survey?surveyId=${surveyId}&token=${token}&studentId=${studentId}`;
              router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your survey response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">We appreciate your valuable feedback!</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main survey form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {survey?.title || 'Feedback Survey'}
          </h1>
          <p className="text-gray-600 mb-6">
            {survey?.description || 'Please share your feedback with us.'}
          </p>
          
          <form onSubmit={handleSubmit}>
            {survey?.questions.map((question, index) => (
              <div key={question.id} className="mb-8 pb-6 border-b border-gray-200 last:border-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {index + 1}. {question.question}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {renderQuestion(question)}
              </div>
            ))}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Your responses will be kept confidential and used to improve our services.
          </p>
        </div>
      </div>
    </div>
  );
}