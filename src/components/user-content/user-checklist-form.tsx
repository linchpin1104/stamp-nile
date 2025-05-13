
"use client";

import type { Checklist as ChecklistType, ChecklistItem as ChecklistItemType } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const checklistItemSchema = z.object({
  id: z.string().default(() => generateId('userItem')),
  text: z.string().min(1, "Item text is required"),
  // itemType is implicitly 'checkbox' for user-created simple checklists
  // isChecked is runtime state, not form definition
});

const userChecklistSchema = z.object({
  id: z.string().default(() => generateId('userCl')),
  title: z.string().min(1, "Checklist title is required"),
  description: z.string().optional(),
  items: z.array(checklistItemSchema).min(1, "At least one item is required."),
  // programId and weekId will be passed in and set, not part of form user fills
});

export type UserChecklistFormData = z.infer<typeof userChecklistSchema>;

interface UserChecklistFormProps {
  initialData?: Partial<ChecklistType>; // Allow partial for creation
  onSubmit: (data: ChecklistType) => void; // Submit full ChecklistType
  onCancel: () => void;
  programId: string;
  weekId: string;
  userId: string;
}

export function UserChecklistForm({ initialData, onSubmit, onCancel, programId, weekId, userId }: UserChecklistFormProps) {
  const form = useForm<UserChecklistFormData>({
    resolver: zodResolver(userChecklistSchema),
    defaultValues: {
      id: initialData?.id || generateId('userCl'),
      title: initialData?.title || '',
      description: initialData?.description || '',
      items: initialData?.items?.map(item => ({
        id: item.id || generateId('userItem'),
        text: item.text,
      })) || [{ id: generateId('userItem'), text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (data: UserChecklistFormData) => {
    const fullChecklistData: ChecklistType = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        itemType: 'checkbox', // User-created checklists are simple checkboxes
        isChecked: false, // Default new items to not completed
      })),
      type: 'generic_todo', // User-created checklists are generic to-do style
      isUserCreated: true,
      userId: userId,
      programId: programId,
      weekId: weekId,
    };
    onSubmit(fullChecklistData);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>My Checklist Title</FormLabel>
              <FormControl><Input placeholder="e.g., My Goals for this Week" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="A brief note about this checklist" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 p-3 border rounded-md bg-muted/30">
          <FormLabel>Checklist Items</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name={`items.${index}.text`}
                render={({ field: itemField }) => (
                  <Input placeholder={`Item ${index + 1}`} {...itemField} className="flex-grow"/>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ id: generateId('userItem'), text: '' })}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Item
          </Button>
          <FormMessage>{(form.formState.errors as any)?.items?.message || (form.formState.errors.items as any)?.root?.message}</FormMessage>
        </div>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t -mx-1 px-1">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {initialData?.id ? 'Update My Checklist' : 'Create My Checklist'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
