import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, BookOpen, DoorOpen, GraduationCap, BarChart3, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/timetable', icon: Calendar, label: 'Timetable' },
  { to: '/faculty', icon: Users, label: 'Faculty' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/classes', icon: GraduationCap, label: 'Classes' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-hero flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
          <Zap className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-primary-foreground">SmartTT</h1>
          <p className="text-xs text-sidebar-foreground/60">Timetable Generator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('h-4.5 w-4.5', isActive && 'text-sidebar-primary')} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-accent text-xs font-bold text-accent-foreground">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
            <p className="text-xs text-sidebar-foreground/50">Dept. Coordinator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
