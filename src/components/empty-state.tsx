import { GraduationCap } from 'lucide-react';
import { AddCollegeDialog } from './add-college-dialog';

export function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <div className="bg-primary/10 p-4 rounded-full">
          <GraduationCap className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold font-headline tracking-tight">
          Your journey starts here
        </h3>
        <p className="text-muted-foreground max-w-sm">
          You haven&apos;t added any colleges yet. Add your first college to start tracking your applications.
        </p>
        <AddCollegeDialog />
      </div>
    </div>
  );
}
