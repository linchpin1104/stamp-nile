"use client";

import type { QuestionAnswerSessionContent, _QAItem } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, _FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const qaItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1, "Question prompt is required"),
  answerPlaceholder: z.string().optional(),
});

const qaSessionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Session title is required"),
  description: z.string().optional(),
  prompts: z.array(qaItemSchema).min(1, "At least one prompt is required.").max(10, "Maximum 10 prompts allowed."),
});

export type QASessionFormData = z.infer<typeof qaSessionSchema>;

interface QASessionFormProps {
  initialData: QuestionAnswerSessionContent;
  onSubmit: (data: QASessionFormData) => void;
  onCancel: () => void;
}

export function QASessionForm({ initialData, onSubmit, onCancel }: QASessionFormProps) {
  const form = useForm<QASessionFormData>({
    resolver: zodResolver(qaSessionSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prompts",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Q&A Session Title</FormLabel>
              <FormControl><Input placeholder="e.g., Weekly Reflection" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Brief description of the Q&A session" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <h3 className="text-lg font-medium">Prompts (Max 10)</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-muted/20 shadow-sm">
            <FormField
              control={form.control}
              name={`prompts.${index}.question`}
              render={({ field: promptField }) => (
                <FormItem>
                  <FormLabel>Prompt / Question {index + 1}</FormLabel>
                  <FormControl><Textarea placeholder="Enter the question or prompt for the user" {...promptField} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`prompts.${index}.answerPlaceholder`}
              render={({ field: promptField }) => (
                <FormItem>
                  <FormLabel>Answer Placeholder (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g., Your thoughts here..." {...promptField} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-1" /> Remove Prompt
            </Button>
          </div>
        ))}
        {fields.length < 10 && (
            <Button type="button" variant="outline" onClick={() => append({ id: generateId('prompt'), question: '', answerPlaceholder: '' })}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Prompt
            </Button>
        )}
        <FormMessage>{(form.formState.errors as Record<string, { message?: string }>)?.prompts?.message}</FormMessage>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Q&A Session</Button>
        </div>
      </form>
    </Form>
  );
}
