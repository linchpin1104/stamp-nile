"use client";

import type { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip"; // Sidebar uses Tooltip

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
