
"use client";

import type { MissionReminderContent } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

// Schema for admin defining a mission reminder
const missionReminderSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Reminder title is required (e.g., Weekly Check-in: Core Mission)"),
  missionTitle: z.string().min(1, "The actual mission title is required"),
  missionDescription: z.string().min(1, "Description of the mission is required"),
});

export type MissionReminderFormData = z.infer<typeof missionReminderSchema>;

interface MissionReminderFormProps {
  initialData: MissionReminderContent;
  onSubmit: (data: MissionReminderFormData) => void;
  onCancel: () => void;
}

export function MissionReminderForm({ initialData, onSubmit, onCancel }: MissionReminderFormProps) {
  const form = useForm<MissionReminderFormData>({
    resolver: zodResolver(missionReminderSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Element Title</FormLabel>
              <FormControl><Input placeholder="e.g., Weekly Check-in: Your Parenting Goal" {...field} /></FormControl>
              <FormDescription>The title for this specific reminder element in the week's content.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="missionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission Title</FormLabel>
              <FormControl><Input placeholder="e.g., Be a More Present Parent" {...field} /></FormControl>
              <FormDescription>The core mission this reminder relates to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="missionDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission Description</FormLabel>
              <FormControl><Textarea placeholder="Describe the mission in detail..." {...field} rows={3} /></FormControl>
              <FormDescription>A clear explanation of what the mission entails.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Mission Reminder</Button>
        </div>
      </form>
    </Form>
  );
}
