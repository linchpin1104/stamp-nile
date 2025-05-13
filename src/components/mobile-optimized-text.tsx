"use client";

import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { optimizeTextForMobile } from '@/lib/mobile-optimization';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileOptimizedTextProps {
  text: string;
  className?: string;
  maxLength?: number;
  readMoreLabel?: string;
  readLessLabel?: string;
}

export function MobileOptimizedText({
  text,
  className,
  maxLength = 300,
  readMoreLabel = "더 보기",
  readLessLabel = "접기"
}: MobileOptimizedTextProps) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  
  // Only apply truncation on mobile
  if (!isMobile || text.length <= maxLength) {
    return (
      <div className={cn("text-foreground", className)}>
        {text}
      </div>
    );
  }
  
  const truncatedText = expanded ? text : `${text.substring(0, maxLength)}...`;
  
  return (
    <div className={cn("text-foreground", className)}>
      <div className={expanded ? "" : "line-clamp-5"}>
        {truncatedText}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="mt-1 text-muted-foreground hover:text-foreground flex items-center text-xs" 
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            {readLessLabel} <ChevronUp className="h-3 w-3 ml-1" />
          </>
        ) : (
          <>
            {readMoreLabel} <ChevronDown className="h-3 w-3 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
} 