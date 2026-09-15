// types/institute_Placement.ts

export type PlacementStatus = "placed" | "not_placed";

export type PlacementType = "campus" | "off_campus";

export interface PlacementRecord {
  id: string;
  institute_id: string;
  student_id: string;
  invitation_id?: number | null;

  student_name?: string | null;
  course?: string | null;
  branch?: string | null;

  placement_status: PlacementStatus;

  placement_type?: PlacementType | null;

  company_name?: string | null;
  job_role?: string | null;

  package?: string | number | null;

  placement_date?: string | null;

  created_at: string;
  updated_at?: string | null;
}

export interface PlacementStats {
  totalStudents: number;
  submitted: number;
  placed: number;
  notPlaced: number;
  notSubmitted: number;
}

/**
 * Overall institute placement dashboard response
 */
export interface InstitutePlacementsData {
  stats: PlacementStats;
  placements: PlacementRecord[];
}

export interface InstitutePlacementsResponse {
  success: boolean;
  message: string;
  data: InstitutePlacementsData;
}

/**
 * Single student placement response
 */
export interface InstituteStudentPlacementData {
  studentId: string;
  studentName: string | null;
  course: string | null;
  branch: string | null;

  instituteId: string;

  invitationId: number | null;

  placement: PlacementRecord | null;

  submitted: boolean;
}

export interface InstituteStudentPlacementResponse {
  success: boolean;
  message: string;
  data: InstituteStudentPlacementData;
}

/**
 * Save / update placement
 */
export interface InstitutePlacementPayload {
  studentId: string;

  studentName?: string;
  course?: string;
  branch?: string;

  placementStatus: PlacementStatus;

  placementType?: PlacementType;

  companyName?: string;

  jobRole?: string;

  package?: string | number;

  placementDate?: string;
}

export interface InstitutePlacementResponse {
  success: boolean;
  message: string;
  data: PlacementRecord;
}