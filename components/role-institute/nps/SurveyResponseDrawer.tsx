// components/role-institute/nps/SurveyResponseDrawer.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Star,
  ThumbsUp,
  Smile,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { instituteNpsService } from '@/services/instituteNpsService';
import type {
  SurveyResponseWithDetails,
  SurveyResponsesResponse,
  SurveyResponseAnalytics,
  AnswerWithQuestion,
} from '@/types/instituteNps';

// ─── Types ──────────────────────────────────────────────────────────────────
interface SurveyResponseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  surveyTitle: string;
}

// ─── Helper Functions ──────────────────────────────────────────────────────
const getScoreColor = (score: number): string => {
  if (score >= 9) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 7) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
};

const getScoreBadgeVariant = (score: number): "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" => {
  if (score >= 9) return "default";
  if (score >= 7) return "secondary";
  return "destructive";
};

const getCategory = (score: number): { label: string; icon: React.ReactNode; color: string } => {
  if (score >= 9) {
    return {
      label: 'Promoter',
      icon: <UserCheck className="h-3.5 w-3.5" />,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
  }
  if (score >= 7) {
    return {
      label: 'Passive',
      icon: <UserMinus className="h-3.5 w-3.5" />,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    };
  }
  return {
    label: 'Detractor',
    icon: <UserX className="h-3.5 w-3.5" />,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  };
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const renderAnswerValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// ─── Component ─────────────────────────────────────────────────────────────
export const SurveyResponseDrawer: React.FC<SurveyResponseDrawerProps> = ({
  open,
  onOpenChange,
  surveyId,
  surveyTitle,
}) => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<SurveyResponseWithDetails[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ─── Filter State ──────────────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // ─── Reset State on Close ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setResponses([]);
      setAnalytics(null);
      setCurrentPage(1);
      setFilterCategory(null);
      setSelectedStudentId(null);
    }
  }, [open]);

  // ─── Load Responses ────────────────────────────────────────────────────
  const loadResponses = useCallback(async () => {
    if (!surveyId) {
      toast.error('Survey ID is required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await instituteNpsService.getSurveyResponses(surveyId, {
        page: currentPage,
        limit: pageSize,
      }) as any;

      if (response.success) {
        const responseData = response.data || [];
        
        const transformedData = responseData.map((item: any) => ({
          id: item.id,
          survey_id: item.survey_id,
          institute_id: item.institute_id,
          student_id: item.student_id,
          answers: item.answers || {},
          submitted_at: item.submitted_at,
          created_at: item.created_at,
          student_name: item.student?.name || 'Anonymous Student',
          email: item.student?.email || '',
          score: item.score || 0,
          category: item.category || 'detractor',
          answers_with_questions: (item.answerDetails || []).map((detail: any) => ({
            questionId: detail.questionId,
            question: detail.question,
            questionType: detail.questionType || 'text',
            displayOrder: detail.displayOrder || 0,
            answer: detail.answer,
            npsScore: detail.npsScore !== undefined && detail.npsScore !== null ? detail.npsScore : undefined,
          })),
        }));
        
        setResponses(transformedData);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.total || 0);
        }
        
        if (response.analytics) {
          setAnalytics(response.analytics);
        }
      } else {
        toast.error(response.message || 'Failed to load responses');
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading survey responses:', error);
      toast.error('Failed to load survey responses');
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }, [surveyId, currentPage, pageSize]);

  // ─── Handle Page Change ────────────────────────────────────────────────
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  // ─── Handle Filter Click ──────────────────────────────────────────────
  const handleFilterClick = (category: string) => {
    setFilterCategory(prev => prev === category ? null : category);
    setCurrentPage(1);
  };

  // ─── Handle Student Click ─────────────────────────────────────────────
  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(prev => prev === studentId ? null : studentId);
  };

  // ─── Handle Back to List ──────────────────────────────────────────────
  const handleBackToList = () => {
    setSelectedStudentId(null);
  };

  // ─── Filtered Responses ───────────────────────────────────────────────
  const filteredResponses = filterCategory
    ? responses.filter(r => r.category === filterCategory)
    : responses;

  // ─── Selected Student Response ────────────────────────────────────────
  const selectedResponse = selectedStudentId
    ? responses.find(r => r.id === selectedStudentId)
    : null;

  // ─── Initialize Dialog ────────────────────────────────────────────────
  useEffect(() => {
    if (open && surveyId) {
      loadResponses();
    }
  }, [open, surveyId, loadResponses]);

  // ─── Get Answer Display ──────────────────────────────────────────────
  const getAnswerDisplay = useCallback((response: SurveyResponseWithDetails): AnswerWithQuestion[] => {
    const answers = response.answers_with_questions || [];

    if (answers.length > 0) {
      return answers;
    }

    if (response.answers && Object.keys(response.answers).length > 0) {
      const entries = Object.entries(response.answers);
      return entries.map(([key, value], index) => ({
        questionId: key,
        question: `Question ${index + 1}`,
        answer: renderAnswerValue(value),
        questionType: 'text',
        displayOrder: index,
        npsScore: undefined,
      }));
    }

    return [];
  }, []);

  // ─── Render Student Detail Card (Separate Panel) ──────────────────────
  const renderStudentDetailPanel = (response: SurveyResponseWithDetails) => {
    const score = response.score || 0;
    const category = getCategory(score);
    const displayAnswers = getAnswerDisplay(response);

    return (
      // Main container - fixed position with explicit height
      <div className="fixed inset-y-0 left-0 z-[1000] flex h-screen w-[400px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
        {/* ─── Header - Fixed ────────────────────────────────────────────── */}
        <div className="flex h-[60px] flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="h-8 w-8 flex-shrink-0 rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-sm font-medium text-slate-700">
            Student Details
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="h-8 w-8 flex-shrink-0 rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ─── Student Info - Fixed ──────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0 bg-violet-100">
              <AvatarFallback className="text-base font-medium text-violet-600">
                {getInitials(response.student_name || 'Student')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-slate-800">
                {response.student_name || 'Anonymous Student'}
              </h4>
              {response.email && (
                <div className="flex min-w-0 items-center gap-1 text-xs text-slate-500">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{response.email}</span>
                </div>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge 
                  variant={getScoreBadgeVariant(score)} 
                  className={`text-xs ${getScoreColor(score)}`}
                >
                  Score: {score}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs flex items-center gap-1 ${category.color}`}
                >
                  {category.icon}
                  {category.label}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(response.submitted_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Answers Section - Takes remaining space ───────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Answers Heading - Fixed */}
          <div className="flex-shrink-0 px-4 pt-3 pb-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Answers
            </h5>
          </div>

          {/* Answers List - ONLY THIS SCROLLS */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <div className="space-y-3">
              {displayAnswers.length > 0 ? (
                displayAnswers.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 text-xs font-medium text-slate-600">
                        {item.question}
                      </p>
                      {item.npsScore !== undefined && item.npsScore !== null && (
                        <Badge variant="outline" className="flex-shrink-0 px-1.5 text-[10px]">
                          NPS: {item.npsScore}
                        </Badge>
                      )}
                    </div>
                    <p className="break-words rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
                      {renderAnswerValue(item.answer)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-center text-sm text-slate-500">
                  No answers provided
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ─── Student Detail Panel (Outside Sheet) ────────────────────── */}
      {open && selectedStudentId && selectedResponse && (
        renderStudentDetailPanel(selectedResponse)
      )}

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          showCloseButton={false}
          side="right"
          overlayClassName={
            selectedStudentId
              ? "!left-[400px]"
              : undefined
          }
          className={`w-full p-0 flex flex-col overflow-hidden ${
            selectedStudentId 
              ? 'sm:max-w-[calc(100%-400px)] sm:ml-[400px] bg-slate-50' 
              : 'sm:max-w-4xl bg-slate-50/50'
          }`}
        >
          {/* ─── Header ────────────────────────────────────────────────────── */}
          <SheetHeader className="border-b border-slate-200 px-4 md:px-6 py-4 md:py-6 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg md:text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-500 flex-shrink-0" />
                  <span className="truncate">Survey Responses</span>
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                  <span className="text-sm text-slate-500 truncate max-w-[150px] md:max-w-[200px]">
                    {surveyTitle || 'Untitled Survey'}
                  </span>
                  <Badge variant="outline" className="text-xs border-violet-200 text-violet-600 bg-violet-50 flex-shrink-0">
                    {totalItems} {totalItems === 1 ? 'Response' : 'Responses'}
                  </Badge>
                  {filterCategory && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-slate-200 flex-shrink-0"
                      onClick={() => setFilterCategory(null)}
                    >
                      Filter: {filterCategory} ✕
                    </Badge>
                  )}
                </div>
              </div>
              <SheetClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-slate-100 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* ─── Content ───────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden min-h-0 flex">
            {loading ? (
              <div className="flex flex-col items-center justify-center w-full h-full gap-3 p-8">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                <p className="text-sm text-slate-500">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-full gap-3 p-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No responses yet</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                  Students haven't submitted this survey yet. Check back later for responses.
                </p>
              </div>
            ) : (
              <div className="flex w-full h-full overflow-hidden">
                {/* ─── Main Content ────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Analytics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 md:p-4 border-b border-slate-200 bg-white flex-shrink-0">
                    <Card className="border-0 shadow-sm bg-slate-50/80">
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-amber-500" />
                          <span className="text-xs font-medium text-slate-500">Rating</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold text-slate-800">
                          {analytics?.averageRating?.toFixed(1) || 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-slate-50/80">
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs font-medium text-slate-500">Recommend</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold text-slate-800">
                          {analytics?.recommendationPercentage || 0}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-slate-50/80">
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Smile className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium text-slate-500">Satisfaction</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold text-slate-800">
                          {analytics?.satisfactionPercentage || 0}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-slate-50/80">
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-violet-500" />
                          <span className="text-xs font-medium text-slate-500">Total</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold text-slate-800">
                          {analytics?.totalResponses ?? totalItems}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filter Cards (Clickable) */}
                  <div className="grid grid-cols-3 gap-2 p-3 md:p-4 border-b border-slate-200 bg-white flex-shrink-0">
                    <Card 
                      className={`border-emerald-200 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        filterCategory === 'promoter' ? 'ring-2 ring-emerald-500 ring-offset-2' : 'bg-emerald-50/70'
                      }`}
                      onClick={() => handleFilterClick('promoter')}
                    >
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">Promoters</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-emerald-700">
                          {analytics?.nps?.promoters || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card 
                      className={`border-amber-200 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        filterCategory === 'passive' ? 'ring-2 ring-amber-500 ring-offset-2' : 'bg-amber-50/70'
                      }`}
                      onClick={() => handleFilterClick('passive')}
                    >
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UserMinus className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-xs font-medium text-amber-600">Passives</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-amber-700">
                          {analytics?.nps?.passives || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card 
                      className={`border-rose-200 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        filterCategory === 'detractor' ? 'ring-2 ring-rose-500 ring-offset-2' : 'bg-rose-50/70'
                      }`}
                      onClick={() => handleFilterClick('detractor')}
                    >
                      <CardContent className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UserX className="h-3.5 w-3.5 text-rose-600" />
                          <span className="text-xs font-medium text-rose-600">Detractors</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-rose-700">
                          {analytics?.nps?.detractors || 0}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Student List - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-4">
                    <div className="space-y-2 pb-4">
                      {filteredResponses.map((response) => {
                        const score = response.score || 0;
                        const category = getCategory(score);

                        return (
                          <Card 
                            key={response.id}
                            className={`overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white cursor-pointer hover:border-violet-300 ${
                              selectedStudentId === response.id ? 'ring-2 ring-violet-500 ring-offset-2' : ''
                            }`}
                            onClick={() => handleStudentClick(response.id)}
                          >
                            <CardContent className="p-3 md:p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0 bg-violet-100">
                                  <AvatarFallback className="text-sm text-violet-600 font-medium">
                                    {getInitials(response.student_name || 'Student')}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-sm truncate text-slate-800">
                                      {response.student_name || 'Anonymous Student'}
                                    </p>
                                    <Badge 
                                      variant={getScoreBadgeVariant(score)} 
                                      className={`text-xs flex-shrink-0 ${getScoreColor(score)}`}
                                    >
                                      Score: {score}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-0.5 text-xs text-slate-500">
                                    {response.email && (
                                      <div className="flex items-center gap-1 min-w-0">
                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate max-w-[100px] md:max-w-[150px]">
                                          {response.email}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(response.submitted_at)}</span>
                                    </div>
                                  </div>
                                </div>

                                <Badge 
                                  variant="outline" 
                                  className={`text-xs flex items-center gap-1 flex-shrink-0 ${category.color}`}
                                >
                                  {category.icon}
                                  {category.label}
                                </Badge>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0 h-8 w-8 p-0 text-slate-400 hover:text-violet-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStudentClick(response.id);
                                  }}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="border-t border-slate-200 px-3 md:px-4 py-3 bg-white flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage <= 1}
                            className="h-8 px-3"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
                          </Button>
                          <div className="text-xs font-medium text-slate-700 px-2">
                            {currentPage} / {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                            className="h-8 px-3"
                          >
                            <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ────────────────────────────────────────────────────── */}
          <div className="border-t border-slate-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0 bg-white">
            <Button 
              variant="outline" 
              className="w-full rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200"
              onClick={() => {
                setSelectedStudentId(null);
                setFilterCategory(null);
                onOpenChange(false);
              }}
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SurveyResponseDrawer;