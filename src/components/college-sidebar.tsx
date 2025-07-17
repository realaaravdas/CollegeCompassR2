'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useCollegeData } from '@/contexts/college-data-context';
import { GraduationCap } from 'lucide-react';

export function CollegeSidebar() {
  const { colleges, selectedCollegeId, setSelectedCollegeId } = useCollegeData();

  return (
    <Sidebar>
      <SidebarHeader>
        {/* The trigger is now in AppHeader.tsx to be always accessible */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {colleges.map((college) => (
            <SidebarMenuItem key={college.id}>
              <SidebarMenuButton
                onClick={() => setSelectedCollegeId(college.id)}
                isActive={selectedCollegeId === college.id}
                tooltip={college.name}
              >
                <GraduationCap />
                <span>{college.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
