import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  currentProject: 'clepsydra' | 'path4med' | null;
  setCurrentProject: (project: 'clepsydra' | 'path4med' | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<'clepsydra' | 'path4med' | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: AppContextType = {
    currentProject,
    setCurrentProject,
    theme,
    toggleTheme,
    language,
    setLanguage,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 