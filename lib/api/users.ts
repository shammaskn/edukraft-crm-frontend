import api from '@/lib/axios';
import { User, ApiResponse } from '@/types';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'STAFF';
}

export interface UpdateUserInput {
  name?: string;
  role?: 'ADMIN' | 'STAFF';
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  },

  create: async (data: CreateUserInput): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};