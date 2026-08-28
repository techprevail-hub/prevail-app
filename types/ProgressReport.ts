// types/ProgressReport.ts

export interface ProgressSummary {
  totalStudents: number;
  accountActivated: number;
  resumeCompleted: number;
  linkedinCompleted: number;
  interviewCompleted: number;
  averageProgress: number;
}

export interface ProgressReportStudent {
  invitationId: string;
  name: string;
  email: string;
  course: string;
  branch: string;
  batch: string;
  // Progress metrics
  resumeCompleted: boolean;
  linkedinCompleted: boolean;
  interviewCompleted: boolean;
  accountActivated: boolean;
  overallProgress: number; // calculated from completed items
  // You can add these if your API provides them
  previousResumeScore?: number;
  currentResumeScore?: number;
  resumeImprovement?: number;
  previousLinkedinScore?: number;
  currentLinkedinScore?: number;
  linkedinImprovement?: number;
  previousInterviewScore?: number;
  currentInterviewScore?: number;
  interviewImprovement?: number;
  previousOverall?: number;
  currentOverall?: number;
  overallImprovement?: number;
  status?: "improved" | "declined" | "stable";
}

export interface ProgressReportData {
  summary: ProgressSummary;
  students: ProgressReportStudent[];
}

export interface ProgressReportResponse {
  success: boolean;
  message: string;
  data: ProgressReportData;
}