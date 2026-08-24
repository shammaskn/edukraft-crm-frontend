import api from '@/lib/axios';
import { Lead, ApiResponse } from '@/types';

export const leadsApi = {
  getAll: async (): Promise<Lead[]> => {
    const res = await api.get<ApiResponse<Lead[]>>('/leads');
    return res.data.data;
  },

  getById: async (id: string): Promise<Lead> => {
    const res = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data;
  },

  create: async (data: CreateLeadInput): Promise<Lead> => {
    const res = await api.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateLeadInput): Promise<Lead> => {
    const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },
};

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  notes?: string;
}

export interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ENROLLED' | 'LOST';
  notes?: string;
}