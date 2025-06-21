
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/dictionaries/en.json';
import ha from '@/dictionaries/ha.json';
import ig from '@/dictionaries/ig.json';
import yo from '@/dictionaries/yo.json';

type Locale = 'en' | 'ha' | 'ig' | 'yo';

const dictionaries: Record<Locale, any> = {
  en,
  ha,
  ig,
  yo,
};

const i18nConfig = {
  locales: ['en', 'ha', 'ig', 'yo'],
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [dictionary, setDictionary] = useState(dictionaries.en);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && i18nConfig.locales.includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('locale', locale);
      setDictionary(dictionaries[locale] || dictionaries.en);
    }
  }, [locale, isMounted]);

  const value = { locale, setLocale, dictionary };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
