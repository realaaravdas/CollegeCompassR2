import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Compass className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">College Compass</h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-gray-50/50">
        <div className="max-w-3xl mx-auto">
          <div 
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5"
            data-ai-hint="compass logo"
          >
            <Compass className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-headline text-gray-800 mb-4 leading-tight">
            Navigate Your College Applications with Confidence
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            College Compass is your AI-powered copilot, simplifying your application journey. Track deadlines, manage essays, and estimate your admission chances—all in one place.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Sign in with Google to securely save your progress.
          </p>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} College Compass. All rights reserved.</p>
      </footer>
    </div>
  );
}
