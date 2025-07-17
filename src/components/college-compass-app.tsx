'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from './app-header';
import { CollegeSidebar } from './college-sidebar';
import { CollegeDetailsView } from './college-details-view';
import { EmptyState } from './empty-state';
import { useCollegeData } from '@/contexts/college-data-context';

export function CollegeCompassApp() {
  const { selectedCollegeId, colleges } = useCollegeData();
  const selectedCollege = colleges.find(c => c.id === selectedCollegeId);

  return (
    <SidebarProvider>
        <CollegeSidebar />
        <SidebarInset className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 flex flex-col bg-background">
                {selectedCollege ? <CollegeDetailsView /> : <EmptyState />}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
