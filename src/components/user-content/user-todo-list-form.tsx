"use client";

import type { _TodoListActionItemContent } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const todoItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "To-do text is required"),
  // isCompleted is runtime, not part of this form's definition data
});

const userTodoListSchema = z.object({
  id: z.string().default(() => generateId('userTodo')),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  todoItems: z.array(todoItemSchema).min(1, "At least one to-do item is required."),
  type: z.literal('todo_list').default('todo_list'),
  isUserCreated: z.boolean().default(true),
});

export type UserTodoListFormData = z.infer<typeof userTodoListSchema>;

interface UserTodoListFormProps {
  initialData?: Partial<UserTodoListFormData>; // Allow partial for creation
  onSubmit: (data: UserTodoListFormData) => void;
  onCancel: () => void;
}

export function UserTodoListForm({ initialData, onSubmit, onCancel }: UserTodoListFormProps) {
  const form = useForm<UserTodoListFormData>({
    resolver: zodResolver(userTodoListSchema),
    defaultValues: {
      id: initialData?.id || generateId('userTodo'),
      title: initialData?.title || '',
      description: initialData?.description || '',
      todoItems: initialData?.todoItems?.map(item => ({...item, id: item.id || generateId('todoSubItem') })) || [{ id: generateId('todoSubItem'), text: '' }],
      type: 'todo_list',
      isUserCreated: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "todoItems",
  });

  const handleSubmit = (data: UserTodoListFormData) => {
    // Ensure all todoItems have an ID, important for editing/keying
    const processedData = {
        ...data,
        todoItems: data.todoItems.map(item => ({
            ...item,
            id: item.id || generateId('todoSubItem'),
            isCompleted: false, // Default new items to not completed
        })),
    };
    onSubmit(processedData as UserTodoListFormData); // Cast because of isCompleted added
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To-Do List Title</FormLabel>
              <FormControl><Input placeholder="e.g., My Weekly Goals" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="What is this to-do list about?" {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 p-3 border rounded-md bg-muted/30">
          <FormLabel>To-Do Items</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name={`todoItems.${index}.text`}
                render={({ field: todoField }) => (
                  <Input placeholder={`Task ${index + 1}`} {...todoField} className="flex-grow"/>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ id: generateId('todoSubItem'), text: '' })}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Task
          </Button>
          <FormMessage>
            {(form.formState.errors as Record<string, unknown>)?.items?.message || 
             (form.formState.errors.items as Record<string, { root?: { message?: string } }>)?.root?.message}
          </FormMessage>
        </div>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t -mx-1 px-1">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save To-Do List</Button>
        </div>
      </form>
    </Form>
  );
}
