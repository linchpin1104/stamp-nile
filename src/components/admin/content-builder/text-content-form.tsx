
"use client";

import type { TextContent } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const textContentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(['article', 'resource_link', 'policy_info', 'support_document']),
  content: z.string().optional(),
  url: z.string().url("Must be a valid URL if type is resource_link or policy_info with URL.").optional().or(z.literal('')),
  imageUrl: z.string().url("Must be a valid URL for image.").optional().or(z.literal('')),
}).refine(data => {
  if (data.type === 'resource_link' && !data.url) {
    return false;
  }
  return true;
}, {
  message: "URL is required for Resource Link type.",
  path: ["url"],
}).refine(data => {
  if (data.type === 'article' && !data.content) {
    return false;
  }
  return true;
}, {
  message: "Content is required for Article type.",
  path: ["content"],
});

export type TextContentFormData = z.infer<typeof textContentSchema>;

interface TextContentFormProps {
  initialData: TextContent;
  onSubmit: (data: TextContentFormData) => void;
  onCancel: () => void;
}

export function TextContentForm({ initialData, onSubmit, onCancel }: TextContentFormProps) {
  const form = useForm<TextContentFormData>({
    resolver: zodResolver(textContentSchema),
    defaultValues: initialData,
  });

  const selectedType = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Enter content title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select content type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="resource_link">Resource Link</SelectItem>
                  <SelectItem value="policy_info">Policy Info</SelectItem>
                  <SelectItem value="support_document">Support Document</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(selectedType === 'article' || selectedType === 'policy_info' || selectedType === 'support_document') && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{selectedType === 'article' ? 'Article Content' : 'Content/Summary'}</FormLabel>
                <FormControl><Textarea placeholder="Enter text content or summary..." {...field} rows={5} /></FormControl>
                <FormDescription>
                  {selectedType === 'article' 
                    ? "Full text of the article. In a full implementation, this would be a rich text editor allowing for formatting (bold, italics, lists), inline images, and embedding links." 
                    : "A summary or key details for this document."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(selectedType === 'resource_link' || selectedType === 'policy_info' || selectedType === 'support_document') && (
            <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
                <FormItem>
                <FormLabel>URL {selectedType === 'resource_link' ? '' : '(Optional)'}</FormLabel>
                <FormControl><Input placeholder="https://example.com/resource" {...field} /></FormControl>
                <FormDescription>Link to the external resource or document.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
              <FormDescription>Optional image to display with the text content.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Content</Button>
        </div>
      </form>
    </Form>
  );
}

