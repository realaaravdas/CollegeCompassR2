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
import { BarChart, CalendarDays, ExternalLink, FileText, LoaderCircle, Percent, Sparkles, Target } from 'lucide-react';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';

export function CollegeDetailsView() {
  const { colleges, selectedCollegeId, updateCollege, estimateAcceptanceRate, isAiLoading } = useCollegeData();
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
    if (!college.gpa || !college.testScore || !college.selectedMajor) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide your GPA, a test score, and select a major to estimate your chances.',
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

  const completedEssays = college.essays.filter(e => e.completed).length;
  const essayProgress = college.numberOfEssays > 0 ? (completedEssays / college.numberOfEssays) * 100 : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-start gap-6">
        <Image
          src={college.imageUrl || 'https://placehold.co/128x128.png'}
          alt={college.name}
          width={128}
          height={128}
          className="rounded-lg border object-cover h-32 w-32"
          data-ai-hint="university building"
        />
        <div className="flex-1">
          <h2 className="text-3xl font-bold font-headline">{college.name}</h2>
          <Button variant="link" asChild className="px-0 h-auto">
            <a href={college.applicationPortal} target="_blank" rel="noopener noreferrer">
              Application Portal <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary"><CalendarDays className="mr-1.5 h-3 w-3" />Deadlines: {college.deadlines}</Badge>
            <Badge variant="secondary"><BarChart className="mr-1.5 h-3 w-3" />Acceptance: {college.acceptanceRate}</Badge>
          </div>
        </div>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>AI Acceptance Rate Estimator</CardTitle>
            <CardDescription>
              Input your scores to get an AI-powered admission chance estimate for your chosen major.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gpa">Your GPA</Label>
                <Input id="gpa" type="number" step="0.1" placeholder="e.g., 3.8" value={college.gpa || ''} onChange={(e) => updateCollege(college.id, { gpa: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-score">SAT/ACT Score</Label>
                <Input id="test-score" type="number" placeholder="e.g., 1500" value={college.testScore || ''} onChange={(e) => updateCollege(college.id, { testScore: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="major">Intended Major</Label>
                <Select value={college.selectedMajor} onValueChange={(value) => updateCollege(college.id, { selectedMajor: value })}>
                    <SelectTrigger id="major">
                        <SelectValue placeholder="Select a major" />
                    </SelectTrigger>
                    <SelectContent>
                        {college.majors.map((major) => (
                            <SelectItem key={major} value={major}>{major}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleEstimateClick} disabled={isAiLoading}>
                {isAiLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Estimate My Chances
            </Button>
            {isAiLoading && college.estimatedAcceptanceRate === undefined && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-center">
                        <Skeleton className="h-20 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            )}
            {college.estimatedAcceptanceRate && (
                <Card className="bg-accent/30 mt-4">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <Target className="h-6 w-6 text-primary"/>
                        <CardTitle>Your Estimated Rate: {college.estimatedAcceptanceRate.rate}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{college.estimatedAcceptanceRate.reasoning}</p>
                    </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>

        <Card>
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
      </div>
    </div>
  );
}
