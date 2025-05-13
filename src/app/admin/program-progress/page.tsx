
"use client";

import { useEffect, useState } from 'react';
import { mockPrograms, mockUsers } from '@/lib/mock-data';
import type { Program, User, ProgramCompletion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgramProgressDataTable, type ProgramProgressEntry } from '@/components/admin/program-progress-data-table';
import { ProgramOverallStatsTable, type ProgramOverallStatsEntry } from '@/components/admin/program-overall-stats-table';
import { Filter, Activity, BarChartHorizontalBig } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProgramProgressPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allProgramProgress, setAllProgramProgress] = useState<ProgramProgressEntry[]>([]);
  const [programOverallStats, setProgramOverallStats] = useState<ProgramOverallStatsEntry[]>([]);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>("all");

  useEffect(() => {
    // Load Programs
    const storedProgramsString = localStorage.getItem('mockPrograms');
    if (storedProgramsString) {
      try {
        setPrograms(JSON.parse(storedProgramsString));
      } catch (error) {
        console.error("Error parsing programs from localStorage:", error);
        setPrograms(mockPrograms);
      }
    } else {
      setPrograms(mockPrograms);
    }

    // Load Users
    const storedUsersString = localStorage.getItem('mockUsers');
    if (storedUsersString) {
      try {
        setUsers(JSON.parse(storedUsersString));
      } catch (error) {
        console.error("Error parsing users from localStorage:", error);
        setUsers(mockUsers);
      }
    } else {
      setUsers(mockUsers);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && programs.length > 0 && users.length > 0) {
      // Calculate User-Specific Program Progress
      const newUserProgressEntries: ProgramProgressEntry[] = [];
      users.forEach(user => {
        programs.forEach(program => {
          const completionInfo = user.programCompletions?.find(pc => pc.programId === program.id);
          const hasCompleted = !!completionInfo;
          const progressPercent = hasCompleted ? 100 : 0; // Simplified progress
          const status: ProgramProgressEntry['status'] = hasCompleted ? 'Completed' : 'Not Started';
          
          newUserProgressEntries.push({
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatarUrl || `https://picsum.photos/seed/${user.id}/100`,
            programId: program.id,
            programTitle: program.title,
            progressPercent,
            status,
            satisfactionScore: completionInfo?.satisfactionScore,
            completionDate: completionInfo?.completionDate,
          });
        });
      });
      setAllProgramProgress(newUserProgressEntries);

      // Calculate Overall Program Statistics
      const newProgramStats: ProgramOverallStatsEntry[] = programs.map(program => {
        const completions = users.reduce((acc, user) => {
          const completion = user.programCompletions?.find(pc => pc.programId === program.id);
          if (completion) {
            acc.push(completion);
          }
          return acc;
        }, [] as ProgramCompletion[]);

        const completedCount = completions.length;
        
        // For "participantCount", let's consider users who completed as participants for now.
        // A more robust system would have explicit enrollment.
        const participantCount = completedCount; // Or users.length if all users are potential participants for all programs
        
        const completionRate = participantCount > 0 ? ((completedCount / users.length) * 100) : 0; // Rate against all users

        const totalSatisfactionScore = completions.reduce((sum, c) => sum + (c.satisfactionScore || 0), 0);
        const averageSatisfaction = completedCount > 0 && totalSatisfactionScore > 0
          ? parseFloat((totalSatisfactionScore / completions.filter(c => c.satisfactionScore !== undefined).length).toFixed(1))
          : null;
        
        return {
          programId: program.id,
          programTitle: program.title,
          participantCount: users.length, // Total users as potential participants
          completedCount,
          completionRate: parseFloat(completionRate.toFixed(1)),
          averageSatisfaction,
        };
      });
      setProgramOverallStats(newProgramStats);
    }
  }, [users, programs, isLoading]);

  const filteredUserProgressData = allProgramProgress.filter(entry =>
    selectedProgramFilter === "all" || entry.programId === selectedProgramFilter
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading program progress data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Program Progress & Statistics</h1>
        <p className="text-muted-foreground">Monitor user participation, completion, and satisfaction across programs.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BarChartHorizontalBig className="mr-3 h-6 w-6 text-primary" />Overall Program Statistics</CardTitle>
          <CardDescription>Summary statistics for each program.</CardDescription>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No programs available to display statistics.</p>
          ) : (
            <ProgramOverallStatsTable data={programOverallStats} />
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow">
            <CardTitle className="text-xl flex items-center"><Activity className="mr-3 h-6 w-6 text-primary"/>Detailed User Progress</CardTitle>
            <CardDescription>View individual user progress for specific programs.</CardDescription>
          </div>
          <Select value={selectedProgramFilter} onValueChange={setSelectedProgramFilter}>
            <SelectTrigger className="w-full md:w-[300px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>
                  {program.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No programs available to display progress.</p>
          ) : (
            <ProgramProgressDataTable data={filteredUserProgressData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
