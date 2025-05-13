
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Program, Voucher } from '@/types';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Ticket, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const generateVoucherCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = '';
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
};

const voucherGenerationSchema = z.object({
  count: z.coerce.number().min(1, "Must generate at least 1 voucher.").max(100, "Cannot generate more than 100 vouchers at a time."),
  programIds: z.array(z.string()).min(1, "At least one program must be selected."),
  registrationStartDate: z.date({ required_error: "Registration start date is required."}),
  registrationEndDate: z.date({ required_error: "Registration end date is required."}),
  accessDurationDays: z.coerce.number().min(1, "Access duration must be at least 1 day."),
}).refine(data => data.registrationEndDate >= data.registrationStartDate, {
    message: "Registration end date cannot be before start date.",
    path: ["registrationEndDate"],
});

type VoucherGenerationFormData = z.infer<typeof voucherGenerationSchema>;

interface VoucherGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (vouchers: Voucher[]) => void;
  programs: Program[];
}

export function VoucherGenerationDialog({ isOpen, onClose, onGenerate, programs }: VoucherGenerationDialogProps) {
  const form = useForm<VoucherGenerationFormData>({
    resolver: zodResolver(voucherGenerationSchema),
    defaultValues: {
      count: 1,
      programIds: [],
      accessDurationDays: 30,
      registrationStartDate: new Date(),
      registrationEndDate: addDays(new Date(), 30)
    },
  });

  const [customCode, setCustomCode] = useState('');
  const [customCodeError, setCustomCodeError] = useState('');

  const validateCustomCode = (code: string): boolean => {
    if (code.length === 0) { // Custom code is optional
        setCustomCodeError('');
        return true; 
    }
    const isValid = /^[A-Z]{2}\d{4}$/.test(code);
    if (!isValid) {
        setCustomCodeError("Custom code must be 2 uppercase letters followed by 4 digits (e.g., AB1234).");
    } else {
        setCustomCodeError('');
    }
    return isValid;
  }

  const downloadVoucherCodes = (vouchersToDownload: Voucher[]) => {
    if (vouchersToDownload.length === 0) {
        return;
    }

    const headers = "Code,ProgramTitle,RegistrationStartDate,RegistrationEndDate,AccessDurationDays";
    const csvContent = vouchersToDownload
        .map(v => {
            const programTitle = v.programTitle?.includes(',') ? `"${v.programTitle}"` : v.programTitle;
            return `${v.code},${programTitle},${v.registrationStartDate},${v.registrationEndDate},${v.accessDurationDays}`;
        })
        .join("\n");

    const fullCsv = `${headers}\n${csvContent}`;
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `vouchers-${format(new Date(), 'yyyyMMddHHmmss')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("Could not automatically download the file. Your browser might not support this feature.");
    }
  };


  const handleSubmit = (values: VoucherGenerationFormData) => {
    const { count, programIds, registrationStartDate, registrationEndDate, accessDurationDays } = values;
    const allNewVouchers: Voucher[] = [];
    const generatedCodesThisSession = new Set<string>(); // Ensures uniqueness within this generation batch
    const today = format(new Date(), 'yyyy-MM-dd');
    let validGeneration = true;

    // Validate custom code if count is 1 and customCode is provided
    if (count === 1 && customCode && !validateCustomCode(customCode)) {
        form.setError("root", { message: "Invalid custom code provided." }); // Attach error to form for visibility
        return; // Stop generation
    }
    
    programIds.forEach((selectedProgramId, progIndex) => {
        if (!validGeneration) return;

        const program = programs.find(p => p.id === selectedProgramId);
        if (!program) {
            console.warn(`Program with ID ${selectedProgramId} not found during voucher generation.`);
            form.setError("programIds", { message: `Program ID ${selectedProgramId} is invalid.` });
            validGeneration = false;
            return;
        }

        for (let i = 0; i < count; i++) {
            let codeToUse: string;

            // Apply custom code only if:
            // 1. Generating exactly 1 voucher in total (count === 1)
            // 2. Custom code is provided
            // 3. This is the first program being processed (if multiple programs selected with count=1)
            if (count === 1 && customCode && progIndex === 0 && i === 0) {
                // Uniqueness for custom code (against batch, ideally against all existing too, but harder for mock)
                if (generatedCodesThisSession.has(customCode)) {
                   setCustomCodeError(`Custom code ${customCode} conflicts with a generated code in this batch or is already used.`);
                   validGeneration = false;
                   return;
                }
                codeToUse = customCode;
            } else {
                do {
                    codeToUse = generateVoucherCode();
                } while (generatedCodesThisSession.has(codeToUse));
            }
            generatedCodesThisSession.add(codeToUse);

            allNewVouchers.push({
                id: codeToUse, 
                code: codeToUse,
                programId: selectedProgramId,
                programTitle: program.title,
                registrationStartDate: format(registrationStartDate, 'yyyy-MM-dd'),
                registrationEndDate: format(registrationEndDate, 'yyyy-MM-dd'),
                accessDurationDays,
                status: 'available',
                createdAt: today,
            });
        }
    });

    if (validGeneration && allNewVouchers.length > 0) {
        onGenerate(allNewVouchers);
        downloadVoucherCodes(allNewVouchers);
        form.reset({
            count: 1,
            programIds: [],
            accessDurationDays: 30,
            registrationStartDate: new Date(),
            registrationEndDate: addDays(new Date(), 30)
        });
        setCustomCode('');
        setCustomCodeError('');
        onClose();
    } else if (validGeneration && programIds.length > 0 && allNewVouchers.length === 0 && count > 0) {
        // This implies an issue like custom code validation failed or no programs found that passed checks
        console.log("Voucher generation halted or resulted in no vouchers. Check form errors or logs.");
        // Errors should be displayed via form.setError or customCodeError
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Ticket className="mr-2 h-6 w-6 text-primary"/>Generate Program Vouchers</DialogTitle>
          <DialogDescription>
            Create new vouchers to grant access to specific programs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="programIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associate with Programs</FormLabel>
                  <FormDescription>Select one or more programs for these vouchers.</FormDescription>
                  <div className="space-y-2 rounded-md border p-4 max-h-48 overflow-y-auto bg-background">
                    {programs.length === 0 && <p className="text-sm text-muted-foreground">No programs available to select.</p>}
                    {programs.map((p) => (
                      <FormItem
                        key={p.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(p.id)}
                            onCheckedChange={(checked) => {
                              const currentProgramIds = field.value || [];
                              const newProgramIds = checked
                                ? [...currentProgramIds, p.id]
                                : currentProgramIds.filter(
                                    (value) => value !== p.id
                                  );
                              field.onChange(newProgramIds);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {p.title}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Number of Vouchers</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>Max 100. For 1, you can set a custom code below.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormItem>
                    <FormLabel>Custom Code (for 1 voucher)</FormLabel>
                    <FormControl>
                        <Input 
                            placeholder="e.g., AB1234 (Optional)" 
                            value={customCode}
                            onChange={(e) => {
                                const newCustomCode = e.target.value.toUpperCase();
                                setCustomCode(newCustomCode);
                                if (form.getValues("count") === 1) {
                                    validateCustomCode(newCustomCode);
                                } else {
                                    setCustomCodeError(''); // Clear error if count is not 1
                                }
                            }}
                            disabled={form.watch("count") !== 1}
                        />
                    </FormControl>
                    {customCodeError && <p className="text-sm font-medium text-destructive flex items-center pt-1"><AlertCircle className="h-4 w-4 mr-1"/>{customCodeError}</p>}
                 </FormItem>
            </div>

            <FormField
                control={form.control}
                name="registrationStartDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Registration Valid From</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="registrationEndDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Registration Valid Until</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="accessDurationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Access Duration (Days)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormDescription>Number of days the program is accessible after voucher registration.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Generate Vouchers</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
