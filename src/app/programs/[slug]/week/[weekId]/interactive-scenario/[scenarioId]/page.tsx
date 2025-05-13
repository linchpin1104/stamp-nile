
"use client";

import { InteractiveScenarioPlayer } from '@/components/interactive-scenario-player';
import { mockScenarios, mockPrograms, mockUser as fallbackMockUser } from '@/lib/mock-data';
import type { InteractiveScenario, User as UserType, Program as ProgramType, Week as WeekType } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface InteractiveScenarioPageProps {
  // Params are now obtained via useParams hook
}

export default function InteractiveScenarioPage({}: InteractiveScenarioPageProps) {
  const { scenarioId: routeScenarioId, slug: routeSlug, weekId: routeWeekId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [scenarioId, setScenarioIdState] = useState<string | null>(null);
  const [programSlug, setProgramSlugState] = useState<string | null>(null);
  const [weekId, setWeekIdState] = useState<string | null>(null);

  const [scenario, setScenarioState] = useState<InteractiveScenario | null | undefined>(undefined);
  const [program, setProgramState] = useState<ProgramType | null | undefined>(undefined);
  const [week, setWeekState] = useState<WeekType | null | undefined>(undefined); 
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (typeof routeScenarioId === 'string') setScenarioIdState(routeScenarioId);
    else setScenarioIdState(null);
  }, [routeScenarioId]);

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
    if (scenarioId && programSlug && weekId) {
      setIsLoading(true);
      const currentScenario = mockScenarios.find(s => s.id === scenarioId);
      setScenarioState(currentScenario || null);

      // Assuming getProgramBySlug is async or mockPrograms is directly available
      const findProgram = async () => {
        const currentProgram = mockPrograms.find(p => p.slug === programSlug); // Or await getProgramBySlug(programSlug)
        setProgramState(currentProgram || null);

        if (currentProgram) {
          const currentWeekData = currentProgram.weeks.find(w => w.id === weekId);
          setWeekState(currentWeekData || null);
        } else {
          setWeekState(null);
        }
        setIsLoading(false);
      };
      findProgram();
      
    } else if (routeScenarioId === null || routeSlug === null || routeWeekId === null ) { 
        setIsLoading(false); 
    }
  }, [scenarioId, programSlug, weekId, routeScenarioId, routeSlug, routeWeekId]);

  if (isLoading) {
    return <div className="text-center py-10"><p>Loading scenario details...</p></div>;
  }
  
  if (!scenario || !program || !week || !currentUser) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Scenario Not Found or User Data Missing</h1>
        <p className="text-muted-foreground">The interactive scenario you are looking for does not exist or user data could not be loaded.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program/Week
          </Link>
        </Button>
      </div>
    );
  }

  const handleScenarioComplete = (completedScenarioId: string, finalUserResponses: Record<string, string | string[]>) => {
    console.log(`Scenario ${completedScenarioId} completed. Responses:`, finalUserResponses);
    if (currentUser) {
        const updatedUser = {
            ...currentUser,
            scenarioResponses: {
                ...(currentUser.scenarioResponses || {}),
                [completedScenarioId]: finalUserResponses,
            },
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser); 
        toast({ title: "Scenario Responses Saved", description: "Your progress has been recorded."});
    }
    if(programSlug && weekId){
        router.push(`/programs/${programSlug}/week/${weekId}`);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}`: "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Week Content
          </Link>
        </Button>
      </div>
      <InteractiveScenarioPlayer scenario={scenario} onScenarioComplete={handleScenarioComplete} />
    </div>
  );
}
