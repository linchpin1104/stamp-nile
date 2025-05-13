'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation, adminTranslations } from './translations';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const defaultValue: LanguageContextProps = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isAdmin: false,
  setIsAdmin: () => {},
};

const LanguageContext = createContext<LanguageContextProps>(defaultValue);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we're on the client side before accessing localStorage
  const isBrowser = typeof window !== 'undefined';
  
  // Initialize from localStorage if available, otherwise default to English
  const [language, setLanguageState] = useState<Language>('en');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Load language preference from localStorage on mount
  useEffect(() => {
    if (isBrowser) {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ko')) {
        setLanguageState(savedLanguage);
      }
      
      // Check if current path is in admin section
      const isAdminPath = window.location.pathname.startsWith('/admin');
      setIsAdmin(isAdminPath);
    }
  }, [isBrowser]);
  
  // Update language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isBrowser) {
      localStorage.setItem('language', lang);
      
      // Dispatch a custom event when language changes
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    }
  };
  
  // Translation function
  const t = (key: string): string => {
    // For admin pages, always use Korean
    if (isAdmin) {
      return adminTranslations[key] || key;
    }
    
    // For user pages, use the selected language
    return getTranslation(key, language);
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isAdmin, setIsAdmin }}>
      {children}
    </LanguageContext.Provider>
  );
}; 