
"use client";

import type { LearningElement } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { mockScenarios } from '@/lib/mock-data'; // For populating scenario dropdown

type InteractiveScenarioLinkElement = Extract<LearningElement, { type: 'interactive_scenario_link' }>;

const interactiveScenarioSchema = z.object({
  id: z.string(), // LearningElement ID
  title: z.string().min(1, "Link title is required"),
  scenarioId: z.string().min(1, "Scenario ID must be selected or entered"),
  // type is fixed to 'interactive_scenario_link'
});

export type InteractiveScenarioFormData = z.infer<typeof interactiveScenarioSchema>;

interface InteractiveScenarioFormProps {
  initialData: InteractiveScenarioLinkElement; // Contains id, title, scenarioId
  onSubmit: (data: InteractiveScenarioFormData) => void;
  onCancel: () => void;
}

export function InteractiveScenarioLinkForm({ initialData, onSubmit, onCancel }: InteractiveScenarioFormProps) {
  const form = useForm<InteractiveScenarioFormData>({
    resolver: zodResolver(interactiveScenarioSchema),
    defaultValues: {
        id: initialData.id,
        title: initialData.title,
        scenarioId: initialData.scenarioId,
    },
  });

  // const availableScenarios = mockScenarios; // Use this if you want a dropdown

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Title</FormLabel>
              <FormControl><Input placeholder="e.g., Practice: Handling Toddler Tantrums" {...field} /></FormControl>
              <FormDescription>This title will be displayed to the user for this scenario link.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scenarioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scenario ID</FormLabel>
              {/* Option 1: Input field for scenario ID (if IDs are known or managed elsewhere) */}
              <FormControl><Input placeholder="Enter the ID of the interactive scenario" {...field} /></FormControl>
              <FormDescription>The unique ID of the interactive scenario to link to. Ensure this ID exists.</FormDescription>
              
              {/* Option 2: Dropdown to select from existing scenarios (more user-friendly if scenarios are pre-defined) */}
              {/* <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a scenario" /></SelectTrigger></FormControl>
                <SelectContent>
                  {availableScenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.title} (ID: {scenario.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose an existing interactive scenario.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Scenario Link</Button>
        </div>
      </form>
    </Form>
  );
}
