
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Program } from '@/types';
import { PlusCircle } from 'lucide-react';
import { ProgramsDataTable } from '@/components/admin/programs-data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { getPrograms, deleteProgram } from '@/services/programService';

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const fetchedPrograms = await getPrograms();
        setPrograms(fetchedPrograms);
      } catch (error) {
        console.error("Error fetching programs from Firestore:", error);
        toast({
          title: "Error",
          description: "Could not load programs. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchPrograms();
  }, [toast]);

  const handleDeleteProgram = async (programId: string) => {
    const success = await deleteProgram(programId);
    if (success) {
      setPrograms(prevPrograms => prevPrograms.filter(p => p.id !== programId));
      toast({
        title: "Program Deleted",
        description: "The program has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Program Management</h1>
          <p className="text-muted-foreground">View, create, and manage all educational programs.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/admin/programs/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Program
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>A list of all programs currently in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramsDataTable data={programs} onDeleteProgram={handleDeleteProgram} />
        </CardContent>
      </Card>
    </div>
  );
}

