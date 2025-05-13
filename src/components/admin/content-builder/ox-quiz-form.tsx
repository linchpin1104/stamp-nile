"use client";

import type { OXQuizContent } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const oxQuizQuestionSchema = z.object({
  id: z.string(),
  statement: z.string().min(1, "Question statement is required"),
  correctAnswer: z.boolean(), // true for O (Yes/True), false for X (No/False)
  explanation: z.string().optional(),
});

const oxQuizSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
  questions: z.array(oxQuizQuestionSchema).min(1, "At least one question is required."),
});

export type OXQuizFormData = z.infer<typeof oxQuizSchema>;

interface OXQuizFormProps {
  initialData: OXQuizContent;
  onSubmit: (data: OXQuizFormData) => void;
  onCancel: () => void;
}

export function OXQuizForm({ initialData, onSubmit, onCancel }: OXQuizFormProps) {
  const form = useForm<OXQuizFormData>({
    resolver: zodResolver(oxQuizSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>O/X Quiz Title</FormLabel>
              <FormControl><Input placeholder="e.g., Toddler Sleep Myths" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Brief description of the quiz" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <h3 className="text-lg font-medium">Quiz Questions</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-muted/20 shadow-sm">
            <FormField
              control={form.control}
              name={`questions.${index}.statement`}
              render={({ field: qField }) => (
                <FormItem>
                  <FormLabel>Statement / Question {index + 1}</FormLabel>
                  <FormControl><Textarea placeholder="Enter the statement for O/X evaluation" {...qField} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.correctAnswer`}
              render={({ field: qField }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                  <div className="space-y-0.5">
                    <FormLabel>Correct Answer is &quot;O&quot; (True/Yes)</FormLabel>
                    <FormDescription>
                      Switch on if &quot;O&quot; (True/Yes) is correct. Off if &quot;X&quot; (False/No) is correct.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={qField.value}
                      onCheckedChange={qField.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.explanation`}
              render={({ field: qField }) => (
                <FormItem>
                  <FormLabel>Explanation (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Explanation shown after user answers" {...qField} rows={1} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-1" /> Remove Question
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ id: generateId('oxq'), statement: '', correctAnswer: true, explanation: '' })}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Question
        </Button>
        <FormMessage>{form.formState.errors.questions?.message}</FormMessage>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save O/X Quiz</Button>
        </div>
      </form>
    </Form>
  );
}
