'use client';

import { KeyRound, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AddCollegeDialog } from './add-college-dialog';
import { useCollegeData } from '@/contexts/college-data-context';
import { CompassIcon } from './icons';

export function AppHeader() {
  const { apiKey, setApiKey } = useCollegeData();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <CompassIcon className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          College Compass
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Manage your application settings.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">Gemini API Key</Label>
                <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <AddCollegeDialog />
      </div>
    </header>
  );
}
