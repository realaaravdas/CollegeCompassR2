
'use client';

import Image from 'next/image';
import { useCollegeData } from '@/contexts/college-data-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { BarChart, CalendarDays, ExternalLink, FileText, Globe, GraduationCap, Home, LoaderCircle, Sparkles, Target, UserCheck } from 'lucide-react';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { Residency } from '@/lib/types';

function getCollegeInitials(name: string) {
  const words = name.split(' ');
  if (words.length > 1) {
    return words
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}


export function CollegeDetailsView() {
  const { colleges, selectedCollegeId, updateCollege, estimateAcceptanceRate, generateStudentProfile, isAiLoading, isProfileLoading } = useCollegeData();
  const { toast } = useToast();

  const college = colleges.find((c) => c.id === selectedCollegeId);

  if (!college) return null;

  const handleEssayNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 0;
    const newEssays = Array.from({ length: count }, (_, i) => ({
      id: `${college.id}-essay-${i}`,
      title: `Essay ${i + 1}`,
      completed: college.essays[i]?.completed || false,
    }));
    updateCollege(college.id, { numberOfEssays: count, essays: newEssays });
  };
  
  const handleEssayCheckChange = (essayId: string, checked: boolean) => {
    const updatedEssays = college.essays.map(essay => 
      essay.id === essayId ? {...essay, completed: checked} : essay
    );
    updateCollege(college.id, { essays: updatedEssays });
  };

  const handleEstimateClick = async () => {
    if (!college.gpa || !college.testScore || !college.selectedMajor || !college.residency) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide your GPA, a test score, residency, and select a major to estimate your chances.',
      });
      return;
    }
    try {
      await estimateAcceptanceRate(college);
      toast({
        title: 'Estimate Complete!',
        description: 'AI has estimated your acceptance rate.',
      });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Estimation Failed',
            description: 'Could not estimate acceptance rate. Please try again.',
        });
    }
  };

  const handleGenerateProfileClick = async () => {
    if (!college.selectedMajor || !college.residency) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select a major and residency to generate a target profile.',
        });
        return;
    }
    try {
        await generateStudentProfile(college);
        toast({
            title: 'Profile Generated!',
            description: 'AI has generated a target student profile.',
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'Could not generate the student profile. Please try again.',
        });
    }
  };


  const completedEssays = college.essays.filter(e => e.completed).length;
  const essayProgress = college.numberOfEssays > 0 ? (completedEssays / college.numberOfEssays) * 100 : 0;

  const getAcceptanceRateColor = (rateStr: string | number | undefined) => {
    if (rateStr === undefined) return '';
    const rate = typeof rateStr === 'string' ? parseFloat(rateStr.replace('%', '')) : rateStr;
    if (isNaN(rate)) return '';
    if (rate > 50) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    if (rate > 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };
  
  const getRateTitleColor = (rate?: number) => {
    if (rate === undefined) return '';
    if (rate > 50) return 'text-green-600 dark:text-green-500';
    if (rate > 20) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-red-600 dark:text-red-500';
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-start gap-6">
        <Avatar className="h-32 w-32 rounded-lg border">
          <AvatarFallback className="text-4xl rounded-lg">
            {getCollegeInitials(college.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-3xl font-bold font-headline">{college.name}</h2>
          <Button variant="link" asChild className="px-0 h-auto">
            <a href={college.applicationPortal} target="_blank" rel="noopener noreferrer">
              Application Portal <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary"><CalendarDays className="mr-1.5 h-3 w-3" />Deadlines: {college.deadlines}</Badge>
            <Badge variant="secondary" className={cn(getAcceptanceRateColor(college.acceptanceRate))}>
              <BarChart className="mr-1.5 h-3 w-3" />Acceptance: {college.acceptanceRate}
            </Badge>
          </div>
        </div>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText />Essay Tracker</CardTitle>
            <CardDescription>Keep track of your writing progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="essay-count">Number of Essays</Label>
              <Input
                id="essay-count"
                type="number"
                min="0"
                value={college.numberOfEssays || ''}
                onChange={handleEssayNumberChange}
              />
            </div>
            {college.numberOfEssays > 0 && (
              <>
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{completedEssays} of {college.numberOfEssays} done</span>
                    </div>
                    <Progress value={essayProgress} />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {college.essays.map((essay) => (
                    <div key={essay.id} className="flex items-center space-x-2 rounded-md bg-background p-2">
                      <Checkbox
                        id={essay.id}
                        checked={essay.completed}
                        onCheckedChange={(checked) => handleEssayCheckChange(essay.id, !!checked)}
                      />
                      <Label htmlFor={essay.id} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {essay.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="flex flex-col md:col-span-2 xl:col-span-1 max-h-[40rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap />
              Offered Majors
            </CardTitle>
            <CardDescription>A list of majors offered at this college.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <ul className="space-y-2 pr-4">
                {college.majors.map((major, index) => (
                  <li key={`${major}-${index}`} className="text-sm p-2 rounded-md bg-accent/20">
                    {major}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>AI Estimator</CardTitle>
            <CardDescription>
              Get an AI-powered admission chance estimate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="gpa">Your GPA</Label>
                <Input id="gpa" type="number" step="0.1" placeholder="e.g., 3.8" value={college.gpa || ''} onChange={(e) => updateCollege(college.id, { gpa: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
                <Label>SAT/ACT Score</Label>
                <div className="flex gap-2">
                    <Input id="test-score" type="number" placeholder="e.g., 1500" value={college.testScore || ''} onChange={(e) => updateCollege(college.id, { testScore: parseInt(e.target.value) })} />
                    <RadioGroup 
                        defaultValue={college.testType || 'SAT'} 
                        onValueChange={(value: 'SAT' | 'ACT') => updateCollege(college.id, { testType: value })} 
                        className="flex items-center"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SAT" id="r1" />
                            <Label htmlFor="r1">SAT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ACT" id="r2" />
                            <Label htmlFor="r2">ACT</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
             <div className="space-y-2">
              <Label>Residency</Label>
              <RadioGroup
                value={college.residency || 'Out-of-State'}
                onValueChange={(value: Residency) => updateCollege(college.id, { residency: value })}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="In-State" id="in-state" className="peer sr-only" />
                  <Label htmlFor="in-state" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Home className="mb-1 h-5 w-5" />
                    In-State
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="Out-of-State" id="out-of-state" className="peer sr-only" />
                  <Label htmlFor="out-of-state" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Globe className="mb-1 h-5 w-5" />
                    Out-of-State
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="International" id="international" className="peer sr-only" />
                  <Label htmlFor="international" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Globe className="mb-1 h-5 w-5" />
                    Int'l
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label htmlFor="major">Intended Major</Label>
                <Select value={college.selectedMajor} onValueChange={(value) => updateCollege(college.id, { selectedMajor: value })}>
                    <SelectTrigger id="major">
                        <SelectValue placeholder="Select a major" />
                    </SelectTrigger>
                    <SelectContent>
                        {college.majors.map((major, index) => (
                            <SelectItem key={`${major}-${index}`} value={major}>{major}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleEstimateClick} disabled={isAiLoading} className="w-full">
                {isAiLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Estimate My Chances
            </Button>
            {isAiLoading && college.estimatedAcceptanceRate === undefined && (
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            )}
            {college.estimatedAcceptanceRate && (
                <Card className={cn("mt-4", getAcceptanceRateColor(college.estimatedAcceptanceRate.rate))}>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <Target className="h-6 w-6 text-primary"/>
                        <CardTitle className={cn(getRateTitleColor(college.estimatedAcceptanceRate.rate))}>
                            Your Rate: {college.estimatedAcceptanceRate.rate}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{college.estimatedAcceptanceRate.reasoning}</p>
                    </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck className="text-primary"/>Target Profile (50% Chance)</CardTitle>
                <CardDescription>
                    See what an average accepted student looks like for your selected major and residency.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleGenerateProfileClick} disabled={isProfileLoading || !college.selectedMajor} className="w-full">
                    {isProfileLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Target Profile
                </Button>
                {isProfileLoading && !college.studentProfile && (
                     <div className="space-y-4 pt-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                )}
                {college.studentProfile && (
                    <div className="space-y-3 pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">GPA:</span>
                            <span className="font-bold">{college.studentProfile.gpa.toFixed(2)}</span>
                        </div>
                        <Separator />
                         <div className="space-y-1">
                            <span className="font-semibold text-muted-foreground">Activities:</span>
                            <p className="font-medium text-foreground">{college.studentProfile.activities}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">SAT Score:</span>
                            <span className="font-bold">{college.studentProfile.satScore}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">ACT Score:</span>
                            <span className="font-bold">{college.studentProfile.actScore}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>


      </div>
    </div>
  );
}
