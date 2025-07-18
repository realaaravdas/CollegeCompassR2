
'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCollegeData } from '@/contexts/college-data-context';
import { GraduationCap, Trash2 } from 'lucide-react';
import type { College } from '@/lib/types';

export function CollegeSidebar() {
  const { colleges, selectedCollegeId, setSelectedCollegeId, deleteCollege } = useCollegeData();
  const [collegeToDelete, setCollegeToDelete] = useState<College | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, college: College) => {
    e.stopPropagation(); // Prevent the sidebar item from being selected
    setCollegeToDelete(college);
  };

  const confirmDelete = () => {
    if (collegeToDelete) {
      deleteCollege(collegeToDelete.id);
      setCollegeToDelete(null);
    }
  };

  return (
    <>
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
                <SidebarMenuAction
                  showOnHover={true}
                  onClick={(e) => handleDeleteClick(e, college)}
                  aria-label={`Delete ${college.name}`}
                >
                  <Trash2 className="text-destructive/70 hover:text-destructive" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <AlertDialog open={!!collegeToDelete} onOpenChange={(open) => !open && setCollegeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{collegeToDelete?.name}</span> and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCollegeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
