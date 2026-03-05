import { AppLayout } from '@/components/AppLayout';
import { useTimetableStore } from '@/store/timetableStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ClassSection } from '@/types/timetable';

const ClassesPage = () => {
  const { classes, addClass, removeClass } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [strength, setStrength] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!sectionName) {
      toast.error("Please enter a section name");
      return;
    }
    
    setIsSubmitting(true);
    
    const newClass: ClassSection = {
      id: `c${Date.now()}`,
      sectionName, 
      semester: 3, 
      department: 'CSE',
      studentStrength: parseInt(strength) || 60,
    };

    try {
      await addClass(newClass);
      toast.success("Class added successfully!");
      setSectionName(''); 
      setStrength('60');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save class to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Classes & Sections</h1>
            <p className="text-sm text-muted-foreground">Manage student sections</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent text-accent-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Add Class Section</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Section Name</Label><Input value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="CSE-C" /></div>
                <div><Label>Student Strength</Label><Input type="number" value={strength} onChange={e => setStrength(e.target.value)} /></div>
                <Button onClick={handleAdd} disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground border-0">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Class'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div key={c.id} className="glass-card rounded-xl p-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{c.sectionName}</p>
                  <p className="text-xs text-muted-foreground">Sem {c.semester} · {c.studentStrength} students</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeClass(c.id)} className="text-muted-foreground hover:text-destructive">
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

export default ClassesPage;