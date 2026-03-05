import { AppLayout } from '@/components/AppLayout';
import { useTimetableStore } from '@/store/timetableStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DAYS } from '@/types/timetable';
import type { Faculty, Day } from '@/types/timetable';

const FacultyPage = () => {
  const { faculty, addFaculty, removeFaculty } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [maxHours, setMaxHours] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!name || !shortCode) {
      toast.error("Name and Short Code are required");
      return;
    }

    setIsSubmitting(true);

    const newFaculty: Faculty = {
      id: `f${Date.now()}`,
      name,
      shortCode: shortCode.toUpperCase(),
      department: 'CSE',
      availability: Object.fromEntries(DAYS.map(d => [d, [0, 1, 3, 4, 6, 7, 8]])) as Record<Day, number[]>,
      maxHoursPerDay: parseInt(maxHours) || 5,
    };

    try {
      await addFaculty(newFaculty);
      toast.success("Faculty member added successfully!");
      setName(''); 
      setShortCode(''); 
      setMaxHours('5');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add faculty to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Faculty</h1>
            <p className="text-sm text-muted-foreground">Manage teaching staff</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent text-accent-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add Faculty</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Add Faculty</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. John Smith" /></div>
                <div><Label>Short Code</Label><Input value={shortCode} onChange={e => setShortCode(e.target.value)} placeholder="JSM" maxLength={4} /></div>
                <div><Label>Max Hours/Day</Label><Input type="number" value={maxHours} onChange={e => setMaxHours(e.target.value)} min={1} max={8} /></div>
                <Button onClick={handleAdd} disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground border-0">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Faculty'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {faculty.map((f) => (
            <div key={f.id} className="glass-card rounded-xl p-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {f.shortCode.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.shortCode} · Max {f.maxHoursPerDay}h/day</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFaculty(f.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default FacultyPage;