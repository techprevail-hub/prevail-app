// app/dashboard/institute/nps/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Loader2, Send, Eye, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { instituteNpsService } from '@/services/instituteNpsService';
import SurveyDialog from '@/components/role-institute/nps/SurveyDialog';
import SendSurveyDialog from '@/components/role-institute/nps/SendSurveyDialog';
import SurveyResponseDrawer from '@/components/role-institute/nps/SurveyResponseDrawer';
import type { Survey, ApiResponse, PaginatedResponse } from '@/types/instituteNps';

// ─── Helper Functions ──────────────────────────────────────────────────────
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'scheduled':
      return 'outline';
    case 'sent':
      return 'default';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
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

const getDaysText = (days: number) => {
  if (days === 1) return '1 day';
  return `${days} days`;
};

const getInitials = (title: string): string => {
  if (!title) return 'S';
  const words = title.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// ─── Component ─────────────────────────────────────────────────────────────
export default function NPSDashboardPage() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [expandedSurvey, setExpandedSurvey] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  // Sort state
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: "asc" | "desc" }>({
    sortBy: "created_at",
    sortOrder: "desc"
  });

  // Dialog states
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [surveyDialogMode, setSurveyDialogMode] = useState<'create' | 'edit'>('create');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [responseDrawerOpen, setResponseDrawerOpen] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Load Surveys ──────────────────────────────────────────────────────
  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instituteNpsService.getSurveys({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      }) as PaginatedResponse<Survey>;

      if (response && response.data) {
        setSurveys(response.data || []);
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page || 1,
            pageSize: response.pagination.limit || 10,
            totalRecords: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 1,
            hasNext: response.pagination.hasNext || false,
            hasPrevious: response.pagination.hasPrev || false,
          });
        }
      } else {
        toast.error('Failed to load surveys');
        setSurveys([]);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
      toast.error('Failed to load surveys');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, statusFilter, sort]);

  // ─── Initial Load ──────────────────────────────────────────────────────
  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  // ─── Delete Survey ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!surveyToDelete) return;

    try {
      setDeleting(true);
      const response = await instituteNpsService.deleteSurvey(surveyToDelete.id) as ApiResponse<null>;

      if (response.success) {
        toast.success('Survey deleted successfully');
        setDeleteDialogOpen(false);
        setSurveyToDelete(null);
        await loadSurveys();
      } else {
        toast.error(response.message || 'Failed to delete survey');
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
    } finally {
      setDeleting(false);
    }
  }, [surveyToDelete, loadSurveys]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleCreateSurvey = useCallback(() => {
    setSelectedSurvey(null);
    setSurveyDialogMode('create');
    setSurveyDialogOpen(true);
  }, []);

  const handleEditSurvey = useCallback((survey: Survey) => {
    setSelectedSurvey(survey);
    setSurveyDialogMode('edit');
    setSurveyDialogOpen(true);
  }, []);

  const handleSendSurvey = useCallback((survey: Survey) => {
    setSelectedSurvey(survey);
    setSendDialogOpen(true);
  }, []);

  const handleViewResponses = useCallback((survey: Survey) => {
    setSelectedSurvey(survey);
    setResponseDrawerOpen(true);
  }, []);

  const handleDeleteClick = useCallback((survey: Survey) => {
    setSurveyToDelete(survey);
    setDeleteDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  const handleSort = useCallback((sortBy: string, sortOrder: "asc" | "desc") => {
    setSort({ sortBy, sortOrder });
  }, []);

  const toggleExpand = useCallback((surveyId: string) => {
    setExpandedSurvey(prev => prev === surveyId ? null : surveyId);
  }, []);

  // ─── Render Questions Cell ────────────────────────────────────────────
  const renderQuestionsCell = (survey: Survey) => {
    const questions = survey.questions || [];
    const isExpanded = expandedSurvey === survey.id;
    const displayQuestions = questions.slice(0, 2);
    const remainingCount = questions.length - 2;

    if (questions.length === 0) {
      return <span className="text-sm text-muted-foreground">No questions</span>;
    }

    return (
      <div className="space-y-1">
        {/* Show first 2 questions */}
        {displayQuestions.map((q, index) => (
          <div key={q.id} className="text-sm truncate max-w-[300px]">
            {index + 1}. {q.question || q.question_text}
          </div>
        ))}
        
        {/* Show remaining count or expand button */}
        {remainingCount > 0 && (
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(survey.id)}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-violet-600 hover:text-violet-800">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    + {remainingCount} more questions
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {questions.slice(2).map((q, index) => (
                <div key={q.id} className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {index + 3}. {q.question || q.question_text}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  // ─── Render Loading State ─────────────────────────────────────────────
  if (loading && surveys.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Survey Management</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage surveys to collect feedback from students</p>
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Survey Management</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage surveys to collect feedback from students</p>
        </div>
        <Button 
          onClick={handleCreateSurvey}
          className="bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* ─── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search surveys by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Survey Table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead className="w-14"></TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Survey
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Questions
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Send After
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Status
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Created
                </TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Search className="w-7 h-7 opacity-50" />
                      </div>
                      <p className="text-base font-semibold text-slate-600">No Surveys Found</p>
                      <p className="text-sm">Try changing your filters or create a new survey.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map((survey) => (
                  <TableRow key={survey.id} className="group hover:bg-violet-50/40 transition-colors">
                    {/* Avatar */}
                    <TableCell>
                      <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                          {getInitials(survey.title)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                          {survey.title}
                        </p>
                        {survey.description && (
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">
                            {survey.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Questions - Shows first 2 with expand/collapse */}
                    <TableCell>
                      {renderQuestionsCell(survey)}
                    </TableCell>

                    {/* Send After */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span>{getDaysText(survey.send_after_days || 15)}</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(survey.status)}
                        className="flex items-center gap-1.5 px-2.5 py-1"
                      >
                        <span className="capitalize">{survey.status}</span>
                      </Badge>
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <p className="text-sm text-slate-600">
                        {formatDate(survey.created_at)}
                      </p>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-violet-100">
                            <span className="sr-only">Open menu</span>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => handleEditSurvey(survey)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Survey
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendSurvey(survey)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Survey
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewResponses(survey)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Responses
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(survey)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Survey
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ─── Pagination ── */}
        {!loading && surveys.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">
                {((pagination.currentPage - 1) * pagination.pageSize) + 1}
              </span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.totalRecords}</span> Surveys
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1 text-xs"
                disabled={!pagination.hasPrevious}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = (() => {
                  const total = pagination.totalPages;
                  const current = pagination.currentPage;
                  if (total <= 5) return i + 1;
                  if (current <= 3) return i + 1;
                  if (current >= total - 2) return total - 4 + i;
                  return current - 2 + i;
                })();
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      pageNum === pagination.currentPage
                        ? "bg-violet-600 text-white"
                        : "text-slate-600 hover:bg-violet-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1 text-xs"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentView" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Dialogs ────────────────────────────────────────────────────── */}
      <SurveyDialog
        open={surveyDialogOpen}
        onOpenChange={setSurveyDialogOpen}
        mode={surveyDialogMode}
        survey={selectedSurvey || undefined}
        onSuccess={handleDialogSuccess}
      />

      <SendSurveyDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        survey={selectedSurvey}
        onSuccess={handleDialogSuccess}
      />

      <SurveyResponseDrawer
        open={responseDrawerOpen}
        onOpenChange={setResponseDrawerOpen}
        surveyId={selectedSurvey?.id || ''}
        surveyTitle={selectedSurvey?.title || ''}
      />

      {/* ─── Delete Confirmation Dialog ────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the survey
              {surveyToDelete && (
                <span className="font-semibold"> "{surveyToDelete.title}"</span>
              )}
              and all associated responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}