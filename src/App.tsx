import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TimetablePage from "./pages/TimetablePage";
import FacultyPage from "./pages/FacultyPage";
import SubjectsPage from "./pages/SubjectsPage";
import RoomsPage from "./pages/RoomsPage";
import ClassesPage from "./pages/ClassesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";
import { useTimetableStore } from "./store/timetableStore";

const queryClient = new QueryClient();

const App = () => {
  const fetchInitialData = useTimetableStore((state) => state.fetchInitialData);

  // This grabs the data from SQL when the page loads
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;