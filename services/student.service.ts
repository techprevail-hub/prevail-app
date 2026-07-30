import {api} from "@/utils/apiServices";
import {
  Student,
  StudentQueryParams,
  StudentResponse,
} from "@/types/student";

class StudentService {
  // Get all student invitations
  async getStudents(
    params: StudentQueryParams
  ): Promise<StudentResponse> {
    return await api.get(
      "/api/role-institute/student-invitations",
      params
    );
  }

  // Get single invitation
  async getStudentById(id: string): Promise<Student> {
    return await api.get(
      `/api/role-institute/student-invitations/${id}`
    );
  }

  // Create invitation
  async createStudentInvitation(data: Partial<Student>) {
    return await api.post(
      "/api/role-institute/student-invitations",
      data
    );
  }

  // Update invitation
  async updateStudentInvitation(
    id: string,
    data: Partial<Student>
  ) {
    return await api.put(
      `/api/role-institute/student-invitations/${id}`,
      data
    );
  }

  // Cancel invitation
  async cancelInvitation(id: string) {
    return await api.patch(
      `/api/role-institute/student-invitations/${id}/cancel`,
      {}
    );
  }
}

const studentService = new StudentService();

export default studentService;