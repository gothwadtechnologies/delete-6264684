
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  studentId?: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  parentsPhone?: string;
  classLevel?: ClassLevel;
  batchIds?: string[];
  createdAt?: any;
  isApproved?: boolean;
}

export interface GlobalSettings {
  appName: string;
  logoEmoji: string;
  primaryColor: string;
  backgroundColor: string;
  underMaintenance?: boolean;
  // AI Configuration
  aiApiKey?: string;
  aiModel1?: string;
  aiModel2?: string;
  aiModel3?: string;
  aiModel4?: string;
  aiModel5?: string;
  activeAiModelIndex?: number;
}

export enum ClassLevel {
  CLASS_9 = '9',
  CLASS_10 = '10',
  CLASS_11 = '11',
  CLASS_12 = '12',
  DROPPER = 'Dropper'
}

export interface Batch {
  id: string;
  name: string;
  classLevel: ClassLevel;
  instructor: string;
  studentIds: string[];
  thumbnailColor: string;
  subjects: string[];
  description?: string;
  subject?: string;
  teacherIds?: string[];
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
  startDate?: string;
  order?: number;
  createdAt?: any;
}

export interface Lecture {
  id: string;
  topicName: string;
  title?: string;
  date: string;
  youtubeUrl?: string;
  videoUrl?: string;
  duration?: string;
  order?: number;
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
  subject?: string;
  marks?: number;
}

export interface Test {
  id: string;
  title: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  totalQuestions: number;
  batchIds: string[];
  batchNames?: string[];
  subjectSyllabus: { [subject: string]: string };
  questions: Question[];
  status: 'upcoming' | 'live' | 'completed';
  totalMarks: number;
  marksPerCorrect: number;
  negativeMarking: boolean;
  marksPerWrong: number;
  createdAt?: any;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  answers: { [questionId: string]: number };
  completedAt: any;
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

export type ScreenName = 'LOADING' | 'LOGIN' | 'SIGNUP' | 'HOME' | 'PROFILE' | 'SETTINGS' | 'ADMIN_MANAGE' | 'BATCH_DETAILS' | 'NOTIFICATIONS' | 'MAINTENANCE' | 'TEST_BUILDER' | 'TEST_TAKER';
export type TabName = 'Batches' | 'Classes' | 'Students' | 'Tests' | 'Fees' | 'Attendance' | 'Home';
