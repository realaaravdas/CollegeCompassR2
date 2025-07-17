'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { College } from '@/lib/types';
import { populateCollegeInfo } from '@/ai/flows/populate-college-info';
import { estimateAcceptanceRate as estimateAcceptanceRateFlow } from '@/ai/flows/estimate-acceptance-rate';

interface CollegeDataContextType {
  colleges: College[];
  setColleges: React.Dispatch<React.SetStateAction<College[]>>;
  selectedCollegeId: string | null;
  setSelectedCollegeId: (id: string | null) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isAiLoading: boolean;
  addCollege: (collegeName: string) => Promise<College>;
  updateCollege: (collegeId: string, data: Partial<College>) => void;
  estimateAcceptanceRate: (college: College) => Promise<void>;
}

const CollegeDataContext = createContext<CollegeDataContextType | undefined>(undefined);

export function CollegeDataProvider({ children }: { children: ReactNode }) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const updateCollege = useCallback((collegeId: string, data: Partial<College>) => {
    setColleges((prev) =>
      prev.map((c) => (c.id === collegeId ? { ...c, ...data } : c))
    );
  }, []);

  const addCollege = useCallback(
    async (collegeName: string): Promise<College> => {
      setIsAiLoading(true);
      try {
        const collegeInfo = await populateCollegeInfo({ collegeName }, { apiKey });
        const newCollege: College = {
          id: Date.now().toString(),
          name: collegeName,
          ...collegeInfo,
          essays: [],
          numberOfEssays: 0,
        };
        setColleges((prev) => [...prev, newCollege]);
        return newCollege;
      } finally {
        setIsAiLoading(false);
      }
    },
    [apiKey]
  );

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
      estimateAcceptanceRate,
    }),
    [colleges, selectedCollegeId, apiKey, isAiLoading, addCollege, updateCollege, estimateAcceptanceRate]
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
