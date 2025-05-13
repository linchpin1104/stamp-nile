"use client";

import React, { useState, useEffect } from 'react';
import { Program, Week, LearningElement } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VideoPlayer } from './video-player';
import { MobileOptimizedText } from './mobile-optimized-text';
import { shouldUseMobileVariant } from '@/lib/mobile-optimization';
import { ChevronRight, ArrowLeft, MessageSquare, Book, Target, Clipboard } from 'lucide-react';

interface MobileProgramViewerProps {
  program: Program;
  currentWeekId?: string;
  onWeekSelect?: (weekId: string) => void;
}

export function MobileProgramViewer({ 
  program, 
  currentWeekId,
  onWeekSelect = () => {}
}: MobileProgramViewerProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedWeek, setExpandedWeek] = useState<string | null>(currentWeekId || null);
  
  // Find current week if provided
  const currentWeek = program.weeks?.find(week => week.id === currentWeekId);
  
  useEffect(() => {
    if (currentWeekId) {
      setExpandedWeek(currentWeekId);
      setActiveTab('weeks');
    }
  }, [currentWeekId]);
  
  // Use simplified layout for mobile
  if (!isMobile) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">This component is optimized for mobile devices only.</p>
      </div>
    );
  }
  
  // Helper function to get icon for learning element type
  const getLearningElementIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'video_choice_group':
        return <MessageSquare className="h-4 w-4" />;
      case 'text_content':
        return <Book className="h-4 w-4" />;
      case 'mission_reminder':
        return <Target className="h-4 w-4" />;
      case 'checklist':
      case 'action_item':
        return <Clipboard className="h-4 w-4" />;
      default:
        return <ChevronRight className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="mobile-program-viewer space-y-4">
      <Card className="shadow-sm border-border/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xl">{program.title}</CardTitle>
          <CardDescription className="text-xs">{program.targetAudience}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <MobileOptimizedText 
            text={program.longDescription || program.description} 
            maxLength={150}
          />
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="weeks">주차별 콘텐츠</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-2 space-y-4">
          {program.mobileMetadata && (
            <div className="grid grid-cols-2 gap-2 text-center">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">예상 학습 시간</p>
                <p className="font-medium">{program.mobileMetadata.estimatedReadingTime || '?'}분</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">오프라인 지원</p>
                <p className="font-medium">{program.mobileMetadata.offlineSupport ? '가능' : '불가능'}</p>
              </Card>
            </div>
          )}
          
          {program.tags && program.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {program.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="weeks" className="mt-2">
          <Accordion 
            type="single" 
            value={expandedWeek || undefined}
            onValueChange={(value) => {
              setExpandedWeek(value);
              if (value) onWeekSelect(value);
            }}
            className="w-full"
          >
            {program.weeks?.map((week) => (
              <AccordionItem key={week.id} value={week.id} className="border-b">
                <AccordionTrigger className={cn(
                  "py-3 px-2 hover:bg-muted/30 rounded-md transition-colors",
                  expandedWeek === week.id && "bg-muted/40"
                )}>
                  <div className="text-left">
                    <p className="font-medium">주차 {week.weekNumber}: {week.title}</p>
                    <p className="text-xs text-muted-foreground">{week.summary}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-2 pr-1 py-2 space-y-3">
                    {week.learningElements?.map((element, index) => (
                      <div 
                        key={element.id} 
                        className="border rounded-md p-3 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center mb-1">
                          {getLearningElementIcon(element.type)}
                          <span className="ml-1 text-sm font-medium">
                            {element.title || (element.type === 'video' ? element.content.title : `학습 요소 ${index+1}`)}
                          </span>
                        </div>
                        {shouldUseMobileVariant(element) ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            {element.type === 'video' ? (
                              <VideoPlayer 
                                videoContent={element.content} 
                                showTitle={false}
                                className="mt-2"
                              />
                            ) : (
                              "모바일 버전 최적화 완료"
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {element.type.replace(/_/g, ' ')} 유형 콘텐츠
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
      
      {currentWeek && (
        <div className="sticky bottom-2 w-full p-2 z-10 bg-background bg-opacity-80 backdrop-blur-sm border-t">
          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
            onClick={() => onWeekSelect(currentWeek.id)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            계속 학습하기: 주차 {currentWeek.weekNumber}
          </Button>
        </div>
      )}
    </div>
  );
} 