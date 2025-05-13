"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { WeekForm } from '@/components/admin/week-form';
import type { Program, Week, LearningElement, LearningElementType, VideoContent, Checklist, ActionItemContent, TextContent, VideoChoiceGroup, PsychologicalTestContent, QuestionAnswerSessionContent, MissionReminderContent, OXQuizContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Edit3, PlaySquare, ListChecks, MessageSquare, FileText, Brain, HelpCircle, Target, CheckSquare, Settings2, GripVertical, ArrowUp, ArrowDown, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProgramById, updateProgram } from '@/services/programService'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { VideoContentForm } from '@/components/admin/content-builder/video-content-form';
import { TextContentForm } from '@/components/admin/content-builder/text-content-form';
import { ChecklistForm } from '@/components/admin/content-builder/checklist-content-form';
import { ActionItemForm } from '@/components/admin/content-builder/action-item-content-form';
import { VideoChoiceGroupForm } from '@/components/admin/content-builder/video-choice-group-form';
import { InteractiveScenarioLinkForm, InteractiveScenarioFormData } from '@/components/admin/content-builder/interactive-scenario-link-form';
import { PsychologicalTestForm } from '@/components/admin/content-builder/psychological-test-form';
import { QASessionForm } from '@/components/admin/content-builder/qa-session-form';
import { MissionReminderForm } from '@/components/admin/content-builder/mission-reminder-form';
import { OXQuizForm } from '@/components/admin/content-builder/ox-quiz-form';
import type { ChecklistItem, TodoListActionItemContent } from '@/types'; 


type WeekFormData = Pick<Week, 'weekNumber' | 'title' | 'summary' | 'sequentialCompletionRequired'>;

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
      const _exhaustiveCheck: never = type; 
      console.warn(`Unknown learning element type: ${type}, creating a default text_content placeholder.`);
      return { id: elementId, type: 'text_content', content: { id: contentId, title: 'New Content (Edit Later)', type: 'article', content: '' } as TextContent };
  }
};

export const availableLearningElementTypes: { id: LearningElementType; label: string }[] = [
  { id: 'video', label: 'Video Content' },
  { id: 'video_choice_group', label: 'Video Choice Group' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'action_item', label: 'Action Item' },
  { id: 'interactive_scenario_link', label: 'Interactive Scenario Link' },
  { id: 'text_content', label: 'Text Content (Article, Link)' },
  { id: 'psychological_test', label: 'Psychological Test (5-choice)' },
  { id: 'qa_session', label: 'Q&A Session' },
  { id: 'mission_reminder', label: 'Mission Reminder' },
  { id: 'ox_quiz', label: 'O/X Quiz' },
];


const getLearningElementTitle = (element: LearningElement): string => {
  if (element.title) return element.title; 
  if ('content' in element && element.content && typeof (element.content as unknown).title === 'string') {
    return (element.content as unknown as { title: string }).title;
  }
  if(element.type === 'interactive_scenario_link' && 'scenarioId' in element && element.scenarioId) {
    return `Scenario: ${element.scenarioId}`;
  }
  return `Untitled ${element.type.replace(/_/g, ' ')}`;
};

const learningElementTypeIcons: Record<LearningElementType, React.ElementType> = {
    video: PlaySquare,
    video_choice_group: PlaySquare, 
    checklist: ListChecks,
    action_item: Settings2, 
    interactive_scenario_link: MessageSquare,
    text_content: FileText,
    psychological_test: Brain,
    qa_session: HelpCircle,
    mission_reminder: Target,
    ox_quiz: CheckSquare,
};


export default function EditWeekPage() {
  const _router = useRouter();
  const { programId: routeProgramId, weekId: routeWeekId } = useParams();
  const { toast } = useToast();

  const [programId, setProgramIdState] = useState<string | null>(null);
  const [weekId, setWeekIdState] = useState<string | null>(null);

  const [program, setProgram] = useState<Program | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingElement, setEditingElement] = useState<LearningElement | null>(null);
  const [selectedNewElementType, setSelectedNewElementType] = useState<LearningElementType | ''>('');

  useEffect(() => {
    if (typeof routeProgramId === 'string') {
      setProgramIdState(routeProgramId);
    } else {
      setProgramIdState(null);
    }
  }, [routeProgramId]);

  useEffect(() => {
    if (typeof routeWeekId === 'string') {
      setWeekIdState(routeWeekId);
    } else {
      setWeekIdState(null);
    }
  }, [routeWeekId]);


  useEffect(() => {
    const fetchWeekData = async () => {
      if (!programId || !weekId) {
         // Only show error if params were expected but not found after initial load attempt
        if(programId === null && weekId === null && !isLoading) {
          toast({ title: "Invalid URL", description: "Program or Week ID missing.", variant: "destructive" });
          _router.push('/admin/programs');
        }
        // If still loading or params not fully resolved yet, don't fetch
        if (isLoading && (programId === undefined || weekId === undefined)) return;

        setIsLoading(false); // No params to fetch with
        return;
      }
      setIsLoading(true);
      const fetchedProgram = await getProgramById(programId);
      if (fetchedProgram) {
        setProgram(fetchedProgram);
        const foundWeek = (fetchedProgram.weeks || []).find(w => w.id === weekId);
        if (foundWeek) {
          setWeek(foundWeek);
        } else {
          toast({ title: "Error", description: "Week not found in this program.", variant: "destructive" });
          _router.push(`/admin/programs/${programId}/edit`);
        }
      } else {
        toast({ title: "Error", description: "Program not found.", variant: "destructive" });
        _router.push('/admin/programs');
      }
      setIsLoading(false);
    };

    // Only fetch if both IDs are resolved to actual strings
    if (programId && weekId) {
        fetchWeekData();
    } else if (programId === null || weekId === null) { // If params resolved to null (invalid path)
        setIsLoading(false); // Stop loading, error will be shown by render logic
    }

  }, [programId, weekId, _router, toast, isLoading]); // isLoading 추가, 조건부 실행으로 루프 방지됨

  const updateAndPersistProgramState = async (updatedProgramState: Program) => {
      if (!programId) return false;
      const { id: _id, ...programDataToUpdate } = updatedProgramState; 
      const success = await updateProgram(programId, programDataToUpdate);
      if (success) {
        setProgram(updatedProgramState); 
        const updatedWeekFromState = updatedProgramState.weeks?.find(w => w.id === weekId);
        if(updatedWeekFromState) setWeek(updatedWeekFromState);
      }
      return success;
  };


  const handleUpdateWeekDetails = async (data: WeekFormData) => {
    if (!program || !week || !programId) return;

    const updatedWeekData: Week = {
      ...week,
      weekNumber: data.weekNumber,
      title: data.title,
      summary: data.summary,
      sequentialCompletionRequired: data.sequentialCompletionRequired,
      learningElements: week.learningElements || [], 
    };
    
    const updatedWeeks = (program.weeks || []).map(w => (w.id === weekId ? updatedWeekData : w)).sort((a,b) => a.weekNumber - b.weekNumber);
    const updatedProgramState = { ...program, weeks: updatedWeeks };
    
    const success = await updateAndPersistProgramState(updatedProgramState);
    if(success) {
        toast({ title: "Week Details Updated", description: `Week ${updatedWeekData.weekNumber} details saved.` });
    } else {
        toast({ title: "Error", description: "Failed to update week details.", variant: "destructive" });
    }
  };

  const handleSaveLearningElementContent = async (updatedContent: VideoContent | TextContent | Checklist | ActionItemContent | VideoChoiceGroup | PsychologicalTestContent | QuestionAnswerSessionContent | MissionReminderContent | OXQuizContent) => { 
    if (!program || !week || !editingElement || !programId) return;

    const updatedLearningElements = (week.learningElements || []).map(el =>
      el.id === editingElement.id ? { ...el, content: updatedContent } : el
    );

    const updatedWeekData: Week = { ...week, learningElements: updatedLearningElements };
    const updatedWeeks = (program.weeks || []).map(w => (w.id === weekId ? updatedWeekData : w));
    const updatedProgramState = { ...program, weeks: updatedWeeks };

    const success = await updateAndPersistProgramState(updatedProgramState);
    if(success){
        setEditingElement(null); 
        toast({ title: "Learning Element Updated", description: `Content for "${getLearningElementTitle(editingElement)}" saved.` });
    } else {
        toast({ title: "Error", description: "Failed to save learning element.", variant: "destructive" });
    }
  };
  
  const handleSaveInteractiveScenarioLink = async (updatedLinkData: InteractiveScenarioFormData) => {
    if (!program || !week || !editingElement || editingElement.type !== 'interactive_scenario_link' || !programId) return;

    const updatedLearningElements = (week.learningElements || []).map(el =>
      el.id === editingElement.id 
        ? { ...el, title: updatedLinkData.title, scenarioId: updatedLinkData.scenarioId } as LearningElement 
        : el
    );
    const updatedWeekData: Week = { ...week, learningElements: updatedLearningElements };
    const updatedWeeks = (program.weeks || []).map(w => (w.id === weekId ? updatedWeekData : w));
    const updatedProgramState = { ...program, weeks: updatedWeeks };

    const success = await updateAndPersistProgramState(updatedProgramState);
    if(success) {
        setEditingElement(null);
        toast({ title: "Interactive Scenario Link Updated", description: `Link "${updatedLinkData.title}" saved.` });
    } else {
        toast({ title: "Error", description: "Failed to save scenario link.", variant: "destructive" });
    }
  };

  const moveLearningElement = async (elementId: string, direction: 'up' | 'down') => {
    if (!program || !week || !week.learningElements) return;

    const elements = [...week.learningElements];
    const index = elements.findIndex(el => el.id === elementId);

    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [elements[index - 1], elements[index]] = [elements[index], elements[index - 1]];
    } else if (direction === 'down' && index < elements.length - 1) {
      [elements[index + 1], elements[index]] = [elements[index], elements[index + 1]];
    } else {
      return; 
    }

    const updatedWeekData: Week = { ...week, learningElements: elements };
    const updatedWeeks = (program.weeks || []).map(w => (w.id === weekId ? updatedWeekData : w));
    const updatedProgramState = { ...program, weeks: updatedWeeks };

    const success = await updateAndPersistProgramState(updatedProgramState);
    if (success) {
      toast({ title: "Content Reordered", description: "Learning element order updated." });
    } else {
      toast({ title: "Error", description: "Failed to reorder content.", variant: "destructive" });
    }
  };

  const handleAddLearningElement = async () => {
    if (!program || !week || !selectedNewElementType || !programId) {
        toast({ title: "Error", description: "Please select an element type to add.", variant: "destructive" });
        return;
    }

    const newElement = createPlaceholderLearningElement(selectedNewElementType);
    const updatedLearningElements = [...(week.learningElements || []), newElement];
    const updatedWeekData: Week = { ...week, learningElements: updatedLearningElements };
    const updatedWeeks = (program.weeks || []).map(w => (w.id === weekId ? updatedWeekData : w));
    const updatedProgramState = { ...program, weeks: updatedWeeks };

    const success = await updateAndPersistProgramState(updatedProgramState);
    if (success) {
        toast({ title: "Learning Element Added", description: `A new "${selectedNewElementType.replace(/_/g, ' ')}" has been added.` });
        setSelectedNewElementType(''); 
    } else {
        toast({ title: "Error", description: "Failed to add learning element.", variant: "destructive" });
    }
  };


  const renderEditFormForElement = () => {
    if (!editingElement) return null;
    switch (editingElement.type) {
      case 'video':
        return <VideoContentForm initialData={editingElement.content as VideoContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'text_content':
        return <TextContentForm initialData={editingElement.content as TextContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'checklist':
        return <ChecklistForm initialData={editingElement.content as Checklist} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'action_item':
        return <ActionItemForm initialData={editingElement.content as ActionItemContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'video_choice_group':
        return <VideoChoiceGroupForm initialData={editingElement.content as VideoChoiceGroup} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'interactive_scenario_link':
         const scenarioLinkData = {
           id: editingElement.id,
           title: editingElement.title || '', 
           scenarioId: editingElement.scenarioId || '',
           type: 'interactive_scenario_link' as const,
         };
         return <InteractiveScenarioLinkForm initialData={scenarioLinkData} onSubmit={handleSaveInteractiveScenarioLink} onCancel={() => setEditingElement(null)} />;
      case 'psychological_test':
        return <PsychologicalTestForm initialData={editingElement.content as PsychologicalTestContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'qa_session':
        return <QASessionForm initialData={editingElement.content as QuestionAnswerSessionContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'mission_reminder':
        return <MissionReminderForm initialData={editingElement.content as MissionReminderContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      case 'ox_quiz':
        return <OXQuizForm initialData={editingElement.content as OXQuizContent} onSubmit={handleSaveLearningElementContent} onCancel={() => setEditingElement(null)} />;
      default:
        return <p>No editor available for this content type: {editingElement.type}.</p>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading week details...</p></div>;
  }

  if (!program || !week) {
    return (
      <div className="text-center py-10">
        Program or Week not found. 
        <Link href={programId ? `/admin/programs/${programId}/edit` : "/admin/programs"} className="text-accent underline ml-2">
          Go back to program
        </Link>.
      </div>
    );
  }
  
  const learningElements = week.learningElements || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" asChild>
          <Link href={programId ? `/admin/programs/${programId}/edit` : "/admin/programs"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Program Management
          </Link>
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Edit Week {week.weekNumber} for "{program.title}"</CardTitle>
          <CardDescription>Modify the basic details for this week. Manage content elements below.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeekForm 
            initialData={{
                weekNumber: week.weekNumber,
                title: week.title,
                summary: week.summary,
                sequentialCompletionRequired: week.sequentialCompletionRequired,
            }} 
            onSubmit={handleUpdateWeekDetails} 
            isEditing={true} 
          />
        </CardContent>
      </Card>
      
       <Card className="max-w-3xl mx-auto shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Manage Week Content</CardTitle>
          <CardDescription>Edit or reorder individual learning elements for this week. Add new elements below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningElements.length > 0 ? (
            learningElements.map((el, index) => {
              const ElementIcon = learningElementTypeIcons[el.type] || Settings2;
              return (
                <Card key={el.id} className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                    <div className="flex items-center space-x-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" /> 
                        <ElementIcon className="h-5 w-5 text-muted-foreground"/>
                        <CardTitle className="text-md">{getLearningElementTitle(el)}</CardTitle>
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full capitalize">{el.type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => moveLearningElement(el.id, 'up')} disabled={index === 0} aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => moveLearningElement(el.id, 'down')} disabled={index === learningElements.length - 1} aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingElement(el)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No learning elements defined for this week yet. Add them below or through the Program's 'Manage Weeks & Content' tab.</p>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 space-y-4">
            <Label className="text-md font-semibold text-primary block">Add New Learning Element</Label>
            <div className="flex items-end space-x-2">
                <div className="flex-grow">
                    <Label htmlFor="new-element-type" className="text-xs text-muted-foreground">Select Type</Label>
                    <Select 
                        value={selectedNewElementType} 
                        onValueChange={(value) => setSelectedNewElementType(value as LearningElementType)}
                    >
                        <SelectTrigger id="new-element-type">
                            <SelectValue placeholder="Choose an element type..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableLearningElementTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddLearningElement} disabled={!selectedNewElementType} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Element
                </Button>
            </div>
        </CardFooter>
      </Card>

      <Dialog open={!!editingElement} onOpenChange={(isOpen) => !isOpen && setEditingElement(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit: {editingElement ? getLearningElementTitle(editingElement) : 'Content'}</DialogTitle>
            <DialogDescription>
              Modify the details for this learning element.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[calc(85vh-150px)] overflow-y-auto pr-2">
            {renderEditFormForElement()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
