// components/role-institute/SurveyResponseDrawer.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SurveyResponseAnalytics | null>(null);

  // ─── Reset State on Close ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setResponses([]);
      setAnalytics(null);
      setExpandedResponse(null);
    }
  }, [open]);

  // ─── Calculate Summary with useMemo ──────────────────────────────────
  const summary = useMemo(() => {
    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    responses.forEach((response) => {
      const score = response.score || 0;
      if (score >= 9) promoters++;
      else if (score >= 7) passives++;
      else detractors++;
    });

    return { promoters, passives, detractors, total: responses.length };
  }, [responses]);

  // ─── Load Responses ────────────────────────────────────────────────────
  const loadResponses = useCallback(async () => {
    if (!surveyId) {
      toast.error('Survey ID is required');
      return;
    }

    try {
      setLoading(true);
      const response = await instituteNpsService.getSurveyResponses(surveyId) as SurveyResponsesResponse;

      if (response.success) {
        const responseData = response.data || [];
        setResponses(responseData);
        
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
  }, [surveyId]);

  // ─── Initialize Dialog ────────────────────────────────────────────────
  useEffect(() => {
    if (open && surveyId) {
      loadResponses();
    }
  }, [open, surveyId, loadResponses]);

  // ─── Toggle Expand ─────────────────────────────────────────────────────
  const toggleExpand = useCallback((responseId: string) => {
    setExpandedResponse((prev) => (prev === responseId ? null : responseId));
  }, []);

  // ─── Get Answer Display ──────────────────────────────────────────────
  const getAnswerDisplay = useCallback((response: SurveyResponseWithDetails): AnswerWithQuestion[] => {
    const answers = response.answers_with_questions || [];

    if (answers.length > 0) {
      return answers;
    }

    if (response.answers && Object.keys(response.answers).length > 0) {
      const entries = Object.entries(response.answers);
      return entries.map(([key, value], index) => ({
        question: `Question ${index + 1}`,
        answer: renderAnswerValue(value),
      }));
    }

    return [];
  }, []);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto h-full max-h-[95vh] flex flex-col">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <DrawerHeader className="border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-lg md:text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-500" />
                Survey Responses
              </DrawerTitle>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                <span className="text-sm text-slate-500 truncate max-w-[150px] md:max-w-[250px]">
                  {surveyTitle || 'Untitled Survey'}
                </span>
                <Badge variant="outline" className="text-xs border-violet-200 text-violet-600 bg-violet-50 flex-shrink-0">
                  {summary.total} {summary.total === 1 ? 'Response' : 'Responses'}
                </Badge>
              </div>
            </div>
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* ─── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden min-h-0">
          {loading ? (
            // ─── Loading State ──────────────────────────────────────────
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm text-slate-500">Loading responses...</p>
            </div>
          ) : responses.length === 0 ? (
            // ─── Empty State ─────────────────────────────────────────────
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No responses yet</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm">
                Students haven't submitted this survey yet. Check back later for responses.
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* ─── Analytics Cards ────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 md:p-4 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
                <Card className="border-0 bg-white shadow-sm">
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
                <Card className="border-0 bg-white shadow-sm">
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
                <Card className="border-0 bg-white shadow-sm">
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
                <Card className="border-0 bg-white shadow-sm">
                  <CardContent className="p-2 md:p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-violet-500" />
                      <span className="text-xs font-medium text-slate-500">Total</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-slate-800">
                      {analytics?.totalResponses || responses.length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* ─── Summary Cards ──────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 p-3 md:p-4 border-b border-slate-200 bg-slate-50/30 flex-shrink-0">
                <Card className="border-emerald-200 bg-emerald-50/70">
                  <CardContent className="p-2 md:p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600">Promoters</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-emerald-700">{summary.promoters}</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50/70">
                  <CardContent className="p-2 md:p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <UserMinus className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-600">Passives</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-amber-700">{summary.passives}</p>
                  </CardContent>
                </Card>
                <Card className="border-rose-200 bg-rose-50/70">
                  <CardContent className="p-2 md:p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <UserX className="h-3.5 w-3.5 text-rose-600" />
                      <span className="text-xs font-medium text-rose-600">Detractors</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-rose-700">{summary.detractors}</p>
                  </CardContent>
                </Card>
              </div>

              {/* ─── Response List ──────────────────────────────────────── */}
              <ScrollArea className="flex-1 p-3 md:p-4">
                <div className="space-y-3">
                  {responses.map((response) => {
                    const score = response.score || 0;
                    const category = getCategory(score);
                    const isExpanded = expandedResponse === response.id;
                    const displayAnswers = getAnswerDisplay(response);

                    return (
                      <Collapsible
                        key={response.id}
                        open={isExpanded}
                        onOpenChange={() => toggleExpand(response.id)}
                      >
                        <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-0">
                            {/* Response Header */}
                            <CollapsibleTrigger asChild>
                              <div className="p-3 md:p-4 flex items-start gap-3 cursor-pointer hover:bg-violet-50/30 transition-colors duration-200">
                                <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0 bg-violet-100">
                                  <AvatarFallback className="text-xs md:text-sm text-violet-600 font-medium">
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

                                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs text-slate-500">
                                    {response.email && (
                                      <div className="flex items-center gap-1 min-w-0">
                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                        <a
                                          href={`mailto:${response.email}`}
                                          className="hover:text-violet-600 hover:underline truncate max-w-[100px] md:max-w-[150px]"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {response.email}
                                        </a>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(response.submitted_at)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs flex items-center gap-1 ${category.color}`}
                                    >
                                      {category.icon}
                                      {category.label}
                                    </Badge>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0 pointer-events-none text-slate-400 hover:text-slate-600"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">Hide</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">View</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CollapsibleTrigger>

                            {/* Expanded Answers */}
                            <CollapsibleContent>
                              <div className="border-t border-slate-200 px-3 md:px-4 py-3 bg-slate-50/50">
                                {displayAnswers.length > 0 ? (
                                  <div className="space-y-3">
                                    {displayAnswers.map((item, index) => (
                                      <div key={index} className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500">
                                          {item.question}
                                        </p>
                                        <p className="text-sm bg-white p-2 md:p-3 rounded-lg border border-slate-200 text-slate-700">
                                          {renderAnswerValue(item.answer)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 text-center py-2">
                                    No answers provided
                                  </p>
                                )}
                              </div>
                            </CollapsibleContent>
                          </CardContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* ─── Footer ────────────────────────────────────────────────────── */}
        <DrawerFooter className="border-t border-slate-200 flex-shrink-0">
          <DrawerClose asChild>
            <Button 
              variant="outline" 
              className="w-full rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200"
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SurveyResponseDrawer;