'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';
import type { College } from '@/lib/types';

import { populateCollegeInfo } from '@/ai/flows/populate-college-info';
import { estimateAcceptanceRate as estimateAcceptanceRateFlow } from '@/ai/flows/estimate-acceptance-rate';
import { useToast } from '@/hooks/use-toast';

interface CollegeDataContextType {
  colleges: College[];
  setColleges: React.Dispatch<React.SetStateAction<College[]>>;
  selectedCollegeId: string | null;
  setSelectedCollegeId: (id: string | null) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isAiLoading: boolean;
  addCollege: (collegeName: string) => Promise<College>;
  updateCollege: (collegeId: string, data: Partial<Omit<College, 'id'>>) => void;
  deleteCollege: (collegeId: string) => Promise<void>;
  estimateAcceptanceRate: (college: College) => Promise<void>;
}

const CollegeDataContext = createContext<CollegeDataContextType | undefined>(undefined);

export function CollegeDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();


  const saveColleges = async (updatedColleges: College[]) => {
    try {
        await fetch('/api/colleges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colleges: updatedColleges }),
        });
    } catch (error) {
        console.error('Failed to save colleges:', error);
        toast({
            variant: 'destructive',
            title: 'Save Error',
            description: 'Could not save your college list changes.',
        });
    }
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to be resolved
    if (!user) {
      setColleges([]);
      setSelectedCollegeId(null);
      return;
    }

    const fetchColleges = async () => {
        try {
            const res = await fetch('/api/colleges');
            if(res.ok) {
                const data = await res.json();
                setColleges(data.colleges || []);
                 if (data.colleges.length > 0 && !selectedCollegeId) {
                    setSelectedCollegeId(data.colleges[0].id);
                 }
            }
        } catch (error) {
            console.error('Failed to fetch colleges:', error);
        }
    };
    fetchColleges();
  }, [user, authLoading, selectedCollegeId]);


  const updateCollege = useCallback(async (collegeId: string, data: Partial<College>) => {
    setColleges(prev => {
        const newColleges = prev.map(c => c.id === collegeId ? { ...c, ...data } : c);
        saveColleges(newColleges);
        return newColleges;
    });
  }, []);

  const addCollege = useCallback(
    async (collegeName: string): Promise<College> => {
      if (!user) throw new Error("User not authenticated");
      setIsAiLoading(true);
      try {
        const collegeInfo = await populateCollegeInfo({ collegeName }, { apiKey });
        const newCollegeId = collegeName.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

        const newCollege: College = {
          id: newCollegeId,
          name: collegeName,
          ...collegeInfo,
          essays: [],
          numberOfEssays: 0,
        };
        
        setColleges(prev => {
            const newColleges = [...prev, newCollege];
            saveColleges(newColleges);
            return newColleges;
        });
        
        return newCollege;
      } finally {
        setIsAiLoading(false);
      }
    },
    [user, apiKey]
  );

  const deleteCollege = useCallback(async (collegeId: string) => {
      if (!user) return;
      setColleges(prev => {
        const newColleges = prev.filter(c => c.id !== collegeId);
        saveColleges(newColleges);
        return newColleges;
      });
  }, [user]);

  const estimateAcceptanceRate = useCallback(async (college: College) => {
    if (!college.gpa || !college.testScore || !college.selectedMajor) {
      throw new Error('GPA, test score, and major must be selected.');
    }
    setIsAiLoading(true);
    try {
      const result = await estimateAcceptanceRateFlow({
        collegeName: college.name,
        major: college.selectedMajor,
        gpa: college.gpa,
        testScore: college.testScore,
      }, { apiKey });
      
      updateCollege(college.id, {
        estimatedAcceptanceRate: {
          rate: result.acceptanceRateEstimate,
          reasoning: result.reasoning,
        },
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [apiKey, updateCollege]);


  const value = useMemo(
    () => ({
      colleges,
      setColleges,
      selectedCollegeId,
      setSelectedCollegeId,
      apiKey,
      setApiKey,
      isAiLoading,
      addCollege,
      updateCollege,
      deleteCollege,
      estimateAcceptanceRate,
    }),
    [colleges, selectedCollegeId, apiKey, isAiLoading, addCollege, updateCollege, deleteCollege, estimateAcceptanceRate]
  );

  return (
    <CollegeDataContext.Provider value={value}>
      {children}
    </CollegeDataContext.Provider>
  );
}

export function useCollegeData() {
  const context = useContext(CollegeDataContext);
  if (context === undefined) {
    throw new Error('useCollegeData must be used within a CollegeDataProvider');
  }
  return context;
}
