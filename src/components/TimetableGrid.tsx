import { useTimetableStore } from '@/store/timetableStore';
import { DAYS, DEFAULT_TIME_SLOTS } from '@/types/timetable';
import { cn } from '@/lib/utils';

export function TimetableGrid() {
  const { timetableEntries, subjects, faculty, rooms, selectedClass, isGenerated } = useTimetableStore();

  const classEntries = timetableEntries.filter(e => e.classId === selectedClass);

  if (!isGenerated) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">No Timetable Generated</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Go to the Dashboard and click "Generate Timetable" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="gradient-primary">
              <th className="px-3 py-3 text-left text-xs font-semibold text-primary-foreground border-r border-primary-foreground/10 w-24">
                Time
              </th>
              {DAYS.map((day) => (
                <th key={day} className="px-3 py-3 text-center text-xs font-semibold text-primary-foreground border-r border-primary-foreground/10 last:border-r-0">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEFAULT_TIME_SLOTS.map((slot) => (
              <tr key={slot.index} className={cn(slot.isBreak && 'slot-break')}>
                <td className="px-3 py-2 text-xs font-medium text-muted-foreground border-r border-border whitespace-nowrap">
                  {slot.label}
                </td>
                {DAYS.map((day) => {
                  if (slot.isBreak) {
                    return (
                      <td key={day} className="px-2 py-2 text-center text-xs text-muted-foreground border-r border-border last:border-r-0">
                        {slot.label}
                      </td>
                    );
                  }

                  const entry = classEntries.find(e => e.day === day && e.slotIndex === slot.index);
                  if (!entry) {
                    return <td key={day} className="px-2 py-2 border-r border-border last:border-r-0" />;
                  }

                  const sub = subjects.find(s => s.id === entry.subjectId);
                  const fac = faculty.find(f => f.id === entry.facultyId);
                  const room = rooms.find(r => r.id === entry.roomId);

                  return (
                    <td key={day} className="px-1.5 py-1.5 border-r border-border last:border-r-0">
                      <div
                        className={cn(
                          'rounded-lg px-2 py-1.5 text-xs border transition-all hover:scale-[1.02]',
                          entry.isLab ? 'slot-lab' : 'slot-theory'
                        )}
                        style={sub?.color ? {
                          backgroundColor: `${sub.color}15`,
                          borderColor: `${sub.color}40`,
                          color: sub.color,
                        } : undefined}
                      >
                        <p className="font-semibold truncate">{sub?.code || 'N/A'}</p>
                        <p className="truncate opacity-80">{fac?.shortCode}</p>
                        <p className="truncate opacity-60">{room?.roomNumber}</p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
