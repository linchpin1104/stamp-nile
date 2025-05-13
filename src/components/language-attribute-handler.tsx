'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function LanguageAttributeHandler() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Function to update the html lang attribute
    const updateLangAttribute = () => {
      const htmlElement = document.documentElement;
      
      // If on admin pages, always set Korean
      if (pathname.startsWith('/admin')) {
        htmlElement.setAttribute('lang', 'ko');
        return;
      }
      
      // For user pages, check localStorage
      const savedLang = localStorage.getItem('language');
      if (savedLang === 'ko') {
        htmlElement.setAttribute('lang', 'ko');
      } else {
        htmlElement.setAttribute('lang', 'en');
      }
    };
    
    // Update immediately and set up a listener for language changes
    updateLangAttribute();
    
    // Create a custom event listener for language changes
    window.addEventListener('languageChange', updateLangAttribute);
    
    return () => {
      window.removeEventListener('languageChange', updateLangAttribute);
    };
  }, [pathname]);
  
  // This component doesn't render anything
  return null;
} 