import api from '@/lib/axios';
import { Application, ApiResponse } from '@/types';

export interface CreateApplicationInput {
  studentId: string;
  courseId: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    const res = await api.get<ApiResponse<Application[]>>('/applications');
    return res.data.data;
  },

  getById: async (id: string): Promise<Application> => {
    const res = await api.get<ApiResponse<Application>>(`/applications/${id}`);
    return res.data.data;
  },

  create: async (data: CreateApplicationInput): Promise<Application> => {
    const res = await api.post<ApiResponse<Application>>('/applications', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateApplicationInput): Promise<Application> => {
    const res = await api.put<ApiResponse<Application>>(`/applications/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },
};