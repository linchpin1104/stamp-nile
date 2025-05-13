"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Voucher, Program } from '@/types';
import { mockPrograms, initialMockVouchers } from '@/lib/mock-data';
import { VouchersDataTable } from '@/components/admin/vouchers-data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from 'lucide-react';
import { VoucherGenerationDialog } from '@/components/admin/voucher-generation-dialog'; // Renamed for clarity
import { format } from 'date-fns';

const VOUCHERS_STORAGE_KEY = 'mockVouchers';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadVouchers = useCallback((currentPrograms: Program[]) => {
    const storedVouchersString = localStorage.getItem(VOUCHERS_STORAGE_KEY);
    let currentVouchers: Voucher[] = initialMockVouchers;
    if (storedVouchersString) {
      try {
        currentVouchers = JSON.parse(storedVouchersString);
      } catch (error) {
        console.error("Error parsing vouchers from localStorage:", error);
      }
    } else {
      localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(initialMockVouchers));
    }
    setVouchers(currentVouchers.map(v => ({
        ...v,
        programTitle: currentPrograms.find(p => p.id === v.programId)?.title || 'Unknown Program'
    })));
  }, []);


  useEffect(() => {
    // Load programs first
    const storedProgramsString = localStorage.getItem('mockPrograms');
    let loadedPrograms: Program[] = mockPrograms;
    if (storedProgramsString) {
        try {
            loadedPrograms = JSON.parse(storedProgramsString);
            setPrograms(loadedPrograms);
        } catch (error) {
            console.error("Error parsing programs from localStorage:", error);
            setPrograms(mockPrograms); // Fallback
        }
    } else {
        setPrograms(mockPrograms); // Fallback
    }
    loadVouchers(loadedPrograms);
    setIsLoading(false);
  }, [loadVouchers]);


  const handleGenerateVouchers = (newlyGeneratedVouchers: Voucher[]) => {
     const updatedVouchersWithTitles = newlyGeneratedVouchers.map(v => ({
        ...v,
        programTitle: programs.find(p => p.id === v.programId)?.title || 'Unknown Program'
    }));
    const updatedVouchers = [...vouchers, ...updatedVouchersWithTitles];
    setVouchers(updatedVouchers);
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(updatedVouchers.map(({programTitle, ...rest}) => rest))); // Store without programTitle
    toast({
      title: "Vouchers Generated",
      description: `${newlyGeneratedVouchers.length} voucher(s) have been successfully created.`,
    });
    setIsGenerationDialogOpen(false); // Close dialog after generation
  };

  const handleDeactivateVoucher = (voucherId: string) => {
    setVouchers(prev => prev.map(v => v.id === voucherId ? {...v, status: 'void'} : v));
    const currentStoredVouchers = JSON.parse(localStorage.getItem(VOUCHERS_STORAGE_KEY) || '[]') as Voucher[];
    const updatedStoredVouchers = currentStoredVouchers.map(v => v.id === voucherId ? {...v, status: 'void'} : v);
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(updatedStoredVouchers));

    toast({
      title: "Voucher Deactivated",
      description: `Voucher ${voucherId} has been voided.`,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading vouchers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Voucher Management</h1>
          <p className="text-muted-foreground">Create, view, and manage program access vouchers.</p>
        </div>
        <Button onClick={() => setIsGenerationDialogOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Generate Vouchers
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Vouchers</CardTitle>
          <CardDescription>A list of all vouchers in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <VouchersDataTable data={vouchers} programs={programs} onDeactivateVoucher={handleDeactivateVoucher} />
        </CardContent>
      </Card>

      <VoucherGenerationDialog
        isOpen={isGenerationDialogOpen}
        onClose={() => setIsGenerationDialogOpen(false)}
        onGenerate={handleGenerateVouchers}
        programs={programs}
      />
    </div>
  );
}
