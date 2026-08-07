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
  if (score >= 9) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (score >= 7) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};

const getCategory = (score: number): { label: string; icon: React.ReactNode } => {
  if (score >= 9) {
    return {
      label: 'Promoter',
      icon: <UserCheck className="h-4 w-4" />,
    };
  }
  if (score >= 7) {
    return {
      label: 'Passive',
      icon: <UserMinus className="h-4 w-4" />,
    };
  }
  return {
    label: 'Detractor',
    icon: <UserX className="h-4 w-4" />,
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
        // Handle the response structure properly
        const responseData = response.data || [];
        setResponses(responseData);
        
        // Store analytics if available
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

    // Fallback: Convert raw answers to display format
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
      <DrawerContent className="max-w-2xl mx-auto h-full">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-semibold">
                Survey Responses
              </DrawerTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground">
                  {surveyTitle || 'Untitled Survey'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {summary.total} {summary.total === 1 ? 'Response' : 'Responses'}
                </Badge>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Close</span>
                ✕
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* ─── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            // ─── Loading State ──────────────────────────────────────────
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading responses...</p>
            </div>
          ) : responses.length === 0 ? (
            // ─── Empty State ─────────────────────────────────────────────
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No responses yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Students haven't submitted this survey yet. Check back later for responses.
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* ─── Analytics Cards ────────────────────────────────────── */}
              <div className="grid grid-cols-4 gap-2 p-4 border-b bg-muted/20">
                <Card className="border-0 bg-background">
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium text-muted-foreground">Rating</span>
                    </div>
                    <p className="text-lg font-bold">
                      {analytics?.averageRating?.toFixed(1) || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-background">
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-muted-foreground">Recommend</span>
                    </div>
                    <p className="text-lg font-bold">
                      {analytics?.recommendationPercentage || 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-background">
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Smile className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium text-muted-foreground">Satisfaction</span>
                    </div>
                    <p className="text-lg font-bold">
                      {analytics?.satisfactionPercentage || 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-background">
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-purple-500" />
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                    </div>
                    <p className="text-lg font-bold">
                      {analytics?.totalResponses || responses.length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* ─── Summary Cards ──────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-3 p-4 border-b bg-muted/10">
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Promoters</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{summary.promoters}</p>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <UserMinus className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-600">Passives</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700">{summary.passives}</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-medium text-red-600">Detractors</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">{summary.detractors}</p>
                  </CardContent>
                </Card>
              </div>

              {/* ─── Response List ──────────────────────────────────────── */}
              <ScrollArea className="flex-1 p-4">
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
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            {/* Response Header */}
                            <CollapsibleTrigger asChild>
                              <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarFallback>
                                    {getInitials(response.student_name || 'Student')}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">
                                      {response.student_name || 'Anonymous Student'}
                                    </p>
                                    <Badge className={`text-xs ${getScoreColor(score)}`}>
                                      {score}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    {response.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <a
                                          href={`mailto:${response.email}`}
                                          className="hover:underline truncate max-w-[150px]"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {response.email}
                                        </a>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(response.submitted_at)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      {category.icon}
                                      {category.label}
                                    </Badge>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0 pointer-events-none"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Hide Answers
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      View Answers
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CollapsibleTrigger>

                            {/* Expanded Answers */}
                            <CollapsibleContent>
                              <div className="border-t px-4 py-3 bg-muted/30">
                                {displayAnswers.length > 0 ? (
                                  <div className="space-y-3">
                                    {displayAnswers.map((item, index) => (
                                      <div key={index} className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">
                                          {item.question}
                                        </p>
                                        <p className="text-sm bg-background p-2 rounded border">
                                          {renderAnswerValue(item.answer)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground text-center py-2">
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
        <DrawerFooter className="border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SurveyResponseDrawer;