
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
  studentId?: string;
  fatherName?: string;
  batchIds?: string[];
}

export interface GlobalSettings {
  appName: string;
  logoEmoji: string;
  primaryColor: string;
  backgroundColor: string;
  underMaintenance?: boolean;
}

export type ClassLevel = '9th' | '10th' | '11th' | '12th' | 'Dropper';

export interface Batch {
  id: string;
  name: string;
  classLevel: ClassLevel;
  instructor: string;
  studentIds: string[];
  thumbnailColor: string;
  subjects: string[];
  createdAt?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: any;
  type: 'info' | 'alert' | 'update';
  senderName: string;
  senderUid: string;
  targetType: 'all' | 'batch';
  targetBatchId?: string;
  targetBatchName?: string;
}

export interface Chapter {
  id: string;
  title: string;
  createdAt?: any;
}

export interface Lecture {
  id: string;
  topicName: string;
  date: string;
  youtubeUrl?: string;
  notesUrl?: string;
  dppUrl?: string;
  testId?: string;
  createdAt?: any;
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

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number; // index 0-3
}

export interface Test {
  id: string;
  title: string;
  date: string;
  batchId?: string;
  batchName?: string;
  totalMarks: number;
  duration?: number; // in minutes
  questions?: Question[];
  score?: number;
  createdAt?: any;
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

export type ScreenName = 'LOADING' | 'ROLE_SELECTION' | 'LOGIN' | 'HOME' | 'PROFILE' | 'SETTINGS' | 'ADMIN_MANAGE' | 'BATCH_DETAILS' | 'NOTIFICATIONS' | 'MAINTENANCE';
export type TabName = 'Batches' | 'Classes' | 'Students' | 'Tests' | 'Fees' | 'Attendance';
