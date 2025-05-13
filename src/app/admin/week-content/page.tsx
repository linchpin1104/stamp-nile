
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WeeksDataTable } from '@/components/admin/weeks-data-table';
import type { Program, Week } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, LayoutList, ListChecks } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getPrograms, getProgramById, updateProgram } from '@/services/programService';

export default function ManageWeekContentPage() {
  const { toast } = useToast();
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingProgramDetails, setIsLoadingProgramDetails] = useState(false);

  useEffect(() => {
    const fetchAllPrograms = async () => {
      setIsLoadingPrograms(true);
      const fetchedPrograms = await getPrograms();
      setAllPrograms(fetchedPrograms);
      setIsLoadingPrograms(false);
    };
    fetchAllPrograms();
  }, []);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (!selectedProgramId) {
        setSelectedProgram(null);
        return;
      }
      setIsLoadingProgramDetails(true);
      const fetchedProgram = await getProgramById(selectedProgramId);
      setSelectedProgram(fetchedProgram);
      setIsLoadingProgramDetails(false);
    };
    fetchProgramDetails();
  }, [selectedProgramId]);

  const handleDeleteWeek = async (weekId: string) => {
    if (!selectedProgram) return;
    const updatedWeeks = (selectedProgram.weeks || []).filter(w => w.id !== weekId);
    
    const success = await updateProgram(selectedProgram.id, { weeks: updatedWeeks });

    if (success) {
      // Re-fetch program details to update the UI
      const refreshedProgram = await getProgramById(selectedProgram.id);
      setSelectedProgram(refreshedProgram);
      toast({ title: "Week Deleted", description: "The week has been removed from the program." });
    } else {
      toast({ title: "Error", description: "Could not update program to delete week.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <LayoutList className="mr-3 h-8 w-8" /> Week Content Management
        </h1>
        <p className="text-muted-foreground">Select a program to manage its weekly content structure.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select Program</CardTitle>
          <CardDescription>Choose a program from the list to view and manage its weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPrograms ? (
            <p className="text-muted-foreground">Loading programs...</p>
          ) : allPrograms.length === 0 ? (
            <p className="text-muted-foreground">No programs available. <Link href="/admin/programs/create" className="text-accent underline">Create a program first</Link>.</p>
          ) : (
            <Select onValueChange={setSelectedProgramId} value={selectedProgramId || undefined}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select a program..." />
              </SelectTrigger>
              <SelectContent>
                {allPrograms.map(prog => (
                  <SelectItem key={prog.id} value={prog.id}>
                    {prog.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedProgramId && (
        isLoadingProgramDetails ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Loading program details...</p>
          </div>
        ) : selectedProgram ? (
          <Card className="shadow-lg mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <ListChecks className="mr-2 h-5 w-5 text-primary"/> Weeks for: <span className="ml-2 font-medium text-foreground">{selectedProgram.title}</span>
                </CardTitle>
                <CardDescription>Organize the weekly curriculum and learning elements.</CardDescription>
              </div>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={`/admin/programs/${selectedProgram.id}/weeks/create`}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Week
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <WeeksDataTable programId={selectedProgram.id} data={selectedProgram.weeks || []} onDeleteWeek={handleDeleteWeek} />
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground mt-4 text-center">Program details could not be loaded.</p>
        )
      )}
    </div>
  );
}
