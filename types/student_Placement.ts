export type PlacementStatus = "placed" | "not_placed";

export type PlacementType = "campus" | "off_campus";

export interface PlacementRecord {
  id: string;
  institute_id: string;
  student_id: string;
  invitation_id?: number | null;

  /**
   * Student name comes from student_invitations
   * and is added by the backend in the API response.
   */
  student_name?: string | null;

  placement_status: PlacementStatus;
  placement_type?: PlacementType | null;

  company_name?: string | null;
  job_role?: string | null;

  package?: string | number | null;

  placement_date?: string | null;

  created_at: string;
  updated_at: string;
}

export interface StudentPlacementData {
  /**
   * Student UUID from users.id
   */
  studentId: string;

  /**
   * Student name comes from student_invitations.student_name
   * and is read-only on the frontend.
   */
  studentName: string | null;

  /**
   * Course comes from student_invitations.course
   * and is read-only on the frontend.
   */
  course: string | null;

  /**
   * Branch comes from student_invitations.branch
   * and is read-only on the frontend.
   */
  branch: string | null;

  /**
   * Institute UUID from student_invitations.institute_id
   */
  instituteId: string;

  /**
   * student_invitations.id is INT.
   */
  invitationId: number | null;

  /**
   * Existing placement record.
   * null means the student has not submitted placement details yet.
   */
  placement: PlacementRecord | null;

  /**
   * true when a placement_records entry exists.
   */
  submitted: boolean;
}

export interface StudentPlacementResponse {
  success: boolean;
  message: string;
  data: StudentPlacementData;
}

export interface SavePlacementPayload {
  /**
   * Required:
   * "placed" | "not_placed"
   */
  placementStatus: PlacementStatus;

  /**
   * Required only when placementStatus === "placed"
   */
  placementType?: PlacementType;

  /**
   * Required only when placementStatus === "placed"
   */
  companyName?: string;

  /**
   * Required only when placementStatus === "placed"
   */
  jobRole?: string;

  /**
   * Required only when placementStatus === "placed"
   */
  package?: string | number;

  /**
   * Required only when placementStatus === "placed"
   */
  placementDate?: string;
}

export interface SavePlacementResponse {
  success: boolean;
  message: string;
  data: PlacementRecord;
}