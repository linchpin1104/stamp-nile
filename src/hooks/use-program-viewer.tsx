"use client";

import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { Program } from '@/types';
import { enhanceProgramForMobile } from '@/lib/mobile-optimization';

interface UseProgramViewerResult {
  optimizedProgram: Program;
  isMobileView: boolean;
  toggleView: () => void;
}

export function useProgramViewer(program: Program): UseProgramViewerResult {
  const isMobile = useIsMobile();
  const [useDesktopView, setUseDesktopView] = useState(!isMobile);
  const [optimizedProgram, setOptimizedProgram] = useState<Program>(program);
  
  const isMobileView = isMobile && !useDesktopView;
  
  useEffect(() => {
    setUseDesktopView(!isMobile);
  }, [isMobile]);
  
  useEffect(() => {
    if (isMobileView && !optimizedProgram.mobileOptimized) {
      const enhanced = enhanceProgramForMobile(program);
      setOptimizedProgram(enhanced);
    } else {
      setOptimizedProgram(program);
    }
  }, [program, isMobileView, optimizedProgram.mobileOptimized]);
  
  const toggleView = () => setUseDesktopView(prev => !prev);
  
  return {
    optimizedProgram,
    isMobileView,
    toggleView
  };
} 