"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Award, BookOpenCheck, ListChecks, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Program as ProgramType, User as UserType, ProgramCompletion } from '@/types';
import { getProgramBySlug } from '@/services/programService';
import { mockUser as fallbackMockUser } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { ProgramCompletionModal } from '@/components/program-completion-modal';
import { useToast } from '@/hooks/use-toast';


export default function ProgramReportPage() {
  const { slug: routeSlug } = useParams();
  const { toast } = useToast();
  
  const [programSlug, setProgramSlugState] = useState<string | null>(null);
  const [program, setProgram] = useState<ProgramType | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [programCompletion, setProgramCompletion] = useState<ProgramCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);

  useEffect(() => {
    if (typeof routeSlug === 'string') {
      setProgramSlugState(routeSlug);
    } else {
      setProgramSlugState(null);
    }
  }, [routeSlug]);

  useEffect(() => {
    const loadData = async () => {
      if (!programSlug) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const storedUser = localStorage.getItem('userProfile');
      const user: UserType = storedUser ? JSON.parse(storedUser) : fallbackMockUser;
      setCurrentUser(user);

      const fetchedProgram = await getProgramBySlug(programSlug);
      setProgram(fetchedProgram);

      if (fetchedProgram && user) {
        const completionRecord = user.programCompletions?.find(pc => pc.programId === fetchedProgram.id);
        setProgramCompletion(completionRecord || null);
      }
      setIsLoading(false);
    };
    if (programSlug) { // Only run if programSlug is resolved
        loadData();
    } else if (routeSlug === null) { // If param explicitly resolved to null
        setIsLoading(false);
    }
  }, [programSlug, routeSlug]);

  const handleSatisfactionSubmit = (satisfactionScore?: number) => {
    setShowSatisfactionModal(false);
    if (!currentUser || !program || satisfactionScore === undefined) {
        toast({ title: "Rating Not Saved", description: "Please provide a satisfaction rating.", variant: "destructive"});
        return;
    }
    
    const existingCompletion = currentUser.programCompletions?.find(pc => pc.programId === program.id);
    let updatedCompletion: ProgramCompletion;

    if (existingCompletion) {
        updatedCompletion = { ...existingCompletion, satisfactionScore };
    } else {
        updatedCompletion = {
            programId: program.id,
            completionDate: format(new Date(), 'yyyy-MM-dd'),
            satisfactionScore,
        };
    }
    
    const updatedCompletions = [
        ...(currentUser.programCompletions?.filter(pc => pc.programId !== program.id) || []),
        updatedCompletion
    ];
    
    const updatedUser: UserType = { ...currentUser, programCompletions: updatedCompletions };
    setCurrentUser(updatedUser);
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    setProgramCompletion(updatedCompletion);
    toast({ title: "Thank You!", description: "Your program satisfaction rating has been saved."});
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading program report...</p></div>;
  }

  if (!program || !currentUser) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Program Report Not Available</h1>
        <p className="text-muted-foreground">Could not load the program or user data to generate the report.</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
          </Link>
        </Button>
      </div>
    );
  }
  
  const completionDateFormatted = programCompletion?.completionDate 
    ? format(parseISO(programCompletion.completionDate), 'MMMM d, yyyy') 
    : 'Not officially marked complete yet';

  const totalLearningElements = program.weeks?.reduce((sum, week) => sum + (week.learningElements?.length || 0), 0) || 0;
  const completedChecklists = currentUser.customChecklists?.filter(cl => cl.programId === program.id && cl.items.every(item => item.isChecked)).length || 0;
  const totalMissions = currentUser.userMissions?.filter(m => m.linkedProgramMissionId && program.weeks?.some(w => w.learningElements?.some(le => le.type === 'mission_reminder' && le.id === m.linkedProgramMissionId))).length || 0;


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={`/programs/${program.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program Overview
          </Link>
        </Button>
         {!programCompletion?.satisfactionScore && (
             <Button onClick={() => setShowSatisfactionModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Star className="mr-2 h-4 w-4"/> Rate This Program
             </Button>
         )}
      </div>

      <Card className="shadow-xl">
        <CardHeader className="text-center bg-primary/10 pb-6">
           <Award className="h-16 w-16 text-accent mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Program Report</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Summary for "{program.title}"</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4">
            <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar medium"/>
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-lg">{currentUser.name}</p>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">Completion Date: {completionDateFormatted}</p>
          </div>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-primary flex items-center"><BookOpenCheck className="mr-2 h-5 w-5"/>Program Overview</h3>
            <p><span className="font-medium">Target Audience:</span> {program.targetAudience}</p>
            <p><span className="font-medium">Total Weeks:</span> {program.weeks?.length || 0}</p>
            <p><span className="font-medium">Total Learning Elements:</span> {totalLearningElements}</p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-primary flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Engagement Summary (Sample)</h3>
            <p><span className="font-medium">Checklists Completed:</span> {completedChecklists} (User-created checklists for this program)</p>
            <p><span className="font-medium">Missions Tracked:</span> {totalMissions}</p>
            <p className="text-xs text-muted-foreground">More detailed activity summaries will be available in future updates.</p>
          </section>
          
          {programCompletion?.satisfactionScore && (
            <>
                <Separator />
                <section className="space-y-2 text-center">
                    <h3 className="text-xl font-semibold text-primary">Your Satisfaction Rating</h3>
                    <div className="flex justify-center items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-7 w-7 ${i < programCompletion.satisfactionScore! ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                        />
                        ))}
                        <span className="ml-2 text-lg font-medium">({programCompletion.satisfactionScore}/5)</span>
                    </div>
                </section>
            </>
          )}


        </CardContent>
        <CardFooter className="p-6 border-t flex justify-center">
            <p className="text-sm text-muted-foreground">Thank you for participating in Parenting Pathways!</p>
        </CardFooter>
      </Card>
        {showSatisfactionModal && (
            <ProgramCompletionModal
            isOpen={showSatisfactionModal}
            onClose={handleSatisfactionSubmit}
            programTitle={program.title}
            />
        )}
    </div>
  );
}
