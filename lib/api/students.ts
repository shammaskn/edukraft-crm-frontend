import api from '@/lib/axios';
import { Student, ApiResponse } from '@/types';

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const res = await api.get<ApiResponse<Student[]>>('/students');
    return res.data.data;
  },

  getById: async (id: string): Promise<Student> => {
    const res = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return res.data.data;
  },

  create: async (data: CreateStudentInput): Promise<Student> => {
    const res = await api.post<ApiResponse<Student>>('/students', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateStudentInput): Promise<Student> => {
    const res = await api.put<ApiResponse<Student>>(`/students/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },
};