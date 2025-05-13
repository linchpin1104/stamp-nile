"use client";

import type { Week } from '@/types';
import Link from 'next/link';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlayCircle, ListChecks, MessageSquare, ExternalLink } from 'lucide-react';

interface WeekAccordionItemProps {
  week: Week;
  programSlug: string;
  isCompleted?: boolean; // Placeholder for progress tracking
  isActive?: boolean; // Placeholder for current week
}

export function WeekAccordionItem({ week, programSlug, isCompleted, isActive }: WeekAccordionItemProps) {
  return (
    <AccordionItem value={`week-${week.weekNumber}`} className="bg-card rounded-lg shadow-sm mb-4 overflow-hidden">
      <AccordionTrigger className={`px-6 py-4 hover:bg-secondary/30 transition-colors ${isActive ? 'bg-secondary/50' : ''}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            ) : isActive ? (
              <PlayCircle className="h-6 w-6 text-accent mr-3 animate-pulse" />
            ) : (
              <div className="h-6 w-6 border-2 border-primary rounded-full mr-3 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{week.weekNumber}</span>
              </div>
            )}
            <span className="text-lg font-medium text-foreground">Week {week.weekNumber}: {week.title}</span>
          </div>
          {/* Progress indicator or status can go here */}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 py-4 border-t">
        <p className="text-muted-foreground mb-4">{week.summary || "No summary available for this week."}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {week.video && (
            <div className="flex items-center p-3 bg-secondary/20 rounded-md">
              <PlayCircle className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="text-sm text-foreground truncate" title={week.video.title}>Video: {week.video.title}</span>
            </div>
          )}
          {week.checklists && week.checklists.length > 0 && (
            <div className="flex items-center p-3 bg-secondary/20 rounded-md">
              <ListChecks className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="text-sm text-foreground truncate" title={week.checklists.map(c => c.title).join(', ')}>
                Checklist(s): {week.checklists.map(c => c.title).join(', ')}
              </span>
            </div>
          )}
          {week.actionItems && week.actionItems.length > 0 && (
             <div className="flex items-center p-3 bg-secondary/20 rounded-md">
              <CheckCircle className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="text-sm text-foreground truncate" title={week.actionItems.map(a => a.title).join(', ')}>
                Action Item(s)
              </span>
            </div>
          )}
          {week.interactiveScenarioId && (
            <div className="flex items-center p-3 bg-secondary/20 rounded-md">
              <MessageSquare className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span className="text-sm text-foreground truncate">Interactive Scenario</span>
            </div>
          )}
        </div>
        <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/programs/${programSlug}/week/${week.id}`}>
            {isActive ? 'Continue Week' : isCompleted ? 'Review Week' : 'Start Week'} <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
