import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Survey, mockSurveys } from '@/constants/data';

interface SurveyContextType {
  surveys: Survey[];
  currentSurvey: Partial<Survey>;
  selectedSurvey: Survey | null;
  profileImage: string | null;
  setCurrentSurvey: (survey: Partial<Survey>) => void;
  setSelectedSurvey: (survey: Survey | null) => void;
  setProfileImage: (imageUri: string | null) => void;
  addSurvey: (survey: Survey) => void;
  deleteSurvey: (id: string) => void;
  updateSurvey: (id: string, updates: Partial<Survey>) => void;
  resetCurrentSurvey: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

const initialSurvey: Partial<Survey> = {
  siteName: '',
  clientName: '',
  description: '',
  priority: 'Medium',
  date: new Date().toISOString().split('T')[0],
  status: 'Pending',
};

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [currentSurvey, setCurrentSurvey] = useState<Partial<Survey>>({ ...initialSurvey });
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const addSurvey = (survey: Survey) => {
    setSurveys((prev) => [survey, ...prev]);
  };

  const deleteSurvey = (id: string) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSurvey = (id: string, updates: Partial<Survey>) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const resetCurrentSurvey = () => {
    setCurrentSurvey({ ...initialSurvey });
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        currentSurvey,
        selectedSurvey,
        profileImage,
        setCurrentSurvey,
        setSelectedSurvey,
        setProfileImage,
        addSurvey,
        deleteSurvey,
        updateSurvey,
        resetCurrentSurvey,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}
