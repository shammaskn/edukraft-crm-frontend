import api from '@/lib/axios';
import { Course, ApiResponse } from '@/types';

export interface CreateCourseInput {
  title: string;
  description?: string;
  duration: number;
  fee: number;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  duration?: number;
  fee?: number;
  isActive?: boolean;
}

export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const res = await api.get<ApiResponse<Course[]>>('/courses');
    return res.data.data;
  },

  getById: async (id: string): Promise<Course> => {
    const res = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data.data;
  },

  create: async (data: CreateCourseInput): Promise<Course> => {
    const res = await api.post<ApiResponse<Course>>('/courses', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateCourseInput): Promise<Course> => {
    const res = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
};