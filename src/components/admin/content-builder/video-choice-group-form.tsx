"use client";

import type { VideoChoiceGroup, VideoContent } from '@/types';
import { useForm, useFieldArray, _Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { _Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { VideoContentForm, VideoContentFormData } from './video-content-form'; // Assuming a separate form for individual videos
import { Dialog, DialogContent, DialogHeader, DialogTitle, _DialogTrigger, _DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';

const generateId = (prefix = "vid") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const videoContentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Video title is required"),
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  duration: z.union([
    z.string().regex(/^\d{1,2}:\d{2}$/, "Duration should be in MM:SS format."),
    z.literal("")
  ]).optional(),
});

const videoChoiceGroupSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Group title is required"),
  videos: z.array(videoContentSchema).min(1, "At least one video is required for a choice group."),
  selectionRule: z.enum(['choose_one', 'complete_all']),
});

export type VideoChoiceGroupFormData = z.infer<typeof videoChoiceGroupSchema>;

interface VideoChoiceGroupFormProps {
  initialData: VideoChoiceGroup;
  onSubmit: (data: VideoChoiceGroupFormData) => void;
  onCancel: () => void;
}

export function VideoChoiceGroupForm({ initialData, onSubmit, onCancel }: VideoChoiceGroupFormProps) {
  const form = useForm<VideoChoiceGroupFormData>({
    resolver: zodResolver(videoChoiceGroupSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "videos",
  });

  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditVideo = (index: number) => {
    setEditingVideoIndex(index);
    setIsModalOpen(true);
  };

  const handleAddNewVideo = () => {
    const newVideo: VideoContent = {
        id: generateId('vidchoice'),
        title: `New Video ${fields.length + 1}`,
        url: '',
        description: '',
        thumbnailUrl: '',
        duration: '',
    };
    append(newVideo);
    setEditingVideoIndex(fields.length); // fields.length will be new index after append
    setIsModalOpen(true);
  }

  const handleVideoFormSubmit = (videoData: VideoContentFormData) => {
    if (editingVideoIndex !== null) {
      update(editingVideoIndex, videoData);
    }
    setIsModalOpen(false);
    setEditingVideoIndex(null);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Choice Group Title</FormLabel>
              <FormControl><Input placeholder="e.g., Choose Your Focus Area" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="selectionRule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selection Rule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select rule" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="choose_one">Choose One</SelectItem>
                  <SelectItem value="complete_all">Complete All (View All)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How should users interact with these videos?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 p-3 border rounded-md bg-muted/30">
          <FormLabel>Videos in this Group</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-between p-3 border rounded-md bg-background shadow-sm">
              <div className="flex-grow">
                <p className="font-medium">{form.watch(`videos.${index}.title`)}</p>
                <p className="text-xs text-muted-foreground truncate">{form.watch(`videos.${index}.url`)}</p>
              </div>
              <div className="space-x-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => handleEditVideo(index)}>Edit</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={handleAddNewVideo}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Video to Group
          </Button>
          <FormMessage>{form.formState.errors.videos?.message || form.formState.errors.videos?.root?.message}</FormMessage>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingVideoIndex(null); }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingVideoIndex !== null && fields[editingVideoIndex] ? 'Edit Video' : 'Add New Video'}</DialogTitle>
                </DialogHeader>
                {editingVideoIndex !== null && fields[editingVideoIndex] && (
                    <VideoContentForm
                        initialData={fields[editingVideoIndex] as VideoContent} // Use the video from the array
                        onSubmit={handleVideoFormSubmit}
                        onCancel={() => { setIsModalOpen(false); setEditingVideoIndex(null);}}
                    />
                )}
            </DialogContent>
        </Dialog>


        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Video Group</Button>
        </div>
      </form>
    </Form>
  );
}

