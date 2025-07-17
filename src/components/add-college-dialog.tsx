'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollegeData } from '@/contexts/college-data-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, PlusCircle } from 'lucide-react';

const formSchema = z.object({
  collegeName: z.string().min(2, {
    message: 'College name must be at least 2 characters.',
  }),
});

export function AddCollegeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addCollege, setSelectedCollegeId, isAiLoading } = useCollegeData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newCollege = await addCollege(values.collegeName);
      toast({
        title: 'College Added!',
        description: `${values.collegeName} has been added to your list.`,
      });
      setSelectedCollegeId(newCollege.id);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem fetching college data. Please try again.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add College
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New College</DialogTitle>
          <DialogDescription>
            Enter the name of a college to track. We&apos;ll use AI to find its information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="collegeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Harvard University" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isAiLoading}>
                {isAiLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isAiLoading ? 'Searching...' : 'Add College'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
