"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { WeekForm, WeekFormData } from '@/components/admin/week-form';
import type { Program, Week, LearningElement, LearningElementType, VideoContent, Checklist, TextContent, VideoChoiceGroup, PsychologicalTestContent, QuestionAnswerSessionContent, MissionReminderContent, OXQuizContent, ChecklistItem, TodoListActionItemContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProgramById, updateProgram } from '@/services/programService';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const createPlaceholderLearningElement = (type: LearningElementType): LearningElement => {
  const elementId = generateId(`le-stub-${type}`);
  const contentId = generateId(`content-stub-${type}`);
  
  switch (type) {
    case 'video':
      return { id: elementId, type, content: { id: contentId, title: 'New Video (Edit Later)', url: '' } as VideoContent };
    case 'video_choice_group':
      return { id: elementId, type, content: { id: contentId, title: 'New Video Choice Group (Edit Later)', videos: [], selectionRule: 'choose_one' } as VideoChoiceGroup };
    case 'checklist':
      return { id: elementId, type, content: { id: contentId, title: 'New Checklist (Edit Later)', items: [] as ChecklistItem[], type: 'generic_todo' } as Checklist };
    case 'action_item':
      return { 
        id: elementId, 
        type, 
        content: { 
          id: contentId, 
          title: 'New Action Item (Edit Later)', 
          description: '', 
          type: 'todo_list', 
          todoItems: [] 
        } as TodoListActionItemContent 
      };
    case 'interactive_scenario_link':
      return { id: elementId, type, scenarioId: '', title: 'New Interactive Scenario (Link Later)' };
    case 'text_content':
      return { id: elementId, type, content: { id: contentId, title: 'New Text Content (Edit Later)', type: 'article', content: '' } as TextContent };
    case 'psychological_test':
      return { id: elementId, type, content: { id: contentId, title: 'New Psychological Test (Edit Later)', factors:[], overallResultComments: [] } as PsychologicalTestContent };
    case 'qa_session':
      return { id: elementId, type, content: { id: contentId, title: 'New Q&A Session (Edit Later)', prompts: [] } as QuestionAnswerSessionContent };
    case 'mission_reminder':
      return { id: elementId, type, content: { id: contentId, title: 'New Mission Reminder (Edit Later)', missionTitle: '', missionDescription: '' } as MissionReminderContent };
    case 'ox_quiz':
      return { id: elementId, type, content: { id: contentId, title: 'New O/X Quiz (Edit Later)', questions: [] } as OXQuizContent };
    default:
      return { id: elementId, type: 'text_content', content: { id: contentId, title: 'New Content (Edit Later)', type: 'article', content: '' } as TextContent };
  }
};

export default function CreateWeekPage() {
  const _router = useRouter();
  const { programId: routeProgramId } = useParams();
  const { toast } = useToast();

  const [programId, setProgramIdState] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof routeProgramId === 'string') {
      setProgramIdState(routeProgramId);
    } else {
      setProgramIdState(null);
    }
  }, [routeProgramId]);

  useEffect(() => {
    if (programId) {
      const fetchProgram = async () => {
        setIsLoading(true);
        const fetchedProgram = await getProgramById(programId);
        if (fetchedProgram) {
          setProgram(fetchedProgram);
        } else {
          toast({ title: "Error", description: "Program not found to add week to.", variant: "destructive" });
          _router.push('/admin/programs');
        }
        setIsLoading(false);
      };
      fetchProgram();
    } else if (routeProgramId === null) { // If param resolved to null
        setIsLoading(false); // Stop loading, error will be shown
    }
  }, [programId, _router, toast, routeProgramId]);

  const handleAddWeek = async (data: WeekFormData) => {
    if (!program || !program.id) {
      toast({ title: "Error", description: "Program data is missing.", variant: "destructive" });
      return;
    }

    const learningElements: LearningElement[] = (data.initialLearningElementTypes || [])
        .map(type => createPlaceholderLearningElement(type as LearningElementType));

    const newWeek: Week = {
      id: generateId('week'),
      weekNumber: data.weekNumber,
      title: data.title,
      summary: data.summary,
      sequentialCompletionRequired: data.sequentialCompletionRequired || false,
      learningElements: learningElements,
    };

    const updatedWeeks = [...(program.weeks || []), newWeek].sort((a, b) => a.weekNumber - b.weekNumber);
    
    const success = await updateProgram(program.id, { weeks: updatedWeeks });
    
    if (success) {
      toast({ title: "Week Added", description: `Week ${newWeek.weekNumber}: "${newWeek.title}" added to ${program.title}. Placeholder content elements created.` });
      _router.push(`/admin/programs/${program.id}/edit`); 
    } else {
       toast({ title: "Error", description: "Failed to add week to the program.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading program data...</p></div>;
  }

  if (!program) {
     return <div className="text-center py-10">Program not found. <Link href="/admin/programs" className="text-accent underline">Go back</Link>.</div>;
  }
  
  const maxExistingWeekNumber = program.weeks && program.weeks.length > 0 
    ? Math.max(...program.weeks.map(w => w.weekNumber)) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" asChild>
          <Link href={programId ? `/admin/programs/${programId}/edit` : '/admin/programs'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Program Management
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Add New Week to "{program.title}"</CardTitle>
          <CardDescription>Define the basic details and select initial content types for this new week. Detailed content will be added using the content builder.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeekForm 
            onSubmit={handleAddWeek} 
            programMaxWeeks={maxExistingWeekNumber}
            isEditing={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
