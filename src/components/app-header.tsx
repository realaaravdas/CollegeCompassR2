'use client';

import { useState, useEffect } from 'react';
import { KeyRound, LogOut, Settings, User, CheckCircle, AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { AddCollegeDialog } from './add-college-dialog';
import { useCollegeData } from '@/contexts/college-data-context';
import { useAuth } from '@/contexts/auth-context';
import { CompassIcon } from './icons';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const { apiKey, setApiKey, testApiKey, isTestingKey } = useCollegeData();
  const { user, logout } = useAuth();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const { toast } = useToast();

  useEffect(() => {
    // Sync local state when context state changes
    setLocalApiKey(apiKey);
  }, [apiKey]);


  const handleSaveKey = () => {
    setApiKey(localApiKey);
    toast({
      title: 'API Key Saved',
      description: 'Your Gemini API key has been saved in this browser.',
    });
  };

  const handleTestKey = async () => {
    const { success, message } = await testApiKey(apiKey); // Use the saved key from context
    if (success) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" /> API Key Test
          </div>
        ),
        description: message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle /> API Key Test Failed
          </div>
        ),
        description: message,
      });
    }
  };


  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
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
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                  />
                </div>
                <div className='flex gap-2 justify-end'>
                  <Button variant="outline" onClick={handleTestKey} disabled={isTestingKey || !apiKey}>
                    {isTestingKey ? <LoaderCircle className="animate-spin"/> : 'Test'}
                  </Button>
                  <Button onClick={handleSaveKey} disabled={!localApiKey}>Save</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <AddCollegeDialog />

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.username ?? 'User'} />
                        <AvatarFallback>
                            {user?.username?.[0].toUpperCase() ?? <User />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
