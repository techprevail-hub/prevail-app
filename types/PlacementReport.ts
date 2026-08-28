export interface PlacementReportSummary {
  totalEligibleStudents: number;
  placedStudents: number;
  notPlacedStudents: number;
  placementRate: number;
  campusPlacements: number;
  offCampusPlacements: number;
}

export interface TopHiringCompany {
  companyName: string;
  hiredStudents: number;
}

export interface PlacementReportStudent {
  studentId: string | null;
  invitationId: string;

  name: string;
  email: string;

  course: string;
  branch: string;
  batch: string;

  placementStatus: string;

  placementType: string | null;

  companyName: string | null;

  jobRole: string | null;

  package: number | null;

  placementDate: string | null;
}

export interface PlacementReportData {
  summary: PlacementReportSummary;

  topHiringCompanies: TopHiringCompany[];

  students: PlacementReportStudent[];
}

export interface PlacementReportResponse {
  success: boolean;
  message: string;
  data: PlacementReportData;
}