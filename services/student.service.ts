import { api } from "@/utils/apiServices";
import {
  StudentQueryParams,
  StudentResponse,
  Student,
} from "@/types/student";

class StudentService {

  // Get All Students (Server-side Pagination)
  async getStudents(
    params: StudentQueryParams
  ): Promise<StudentResponse> {
    return await api.get("/api/student", params);
  }

  // Get Single Student
  async getStudentById(id: string): Promise<Student> {
    return await api.get(`/api/student/${id}`);
  }

  // Create Student
  async createStudent(data: Partial<Student>) {
    return await api.post("/api/student", data);
  }

  // Update Student
  async updateStudent(id: string, data: Partial<Student>) {
    return await api.put(`/api/student/${id}`, data);
  }

  // Delete Student
  async deleteStudent(id: string) {
    return await api.delete(`/api/student/${id}`);
  }
}

export default new StudentService();