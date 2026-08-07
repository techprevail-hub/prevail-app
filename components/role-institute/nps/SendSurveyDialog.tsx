// components/role-institute/SendSurveyDialog.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Mail,
  Clock,
  Users,
  Loader2,
  FileText,
  UserCheck,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { instituteNpsService } from '@/services/instituteNpsService';
import studentService from '@/services/student.service';
import coachService from '@/services/coachService';
import type { Survey } from '@/types/instituteNps';
import type { Student } from '@/types/student';
import type { Coach } from '@/types/coaches';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ─── Props ──────────────────────────────────────────────────────────────────
interface SendSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Survey | null;
  onSuccess: () => void;
}

// ─── Helper Functions ──────────────────────────────────────────────────────
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

// ─── Component ─────────────────────────────────────────────────────────────
export const SendSurveyDialog: React.FC<SendSurveyDialogProps> = ({
  open,
  onOpenChange,
  survey,
  onSuccess,
}) => {
  // ─── Early return if no survey ────────────────────────────────────────
  if (!survey) {
    return null;
  }

  // ─── State ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [resend, setResend] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'coaches'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Student states
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  
  // Coach states
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([]);
  const [selectAllCoaches, setSelectAllCoaches] = useState(false);

  // ─── Refs to prevent infinite loops ─────────────────────────────────────
  const studentsLoadedRef = useRef(false);
  const coachesLoadedRef = useRef(false);

  // ─── Load Students ──────────────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    if (studentsLoadedRef.current) return;
    
    try {
      setLoadingStudents(true);
      const response = await studentService.getStudents({
        page: 1,
        limit: 100,
        status: 'accepted',
      });
      
      if (response && response.success) {
        const acceptedStudents = (response.data || []).filter(
          (student: Student) => student.status === 'accepted'
        );
        setStudents(acceptedStudents);
        studentsLoadedRef.current = true;
      } else {
        const errorMsg = (response as any)?.message || 'Failed to load students';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // ─── Load Coaches ──────────────────────────────────────────────────────
  const loadCoaches = useCallback(async () => {
    if (coachesLoadedRef.current) return;
    
    try {
      setLoadingCoaches(true);
      const response = await coachService.getCoaches({
        page: 1,
        limit: 100,
        status: 'accepted',
      });
      
      if (response && response.success) {
        const acceptedCoaches = (response.data || []).filter(
          (coach: Coach) => coach.status === 'accepted'
        );
        setCoaches(acceptedCoaches);
        coachesLoadedRef.current = true;
      } else {
        const errorMsg = (response as any)?.message || 'Failed to load coaches';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error loading coaches:', error);
      toast.error('Failed to load coaches');
    } finally {
      setLoadingCoaches(false);
    }
  }, []);

  // ─── Handle Tab Change ──────────────────────────────────────────────────
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'students' | 'coaches');
    setSearchTerm('');
    
    if (value === 'students' && !studentsLoadedRef.current) {
      loadStudents();
    } else if (value === 'coaches' && !coachesLoadedRef.current) {
      loadCoaches();
    }
  }, [loadStudents, loadCoaches]);

  // ─── Reset Dialog ──────────────────────────────────────────────────────
  const resetDialog = useCallback(() => {
    setResend(false);
    setSearchTerm('');
    setSelectedStudents([]);
    setSelectedCoaches([]);
    setSelectAllStudents(false);
    setSelectAllCoaches(false);
    setStudents([]);
    setCoaches([]);
    studentsLoadedRef.current = false;
    coachesLoadedRef.current = false;
  }, []);

  // ─── Initialize Dialog ────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      resetDialog();
      
      const timer = setTimeout(() => {
        if (!studentsLoadedRef.current) {
          loadStudents();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, resetDialog, loadStudents]);

  // ─── Handle Student Selection ──────────────────────────────────────────
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectAllStudents) {
      setSelectedStudents([]);
    } else {
      const acceptedIds = students.map((s) => s.id);
      setSelectedStudents(acceptedIds);
    }
    setSelectAllStudents(!selectAllStudents);
  };

  // ─── Handle Coach Selection ────────────────────────────────────────────
  const handleCoachToggle = (coachId: string) => {
    setSelectedCoaches((prev) =>
      prev.includes(coachId)
        ? prev.filter((id) => id !== coachId)
        : [...prev, coachId]
    );
  };

  const handleSelectAllCoaches = () => {
    if (selectAllCoaches) {
      setSelectedCoaches([]);
    } else {
      const acceptedIds = coaches.map((c) => c.id);
      setSelectedCoaches(acceptedIds);
    }
    setSelectAllCoaches(!selectAllCoaches);
  };

  // ─── Filter Students ──────────────────────────────────────────────────
  const filteredStudents = students.filter((student) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (student.student_name || '').toLowerCase().includes(term) ||
      (student.email || '').toLowerCase().includes(term)
    );
  });

  // ─── Filter Coaches ──────────────────────────────────────────────────
  const filteredCoaches = coaches.filter((coach) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (coach.coach_name || '').toLowerCase().includes(term) ||
      (coach.email || '').toLowerCase().includes(term) ||
      (coach.specialization || '').toLowerCase().includes(term)
    );
  });

  // ─── Handle Send ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!survey) {
      toast.error('Survey not found');
      return;
    }

    const totalSelected = selectedStudents.length + selectedCoaches.length;
    if (totalSelected === 0) {
      toast.error('Please select at least one student or coach to send the survey');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        resend,
        studentIds: selectedStudents,
        coachIds: selectedCoaches,
      };

      const response = await instituteNpsService.sendSurvey(
        survey.id,
        payload
      );

      if (response.success) {
        const sentCount = response.data?.sentCount || 0;
        const skippedCount = response.data?.skippedCount || 0;
        const totalEligible = response.data?.totalEligible || 0;

        let successMessage = `Survey sent to ${sentCount} recipients`;
        if (skippedCount > 0) {
          successMessage += ` (${skippedCount} skipped, ${totalEligible} eligible)`;
        }

        toast.success(successMessage);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to send survey');
      }
    } catch (error) {
      console.error('Error sending survey:', error);
      toast.error('Failed to send survey');
    } finally {
      setLoading(false);
    }
  };

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getDaysText = (days: number) => {
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" => {
    switch (status) {
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      case "sent":
        return "default";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  // ─── Get Values ────────────────────────────────────────────────────────
  const days = survey?.send_after_days ?? 15;
  const questionCount = survey?.questions?.length || survey?.question_ids?.length || 0;
  const totalSelected = selectedStudents.length + selectedCoaches.length;

  // ─── Get Date from Student or Coach ──────────────────────────────────
  const getDate = (item: Student | Coach): string => {
    return (item as any).accepted_at || (item as any).created_at || (item as any).invited_at || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 rounded-3xl overflow-hidden">
        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-6 pt-6 pb-8 flex-shrink-0">
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <DialogHeader className="relative">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Survey
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ── Content ── */}
        <div className="px-6 py-4 -mt-4 overflow-y-auto flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            {/* Survey Information */}
            <Card className="border-0 shadow-none bg-slate-50/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800">
                      {survey?.title || 'Untitled Survey'}
                    </h3>
                    {survey?.description && (
                      <p className="text-sm text-slate-500 mt-1">
                        {survey.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={getStatusVariant(survey.status)}
                    className={`ml-2 flex-shrink-0 ${
                      survey.status === "completed"
                        ? "bg-emerald-600 text-white"
                        : survey.status === "sent"
                        ? "bg-blue-600 text-white"
                        : ""
                    }`}
                  >
                    {survey.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>
                      <span className="font-medium text-slate-700">
                        {getDaysText(days)}
                      </span>
                      {' after acceptance'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 ml-auto">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{questionCount}</span>
                    <span className="text-slate-500">questions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipients Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">Select Recipients</h4>
                <Badge variant="outline" className="text-xs border-violet-200 text-violet-600 bg-violet-50">
                  {totalSelected} selected
                </Badge>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-slate-200 focus:border-violet-400 focus:ring-violet-400/20 rounded-xl"
                />
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger 
                    value="students" 
                    className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-600"
                  >
                    <Users className="h-4 w-4" />
                    Students
                    <Badge variant="secondary" className="ml-1 text-xs bg-slate-200 text-slate-600">
                      {students.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="coaches" 
                    className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-600"
                  >
                    <UserCheck className="h-4 w-4" />
                    Coaches
                    <Badge variant="secondary" className="ml-1 text-xs bg-slate-200 text-slate-600">
                      {coaches.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Students Tab */}
                <TabsContent value="students" className="mt-4">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {searchTerm ? 'No students found matching your search' : 'No accepted students found'}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <Checkbox
                          id="select-all-students"
                          checked={selectAllStudents}
                          onCheckedChange={handleSelectAllStudents}
                          className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <label
                          htmlFor="select-all-students"
                          className="text-sm font-medium text-slate-700 cursor-pointer"
                        >
                          Select All Students
                        </label>
                        <span className="text-xs text-slate-400 ml-auto">
                          ({students.length} students)
                        </span>
                      </div>

                      <ScrollArea className="h-[200px] mt-2">
                        <div className="space-y-1">
                          {filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50/50 transition-colors"
                            >
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={() => handleStudentToggle(student.id)}
                                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                              />
                              <Avatar className="h-8 w-8 bg-violet-100">
                                <AvatarFallback className="text-xs text-violet-600 font-medium">
                                  {getInitials(student.student_name || 'Student')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                  {student.student_name || 'Unnamed Student'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {student.email || 'No email'}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                                {formatDate(getDate(student))}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </TabsContent>

                {/* Coaches Tab */}
                <TabsContent value="coaches" className="mt-4">
                  {loadingCoaches ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    </div>
                  ) : filteredCoaches.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {searchTerm ? 'No coaches found matching your search' : 'No accepted coaches found'}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <Checkbox
                          id="select-all-coaches"
                          checked={selectAllCoaches}
                          onCheckedChange={handleSelectAllCoaches}
                          className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <label
                          htmlFor="select-all-coaches"
                          className="text-sm font-medium text-slate-700 cursor-pointer"
                        >
                          Select All Coaches
                        </label>
                        <span className="text-xs text-slate-400 ml-auto">
                          ({coaches.length} coaches)
                        </span>
                      </div>

                      <ScrollArea className="h-[200px] mt-2">
                        <div className="space-y-1">
                          {filteredCoaches.map((coach) => (
                            <div
                              key={coach.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50/50 transition-colors"
                            >
                              <Checkbox
                                id={`coach-${coach.id}`}
                                checked={selectedCoaches.includes(coach.id)}
                                onCheckedChange={() => handleCoachToggle(coach.id)}
                                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                              />
                              <Avatar className="h-8 w-8 bg-indigo-100">
                                <AvatarFallback className="text-xs text-indigo-600 font-medium">
                                  {getInitials(coach.coach_name || 'Coach')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                  {coach.coach_name || 'Unnamed Coach'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {coach.email || 'No email'}
                                </p>
                                {coach.specialization && (
                                  <p className="text-xs text-slate-400 truncate">
                                    {coach.specialization}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                                {formatDate(getDate(coach))}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Resend Checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-violet-100 bg-violet-50/30">
              <Checkbox
                id="resend"
                checked={resend}
                onCheckedChange={(checked) => setResend(checked as boolean)}
                className="mt-0.5 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
              <div>
                <label
                  htmlFor="resend"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Resend to students who have not completed survey
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Only students who haven't submitted will receive the email again
                </p>
              </div>
            </div>

            {/* Warning Box */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">
                    Important Information
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>Only selected students and coaches will receive this survey</li>
                    <li>Recipients must have accepted their invitation</li>
                    <li>Recipients must have completed the waiting period</li>
                    <li>Recipients who already submitted will be skipped automatically</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-3 space-y-1">
                <p className="text-sm font-medium text-center text-slate-700">
                  Are you sure you want to send this survey to {totalSelected} recipient{totalSelected !== 1 ? 's' : ''}?
                </p>
                <p className="text-xs text-center text-slate-500">
                  Once sent, emails will immediately be delivered to all selected recipients.
                </p>
                <p className="text-xs text-center text-slate-500">
                  Recipients who already submitted will not receive another survey unless "Resend" is enabled.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 pb-6 pt-4 gap-2 sm:gap-2 flex-shrink-0 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={loading || totalSelected === 0}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm shadow-violet-200 hover:shadow-violet-300 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send to {totalSelected} {totalSelected === 1 ? 'Recipient' : 'Recipients'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendSurveyDialog;