import { AppLayout } from '@/components/AppLayout';
import { useTimetableStore } from '@/store/timetableStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2dd4bf', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const AnalyticsPage = () => {
  const { faculty, subjects, rooms, timetableEntries, isGenerated } = useTimetableStore();

  const facultyLoadData = faculty.map(f => ({
    name: f.shortCode,
    hours: timetableEntries.filter(e => e.facultyId === f.id).length,
  }));

  const subjectDistData = subjects.map(s => ({
    name: s.code,
    value: timetableEntries.filter(e => e.subjectId === s.id).length,
  })).filter(d => d.value > 0);

  const roomUtilData = rooms.map(r => {
    const used = timetableEntries.filter(e => e.roomId === r.id).length;
    const total = 6 * 7; // 6 days * ~7 teaching slots
    return { name: r.roomNumber, utilization: Math.round((used / total) * 100) };
  });

  if (!isGenerated) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Generate a timetable first to view analytics.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Faculty load, room usage & subject distribution</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Faculty Load */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display text-base font-semibold mb-4">Faculty Weekly Load (hrs)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={facultyLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(174 62% 42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Distribution */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display text-base font-semibold mb-4">Subject Slot Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={subjectDistData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name }) => name}>
                  {subjectDistData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Room Utilization */}
          <div className="glass-card rounded-xl p-5 lg:col-span-2">
            <h3 className="font-display text-base font-semibold mb-4">Room Utilization (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roomUtilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="utilization" fill="hsl(222 60% 18%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
