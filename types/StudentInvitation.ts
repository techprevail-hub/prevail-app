// types/StudentInvitation.ts

export interface StudentInvitation {
  id: string;
  student_name: string;
  email: string;
  course: string;
  branch: string;
  batch: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  cancelledAt?: string;
  created_at: string;
  updatedAt: string;
}

export interface CreateStudentInvitationRequest {
  student_name: string;
  email: string;
  course: string;
  branch: string;
  batch: string;
}

export interface UpdateStudentInvitationRequest {
  student_name?: string;
  email?: string;
  course?: string;
  branch?: string;
  batch?: string;
  status?: 'pending' | 'cancelled';
}

export interface StudentInvitationResponse {
  success: boolean;
  data: StudentInvitation;
  message?: string;
}

export interface StudentInvitationListResponse {
  success: boolean;
  data: {
    invitations: StudentInvitation[];
    pagination: Pagination;
  };
  message?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StudentInvitationFilters {
  search?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}