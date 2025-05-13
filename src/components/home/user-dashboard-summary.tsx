
"use client";

import type { User, Program } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LayoutDashboard, BookOpenCheck, ChevronRight, CheckCircle, PlayCircle } from 'lucide-react';
import Image from 'next/image';

interface UserDashboardSummaryProps {
  user: User;
  activePrograms: Program[];
}

export function UserDashboardSummary({ user, activePrograms }: UserDashboardSummaryProps) {

  // Simplified progress calculation for demo purposes
  const getProgramProgress = (programId: string): number => {
    // Check if explicitly completed
    if (user.completedProgramIds?.includes(programId)) {
      return 100;
    }
    // For active programs, show a simulated progress or 0 if no specific logic exists
    // This could be enhanced by checking completed weeks/elements
    const MOCK_IN_PROGRESS_PERCENTAGE = 45; // Example
    if (activePrograms.some(p => p.id === programId)) {
        return MOCK_IN_PROGRESS_PERCENTAGE; 
    }
    return 0;
  };


  return (
    <section className="mb-12">
      <Card className="shadow-lg bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome back, {user.name}!
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Here's a quick look at your parenting journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activePrograms.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Your Active Programs:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePrograms.slice(0, 2).map(program => ( // Show max 2 for summary
                  <Card key={program.id} className="bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-start space-x-3">
                      <Image
                        src={program.imageUrl || `https://picsum.photos/seed/${program.slug}/100`}
                        alt={program.title}
                        width={80}
                        height={60}
                        className="rounded-md object-cover aspect-[4/3]"
                        data-ai-hint="program small image"
                      />
                      <div className="flex-grow">
                        <Link href={`/programs/${program.slug}`} className="hover:text-accent">
                            <h4 className="font-semibold text-md text-primary truncate">{program.title}</h4>
                        </Link>
                        <p className="text-xs text-muted-foreground mb-1 truncate">{program.targetAudience}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={getProgramProgress(program.id)} className="h-1.5 w-full" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{getProgramProgress(program.id)}%</span>
                        </div>
                         <Button variant="link" size="sm" asChild className="p-0 h-auto text-accent mt-1.5">
                            <Link href={`/programs/${program.slug}`}>
                                Continue Program <ChevronRight className="h-4 w-4 ml-1"/>
                            </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
               {activePrograms.length > 2 && (
                 <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/profile">View All My Programs</Link>
                 </Button>
                )}
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpenCheck className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">
                You're not currently active in any programs.
              </p>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/programs">Explore Programs</Link>
              </Button>
            </div>
          )}
          
          <div className="pt-4 border-t border-border/50">
             <Button variant="ghost" asChild className="text-foreground hover:text-accent">
                <Link href="/profile">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to My Full Dashboard
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
