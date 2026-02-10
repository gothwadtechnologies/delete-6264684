
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  studentId?: string; // Only for parents to link to child
}

export type ClassLevel = '9th' | '10th' | '11th' | '12th';

export interface Batch {
  id: string;
  name: string;
  classLevel: ClassLevel;
  instructor: string;
  studentIds: string[];
  thumbnailColor: string;
  subject: string;
}

export interface ClassSession {
  id: string;
  title: string;
  instructor: string;
  time: string;
  youtubeUrl: string;
  type: 'live' | 'recorded';
  modality: 'online' | 'offline';
}

export interface Test {
  id: string;
  title: string;
  date: string;
  score?: number;
  totalMarks: number;
}

export interface FeeRecord {
  total: number;
  paid: number;
  history: {
    amount: number;
    date: string;
    method: string;
  }[];
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
}

export type ScreenName = 'LOADING' | 'ROLE_SELECTION' | 'LOGIN' | 'HOME' | 'PROFILE' | 'SETTINGS' | 'ADMIN_MANAGE';
export type TabName = 'Batches' | 'Classes' | 'Tests' | 'Fees' | 'Attendance';
