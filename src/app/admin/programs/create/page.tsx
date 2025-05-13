
"use client";

import { ProgramForm } from '@/components/admin/program-form';
import { useRouter } from 'next/navigation';
import type { Program, Week, CompanyDocument } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createProgram } from '@/services/programService';

// Helper function to generate a slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

export default function CreateProgramPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateProgram = async (data: Omit<Program, 'id' | 'weeks' | 'slug'> & { slug?: string, tagsString?: string, companySpecificDocuments?: CompanyDocument[]}) => {
    
    const programDataToCreate: Omit<Program, 'id'> = {
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      description: data.description,
      longDescription: data.longDescription || '',
      imageUrl: data.imageUrl || `https://picsum.photos/seed/${generateSlug(data.title) || 'newprog'}/600/400`,
      targetAudience: data.targetAudience,
      weeks: [] as Week[], 
      tags: data.tagsString ? data.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      companySpecificDocuments: data.companySpecificDocuments || [],
    };

    const newProgramId = await createProgram(programDataToCreate);
    
    if (newProgramId) {
      toast({
        title: "Program Created",
        description: `"${programDataToCreate.title}" has been successfully created.`,
      });
      router.push('/admin/programs');
    } else {
      toast({
        title: "Error",
        description: "Failed to create program. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" asChild>
            <Link href="/admin/programs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
            </Link>
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Create New Program</CardTitle>
          <CardDescription>Fill in the details for the new educational program.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm onSubmit={handleCreateProgram} />
        </CardContent>
      </Card>
    </div>
  );
}
