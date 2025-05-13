
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import type { Program, Week, QuestionAnswerSessionContent, QAItem, User as UserType, UserQASessionResponseItem } from '@/types';
import { getProgramBySlug } from '@/services/programService';
import { useToast } from '@/hooks/use-toast';
import { mockUser as fallbackMockUser } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

interface UserQAResponse extends UserQASessionResponseItem {} 

export default function QASessionPage() {
  const { slug: routeSlug, weekId: routeWeekId, qaSessionId: routeQASessionId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [programSlug, setProgramSlugState] = useState<string | null>(null);
  const [weekId, setWeekIdState] = useState<string | null>(null);
  const [qaSessionId, setQASessionIdState] = useState<string | null>(null);

  const [program, setProgram] = useState<Program | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [sessionContent, setSessionContent] = useState<QuestionAnswerSessionContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); 
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (typeof routeSlug === 'string') setProgramSlugState(routeSlug); else setProgramSlugState(null);
  }, [routeSlug]);
  useEffect(() => {
    if (typeof routeWeekId === 'string') setWeekIdState(routeWeekId); else setWeekIdState(null);
  }, [routeWeekId]);
  useEffect(() => {
    if (typeof routeQASessionId === 'string') setQASessionIdState(routeQASessionId); else setQASessionIdState(null);
  }, [routeQASessionId]);

  useEffect(() => {
    const storedUserProfileString = localStorage.getItem('userProfile');
    if (storedUserProfileString) {
      try {
        setCurrentUser(JSON.parse(storedUserProfileString));
      } catch (e) {
        console.error("Failed to parse userProfile from localStorage", e);
        setCurrentUser(fallbackMockUser);
      }
    } else {
      setCurrentUser(fallbackMockUser);
    }
  }, []);


  useEffect(() => {
    const loadSessionData = async () => {
      if (!programSlug || !weekId || !qaSessionId || !currentUser) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const fetchedProgram = await getProgramBySlug(programSlug);
      if (fetchedProgram) {
        setProgram(fetchedProgram);
        const currentWeek = fetchedProgram.weeks?.find(w => w.id === weekId);
        if (currentWeek) {
          setWeek(currentWeek);
          const learningElement = currentWeek.learningElements?.find(el => el.type === 'qa_session' && el.id === qaSessionId);
          if (learningElement && learningElement.type === 'qa_session') {
            setSessionContent(learningElement.content);
            if (currentUser?.qaSessionResponses && currentUser.qaSessionResponses[learningElement.content.id]) {
                const initialAnswers: Record<string, string> = {};
                currentUser.qaSessionResponses[learningElement.content.id].forEach(item => {
                    initialAnswers[item.promptId] = item.answer;
                });
                setUserAnswers(initialAnswers);
                if (learningElement.content.prompts.every(p => initialAnswers[p.id]?.trim())) {
                    setIsCompleted(true);
                }
            }
          } else {
            toast({ title: "Error", description: "Q&A Session not found in this week.", variant: "destructive" });
            setSessionContent(null);
          }
        } else {
          toast({ title: "Error", description: "Week not found.", variant: "destructive" });
          setWeek(null);
        }
      } else {
        toast({ title: "Error", description: "Program not found.", variant: "destructive" });
        setProgram(null);
      }
      setIsLoading(false);
    };
    if (currentUser && programSlug && weekId && qaSessionId) {
        loadSessionData();
    } else if (routeSlug === null || routeWeekId === null || routeQASessionId === null) {
        setIsLoading(false);
    }
  }, [programSlug, weekId, qaSessionId, toast, currentUser, routeSlug, routeWeekId, routeQASessionId]);


  const handleAnswerChange = (promptId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [promptId]: answer }));
    setIsCompleted(false); 
  };
  
  const handleSessionSubmit = () => {
    if (!sessionContent || !currentUser) {
        toast({ title: "Error", description: "Session or user data missing.", variant: "destructive" });
        return;
    }

    const allPromptsAnswered = sessionContent.prompts.every(prompt => userAnswers[prompt.id]?.trim());

    if (!allPromptsAnswered && !isCompleted) { 
        toast({ title: "Incomplete", description: "Please answer all prompts before submitting.", variant: "destructive" });
        return;
    }
    
    const responsesToSave: UserQASessionResponseItem[] = sessionContent.prompts.map(prompt => ({
        promptId: prompt.id,
        answer: userAnswers[prompt.id] || "" 
    }));

    const updatedUser = {
        ...currentUser,
        qaSessionResponses: {
            ...(currentUser.qaSessionResponses || {}),
            [sessionContent.id]: responsesToSave,
        },
    };
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser); 
    setIsCompleted(true);
    toast({ title: "Session Responses Saved", description: "Your answers have been recorded."});
  };


  if (isLoading || !currentUser) {
    return <div className="flex justify-center items-center h-64"><p>Loading Q&A session...</p></div>;
  }

  if (!sessionContent || !program || !week) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Q&A Session Not Found</h1>
        <p className="text-muted-foreground">The session you are looking for does not exist or could not be loaded.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program/Week
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild>
        <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Week Content
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
            <div className="flex items-center space-x-3">
                <HelpCircle className="h-8 w-8 text-primary"/>
                <div>
                    <CardTitle className="text-2xl text-primary">{sessionContent.title}</CardTitle>
                    {sessionContent.description && <CardDescription>{sessionContent.description}</CardDescription>}
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            {sessionContent.prompts.map((prompt, index) => (
                <div key={prompt.id} className="space-y-2">
                    <Label htmlFor={`prompt-${prompt.id}`} className="text-base font-medium text-foreground/90">
                        {index + 1}. {prompt.question}
                    </Label>
                    <Textarea
                        id={`prompt-${prompt.id}`}
                        value={userAnswers[prompt.id] || ''}
                        onChange={(e) => handleAnswerChange(prompt.id, e.target.value)}
                        placeholder={prompt.answerPlaceholder || "Your answer..."}
                        rows={3}
                        className="bg-background focus:border-primary"
                        disabled={isCompleted}
                    />
                </div>
            ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t">
            {isCompleted ? (
                <div className="flex items-center text-green-600 font-semibold">
                    <CheckCircle className="mr-2 h-5 w-5"/> Session Completed & Saved
                </div>
            ) : (
                <Button onClick={handleSessionSubmit} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    Submit All Answers
                </Button>
            )}
             <Button onClick={() => router.push(programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs"))} className="w-full sm:w-auto" variant="outline">
                Return to Week
             </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
