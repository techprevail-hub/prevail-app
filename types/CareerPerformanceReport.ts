export interface CareerPerformanceSummary {
  totalStudents: number;
  averageResumeScore: number;
  averageLinkedinScore: number;
  averageInterviewScore: number;
  averagePerformanceScore: number;
}

export interface CareerPerformanceStudent {
  studentId: string | null;
  invitationId: string;
  name: string;
  email: string;
  course: string;
  branch: string;
  batch: string;
  resumeScore: number;
  linkedinScore: number;
  interviewScore: number;
  overallPerformance: number;
}

export interface CareerPerformanceReportData {
  summary: CareerPerformanceSummary;
  students: CareerPerformanceStudent[];
}

export interface CareerPerformanceReportResponse {
  success: boolean;
  message: string;
  data: CareerPerformanceReportData;
}