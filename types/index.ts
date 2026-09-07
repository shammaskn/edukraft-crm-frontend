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
export interface University {
  id: string;
  name: string;
  location: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courses: number;
  };
}
export interface Course {
  id: string;
  title: string;
  description?: string;
  duration: number;
  fee: number;
  isActive: boolean;
   universityId?: string | null;
  university?: {
    id: string;
    name: string;
    location: string;
  } | null;
  
  createdAt: string;
  updatedAt: string;
}
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ENROLLED' | 'LOST';
export interface Lead {
  name: any;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  studentId?: string | null; 
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
    university?: {
      id: string;
      name: string;
    } | null;
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