import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { useTimetableStore } from '@/store/timetableStore';
import { generateTimetable } from '@/lib/timetableGenerator';
import { Users, BookOpen, DoorOpen, GraduationCap, Calendar, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Dashboard = () => {
  const store = useTimetableStore();
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{ conflicts: string[]; totalSlotsFilled: number } | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const result = generateTimetable(store.subjects, store.faculty, store.rooms, store.classes);
      store.setTimetableEntries(result.entries);
      setLastResult({ conflicts: result.conflicts, totalSlotsFilled: result.stats.totalSlotsFilled });
      setGenerating(false);

      if (result.success) {
        toast.success(`Timetable generated successfully! ${result.stats.totalSlotsFilled} slots filled.`);
      } else {
        toast.warning(`Generated with ${result.conflicts.length} conflict(s). Review in Timetable view.`);
      }
    }, 800);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Department timetable overview & management</p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gradient-accent text-accent-foreground border-0 font-semibold shadow-lg hover:opacity-90 transition-opacity"
          >
            <Zap className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Timetable'}
          </Button>
        </div>

        {/* Stats */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <StatCard title="Faculty" value={store.faculty.length} subtitle="Total teachers" icon={Users} />
          <StatCard title="Subjects" value={store.subjects.length} subtitle={`Sem ${store.selectedSemester}`} icon={BookOpen} />
          <StatCard title="Rooms" value={store.rooms.length} subtitle={`${store.rooms.filter(r => r.type === 'Lab').length} labs`} icon={DoorOpen} />
          <StatCard title="Sections" value={store.classes.length} subtitle="Active classes" icon={GraduationCap} />
        </motion.div>

        {/* Generation Result */}
        {lastResult && (
          <motion.div
            className="glass-card rounded-xl p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-accent" />
              <h2 className="font-display text-lg font-semibold">Generation Result</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                <p className="text-sm font-medium text-success">Slots Filled</p>
                <p className="text-2xl font-display font-bold text-foreground">{lastResult.totalSlotsFilled}</p>
              </div>
              <div className={`rounded-lg p-3 ${lastResult.conflicts.length === 0 ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
                <p className={`text-sm font-medium ${lastResult.conflicts.length === 0 ? 'text-success' : 'text-warning'}`}>Conflicts</p>
                <p className="text-2xl font-display font-bold text-foreground">{lastResult.conflicts.length}</p>
              </div>
            </div>
            {lastResult.conflicts.length > 0 && (
              <div className="mt-3 space-y-1">
                {lastResult.conflicts.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-warning">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Info */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display text-base font-semibold mb-3">Faculty Overview</h3>
            <div className="space-y-2">
              {store.faculty.slice(0, 5).map((f) => {
                const load = store.timetableEntries.filter(e => e.facultyId === f.id).length;
                return (
                  <div key={f.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {f.shortCode.slice(0, 2)}
                      </div>
                      <span className="text-foreground">{f.name}</span>
                    </div>
                    <span className="text-muted-foreground">{load} hrs/week</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display text-base font-semibold mb-3">Subject Distribution</h3>
            <div className="space-y-2">
              {store.subjects.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-foreground">{s.name}</span>
                  </div>
                  <span className="text-muted-foreground">{s.credits} cr · {s.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
