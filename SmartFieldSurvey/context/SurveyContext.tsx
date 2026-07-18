import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import { Survey, mockSurveys } from '@/constants/data';

const PROFILE_IMAGE_FILE = `${FileSystem.documentDirectory}profile_image.json`;
const SURVEYS_FILE = `${FileSystem.documentDirectory}surveys.json`;

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
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    FileSystem.readAsStringAsync(SURVEYS_FILE)
      .then((data) => {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSurveys(parsed);
        }
      })
      .catch(() => {})
      .finally(() => { loadedRef.current = true; });

    FileSystem.readAsStringAsync(PROFILE_IMAGE_FILE)
      .then((data) => {
        const parsed = JSON.parse(data);
        if (parsed?.uri) setProfileImageState(parsed.uri);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (loadedRef.current) {
      FileSystem.writeAsStringAsync(SURVEYS_FILE, JSON.stringify(surveys));
    }
  }, [surveys]);

  const setProfileImage = useCallback((imageUri: string | null) => {
    setProfileImageState(imageUri);
    if (imageUri) {
      FileSystem.writeAsStringAsync(PROFILE_IMAGE_FILE, JSON.stringify({ uri: imageUri }));
    } else {
      FileSystem.deleteAsync(PROFILE_IMAGE_FILE, { idempotent: true });
    }
  }, []);

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
