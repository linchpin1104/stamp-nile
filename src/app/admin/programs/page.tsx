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
          title: "오류",
          description: "프로그램을 불러올 수 없습니다. 다시 시도해주세요.",
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
        title: "프로그램 삭제됨",
        description: "프로그램이 성공적으로 삭제되었습니다.",
      });
    } else {
      toast({
        title: "오류",
        description: "프로그램 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">프로그램 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">프로그램 관리</h1>
          <p className="text-muted-foreground">모든 교육 프로그램을 보고, 생성하고, 관리합니다.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/admin/programs/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            새 프로그램 추가
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>모든 프로그램</CardTitle>
          <CardDescription>시스템에 있는 모든 프로그램 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramsDataTable data={programs} onDeleteProgram={handleDeleteProgram} />
        </CardContent>
      </Card>
    </div>
  );
}

