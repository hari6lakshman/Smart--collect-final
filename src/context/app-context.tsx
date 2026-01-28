
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Case, Dca, TimetableEntry } from '@/lib/types';
import { cases as initialCases, dcas as initialDcas, timetable as initialTimetable } from '@/lib/data';
import { useRouter } from 'next/navigation';

type LoggedInUser = (Dca & { role: 'DCA' }) | { id: string; name: string, role: 'Admin' };

interface AppContextType {
  cases: Case[];
  dcas: Dca[];
  timetable: TimetableEntry[];
  loggedInUser: LoggedInUser | null;
  isLoading: boolean;
  addCase: (newCase: Case) => void;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  addDca: (newDca: Dca) => void;
  removeDca: (dcaId: string) => void;
  updateTimetableEntry: (entryId: string, updates: Partial<TimetableEntry>) => void;
  addTimetableEntry: (newEntry: TimetableEntry) => void;
  removeTimetableEntry: (entryId: string) => void;
  setLoggedInUser: (user: LoggedInUser | null) => void;
  login: (username: string, password?: string) => 'admin' | 'dca' | 'not-found' | 'invalid';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [dcas, setDcas] = useState<Dca[]>(initialDcas);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoggedInUser(user);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password?: string) => {
    // Admin login
    if (username === 'admin.com' && password === 'admin@123') {
      const adminUser = { id: username, name: 'Admin', role: 'Admin' as const };
      setLoggedInUser(adminUser);
      localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
      return 'admin';
    }

    // DCA login
    const dca = dcas.find(d => d.username === username);
    if (dca) {
      if (dca.password === password) {
        const dcaUser = { ...dca, role: 'DCA' as const };
        setLoggedInUser(dcaUser);
        localStorage.setItem('loggedInUser', JSON.stringify(dcaUser));
        return 'dca';
      } else {
        return 'invalid'; // Correct user, wrong password
      }
    }

    if (username === 'admin.com') return 'invalid';

    return 'not-found';
  };

  const handleSetLoggedInUser = (user: LoggedInUser | null) => {
    setLoggedInUser(user);
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('loggedInUser');
      router.push('/login');
    }
  }

  const addCase = (newCase: Case) => {
    setCases(prevCases => [...prevCases, newCase]);
  };

  const updateCase = (caseId: string, updates: Partial<Case>) => {
    setCases(prevCases => {
      const newCases = prevCases.map(c => {
        if (c.id === caseId) {
          const updatedCase = { ...c, ...updates };
          if (updates.responseMode) {
            const historyPrefix = c.communicationHistory === 'No contact made yet.' ? '' : `${c.communicationHistory}\n`;
            updatedCase.communicationHistory = `${historyPrefix}- Responded to ${updates.responseMode}.`;
          }
          return updatedCase;
        }
        return c;
      });

      if (updates.status === 'Paid') {
        const paidCase = newCases.find(c => c.id === caseId);
        if (paidCase && paidCase.assignedDcaId) {
          setDcas(prevDcas => prevDcas.map(dca => {
            if (dca.id === paidCase.assignedDcaId) {
              const totalCases = (dca.caseCount || 0) + 1;
              const successfulCases = (dca.caseCount * dca.recoveryRate) + 1;
              const newRecoveryRate = successfulCases / totalCases;
              const newCaseHistory = `${dca.caseHistory}\n- Solved case: ${paidCase.debtorName}, Amount: ₹${paidCase.dueAmount}, Status: Paid.`;
              return {
                ...dca,
                caseCount: totalCases,
                recoveryRate: newRecoveryRate,
                caseHistory: newCaseHistory,
              };
            }
            return dca;
          }));
        }
      }
      return newCases;
    });
  };


  const addDca = (newDca: Dca) => {
    setDcas(prevDcas => [...prevDcas, newDca]);
  };

  const removeDca = (dcaId: string) => {
    setDcas(prevDcas => prevDcas.filter(d => d.id !== dcaId));
    // Unassign cases from the removed DCA
    setCases(prevCases => prevCases.map(c =>
      c.assignedDcaId === dcaId ? { ...c, assignedDcaId: null, status: 'Pending' } : c
    ));
    // Remove timetable entries for the removed DCA
    setTimetable(prevTimetable => prevTimetable.filter(t => t.dcaId !== dcaId));
  };


  const updateTimetableEntry = (entryId: string, updates: Partial<TimetableEntry>) => {
    setTimetable(prevTimetable =>
      prevTimetable.map(entry =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )
    );
  };

  const addTimetableEntry = (newEntry: TimetableEntry) => {
    setTimetable(prevTimetable => [...prevTimetable, newEntry]);
  };

  const removeTimetableEntry = (entryId: string) => {
    setTimetable(prevTimetable => prevTimetable.filter(entry => entry.id !== entryId));
  };

  const value = {
    cases,
    dcas,
    timetable,
    loggedInUser,
    isLoading,
    addCase,
    updateCase,
    addDca,
    removeDca,
    updateTimetableEntry,
    addTimetableEntry,
    removeTimetableEntry,
    setLoggedInUser: handleSetLoggedInUser,
    login,
  };


  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
