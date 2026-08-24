export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
}
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Course {
  id: string;
  title: string;
  description?: string;
  duration: number;
  fee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ENROLLED' | 'LOST';
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Application {
  id: string;
  status: ApplicationStatus;
  notes?: string;
  studentId: string;
  courseId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    fee: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}