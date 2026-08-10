// components/role-institute/SurveyDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { instituteNpsService } from '@/services/instituteNpsService';
import type { SurveyQuestion, Survey, ApiResponse, PaginatedResponse } from '@/types/instituteNps';

// ─── Props ──────────────────────────────────────────────────────────────────
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: Survey;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────
export const SurveyDialog: React.FC<SurveyDialogProps> = ({
  open,
  onOpenChange,
  survey,
  mode,
  onSuccess,
}) => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string>(''); // Changed from '15' to ''

  // ─── Generate Day Options ──────────────────────────────────────────────
  const generateDayOptions = () => {
    const options = [];
    for (let i = 5; i <=60; i += 5) {
      options.push(i);
    }
    return options;
  };

  // ─── Filtered and Sorted Questions ─────────────────────────────────────
  const filteredQuestions = questions
    .filter((question) => {
      // Safety check: ensure question and question text exist
      if (!question) return false;
      
      // Get the question text - use 'question' field (API returns 'question')
      const questionText = question.question || question.question_text || '';
      if (!questionText) return false;
      
      return questionText.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      // Safety check: ensure both questions exist
      if (!a || !b) return 0;
      
      // Sort by display_order if available
      if (a.display_order !== undefined && b.display_order !== undefined) {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      
      // Sort by created_at if available
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      
      // Fallback: sort by question text
      const textA = a.question || a.question_text || '';
      const textB = b.question || b.question_text || '';
      return textA.localeCompare(textB);
    });

  // ─── Load Questions ────────────────────────────────────────────────────
  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await instituteNpsService.getSurveyQuestions() as PaginatedResponse<SurveyQuestion>;
      
      // Handle the response properly
      if (response && response.data) {
        // Map the data to ensure we have both 'question' and 'question_text' fields
        const mappedQuestions = response.data.map((q: any) => ({
          ...q,
          // Ensure both fields exist for compatibility
          question: q.question || q.question_text || '',
          question_text: q.question_text || q.question || '',
        }));
        
        // Filter out any invalid questions
        const validQuestions = mappedQuestions.filter((q: SurveyQuestion) => q && q.id && (q.question || q.question_text));
        setQuestions(validQuestions || []);
      } else {
        toast.error('Failed to load questions');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ─── Handle Question Selection ────────────────────────────────────────
  const handleQuestionSelect = (id: string) => {
    if (!id) return;
    
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions((prev) => prev.filter((q) => q !== id));
    } else {
      if (selectedQuestions.length === 10) {
        toast.warning('You can select at most 10 questions');
        return;
      }
      setSelectedQuestions((prev) => [...prev, id]);
    }
  };

  // ─── Check if question is selected ────────────────────────────────────
  const isQuestionSelected = (id: string) => {
    if (!id) return false;
    return selectedQuestions.includes(id);
  };

  // ─── Reset Dialog State ──────────────────────────────────────────────
  const resetDialog = () => {
    setSelectedQuestions([]);
    setSearch('');
    setSelectedDays(''); // Reset days selection
  };

  // ─── Initialize Dialog ────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      loadQuestions();

      if (mode === 'edit' && survey) {
        if (!survey.id) {
          toast.error('Survey not found');
          onOpenChange(false);
          return;
        }
        setSelectedQuestions(survey.question_ids || []);
        setSelectedDays(String(survey.send_after_days || '')); // Set to empty if not available
      } else {
        resetDialog();
      }
    } else {
      resetDialog();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, survey, onOpenChange]);

  // ─── Handle Submit ────────────────────────────────────────────────────
  const handleSubmit = async (values: Record<string, string>) => {
    // Validate selected questions
    if (selectedQuestions.length < 6) {
      toast.error('Please select at least 6 questions');
      return;
    }

    if (selectedQuestions.length > 10) {
      toast.error('Please select at most 10 questions');
      return;
    }

    // Validate days selection
    if (!values.sendAfterDays) {
      toast.error('Please select when to send the survey');
      return;
    }

    if (mode === 'edit' && !survey?.id) {
      toast.error('Survey not found');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: values.title,
        description: values.description || '',
        selectedQuestions: selectedQuestions,
        sendAfterDays: Number(values.sendAfterDays),
        status: 'draft' as const,
      };

      let response;
      if (mode === 'create') {
        response = await instituteNpsService.createSurvey(payload) as ApiResponse<Survey>;
      } else {
        response = await instituteNpsService.updateSurvey(survey?.id || '', payload) as ApiResponse<Survey>;
      }

      if (response.success) {
        toast.success(mode === 'create' ? 'Survey created successfully!' : 'Survey updated successfully!');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to save survey');
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey');
    } finally {
      setSaving(false);
    }
  };

  // ─── Get Initial Values ──────────────────────────────────────────────
  const getInitialValues = () => {
    if (mode === 'edit' && survey) {
      return {
        title: survey.title || '',
        description: survey.description || '',
        sendAfterDays: String(survey.send_after_days || ''), // Changed from '15' to ''
      };
    }
    return {
      title: '',
      description: '',
      sendAfterDays: '', // Changed from '15' to ''
    };
  };

  const initialValues = getInitialValues();

  // ─── Get Display Text for Question ────────────────────────────────────
  const getQuestionDisplayText = (question: SurveyQuestion): string => {
    return question.question || question.question_text || 'Untitled Question';
  };

  // ─── Custom Questions Section ──────────────────────────────────────────
  const renderQuestionsSection = () => (
    <div className="space-y-4 mt-6 pt-6 border-t">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Questions</h3>
        <Badge variant={selectedQuestions.length >= 6 ? 'default' : 'destructive'}>
          Selected: {selectedQuestions.length} / 10
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
        />
      </div>

      <ScrollArea className="h-[200px] border rounded-xl p-4">
        {loadingQuestions ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">
              {search ? 'No questions found matching your search' : 'No questions available'}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question) => {
              // Safety check: skip rendering if question is invalid
              if (!question || !question.id) return null;
              
              const isSelected = isQuestionSelected(question.id);
              const isDisabled = !isSelected && selectedQuestions.length >= 10;
              const displayText = getQuestionDisplayText(question);

              return (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={question.id}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => handleQuestionSelect(question.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <label htmlFor={question.id} className="text-sm cursor-pointer block">
                      {displayText}
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {question.question_type && (
                        <Badge variant="outline" className="text-xs">
                          {question.question_type}
                        </Badge>
                      )}
                      {question.is_required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {question.display_order !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          #{question.display_order}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {selectedQuestions.length > 0 && selectedQuestions.length < 6 && (
        <p className="text-sm text-rose-500">
          Please select at least 6 questions (currently {selectedQuestions.length})
        </p>
      )}
      {selectedQuestions.length === 0 && (
        <p className="text-sm text-muted-foreground">Please select 6-10 questions for your survey</p>
      )}
      {selectedQuestions.length === 10 && (
        <p className="text-sm text-emerald-600">Maximum questions selected</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-6 pt-6 pb-8 flex-shrink-0">
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <DialogHeader className="relative">
            <DialogTitle className="text-xl font-bold text-white">
              {mode === 'create' ? 'Create Survey' : 'Edit Survey'}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/70">
              {mode === 'create'
                ? 'Fill in the details below to create a new survey.'
                : 'Update the details for this survey.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Form body ── */}
        <div className="px-6 py-6 -mt-4 overflow-y-auto flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            {/* Survey Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title - Full Width */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Survey Title <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  id="survey-title"
                  defaultValue={initialValues.title}
                  placeholder="e.g., Student Feedback Survey"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                />
              </div>

              {/* Description - Full Width */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Description
                </label>
                <textarea
                  id="survey-description"
                  defaultValue={initialValues.description}
                  placeholder="Please share your experience with our institute"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm resize-none focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                  rows={3}
                />
              </div>

              {/* Send After Days */}
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Send Survey After <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <select
                  id="survey-send-after"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                >
                  <option value="">Select days</option>
                  {generateDayOptions().map((days) => (
                    <option key={days} value={days}>
                      {days} Days
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Section */}
            {renderQuestionsSection()}
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 pb-6 pt-0 gap-2 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 shadow-sm shadow-violet-200"
            onClick={() => {
              const title = (document.getElementById('survey-title') as HTMLInputElement)?.value || '';
              const description = (document.getElementById('survey-description') as HTMLTextAreaElement)?.value || '';
              const sendAfterDays = selectedDays; // Use state value instead of DOM
              
              handleSubmit({
                title,
                description,
                sendAfterDays,
              });
            }}
            disabled={saving || loadingQuestions}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === 'create' ? (
              'Create Survey'
            ) : (
              'Update Survey'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;