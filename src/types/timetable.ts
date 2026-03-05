export type SubjectType = 'Theory' | 'Lab' | 'Project';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type UserRole = 'admin' | 'teacher' | 'student';

export interface Faculty {
  id: string;
  name: string;
  shortCode: string;
  department: string;
  availability: Record<Day, number[]>; // slot indices available per day
  maxHoursPerDay: number;
  email?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  type: SubjectType;
  semester: number;
  department: string;
  facultyId?: string;
  color?: string;
}

export interface ClassSection {
  id: string;
  sectionName: string;
  semester: number;
  department: string;
  studentStrength: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: 'Classroom' | 'Lab';
  building?: string;
}

export interface TimetableEntry {
  id: string;
  day: Day;
  slotIndex: number;
  subjectId: string;
  facultyId: string;
  roomId: string;
  classId: string;
  isLab?: boolean;
  isLocked?: boolean; // Matches the SQL database column for Manual Overrides!
}

export interface TimeSlot {
  index: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  label: string;
}

export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { index: 0, startTime: '09:00', endTime: '09:55', label: '9:00 - 9:55' },
  { index: 1, startTime: '09:55', endTime: '10:50', label: '9:55 - 10:50' },
  { index: 2, startTime: '10:50', endTime: '11:10', label: 'Break', isBreak: true },
  { index: 3, startTime: '11:10', endTime: '12:05', label: '11:10 - 12:05' },
  { index: 4, startTime: '12:05', endTime: '13:00', label: '12:05 - 1:00' },
  { index: 5, startTime: '13:00', endTime: '13:45', label: 'Lunch', isBreak: true },
  { index: 6, startTime: '13:45', endTime: '14:40', label: '1:45 - 2:40' },
  { index: 7, startTime: '14:40', endTime: '15:35', label: '2:40 - 3:35' },
  { index: 8, startTime: '15:35', endTime: '16:30', label: '3:35 - 4:30' },
];

export const SUBJECT_COLORS: string[] = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
  '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];