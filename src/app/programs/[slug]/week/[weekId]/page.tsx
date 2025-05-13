"use client";

import { mockScenarios, mockUser as fallbackMockUser } from '@/lib/mock-data';
import type { Week as WeekType, Program as ProgramType, LearningElement, VideoContent, Checklist as ChecklistType, ActionItem, TextContent, VideoChoiceGroup, PsychologicalTestContent, QuestionAnswerSessionContent, MissionReminderContent, OXQuizContent, User, UserMission } from '@/types';
import { VideoPlaceholder } from '@/components/video-placeholder';
import { ChecklistView } from '@/components/checklist-view';
import { ActionItemCardView } from '@/components/action-item-card-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, FileText, AlertCircle, ExternalLink, Brain, HelpCircle, Target, CheckSquare, Lock, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from '@/components/ui/slider'; 
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getProgramBySlug } from '@/services/programService';
import { useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserChecklistForm } from '@/components/user-content/user-checklist-form';
import { Badge } from '@/components/ui/badge';


const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const getLearningElementKey = (el: LearningElement) => `${el.type}-${el.id}`;

const sortUserChecklists = (checklists: ChecklistType[], program: ProgramType | null): ChecklistType[] => {
    if (!program || !program.weeks) {
        return [...checklists]; // Return unsorted if no program or weeks
    }
    
    const programWeeks = program.weeks;
    return checklists.sort((a, b) => {
        const weekA = programWeeks.find(w => w.id === a.weekId);
        const weekB = programWeeks.find(w => w.id === b.weekId);
        const weekNumA = weekA?.weekNumber || Infinity; 
        const weekNumB = weekB?.weekNumber || Infinity;

        if (weekNumA !== weekNumB) {
            return weekNumA - weekNumB;
        }
        return (a.title || '').localeCompare(b.title || '');
    });
};


export default function WeekDetailPage() {
  const { slug: routeSlug, weekId: routeWeekId } = useParams();
  const { toast } = useToast();

  const [programSlug, setProgramSlugState] = useState<string | null>(null);
  const [weekId, setWeekIdState] = useState<string | null>(null);
  
  const [program, setProgram] = useState<ProgramType | null | undefined>(undefined);
  const [week, setWeek] = useState<WeekType | null | undefined>(undefined);
  const [selectedVideoChoice, setSelectedVideoChoice] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasAccessToProgram, _setHasAccessToProgram] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [userWeekChecklists, setUserWeekChecklists] = useState<ChecklistType[]>([]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistType | null>(null);
  const [isChecklistInitialized, setIsChecklistInitialized] = useState(false);

  const initializeChecklistFormData = useCallback((_currentWeek: WeekType) => {
    setIsChecklistInitialized(true);
  }, []);

  useEffect(() => {
    if (typeof routeSlug === 'string') setProgramSlugState(routeSlug);
    else setProgramSlugState(null);
  }, [routeSlug]);

  useEffect(() => {
    if (typeof routeWeekId === 'string') setWeekIdState(routeWeekId);
    else setWeekIdState(null);
  }, [routeWeekId]);


  useEffect(() => {
    const storedUserProfileString = localStorage.getItem('userProfile');
    let userToSet: User;
    if (storedUserProfileString) {
        try { userToSet = JSON.parse(storedUserProfileString); } 
        catch (e) { console.error("Failed to parse user profile", e); userToSet = fallbackMockUser; }
    } else { userToSet = fallbackMockUser; }
    setCurrentUser(userToSet);
  }, []);

  useEffect(() => {
    const loadData = async () => {
        if (!programSlug || !weekId || !currentUser) {
          if((programSlug === null || weekId === null) && currentUser !== null) setIsLoading(false); 
          return;
        }
        setIsLoading(true);
        const fetchedProgram = await getProgramBySlug(programSlug);
        setProgram(fetchedProgram);

        if (fetchedProgram) {
            const currentWeekContent = fetchedProgram.weeks?.find(w => w.id === weekId);
            setWeek(currentWeekContent || null);

            const allUserChecklists = currentUser.customChecklists || [];
            const programChecklists = allUserChecklists.filter(
                cl => cl.programId === fetchedProgram.id
            );
            setUserWeekChecklists(sortUserChecklists(programChecklists, fetchedProgram));

            // Initialize checklist form data
            if (currentWeekContent && !isChecklistInitialized) {
                initializeChecklistFormData(currentWeekContent);
                setIsChecklistInitialized(true);
            }
        }
        setIsLoading(false);
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programSlug, weekId, currentUser, isChecklistInitialized]); // Some dependencies are intentionally omitted to prevent unnecessary re-renders


  const persistCurrentUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
  }, []);

  const persistUserMissions = useCallback((updatedMissions: UserMission[]) => {
    if (currentUser) {
      persistCurrentUser({ ...currentUser, userMissions: updatedMissions });
      toast({ title: "Mission Progress Updated" });
    }
  },[currentUser, persistCurrentUser, toast]);

  const handleMissionProgressChange = useCallback((missionId: string, newProgress: number, missionDetails: {title: string, description?: string}) => {
    if (!currentUser) return;
    const missions = currentUser.userMissions || [];
    const existingMissionIndex = missions.findIndex(m => m.linkedProgramMissionId === missionId);
    if (existingMissionIndex > -1) {
      missions[existingMissionIndex] = { ...missions[existingMissionIndex], progress: newProgress };
    } else {
      missions.push({
        id: generateId('userProgMission'),
        linkedProgramMissionId: missionId,
        title: missionDetails.title,
        description: missionDetails.description,
        progress: newProgress,
        isUserCreated: false,
      });
    }
    persistUserMissions(missions);
  }, [currentUser, persistUserMissions]);

  const handleSaveUserChecklist = useCallback((data: ChecklistType) => {
    if (!currentUser || !program || !week) return;
    let updatedCustomChecklists = [...(currentUser.customChecklists || [])];
    if (editingChecklist) { 
        updatedCustomChecklists = updatedCustomChecklists.map(cl => cl.id === data.id ? data : cl);
        toast({ title: "Checklist Updated", description: `"${data.title}" has been saved.` });
    } else { 
        updatedCustomChecklists.push(data);
        toast({ title: "Checklist Added", description: `"${data.title}" created for this week.` });
    }
    persistCurrentUser({ ...currentUser, customChecklists: updatedCustomChecklists });
    setUserWeekChecklists(sortUserChecklists(updatedCustomChecklists.filter(cl => cl.programId === program.id), program));
    setIsChecklistModalOpen(false);
    setEditingChecklist(null);
  }, [currentUser, program, week, editingChecklist, persistCurrentUser, toast]);

  const _handleEditUserChecklist = useCallback((checklistId: string) => {
    const checklistToEdit = userWeekChecklists.find(cl => cl.id === checklistId);
    if (checklistToEdit) {
        setEditingChecklist(checklistToEdit);
        setIsChecklistModalOpen(true);
    }
  }, [userWeekChecklists]);
  
  const _handleDeleteUserChecklist = useCallback((checklistId: string) => {
    if (!currentUser || !program || !week) return;
    if (confirm("Are you sure you want to delete this checklist? This action cannot be undone.")) {
        const updatedCustomChecklists = (currentUser.customChecklists || []).filter(cl => cl.id !== checklistId);
        persistCurrentUser({ ...currentUser, customChecklists: updatedCustomChecklists });
        setUserWeekChecklists(sortUserChecklists(updatedCustomChecklists.filter(cl => cl.programId === program.id), program));
        toast({ title: "Checklist Deleted", variant: "destructive" });
    }
  }, [currentUser, program, week, persistCurrentUser, toast]);

 const handleChecklistItemUpdate = useCallback((checklistId: string, itemId: string, isChecked: boolean) => {
    if (!currentUser) return;

    const updatedCustomChecklists = (currentUser.customChecklists || []).map(cl => {
        if (cl.id === checklistId) {
            return {
                ...cl,
                items: cl.items.map(item => item.id === itemId ? { ...item, isChecked } : item)
            };
        }
        return cl;
    });
    
    setUserWeekChecklists(prevUserChecklists => 
        prevUserChecklists.map(cl => 
            cl.id === checklistId 
            ? { ...cl, items: cl.items.map(item => item.id === itemId ? { ...item, isChecked } : item) } 
            : cl
        )
    );

    const programChecklist = week?.learningElements?.find(el => el.type === 'checklist' && el.id === checklistId);
    if (programChecklist && programChecklist.type === 'checklist') {
        const newActionItemProgress = { ...(currentUser.actionItemProgress || {}) };
        if (!newActionItemProgress[checklistId]) {
            newActionItemProgress[checklistId] = { todoItemScores: {} }; 
        }
        if (!newActionItemProgress[checklistId].todoItemScores) {
             newActionItemProgress[checklistId].todoItemScores = {};
        }
        newActionItemProgress[checklistId].todoItemScores![itemId] = isChecked ? 1 : 0; 
        persistCurrentUser({ ...currentUser, actionItemProgress: newActionItemProgress, customChecklists: updatedCustomChecklists });
    } else {
        persistCurrentUser({ ...currentUser, customChecklists: updatedCustomChecklists });
    }

    toast({ title: "Checklist Updated", description: "Progress saved." });
}, [currentUser, persistCurrentUser, week, toast]);


  const handleActionItemProgressChange = useCallback((
    actionItemId: string,
    dataType: 'notes' | 'completion' | 'todoScore',
    value: string | boolean | number,
    todoItemId?: string
  ) => {
    if (!currentUser) return;

    const newActionItemProgress = { ...(currentUser.actionItemProgress || {}) };
    if (!newActionItemProgress[actionItemId]) {
      newActionItemProgress[actionItemId] = {};
    }

    if (dataType === 'notes' && typeof value === 'string') {
      newActionItemProgress[actionItemId].notes = value;
    } else if (dataType === 'completion' && typeof value === 'boolean') {
      newActionItemProgress[actionItemId].isCompletedOverall = value;
    } else if (dataType === 'todoScore' && todoItemId && typeof value === 'number') {
      if (!newActionItemProgress[actionItemId].todoItemScores) {
        newActionItemProgress[actionItemId].todoItemScores = {};
      }
      newActionItemProgress[actionItemId].todoItemScores![todoItemId] = value;
    }
    
    persistCurrentUser({ ...currentUser, actionItemProgress: newActionItemProgress });
    if (dataType !== 'notes') { 
        toast({ title: "Action Item Updated", description: "Your progress has been saved." });
    }
  }, [currentUser, persistCurrentUser, toast]);


  if (isLoading || program === undefined || week === undefined || currentUser === undefined) {
    return <div className="flex justify-center items-center h-screen"><p>Loading week content...</p></div>;
  }

  if (!program || !week) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Week Not Found</h1>
        <p className="text-muted-foreground">The content you are looking for does not exist.</p>
         <Button asChild variant="link" className="mt-4">
          <Link href={programSlug ? `/programs/${programSlug}` : "/programs"}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program
          </Link>
        </Button>
      </div>
    );
  }

  if (!hasAccessToProgram) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Button variant="outline" asChild>
                <Link href={programSlug ? `/programs/${programSlug}` : "/programs"}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program Overview
                </Link>
                </Button>
            </div>
             <Card className="text-center py-10 bg-muted/50">
                <CardHeader>
                    <Lock className="h-12 w-12 text-primary mx-auto mb-3"/>
                    <CardTitle className="text-xl text-primary">Content Locked</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You need active access to &quot;{program.title}&quot; to view this week&apos;s content.
                    </p>
                    <Button asChild className="mt-4 bg-accent hover:bg-accent/80 text-accent-foreground">
                        <Link href="/profile#vouchers_tab">Register Voucher or Check Access</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const programWeeks = program.weeks || [];
  const currentWeekIndex = programWeeks.findIndex(w => w.id === week.id);
  const _prevWeek = currentWeekIndex > 0 ? programWeeks[currentWeekIndex - 1] : null;
  const _nextWeek = currentWeekIndex < programWeeks.length - 1 ? programWeeks[currentWeekIndex + 1] : null;
  const _isLastWeek = currentWeekIndex === programWeeks.length - 1;

  const learningElements = week.learningElements || [];

  const renderLearningElement = (element: LearningElement, index: number) => {
    const key = getLearningElementKey(element) + `-${index}`;
    const userProgressForElement = currentUser?.actionItemProgress?.[element.id];

    switch (element.type) {
      case 'video':
        return <VideoPlaceholder key={key} title={(element.content as VideoContent).title} src={(element.content as VideoContent).url} />;
      case 'video_choice_group':
        const group = element.content as VideoChoiceGroup;
        const currentSelection = selectedVideoChoice[group.id] || (group.videos[0]?.id);
        const selectedVid = group.videos.find(v => v.id === currentSelection);
        return (
          <Card key={key} className="my-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{group.title}</CardTitle>
              {group.selectionRule === 'choose_one' && <CardDescription>Please select one video to watch.</CardDescription>}
            </CardHeader>
            <CardContent>
              {group.selectionRule === 'choose_one' && (
                <RadioGroup
                  value={currentSelection}
                  onValueChange={(videoId) => setSelectedVideoChoice(prev => ({...prev, [group.id]: videoId}))}
                  className="mb-4 space-y-2"
                >
                  {group.videos.map(v => (
                    <div key={v.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={v.id} id={`${group.id}-${v.id}`} />
                      <Label htmlFor={`${group.id}-${v.id}`}>{v.title}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {selectedVid && <VideoPlaceholder title={selectedVid.title} src={selectedVid.url} />}
            </CardContent>
          </Card>
        );
      case 'checklist':
        const checklistContent = element.content as ChecklistType;
        return <ChecklistView 
            key={key} 
            checklist={checklistContent}
            onChecklistItemChange={handleChecklistItemUpdate}
            />;
      case 'action_item':
        return <ActionItemCardView 
            key={key} 
            actionItem={element.content as ActionItem} 
            onCompletionChange={(itemId, isCompleted) => handleActionItemProgressChange(itemId, 'completion', isCompleted)}
            onNotesChange={(itemId, notes) => handleActionItemProgressChange(itemId, 'notes', notes)}
            onTodoItemProgressChange={(actionItemId, todoItemId, score) => handleActionItemProgressChange(actionItemId, 'todoScore', score, todoItemId)}
            initialProgress={userProgressForElement?.todoItemScores}
            />;
      case 'interactive_scenario_link':
        const scenario = mockScenarios.find(s => s.id === element.scenarioId);
        return scenario ? (
          <Link key={key} href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}/interactive-scenario/${scenario.id}`: '#'}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-secondary/20 my-4">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center">
                  <MessageSquare className="mr-2 h-6 w-6"/> Interactive Scenario: {element.title || scenario.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{scenario.description || "Engage in this interactive activity."}</p>
                <Button className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Start Scenario</Button>
              </CardContent>
            </Card>
          </Link>
        ) : null;
      case 'text_content':
        const textEl = element.content as TextContent;
        return (
            <Card key={key} className="my-4 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center">
                        <FileText className="mr-2 h-5 w-5"/> {textEl.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="outline" className="mb-2 capitalize text-xs">{textEl.type.replace('_', ' ')}</Badge>
                    {textEl.url && (
                        <Button variant="link" asChild className="p-0 h-auto text-accent block">
                        <a href={textEl.url} target="_blank" rel="noopener noreferrer">
                            View Document/Link <ExternalLink className="ml-1 h-3 w-3 inline" />
                        </a>
                        </Button>
                    )}
                     {textEl.content && (
                        textEl.richTextEditorComponent ?
                        React.createElement(textEl.richTextEditorComponent, { value: textEl.content, onChange: () => {}, readOnly: true }) :
                        <div className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: textEl.content }}/>
                    )}
                </CardContent>
            </Card>
        );
      case 'psychological_test':
        const psychTestEl = element.content as PsychologicalTestContent;
        return (
          <Card key={key} className="my-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center"><Brain className="mr-2 h-5 w-5"/> {psychTestEl.title}</CardTitle>
              {psychTestEl.description && <CardDescription>{psychTestEl.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Psychological Test content will be displayed here. ({psychTestEl.factors.reduce((sum, factor) => sum + factor.questions.length, 0)} questions)</p>
              <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}/psychological-test/${element.id}` : '#'}>Start Test</Link>
              </Button>
            </CardContent>
          </Card>
        );
      case 'qa_session':
        const qaSessionEl = element.content as QuestionAnswerSessionContent;
        return (
          <Card key={key} className="my-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center"><HelpCircle className="mr-2 h-5 w-5"/> {qaSessionEl.title}</CardTitle>
              {qaSessionEl.description && <CardDescription>{qaSessionEl.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Q&A Session content will be displayed here. ({qaSessionEl.prompts.length} prompts)</p>
               <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                 <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}/qa-session/${element.id}` : '#'}>Begin Session</Link>
              </Button>
            </CardContent>
          </Card>
        );
      case 'mission_reminder':
        const missionContent = element.content as MissionReminderContent;
        const userMissionProgress = currentUser?.userMissions?.find(m => m.linkedProgramMissionId === missionContent.id)?.progress || 0;
        return (
          <Card key={key} className="my-4 shadow-sm bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center"><Target className="mr-2 h-5 w-5"/> {missionContent.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold mb-1">{missionContent.missionTitle}</p>
              <p className="text-sm text-muted-foreground mb-3">{missionContent.missionDescription}</p>
              <div className="space-y-2">
                <Label htmlFor={`mission-progress-${missionContent.id}`} className="text-sm font-medium">
                  Your Progress (0-10): {userMissionProgress}
                </Label>
                <Slider
                  id={`mission-progress-${missionContent.id}`}
                  min={0}
                  max={10}
                  step={1}
                  defaultValue={[userMissionProgress]}
                  onValueChange={(value) => handleMissionProgressChange(missionContent.id, value[0], {title: missionContent.missionTitle, description: missionContent.missionDescription})}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 'ox_quiz':
        const oxQuizEl = element.content as OXQuizContent;
        return (
          <Card key={key} className="my-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center"><CheckSquare className="mr-2 h-5 w-5"/> {oxQuizEl.title}</CardTitle>
              {oxQuizEl.description && <CardDescription>{oxQuizEl.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">O/X Quiz content will be displayed here. ({oxQuizEl.questions.length} questions)</p>
               <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}/ox-quiz/${element.id}` : '#'}>Start Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        );
      default:
        // Handle unknown element types gracefully
        return (
          <div 
            key={`unknown-element-${index}`} 
            className="p-4 my-2 border border-dashed rounded-md text-muted-foreground"
          >
            <AlertCircle className="inline mr-2 h-4 w-4" />
            Unknown learning element type
          </div>
        );
    }
  };

  const _renderFallbackContent = () => (
    <>
      {week.videos && week.videos.map(video => <VideoPlaceholder key={video.id} title={video.title} src={video.url} />)}
      {week.videoChoiceGroups && week.videoChoiceGroups.map(group => {
         const currentSelection = selectedVideoChoice[group.id] || (group.videos[0]?.id);
         const selectedVid = group.videos.find(v => v.id === currentSelection);
         return (
          <Card key={group.id} className="my-4 shadow-md">
            <CardHeader><CardTitle className="text-lg text-primary">{group.title}</CardTitle></CardHeader>
            <CardContent>
            {group.selectionRule === 'choose_one' && (
                <RadioGroup
                  value={currentSelection}
                  onValueChange={(videoId) => setSelectedVideoChoice(prev => ({...prev, [group.id]: videoId}))}
                  className="mb-4 space-y-2"
                >
                  {group.videos.map(v => (
                    <div key={v.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={v.id} id={`${group.id}-${v.id}-fb`} />
                      <Label htmlFor={`${group.id}-${v.id}-fb`}>{v.title}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {selectedVid && <VideoPlaceholder title={selectedVid.title} src={selectedVid.url} />}
            </CardContent>
          </Card>
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={programSlug ? `/programs/${programSlug}` : "/programs"}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program
          </Link>
        </Button>
      </div>
      {userWeekChecklists.length > 0 ? (
        <Card className="text-center py-10 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Personal Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have created {userWeekChecklists.length} personal checklists for this program.</p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">You haven&apos;t created any personal checklists for this program yet.</p>
      )}
      <div className="flex justify-center items-center">
        <Button onClick={() => setIsChecklistModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Checklist
        </Button>
      </div>
      <div className="flex flex-col space-y-4">
        {learningElements.map((element, index) => renderLearningElement(element, index))}
      </div>
      <div className="flex justify-center items-center">
        <Button onClick={() => setIsChecklistModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Checklist
        </Button>
      </div>
      <Dialog open={isChecklistModalOpen} onOpenChange={setIsChecklistModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingChecklist ? 'Edit My Checklist' : 'Add New Checklist'}</DialogTitle>
          </DialogHeader>
          {currentUser && program && week && (
            <UserChecklistForm
              initialData={editingChecklist || {}}
              onSubmit={handleSaveUserChecklist}
              onCancel={() => setIsChecklistModalOpen(false)}
              programId={program.id}
              weekId={week.id}
              userId={currentUser.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}