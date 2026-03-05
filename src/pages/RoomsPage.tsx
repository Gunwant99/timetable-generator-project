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
import type { Room } from '@/types/timetable';

const RoomsPage = () => {
  const { rooms, addRoom, removeRoom } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('60');
  const [type, setType] = useState<'Classroom' | 'Lab'>('Classroom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!roomNumber) {
      toast.error("Room Number is required");
      return;
    }

    setIsSubmitting(true);

    const newRoom: Room = {
      id: `r${Date.now()}`,
      roomNumber, 
      capacity: parseInt(capacity) || 60, 
      type,
      building: 'Main' // Adding a default value since it's in your model
    };

    try {
      await addRoom(newRoom);
      toast.success("Room added successfully!");
      setRoomNumber(''); 
      setCapacity('60'); 
      setType('Classroom');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add room to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Rooms & Labs</h1>
            <p className="text-sm text-muted-foreground">Manage available spaces</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent text-accent-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Add Room</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Room Number</Label><Input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="CR-104" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Capacity</Label><Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as 'Classroom' | 'Lab')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Classroom">Classroom</SelectItem>
                        <SelectItem value="Lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAdd} disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground border-0">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{r.roomNumber}</p>
                  <p className="text-xs text-muted-foreground">Cap: {r.capacity} · {r.type}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeRoom(r.id)} className="text-muted-foreground hover:text-destructive">
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

export default RoomsPage;