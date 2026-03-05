import type { Faculty, Subject, ClassSection, Room, TimetableEntry, Day } from '@/types/timetable';
import { DAYS, DEFAULT_TIME_SLOTS } from '@/types/timetable';

const TEACHING_SLOTS = DEFAULT_TIME_SLOTS.filter(s => !s.isBreak).map(s => s.index);

interface GenerationResult {
  success: boolean;
  entries: TimetableEntry[];
  conflicts: string[];
  stats: {
    totalSlotsFilled: number;
    facultyUtilization: Record<string, number>;
  };
}

export function generateTimetable(
  subjects: Subject[],
  faculty: Faculty[],
  rooms: Room[],
  classes: ClassSection[],
): GenerationResult {
  const entries: TimetableEntry[] = [];
  const conflicts: string[] = [];

  // Track occupancy
  const facultyOccupied = new Map<string, Set<string>>(); // facultyId -> Set<"day-slot">
  const roomOccupied = new Map<string, Set<string>>();
  const classOccupied = new Map<string, Set<string>>();
  const facultyDailyHours = new Map<string, Map<string, number>>(); // facultyId -> day -> hours

  const key = (day: Day, slot: number) => `${day}-${slot}`;

  function isAvailable(facultyId: string, roomId: string, classId: string, day: Day, slot: number): boolean {
    const k = key(day, slot);
    if (facultyOccupied.get(facultyId)?.has(k)) return false;
    if (roomOccupied.get(roomId)?.has(k)) return false;
    if (classOccupied.get(classId)?.has(k)) return false;

    // Check faculty availability
    const f = faculty.find(f => f.id === facultyId);
    if (f && !f.availability[day]?.includes(slot)) return false;

    // Check max hours per day
    if (f) {
      const dailyHours = facultyDailyHours.get(facultyId)?.get(day) || 0;
      if (dailyHours >= f.maxHoursPerDay) return false;
    }

    return true;
  }

  function occupy(entry: TimetableEntry) {
    const k = key(entry.day, entry.slotIndex);

    if (!facultyOccupied.has(entry.facultyId)) facultyOccupied.set(entry.facultyId, new Set());
    facultyOccupied.get(entry.facultyId)!.add(k);

    if (!roomOccupied.has(entry.roomId)) roomOccupied.set(entry.roomId, new Set());
    roomOccupied.get(entry.roomId)!.add(k);

    if (!classOccupied.has(entry.classId)) classOccupied.set(entry.classId, new Set());
    classOccupied.get(entry.classId)!.add(k);

    if (!facultyDailyHours.has(entry.facultyId)) facultyDailyHours.set(entry.facultyId, new Map());
    const dayMap = facultyDailyHours.get(entry.facultyId)!;
    dayMap.set(entry.day, (dayMap.get(entry.day) || 0) + 1);
  }

  // For each class, schedule all subjects
  for (const cls of classes) {
    const classSubjects = subjects.filter(s => s.semester === cls.semester && s.department === cls.department);

    // Build assignment list: each subject needs `credits` slots per week
    interface Assignment {
      subject: Subject;
      facultyId: string;
      slotsNeeded: number;
      isLab: boolean;
    }

    const assignments: Assignment[] = [];
    for (const sub of classSubjects) {
      const fId = sub.facultyId || faculty[0]?.id;
      if (!fId) continue;

      if (sub.type === 'Lab') {
        // Labs need consecutive slots, counted as credits/2 sessions of 2 slots each
        const sessions = Math.ceil(sub.credits);
        assignments.push({ subject: sub, facultyId: fId, slotsNeeded: sessions, isLab: true });
      } else {
        assignments.push({ subject: sub, facultyId: fId, slotsNeeded: sub.credits, isLab: false });
      }
    }

    // Sort: labs first (harder to place), then by credits desc
    assignments.sort((a, b) => {
      if (a.isLab !== b.isLab) return a.isLab ? -1 : 1;
      return b.slotsNeeded - a.slotsNeeded;
    });

    // Track how many slots per subject per day for this class (avoid too many same subject per day)
    const subjectDayCount = new Map<string, Map<string, number>>();

    for (const assign of assignments) {
      let placed = 0;
      const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);

      for (const day of shuffledDays) {
        if (placed >= assign.slotsNeeded) break;

        // Limit same subject to 1 per day (2 for labs)
        const dayKey = `${assign.subject.id}-${day}`;
        if (!subjectDayCount.has(assign.subject.id)) subjectDayCount.set(assign.subject.id, new Map());
        const currentDayCount = subjectDayCount.get(assign.subject.id)!.get(day) || 0;
        const maxPerDay = assign.isLab ? 1 : 1;
        if (currentDayCount >= maxPerDay) continue;

        if (assign.isLab) {
          // Find two consecutive teaching slots
          for (let i = 0; i < TEACHING_SLOTS.length - 1; i++) {
            const slot1 = TEACHING_SLOTS[i];
            const slot2 = TEACHING_SLOTS[i + 1];
            if (slot2 - slot1 !== 1) continue; // must be consecutive

            const labRoom = rooms.find(r => r.type === 'Lab' && r.capacity >= cls.studentStrength / 2);
            const room = labRoom || rooms.find(r => r.capacity >= cls.studentStrength / 2) || rooms[0];
            if (!room) continue;

            if (isAvailable(assign.facultyId, room.id, cls.id, day, slot1) &&
                isAvailable(assign.facultyId, room.id, cls.id, day, slot2)) {
              const e1: TimetableEntry = {
                id: `${cls.id}-${day}-${slot1}`,
                day, slotIndex: slot1,
                subjectId: assign.subject.id,
                facultyId: assign.facultyId,
                roomId: room.id,
                classId: cls.id,
                isLab: true,
              };
              const e2: TimetableEntry = {
                id: `${cls.id}-${day}-${slot2}`,
                day, slotIndex: slot2,
                subjectId: assign.subject.id,
                facultyId: assign.facultyId,
                roomId: room.id,
                classId: cls.id,
                isLab: true,
              };
              entries.push(e1, e2);
              occupy(e1);
              occupy(e2);
              placed++;
              subjectDayCount.get(assign.subject.id)!.set(day, currentDayCount + 1);
              break;
            }
          }
        } else {
          // Theory: find any available slot
          const shuffledSlots = [...TEACHING_SLOTS].sort(() => Math.random() - 0.5);
          for (const slot of shuffledSlots) {
            const room = rooms.find(r => r.type === 'Classroom' && r.capacity >= cls.studentStrength) || rooms[0];
            if (!room) continue;

            if (isAvailable(assign.facultyId, room.id, cls.id, day, slot)) {
              const entry: TimetableEntry = {
                id: `${cls.id}-${day}-${slot}`,
                day, slotIndex: slot,
                subjectId: assign.subject.id,
                facultyId: assign.facultyId,
                roomId: room.id,
                classId: cls.id,
              };
              entries.push(entry);
              occupy(entry);
              placed++;
              subjectDayCount.get(assign.subject.id)!.set(day, currentDayCount + 1);
              break;
            }
          }
        }
      }

      if (placed < assign.slotsNeeded) {
        conflicts.push(`Could not place all slots for ${assign.subject.name} (${assign.subject.code}) in ${cls.sectionName}: ${placed}/${assign.slotsNeeded}`);
      }
    }
  }

  // Compute stats
  const facultyUtilization: Record<string, number> = {};
  for (const f of faculty) {
    const totalSlots = entries.filter(e => e.facultyId === f.id).length;
    facultyUtilization[f.id] = totalSlots;
  }

  return {
    success: conflicts.length === 0,
    entries,
    conflicts,
    stats: {
      totalSlotsFilled: entries.length,
      facultyUtilization,
    },
  };
}
