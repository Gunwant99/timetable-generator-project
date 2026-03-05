import { AppLayout } from '@/components/AppLayout';
import { useTimetableStore } from '@/store/timetableStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Subject, SubjectType } from '@/types/timetable';
import { SUBJECT_COLORS } from '@/types/timetable';

const SubjectsPage = () => {
  const { subjects, addSubject, removeSubject, faculty } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('3');
  const [type, setType] = useState<SubjectType>('Theory');
  const [facultyId, setFacultyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!name || !code) {
      toast.error("Subject Name and Code are required");
      return;
    }

    setIsSubmitting(true);

    const newSubject: Subject = {
      id: `s${Date.now()}`,
      name, 
      code, 
      credits: parseInt(credits) || 3, 
      type,
      semester: 3, 
      department: 'CSE', 
      facultyId: facultyId || undefined,
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
    };

    try {
      await addSubject(newSubject);
      toast.success("Subject added successfully!");
      setName(''); 
      setCode(''); 
      setCredits('3'); 
      setType('Theory'); 
      setFacultyId('');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save subject. Check your backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Subjects</h1>
            <p className="text-sm text-muted-foreground">Manage course offerings</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent text-accent-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add Subject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Subject Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Data Structures" /></div>
                <div><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="CS301" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Credits</Label><Input type="number" value={credits} onChange={e => setCredits(e.target.value)} min={1} max={6} /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as SubjectType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Theory">Theory</SelectItem>
                        <SelectItem value="Lab">Lab</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Assigned Faculty</Label>
                  <Select value={facultyId} onValueChange={setFacultyId}>
                    <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                    <SelectContent>
                      {faculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground border-0">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Subject'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s.id} className="glass-card rounded-xl p-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.code} · {s.credits} cr · {s.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeSubject(s.id)} className="text-muted-foreground hover:text-destructive">
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

export default SubjectsPage;