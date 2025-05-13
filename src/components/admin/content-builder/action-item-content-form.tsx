
"use client";

import type { ActionItemContent, TodoListActionItemContent, JournalPromptActionItemContent, DialogueActivityActionItemContent, ConversationalResponseActionItemContent } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

// Base schema for all action items
const baseActionItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  userNotes: z.string().optional(), // Though primarily for journal, can be available for others if design allows
});

// Schemas for specific action item types
const todoListActionItemSchema = baseActionItemSchema.extend({
  type: z.literal('todo_list'),
  todoItems: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "To-do text is required"),
    // isCompleted is runtime, not form data for definition
  })).min(1, "At least one to-do item is required."),
});

const journalPromptActionItemSchema = baseActionItemSchema.extend({
  type: z.literal('journal_prompt'),
  // Description serves as the prompt
});

const dialogueActivityActionItemSchema = baseActionItemSchema.extend({
  type: z.literal('dialogue_activity'),
  dialoguePrompt: z.string().min(1, "Dialogue prompt is required"),
  dialogueChoices: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Choice text is required"),
    feedback: z.string().optional(),
    // nextActionItemId: z.string().optional(), // For more complex branching, out of scope for initial simple form
  })).min(1, "At least one dialogue choice is required."),
});

const conversationalResponseActionItemSchema = baseActionItemSchema.extend({
  type: z.literal('conversational_response_practice'),
  dialoguePrompt: z.string().min(1, "Dialogue prompt for practice is required"),
});

// Union schema for validation based on type
const actionItemContentSchema = z.discriminatedUnion("type", [
  todoListActionItemSchema,
  journalPromptActionItemSchema,
  dialogueActivityActionItemSchema,
  conversationalResponseActionItemSchema,
]);

export type ActionItemFormData = z.infer<typeof actionItemContentSchema>;

interface ActionItemFormProps {
  initialData: ActionItemContent;
  onSubmit: (data: ActionItemFormData) => void;
  onCancel: () => void;
}

export function ActionItemForm({ initialData, onSubmit, onCancel }: ActionItemFormProps) {
  const form = useForm<ActionItemFormData>({
    resolver: zodResolver(actionItemContentSchema),
    defaultValues: initialData,
  });

  const itemType = form.watch("type");

  const { fields: todoFields, append: appendTodo, remove: removeTodo } = useFieldArray({
    control: form.control,
    name: "todoItems" as any, // Type assertion needed due to discriminated union
  });

  const { fields: choiceFields, append: appendChoice, remove: removeChoice } = useFieldArray({
    control: form.control,
    name: "dialogueChoices" as any, // Type assertion
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action Item Title</FormLabel>
              <FormControl><Input placeholder="Enter action item title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Prompt</FormLabel>
              <FormControl><Textarea placeholder="Detailed description or prompt for the user" {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action Item Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    // Reset specific fields when type changes
                    if (value === 'todo_list' && !form.getValues('todoItems' as any)?.length) {
                        form.setValue('todoItems' as any, [{ id: generateId('todo'), text: '' }]);
                    } else if (value !== 'todo_list') {
                        form.setValue('todoItems' as any, undefined);
                    }
                    if (value === 'dialogue_activity' && !form.getValues('dialogueChoices' as any)?.length) {
                        form.setValue('dialoguePrompt' as any, form.getValues('description') || '');
                        form.setValue('dialogueChoices'as any, [{ id: generateId('choice'), text: '', feedback: '' }]);
                    } else if (value !== 'dialogue_activity') {
                        form.setValue('dialogueChoices'as any, undefined);
                        if (value !== 'conversational_response_practice') {
                             form.setValue('dialoguePrompt' as any, undefined);
                        }
                    }
                    if (value === 'conversational_response_practice' && !form.getValues('dialoguePrompt' as any)) {
                         form.setValue('dialoguePrompt' as any, form.getValues('description') || '');
                    }

                }} 
                defaultValue={field.value}
              >
                <FormControl><SelectTrigger><SelectValue placeholder="Select action item type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="todo_list">To-Do List</SelectItem>
                  <SelectItem value="journal_prompt">Journal Prompt</SelectItem>
                  <SelectItem value="dialogue_activity">Dialogue Activity (Multiple Choice)</SelectItem>
                  <SelectItem value="conversational_response_practice">Conversational Response Practice</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional fields based on type */}
        {itemType === 'todo_list' && (
          <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <FormLabel>To-Do Items</FormLabel>
            {(todoFields as any[]).map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`todoItems.${index}.text` as any}
                  render={({ field: todoField }) => (
                    <Input placeholder={`To-do item ${index + 1}`} {...todoField} className="flex-grow"/>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTodo(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendTodo({ id: generateId('todo'), text: '' })}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add To-Do Item
            </Button>
            <FormMessage>{(form.formState.errors as any)?.todoItems?.message}</FormMessage>
          </div>
        )}

        {(itemType === 'dialogue_activity' || itemType === 'conversational_response_practice') && (
          <FormField
            control={form.control}
            name={"dialoguePrompt" as any}
            render={({ field }) => (
              <FormItem className="p-3 border rounded-md bg-muted/30">
                <FormLabel>{itemType === 'dialogue_activity' ? 'Dialogue Activity Prompt' : 'Practice Scenario Prompt'}</FormLabel>
                <FormControl><Textarea placeholder="Enter the main prompt or scenario" {...field} rows={3}/></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {itemType === 'dialogue_activity' && (
          <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <FormLabel>Dialogue Choices</FormLabel>
            {(choiceFields as any[]).map((field, index) => (
              <div key={field.id} className="space-y-2 p-2 border rounded bg-background">
                <FormField
                  control={form.control}
                  name={`dialogueChoices.${index}.text` as any}
                  render={({ field: choiceField }) => (
                    <FormItem>
                      <FormLabel>Choice {index + 1} Text</FormLabel>
                      <Input placeholder="Text for this choice" {...choiceField} />
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dialogueChoices.${index}.feedback` as any}
                  render={({ field: choiceField }) => (
                     <FormItem>
                        <FormLabel>Feedback for this choice (Optional)</FormLabel>
                        <Textarea placeholder="Feedback if user selects this" {...choiceField} rows={2}/>
                     </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeChoice(index)} className="text-destructive float-right"><Trash2 className="h-4 w-4 mr-1"/>Remove Choice</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendChoice({ id: generateId('choice'), text: '', feedback: '' })}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Choice
            </Button>
            <FormMessage>{(form.formState.errors as any)?.dialogueChoices?.message}</FormMessage>
          </div>
        )}

        {itemType === 'journal_prompt' && (
             <FormDescription>
                The main description field above serves as the journal prompt for the user. Users will be provided a text area to write their reflections.
            </FormDescription>
        )}
         {itemType === 'conversational_response_practice' && (
             <FormDescription>
                The prompt field above sets the scenario. Users will be provided a text area to practice their response.
            </FormDescription>
        )}


        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Action Item</Button>
        </div>
      </form>
    </Form>
  );
}
