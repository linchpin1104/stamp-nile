
"use client";

import type { Checklist, ChecklistItem as ChecklistItemType } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Item text is required"),
  itemType: z.enum(['checkbox', 'multiple_choice_single', 'multiple_choice_multiple', 'scale']),
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Option text is required"),
    value: z.union([z.string(), z.number()]),
  })).optional(),
  category: z.string().optional(),
  details: z.string().optional(),
  // isChecked and selectedValue are runtime properties, not part of the form data structure directly for editing definition
});

const checklistSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Checklist title is required"),
  description: z.string().optional(),
  type: z.enum(['readiness_assessment', 'child_relationship_assessment', 'generic_todo', 'self_reflection']),
  items: z.array(checklistItemSchema),
});

export type ChecklistFormData = z.infer<typeof checklistSchema>;
export type ChecklistItemFormData = z.infer<typeof checklistItemSchema>;


interface ChecklistFormProps {
  initialData: Checklist;
  onSubmit: (data: ChecklistFormData) => void;
  onCancel: () => void;
}

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function ChecklistForm({ initialData, onSubmit, onCancel }: ChecklistFormProps) {
  const form = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");

  const addOption = (itemIndex: number) => {
    const currentItem = watchItems[itemIndex];
    const newOptions = [
        ...(currentItem.options || []),
        { id: generateId('opt'), text: '', value: (currentItem.options?.length || 0) + 1 }
    ];
    update(itemIndex, { ...currentItem, options: newOptions });
  };

  const removeOption = (itemIndex: number, optionIndex: number) => {
    const currentItem = watchItems[itemIndex];
    const newOptions = currentItem.options?.filter((_, i) => i !== optionIndex);
    update(itemIndex, { ...currentItem, options: newOptions || [] });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checklist Title</FormLabel>
              <FormControl><Input placeholder="Enter checklist title" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Brief description of the checklist" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checklist Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select checklist type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="generic_todo">Generic To-Do</SelectItem>
                  <SelectItem value="readiness_assessment">Readiness Assessment</SelectItem>
                  <SelectItem value="child_relationship_assessment">Child Relationship Assessment</SelectItem>
                  <SelectItem value="self_reflection">Self Reflection</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <h3 className="text-lg font-medium">Checklist Items</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-background shadow-sm">
            <FormField
              control={form.control}
              name={`items.${index}.text`}
              render={({ field: itemField }) => (
                <FormItem>
                  <FormLabel>Item Text</FormLabel>
                  <FormControl><Input placeholder="Checklist item text" {...itemField} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.itemType`}
              render={({ field: itemField }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <Select onValueChange={(value) => {
                      itemField.onChange(value);
                      // Reset options if type changes from one that needs options to one that doesn't
                      if (value === 'checkbox') {
                        form.setValue(`items.${index}.options`, []);
                      } else if (!form.getValues(`items.${index}.options`)?.length && (value.startsWith('multiple_choice') || value === 'scale')) {
                        form.setValue(`items.${index}.options`, [{id: generateId('opt'), text: 'Option 1', value: 1}]);
                      }
                  }} defaultValue={itemField.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select item type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="multiple_choice_single">Multiple Choice (Single)</SelectItem>
                      <SelectItem value="multiple_choice_multiple">Multiple Choice (Multiple)</SelectItem>
                      <SelectItem value="scale">Scale (e.g., 1-5)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            { (form.watch(`items.${index}.itemType`)?.startsWith('multiple_choice') || form.watch(`items.${index}.itemType`) === 'scale') && (
                <div className="pl-4 border-l-2 ml-2 space-y-2">
                    <FormLabel className="text-sm">Options</FormLabel>
                    {form.watch(`items.${index}.options`)?.map((option, optIndex) => (
                        <div key={option.id || optIndex} className="flex items-center space-x-2">
                             <FormField
                                control={form.control}
                                name={`items.${index}.options.${optIndex}.text`}
                                render={({ field: optField }) => (
                                    <Input placeholder={`Option ${optIndex + 1} text`} {...optField} className="flex-grow"/>
                                )}
                                />
                            {form.watch(`items.${index}.itemType`) !== 'scale' && ( // Value is implicit for scale
                                <FormField
                                control={form.control}
                                name={`items.${index}.options.${optIndex}.value`}
                                render={({ field: optField }) => (
                                    <Input type="text" placeholder="Value" {...optField} className="w-20"/>
                                )}
                                />
                            )}
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index, optIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)}>
                        <PlusCircle className="h-4 w-4 mr-2"/> Add Option
                    </Button>
                </div>
            )}
            <FormField
              control={form.control}
              name={`items.${index}.category`}
              render={({ field: itemField }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g., Work, Home" {...itemField} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.details`}
              render={({ field: itemField }) => (
                <FormItem>
                  <FormLabel>Details (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Additional details or instructions" {...itemField} rows={1} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-1" /> Remove Item
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ id: generateId('item'), text: '', itemType: 'checkbox', options:[] })}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Checklist Item
        </Button>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Checklist</Button>
        </div>
      </form>
    </Form>
  );
}
