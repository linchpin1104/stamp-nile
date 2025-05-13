
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Week, LearningElementType } from '@/types';
import { Separator } from '../ui/separator';

// Schema for the fields directly managed by this form
const weekFormSchema = z.object({
  weekNumber: z.coerce.number().min(1, "Week number must be at least 1."),
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  summary: z.string().optional(),
  sequentialCompletionRequired: z.boolean().optional().default(false),
  initialLearningElementTypes: z.array(z.string()).optional(), // For selecting types in create mode
});

export type WeekFormData = z.infer<typeof weekFormSchema>;

// Props for the form: initialData for editing, onSubmit callback
interface WeekFormProps {
  initialData?: Partial<WeekFormData>; // Data for editing
  onSubmit: (data: WeekFormData) => void;
  programMaxWeeks?: number; // To suggest next week number for new weeks
  isEditing?: boolean;
}

export const availableLearningElementTypes: { id: LearningElementType; label: string }[] = [
  { id: 'video', label: 'Video Content' },
  { id: 'video_choice_group', label: 'Video Choice Group' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'action_item', label: 'Action Item' },
  { id: 'interactive_scenario_link', label: 'Interactive Scenario Link' },
  { id: 'text_content', label: 'Text Content (Article, Link)' },
  { id: 'psychological_test', label: 'Psychological Test (5-choice)' },
  { id: 'qa_session', label: 'Q&A Session' },
  { id: 'mission_reminder', label: 'Mission Reminder' },
  { id: 'ox_quiz', label: 'O/X Quiz' },
];


export function WeekForm({ initialData, onSubmit, programMaxWeeks, isEditing = false }: WeekFormProps) {
  const form = useForm<WeekFormData>({
    resolver: zodResolver(weekFormSchema),
    defaultValues: {
      weekNumber: initialData?.weekNumber || (programMaxWeeks ? programMaxWeeks + 1 : 1),
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      sequentialCompletionRequired: initialData?.sequentialCompletionRequired || false,
      initialLearningElementTypes: initialData?.initialLearningElementTypes || [],
    },
  });

  const handleSubmit = (values: WeekFormData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="weekNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week Number</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1" {...field} />
              </FormControl>
              <FormDescription>The sequential number of this week in the program.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to Mindful Parenting" {...field} />
              </FormControl>
              <FormDescription>The main title of this week's content.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Week Summary (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief overview of what this week covers." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sequentialCompletionRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Require Prior Week Completion</FormLabel>
                <FormDescription>
                  If enabled, learners must complete the previous week before accessing this one. (Full logic implemented on client-side view)
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isEditing && (
          <>
            <Separator />
            <FormField
              control={form.control}
              name="initialLearningElementTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Initial Learning Elements</FormLabel>
                    <FormDescription>
                      Select the types of content to include in this week. You'll add details later using the Content Builder.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableLearningElementTypes.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="initialLearningElementTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
          </>
        )}


        {isEditing && (
            <p className="text-sm text-muted-foreground">
            Note: Detailed content elements (videos, checklists, action items, etc.) for this week are managed on the main program edit page, under the "Manage Weeks & Content" tab, which will link to the Content Builder interface in the future. This form handles basic week properties.
            </p>
        )}

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {isEditing ? 'Update Week Details' : 'Add Week'}
        </Button>
      </form>
    </Form>
  );
}
