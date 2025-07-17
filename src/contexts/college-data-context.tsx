'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { useAuth } from './auth-context';
import type { College } from '@/lib/types';
import { db } from '@/lib/firebase-config';

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
  updateCollege: (collegeId: string, data: Partial<Omit<College, 'id'>>) => void;
  deleteCollege: (collegeId: string) => Promise<void>;
  estimateAcceptanceRate: (college: College) => Promise<void>;
}

const CollegeDataContext = createContext<CollegeDataContextType | undefined>(undefined);

export function CollegeDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setColleges([]);
      setSelectedCollegeId(null);
      return;
    }

    const collRef = collection(db, 'users', user.uid, 'colleges');
    const unsubscribe = onSnapshot(collRef, (snapshot) => {
      const collegesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
      setColleges(collegesData);
      
      if (collegesData.length > 0 && !snapshot.docs.find(d => d.id === selectedCollegeId)) {
        setSelectedCollegeId(collegesData[0].id);
      } else if (collegesData.length === 0) {
        setSelectedCollegeId(null);
      }
    });

    return () => unsubscribe();
  }, [user, selectedCollegeId]);


  const updateCollege = useCallback(async (collegeId: string, data: Partial<College>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'colleges', collegeId);
    await setDoc(docRef, data, { merge: true });
  }, [user]);

  const addCollege = useCallback(
    async (collegeName: string): Promise<College> => {
      if (!user) throw new Error("User not authenticated");
      setIsAiLoading(true);
      try {
        const collegeInfo = await populateCollegeInfo({ collegeName }, { apiKey });
        const newCollegeId = doc(collection(db, 'users', user.uid, 'colleges')).id;
        const newCollege: College = {
          id: newCollegeId,
          name: collegeName,
          ...collegeInfo,
          essays: [],
          numberOfEssays: 0,
        };

        const docRef = doc(db, 'users', user.uid, 'colleges', newCollege.id);
        await setDoc(docRef, newCollege);
        
        return newCollege;
      } finally {
        setIsAiLoading(false);
      }
    },
    [user, apiKey]
  );

  const deleteCollege = useCallback(async (collegeId: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'colleges', collegeId));
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
