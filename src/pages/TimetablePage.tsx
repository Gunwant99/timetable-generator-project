import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TimetableGrid } from '@/components/TimetableGrid';
import { useTimetableStore } from '@/store/timetableStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, FileSpreadsheet, Printer } from 'lucide-react';

const TimetablePage = () => {
  const { 
    classes, 
    faculty, 
    subjects, 
    rooms, 
    timetableEntries, 
    selectedClass, 
    setSelectedClass, 
    setTimetableEntries 
  } = useTimetableStore();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast.info("Generating intelligent timetable...");

    try {
      const generateRes = await fetch('http://127.0.0.1:5000/api/generate', { method: 'POST' });
      const generateData = await generateRes.json();

      // ALWAYS fetch the new entries, even if there are conflicts, so you can see what got filled
      const entriesRes = await fetch('http://127.0.0.1:5000/api/timetable');
      const entriesData = await entriesRes.json();
      setTimetableEntries(entriesData);

      if (generateData.success) {
        toast.success("Timetable generated successfully with 100% placement!");
      } else {
        // Show EXACTLY what caused the conflict!
        toast.warning("Generated with missing slots:", {
          description: generateData.conflicts.slice(0, 3).join(' | ') + (generateData.conflicts.length > 3 ? '...' : ''),
          duration: 10000, // Keep it on screen longer so you can read it
        });
      }
    } catch (error) {
      toast.error("Error communicating with backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 100% Reliable React-based CSV Generator
  const handleExportCSV = () => {
    if (!timetableEntries || timetableEntries.length === 0) {
      toast.error("No timetable data to export! Please generate a timetable first.");
      return;
    }

    const headers = ['Day', 'Time Slot', 'Subject', 'Faculty', 'Room', 'Class Section'];
    
    const csvRows = timetableEntries.map(entry => {
      // Map the IDs back to the actual readable names
      const sub = subjects.find(s => s.id === entry.subjectId)?.name || 'Unknown Subject';
      const fac = faculty.find(f => f.id === entry.facultyId)?.name || 'Unknown Faculty';
      const room = rooms.find(r => r.id === entry.roomId)?.roomNumber || 'Unknown Room';
      const cls = classes.find(c => c.id === entry.classId)?.sectionName || 'Unknown Class';
      
      // Wrap in quotes to prevent issues with commas in names
      return `"${entry.day}","Slot ${entry.slotIndex}","${sub}","${fac}","${room}","${cls}"`;
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Official_College_Timetable.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Downloaded Successfully!");
  };

  // Trigger the browser's PDF engine
  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* The "print:hidden" class ensures buttons don't show up on the final PDF */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Timetable Generator</h1>
            <p className="text-sm text-muted-foreground">Automatic scheduling with manual overrides</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedClass || ''} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Select Section" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.sectionName}</SelectItem>))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Save as PDF
            </Button>

            <Button onClick={handleGenerate} disabled={isGenerating} className="gradient-primary text-white">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate AI Schedule'}
            </Button>
          </div>
        </div>

        {/* This block handles the professional PDF layout */}
        <div className="bg-white rounded-xl shadow-sm border p-4 overflow-hidden print-container">
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold uppercase">St. Vincent Pallotti College of Engineering</h1>
            <h2 className="text-lg">Department Timetable</h2>
          </div>
          <TimetableGrid />
        </div>
      </div>
    </AppLayout>
  );
};

export default TimetablePage;