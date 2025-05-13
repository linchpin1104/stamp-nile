"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProgramForm } from '@/components/admin/program-form';
import { WeeksDataTable } from '@/components/admin/weeks-data-table';
import type { Program, Week as _Week, CompanyDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, PlusCircle, Settings, ListChecks } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProgramById, updateProgram } from '@/services/programService';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

export default function EditProgramPage() {
  const _router = useRouter();
  const { programId: routeProgramId } = useParams();
  const { toast } = useToast();

  const [programId, setProgramId] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (typeof routeProgramId === 'string') {
      setProgramId(routeProgramId);
    } else {
      setProgramId(null);
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
          toast({ title: "Error", description: "Program not found.", variant: "destructive" });
          _router.push('/admin/programs');
        }
        setIsLoading(false);
      };
      fetchProgram();
    }
  }, [programId, _router, toast]);

  const handleUpdateProgram = async (data: Omit<Program, 'id' | 'weeks' | 'slug'> & { slug?: string, tagsString?: string, companySpecificDocuments?: CompanyDocument[] }) => {
    if (!program || !programId) return;

    const programDataToUpdate: Partial<Program> = {
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      description: data.description,
      longDescription: data.longDescription,
      imageUrl: data.imageUrl || program.imageUrl,
      targetAudience: data.targetAudience,
      tags: data.tagsString ? data.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : (program.tags || []),
      companySpecificDocuments: data.companySpecificDocuments || program.companySpecificDocuments || [],
      // Weeks are part of the program object and will be updated when the program object is saved
    };
    
    const success = await updateProgram(programId, programDataToUpdate);

    if (success) {
      setProgram(prev => prev ? ({ ...prev, ...programDataToUpdate } as Program) : null);
      toast({ title: "Program Updated", description: "Program details saved successfully." });
    } else {
      toast({ title: "Error", description: "Failed to update program.", variant: "destructive" });
    }
  };

  const handleDeleteWeek = async (weekId: string) => {
    if (!program || !programId) return;
    const updatedWeeks = (program.weeks || []).filter(w => w.id !== weekId);
    const updatedProgramData = { ...program, weeks: updatedWeeks };
    
    const success = await updateProgram(programId, { weeks: updatedWeeks });

    if (success) {
        setProgram(updatedProgramData);
        toast({ title: "Week Deleted", description: "The week has been removed from the program." });
    } else {
        toast({ title: "Error", description: "Could not update program to delete week.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading program details...</p></div>;
  }

  if (!program) {
    return <div className="text-center py-10">Program not found. <Link href="/admin/programs" className="text-accent underline">Go back</Link>.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Programs
          </Link>
        </Button>
      </div>

      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Program</h1>
        <p className="text-muted-foreground">Edit details and manage weeks for: <span className="font-semibold text-foreground">{program.title}</span></p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-2">
          <TabsTrigger value="details"><Settings className="mr-2 h-4 w-4" />Program Details</TabsTrigger>
          <TabsTrigger value="weeks"><ListChecks className="mr-2 h-4 w-4" />Manage Weeks & Content</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Edit Program Information</CardTitle>
              <CardDescription>Modify the core details and company-specific documents for this program.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramForm initialData={program} onSubmit={handleUpdateProgram} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weeks" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Program Weeks & Content</CardTitle>
                <CardDescription>Organize the weekly curriculum and learning elements.</CardDescription>
              </div>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={`/admin/programs/${program.id}/weeks/create`}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Week
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <WeeksDataTable programId={program.id} data={program.weeks || []} onDeleteWeek={handleDeleteWeek} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
