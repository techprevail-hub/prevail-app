export interface InstituteDashboardOverview {
  totalStudents: number;
  totalCoaches: number;
  careerReadiness: number;
  averageProgress: number;
  placementRate: number;
  averagePackage: number;
  needsAttention: number;
}

export interface CareerReadinessData {
  overall: number;
  ready: number;
  developing: number;
  needsSupport: number;
}

export interface ProgressData {
  averageProgress: number;
  onTrack: number;
  needsAttention: number;
}

export interface PlacementDashboardData {
  placementRate: number;
  placedStudents: number;
  averagePackage: number;
  campusPlaced: number;
  offCampusPlaced: number;
  submitted: number;
  notPlaced: number;
  notSubmitted: number;
}

export interface NpsDashboardData {
  averageScore: number;
}

export interface StudentNeedingAttention {
  studentId: string;
  name: string;
  email: string;
  course?: string | null;
  branch?: string | null;
  reasons: string[];
}

export interface CoursePerformance {
  course: string;
  totalStudents: number;
  averageProgress: number;
  careerReadiness: number;
  placementRate: number;
}

export interface TrendDataPoint {
  month: string;
  progress: number;
  careerReadiness: number;
}


export interface InstituteDashboardData {
  overview: InstituteDashboardOverview;

  careerReadiness: CareerReadinessData;

  progress: ProgressData;

  placement: PlacementDashboardData;

  nps: NpsDashboardData;

  studentsNeedingAttention: StudentNeedingAttention[];

  coursePerformance: CoursePerformance[];
  trendData?: TrendDataPoint[]; 
}

export interface InstituteDashboardResponse {
  success: boolean;
  message: string;
  data: InstituteDashboardData;
}