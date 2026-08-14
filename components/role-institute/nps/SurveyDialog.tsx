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
import { Search, Loader2, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { instituteNpsService } from '@/services/instituteNpsService';
import EntityFormDialog, { FormFieldConfig } from '@/components/role-institute/FormDialog';
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
  const [selectedDays, setSelectedDays] = useState<string>('');
  
  // ─── Add Question Dialog State ──────────────────────────────────────────
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [showRatingScale, setShowRatingScale] = useState(false);

  // ─── Edit Question Dialog State ──────────────────────────────────────────
  const [editQuestionOpen, setEditQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState<SurveyQuestion | null>(null);
  const [editShowRatingScale, setEditShowRatingScale] = useState(false);

  // ─── Generate Day Options ──────────────────────────────────────────────
  const generateDayOptions = () => {
    const options = [];
    for (let i = 5; i <=60; i += 5) {
      options.push(i);
    }
    return options;
  };

  // ─── Handle Question Type Change ───────────────────────────────────────
  const handleQuestionTypeChange = (value: string) => {
    setShowRatingScale(value === 'rating');
  };

  // ─── Handle Edit Question Type Change ───────────────────────────────────
  const handleEditQuestionTypeChange = (value: string) => {
    setEditShowRatingScale(value === 'rating');
  };

  // ─── Question Form Fields ──────────────────────────────────────────────
  const getQuestionFormFields = (isEdit: boolean = false): FormFieldConfig[] => {
    const baseFields: FormFieldConfig[] = [
      {
        name: 'questionText',
        label: 'Question Text',
        type: 'textarea',
        placeholder: 'Enter your question here...',
        required: true,
        span: 2,
      },
      {
        name: 'question_type',
        label: 'Question Type',
        type: 'select',
        placeholder: 'Select question type',
        required: true,
        options: [
          { label: 'Rating', value: 'rating' },
          { label: 'Text', value: 'text' },
          { label: 'Multiple Choice', value: 'multiple_choice' },
          { label: 'Recommendation', value: 'recommendation' },
          { label: 'Satisfaction', value: 'satisfaction' },
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Name', value: 'name' },
        ],
        onChange: isEdit ? handleEditQuestionTypeChange : handleQuestionTypeChange,
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        placeholder: 'Select category',
        required: true,
        options: [
          { label: 'General', value: 'general' },
          { label: 'Satisfaction', value: 'satisfaction' },
          { label: 'Feedback', value: 'feedback' },
          { label: 'Demographic', value: 'demographic' },
          { label: 'Academic', value: 'academic' },
          { label: 'Administrative', value: 'administrative' },
          { label: 'Faculty', value: 'faculty' },
          { label: 'Infrastructure', value: 'infrastructure' },
          { label: 'Placement', value: 'placement' },
        ],
      },
      {
        name: 'isRequired',
        label: 'Required',
        type: 'select',
        required: true,
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      },
      {
        name: 'isActive',
        label: 'Active',
        type: 'select',
        required: true,
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      },
    ];

    // Add ratingScale field - always show it but conditionally required
    baseFields.push({
      name: 'ratingScale',
      label: 'Rating Scale',
      type: 'select',
      placeholder: 'Select rating scale',
      required: isEdit ? editShowRatingScale : showRatingScale,
      options: [
        { label: '5-point scale (1-5)', value: '5' },
        { label: '10-point scale (1-10)', value: '10' },
      ],
    });

    return baseFields;
  };

  // ─── Filtered and Sorted Questions ─────────────────────────────────────
  const filteredQuestions = questions
    .filter((question) => {
      if (!question) return false;
      const questionText = question.question || question.question_text || '';
      if (!questionText) return false;
      return questionText.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (a.display_order !== undefined && b.display_order !== undefined) {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      const textA = a.question || a.question_text || '';
      const textB = b.question || b.question_text || '';
      return textA.localeCompare(textB);
    });

  // ─── Load Questions ────────────────────────────────────────────────────
  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await instituteNpsService.getSurveyQuestions() as PaginatedResponse<SurveyQuestion>;
      
      if (response && response.data) {
        const mappedQuestions = response.data.map((q: any) => ({
          ...q,
          question: q.question || q.question_text || '',
          question_text: q.question_text || q.question || '',
        }));
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
    setSelectedDays('');
    setShowRatingScale(false);
  };

  // ─── Handle Add Question Submit ────────────────────────────────────────
  const handleAddQuestion = async (values: Record<string, string>) => {
    try {
      setAddingQuestion(true);
      
      const payload: any = {
        questionText: values.questionText,
        question_type: values.question_type,
        category: values.category || 'general',
        isRequired: values.isRequired === 'true',
        isActive: values.isActive === 'true',
        options: [],
        ratingScale:
          values.question_type === 'rating' && values.ratingScale
            ? Number(values.ratingScale)
            : null,
      };

      const response = await instituteNpsService.createQuestion(payload) as ApiResponse<SurveyQuestion>;
      
      if (response.success) {
        toast.success('Question added successfully!');
        setAddQuestionOpen(false);
        setShowRatingScale(false);
        await loadQuestions();
        if (response.data && response.data.id) {
          handleQuestionSelect(response.data.id);
        }
      } else {
        toast.error(response.message || 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

  // ─── Handle Edit Question ──────────────────────────────────────────────
  const handleEditClick = (question: SurveyQuestion) => {
    setEditQuestionData(question);
    setEditShowRatingScale(question.question_type === 'rating');
    setEditQuestionOpen(true);
  };

  // ─── Handle Edit Question Submit ────────────────────────────────────────
  const handleEditQuestion = async (values: Record<string, string>) => {
    if (!editQuestionData) return;

    try {
      setEditingQuestion(true);
      
      const payload: any = {
        questionText: values.questionText,
        question_type: values.question_type,
        category: values.category || 'general',
        isRequired: values.isRequired === 'true',
        isActive: values.isActive === 'true',
        options: editQuestionData.options || [],
        ratingScale:
          values.question_type === 'rating' && values.ratingScale
            ? Number(values.ratingScale)
            : null,
      };

      const response = await instituteNpsService.updateQuestion(
        editQuestionData.id,
        payload
      ) as ApiResponse<SurveyQuestion>;
      
      if (response.success) {
        toast.success('Question updated successfully!');
        setEditQuestionOpen(false);
        setEditShowRatingScale(false);
        setEditQuestionData(null);
        await loadQuestions();
      } else {
        toast.error(response.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    } finally {
      setEditingQuestion(false);
    }
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
        setSelectedDays(String(survey.send_after_days || ''));
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
    if (selectedQuestions.length < 6) {
      toast.error('Please select at least 6 questions');
      return;
    }

    if (selectedQuestions.length > 10) {
      toast.error('Please select at most 10 questions');
      return;
    }

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
        sendAfterDays: String(survey.send_after_days || ''),
      };
    }
    return {
      title: '',
      description: '',
      sendAfterDays: '',
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

      {/* ─── Search Bar with Add Button ────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowRatingScale(false);
            setAddQuestionOpen(true);
          }}
          className="rounded-xl border-slate-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
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
              if (!question || !question.id) return null;
              
              const isSelected = isQuestionSelected(question.id);
              const isDisabled = !isSelected && selectedQuestions.length >= 10;
              const displayText = getQuestionDisplayText(question);

              return (
                <div
                  key={question.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors group"
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
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {question.question_type && (
                        <Badge variant="outline" className="text-xs">
                          {question.question_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* ✅ Edit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(question);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit question</span>
                  </Button>
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
    <>
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
                const sendAfterDays = selectedDays;
                
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

      {/* ─── Add Question Dialog ─────────────────────────────────────────── */}
      <EntityFormDialog
        open={addQuestionOpen}
        onOpenChange={(open: boolean) => {
          setAddQuestionOpen(open);
          if (!open) {
            setShowRatingScale(false);
          }
        }}
        mode="create"
        entityLabel="Question"
        fields={getQuestionFormFields(false)}
        onSubmit={handleAddQuestion}
        submitting={addingQuestion}
        initialValues={{
          questionText: '',
          question_type: '',
          category: 'general',
          isRequired: 'true',
          isActive: 'true',
          ratingScale: '',
        }}
      />

      {/* ─── Edit Question Dialog ────────────────────────────────────────── */}
      <EntityFormDialog
        open={editQuestionOpen}
        onOpenChange={(open: boolean) => {
          setEditQuestionOpen(open);
          if (!open) {
            setEditShowRatingScale(false);
            setEditQuestionData(null);
          }
        }}
        mode="edit"
        entityLabel="Question"
        fields={getQuestionFormFields(true)}
        onSubmit={handleEditQuestion}
        submitting={editingQuestion}
        initialValues={{
          questionText: editQuestionData?.question || editQuestionData?.question_text || '',
          question_type: editQuestionData?.question_type || '',
          category: editQuestionData?.category || 'general',
          isRequired: String(editQuestionData?.is_required ?? true),
          isActive: String(editQuestionData?.is_active ?? true),
          ratingScale: editQuestionData?.ratingScale ? String(editQuestionData.ratingScale) : '',
        }}
        key={editQuestionData?.id || 'edit'} // Force re-render when data changes
      />
    </>
  );
};

export default SurveyDialog;