import { create } from 'zustand';
import type { Faculty, Subject, ClassSection, Room, TimetableEntry } from '@/types/timetable';

interface TimetableStore {
  faculty: Faculty[];
  subjects: Subject[];
  classes: ClassSection[];
  rooms: Room[];
  timetableEntries: TimetableEntry[];
  isGenerated: boolean;
  selectedClass: string | null;
  selectedSemester: number;

  fetchInitialData: () => Promise<void>;
  addFaculty: (f: Faculty) => Promise<void>;
  removeFaculty: (id: string) => Promise<void>;
  addSubject: (s: Subject) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  addClass: (c: ClassSection) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  addRoom: (r: Room) => Promise<void>;
  removeRoom: (id: string) => Promise<void>;
  setTimetableEntries: (entries: TimetableEntry[]) => void;
  setIsGenerated: (v: boolean) => void;
  setSelectedClass: (id: string | null) => void;
  setSelectedSemester: (s: number) => void;
  clearTimetable: () => void;
}

const API_BASE = 'http://127.0.0.1:5000/api';

export const useTimetableStore = create<TimetableStore>((set) => ({
  faculty: [],
  subjects: [],
  classes: [],
  rooms: [],
  timetableEntries: [],
  isGenerated: false,
  selectedClass: null,
  selectedSemester: 3,

  fetchInitialData: async () => {
    // Ultra-safe fetching: if one fails, the others still load!
    try {
      const fetchSafe = async (endpoint: string) => {
        try {
          const res = await fetch(`${API_BASE}/${endpoint}`);
          return res.ok ? await res.json() : [];
        } catch (e) {
          console.error(`Failed to load ${endpoint}`);
          return [];
        }
      };

      const faculty = await fetchSafe('faculty');
      const subjects = await fetchSafe('subjects');
      const classes = await fetchSafe('classes');
      const rooms = await fetchSafe('rooms');
      const timetableEntries = await fetchSafe('timetable');

      set({
        faculty,
        subjects,
        classes,
        rooms,
        timetableEntries,
        isGenerated: timetableEntries.length > 0
      });
      
    } catch (error: any) {
      console.error("Database Connection Error:", error.message);
    }
  },

  addFaculty: async (f) => {
    try {
      const res = await fetch(`${API_BASE}/faculty`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      if (res.ok) set((s) => ({ faculty: [...s.faculty, f] }));
      else alert("Backend Error: Database format mismatch.");
    } catch (e: any) { alert("Network Error"); }
  },
  
  removeFaculty: async (id) => {
    await fetch(`${API_BASE}/faculty/${id}`, { method: 'DELETE' });
    set((s) => ({ faculty: s.faculty.filter(f => f.id !== id) }));
  },

  addSubject: async (sub) => {
    try {
      const res = await fetch(`${API_BASE}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
      if (res.ok) set((s) => ({ subjects: [...s.subjects, sub] }));
    } catch (e: any) { alert("Network Error"); }
  },
  
  removeSubject: async (id) => {
    await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
    set((s) => ({ subjects: s.subjects.filter(sub => sub.id !== id) }));
  },

  addClass: async (c) => {
    try {
      const res = await fetch(`${API_BASE}/classes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
      if (res.ok) set((s) => ({ classes: [...s.classes, c] }));
    } catch (e: any) { alert("Network Error"); }
  },
  
  removeClass: async (id) => {
    await fetch(`${API_BASE}/classes/${id}`, { method: 'DELETE' });
    set((s) => ({ classes: s.classes.filter(c => c.id !== id) }));
  },

  addRoom: async (r) => {
    try {
      const res = await fetch(`${API_BASE}/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
      if (res.ok) set((s) => ({ rooms: [...s.rooms, r] }));
    } catch (e: any) { alert("Network Error"); }
  },
  
  removeRoom: async (id) => {
    await fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' });
    set((s) => ({ rooms: s.rooms.filter(r => r.id !== id) }));
  },

  setTimetableEntries: (entries) => set({ timetableEntries: entries, isGenerated: true }),
  setIsGenerated: (v) => set({ isGenerated: v }),
  setSelectedClass: (id) => set({ selectedClass: id }),
  setSelectedSemester: (s) => set({ selectedSemester: s }),
  clearTimetable: () => set({ timetableEntries: [], isGenerated: false }),
}));