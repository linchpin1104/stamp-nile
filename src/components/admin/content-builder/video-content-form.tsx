
"use client";

import type { VideoContent } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const videoContentSchema = z.object({
  id: z.string(), // Keep id, it's part of the content
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL (e.g., https://www.youtube.com/embed/VIDEO_ID or https://picsum.photos/seed/...).").min(1, "URL is required."),
  description: z.string().optional(),
  thumbnailUrl: z.string().url("Must be a valid URL for thumbnail.").optional().or(z.literal('')),
  duration: z.union([
    z.string().regex(/^\d{1,2}:\d{2}$/, "Duration should be in MM:SS format."),
    z.literal("")
  ]).optional(),
});

export type VideoContentFormData = z.infer<typeof videoContentSchema>;

interface VideoContentFormProps {
  initialData: VideoContent;
  onSubmit: (data: VideoContentFormData) => void;
  onCancel: () => void;
}

export function VideoContentForm({ initialData, onSubmit, onCancel }: VideoContentFormProps) {
  const form = useForm<VideoContentFormData>({
    resolver: zodResolver(videoContentSchema),
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
              <FormLabel>Video Title</FormLabel>
              <FormControl><Input placeholder="Enter video title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl><Input placeholder="https://example.com/video.mp4" {...field} /></FormControl>
              <FormDescription>Direct video link or embeddable URL (e.g., YouTube embed).</FormDescription>
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
              <FormControl><Textarea placeholder="Brief description of the video" {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL (Optional)</FormLabel>
              <FormControl><Input placeholder="https://example.com/thumbnail.jpg" {...field} /></FormControl>
              <FormDescription>URL for the video thumbnail image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (Optional)</FormLabel>
              <FormControl><Input placeholder="MM:SS (e.g., 10:35)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Video</Button>
        </div>
      </form>
    </Form>
  );
}

