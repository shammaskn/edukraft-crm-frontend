import api from '@/lib/axios';
import { University, ApiResponse } from '@/types';

export interface CreateUniversityInput {
  name: string;
  location: string;
  website?: string;
  description?: string;
}

export interface UpdateUniversityInput {
  name?: string;
  location?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

export const universitiesApi = {
  getAll: async (): Promise<University[]> => {
    const res = await api.get<ApiResponse<University[]>>('/universities');
    return res.data.data;
  },

  getById: async (id: string): Promise<University> => {
    const res = await api.get<ApiResponse<University>>(`/universities/${id}`);
    return res.data.data;
  },

  create: async (data: CreateUniversityInput): Promise<University> => {
    const res = await api.post<ApiResponse<University>>('/universities', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateUniversityInput): Promise<University> => {
    const res = await api.put<ApiResponse<University>>(`/universities/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/universities/${id}`);
  },
};