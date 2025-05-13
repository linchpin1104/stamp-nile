"use client";

import type { PsychologicalTestContent } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const psychologicalTestQuestionOptionSchema = z.object({
  id: z.string().default(() => generateId('opt')),
  text: z.string().min(1, "Option text is required"),
  value: z.coerce.number().int("Value must be an integer (e.g., 1-5)"),
});

const psychologicalTestQuestionSchema = z.object({
  id: z.string().default(() => generateId('q')),
  text: z.string().min(1, "Question text is required"),
  options: z.array(psychologicalTestQuestionOptionSchema).length(5, "Each question must have exactly 5 options."),
});

const resultCommentSchema = z.object({
  id: z.string().default(() => generateId('resComment')),
  scoreRange: z.tuple([
      z.coerce.number({invalid_type_error: "Min score must be a number."}), 
      z.coerce.number({invalid_type_error: "Max score must be a number."})
    ]).refine(data => data[0] <= data[1], {
    message: "Min score must be less than or equal to max score.",
    path: ["0"], // or path: ["1"] or omit path for general message on the tuple
  }),
  categoryLabel: z.string().min(1, "Category label is required (e.g., 매우높음)"),
  comment: z.string().min(1, "Result comment is required"),
});

const psychologicalFactorSchema = z.object({
  id: z.string().default(() => generateId('factor')),
  title: z.string().min(1, "Factor title is required"),
  scoringMethod: z.enum(['sum', 'average']).default('sum').optional(),
  questions: z.array(psychologicalTestQuestionSchema).min(1, "At least one question is required for a factor.").max(15, "Maximum 15 questions per factor."),
  factorResultComments: z.array(resultCommentSchema).min(1, "At least one result comment is required for a factor."),
});

const psychologicalTestSchema = z.object({
  id: z.string().default(() => generateId('psychTest')),
  title: z.string().min(1, "Test title is required"),
  description: z.string().optional(),
  overallScoringMethod: z.enum(['sum', 'average']).default('sum').optional(),
  factors: z.array(psychologicalFactorSchema).min(1, "At least one factor is required."),
  overallResultComments: z.array(resultCommentSchema).min(1, "At least one overall result comment is required."),
});

export type PsychologicalTestFormData = z.infer<typeof psychologicalTestSchema>;

interface PsychologicalTestFormProps {
  initialData: PsychologicalTestContent;
  onSubmit: (data: PsychologicalTestFormData) => void;
  onCancel: () => void;
}

const defaultQuestionOptions = (): {id: string; text: string; value: number}[] => Array.from({length: 5}, (_, i) => ({id: generateId('opt'), text: `선택지 ${i+1}`, value: i+1}));

export function PsychologicalTestForm({ initialData, onSubmit, onCancel }: PsychologicalTestFormProps) {
  const form = useForm<PsychologicalTestFormData>({
    resolver: zodResolver(psychologicalTestSchema),
    defaultValues: {
      id: initialData.id || generateId('psychTest'),
      title: initialData.title || '',
      description: initialData.description || '',
      overallScoringMethod: initialData.overallScoringMethod || 'sum',
      factors: initialData.factors?.length > 0 ? initialData.factors.map(f => ({
        ...f,
        id: f.id || generateId('factor'),
        scoringMethod: f.scoringMethod || 'sum',
        questions: f.questions?.map(q => ({...q, id: q.id || generateId('q'), options: q.options?.map(o => ({...o, id: o.id || generateId('opt')})) || defaultQuestionOptions() })) || [{id: generateId('q'), text:'', options: defaultQuestionOptions()}],
        factorResultComments: f.factorResultComments?.map(c => ({...c, id: c.id || generateId('resComment')})) || [{id: generateId('resComment'), scoreRange: [0,0], categoryLabel: '', comment: ''}]
      })) : [{ id: generateId('factor'), title: '', scoringMethod: 'sum', questions: [{id: generateId('q'), text: '', options: defaultQuestionOptions()}], factorResultComments: [{id: generateId('resComment'), scoreRange:[0,0], categoryLabel:'', comment:''}] }],
      overallResultComments: initialData.overallResultComments?.length > 0 ? initialData.overallResultComments.map(c => ({...c, id: c.id || generateId('resComment')})) : [{id: generateId('resComment'), scoreRange: [0,0], categoryLabel: '', comment: ''}],
    },
  });

  const { fields: factorFields, append: appendFactor, remove: removeFactor } = useFieldArray({
    control: form.control,
    name: "factors",
  });

  const { fields: overallCommentFields, append: appendOverallComment, remove: removeOverallComment } = useFieldArray({
    control: form.control,
    name: "overallResultComments",
  });
  
  const addQuestionToFactor = (factorIndex: number) => {
    const currentFactor = form.getValues(`factors.${factorIndex}`);
    if (currentFactor && currentFactor.questions.length < 15) {
      const newQuestions = [...currentFactor.questions, { id: generateId('q'), text: '', options: defaultQuestionOptions() }];
      form.setValue(`factors.${factorIndex}.questions`, newQuestions);
    }
  };
  const removeQuestionFromFactor = (factorIndex: number, questionIndex: number) => {
     const currentFactor = form.getValues(`factors.${factorIndex}`);
     if(currentFactor) {
        const newQuestions = currentFactor.questions.filter((_,idx) => idx !== questionIndex);
        form.setValue(`factors.${factorIndex}.questions`, newQuestions);
     }
  }

  const addResultCommentToFactor = (factorIndex: number) => {
    const currentFactor = form.getValues(`factors.${factorIndex}`);
    if (currentFactor) {
      const newComments = [...currentFactor.factorResultComments, { id: generateId('resComment'), scoreRange: [0,0] as [number, number], categoryLabel: '', comment: '' }];
      form.setValue(`factors.${factorIndex}.factorResultComments`, newComments);
    }
  };
  const removeResultCommentFromFactor = (factorIndex: number, commentIndex: number) => {
    const currentFactor = form.getValues(`factors.${factorIndex}`);
     if(currentFactor) {
        const newComments = currentFactor.factorResultComments.filter((_,idx) => idx !== commentIndex);
        form.setValue(`factors.${factorIndex}.factorResultComments`, newComments);
     }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[75vh] overflow-y-auto pr-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Psychological Test Title</FormLabel>
              <FormControl><Input placeholder="e.g., Parenting Style Inventory" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Brief description of the test" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="overallScoringMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Score Calculation Method (총점 계산 방식)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select scoring method" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="sum">Sum of Scores (합산)</SelectItem>
                  <SelectItem value="average">Average of Scores (평균)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How the final overall score from all factors/questions should be calculated.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        <Separator />
        <h3 className="text-xl font-semibold text-primary">Factors (Sub-scales)</h3>
        {factorFields.map((factorField, factorIndex) => (
          <Card key={factorField.id} className="p-4 space-y-4 bg-muted/30 relative">
            <CardHeader className="p-2">
              <div className="flex justify-between items-start">
                <FormField
                  control={form.control}
                  name={`factors.${factorIndex}.title`}
                  render={({ field }) => (
                    <FormItem className="flex-grow mr-2">
                      <FormLabel>Factor {factorIndex + 1} Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Emotional Regulation" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name={`factors.${factorIndex}.scoringMethod`}
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormLabel>Factor Scoring</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFactor(factorIndex)} className="ml-2 text-destructive self-end">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
              <h4 className="text-md font-medium">Questions for Factor {factorIndex + 1} (Max 15)</h4>
              {form.watch(`factors.${factorIndex}.questions`).map((qField, qIndex) => (
                <Card key={qField.id || qIndex} className="p-3 space-y-2 bg-background shadow-sm relative">
                   <FormField
                    control={form.control}
                    name={`factors.${factorIndex}.questions.${qIndex}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question {qIndex + 1}</FormLabel>
                        <FormControl><Textarea placeholder="Enter question text" {...field} rows={2}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormLabel className="text-xs">Options (Exactly 5, values 1-5 recommended)</FormLabel>
                  {form.watch(`factors.${factorIndex}.questions.${qIndex}.options`).map((optField, optIndex) => (
                    <div key={optField.id || optIndex} className="flex items-center space-x-2">
                      <FormField control={form.control} name={`factors.${factorIndex}.questions.${qIndex}.options.${optIndex}.text`}
                        render={({ field }) => <Input placeholder={`Option ${optIndex + 1} Text`} {...field} className="flex-grow"/>} />
                      <FormField control={form.control} name={`factors.${factorIndex}.questions.${qIndex}.options.${optIndex}.value`}
                        render={({ field }) => <Input type="number" placeholder="Val" {...field} className="w-20"/>} />
                    </div>
                  ))}
                  <FormMessage>{form.formState.errors.factors?.[factorIndex]?.questions?.[qIndex]?.options?.message}</FormMessage>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestionFromFactor(factorIndex, qIndex)} className="absolute top-1 right-1 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3"/>
                  </Button>
                </Card>
              ))}
              {form.watch(`factors.${factorIndex}.questions`).length < 15 &&
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestionToFactor(factorIndex)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Question to Factor
                </Button>
              }
              <FormMessage>{form.formState.errors.factors?.[factorIndex]?.questions?.message}</FormMessage>
              
              <Separator className="my-3"/>
              <h4 className="text-md font-medium">Result Comments for Factor {factorIndex + 1}</h4>
              {form.watch(`factors.${factorIndex}.factorResultComments`).map((commentField, commentIndex) => (
                 <Card key={commentField.id || commentIndex} className="p-3 space-y-2 bg-background shadow-sm relative">
                    <div className="grid grid-cols-2 gap-2">
                      <FormField control={form.control} name={`factors.${factorIndex}.factorResultComments.${commentIndex}.scoreRange.0`}
                        render={({ field }) => <FormItem><FormLabel>Min Score</FormLabel><Input type="number" {...field}/><FormMessage/></FormItem>} />
                      <FormField control={form.control} name={`factors.${factorIndex}.factorResultComments.${commentIndex}.scoreRange.1`}
                        render={({ field }) => <FormItem><FormLabel>Max Score</FormLabel><Input type="number" {...field}/><FormMessage/></FormItem>} />
                    </div>
                    <FormMessage>{form.formState.errors.factors?.[factorIndex]?.factorResultComments?.[commentIndex]?.scoreRange?.message}</FormMessage>
                    <FormField control={form.control} name={`factors.${factorIndex}.factorResultComments.${commentIndex}.categoryLabel`}
                        render={({ field }) => <FormItem><FormLabel>Category Label</FormLabel><Input placeholder="e.g., 매우높음" {...field}/><FormMessage/></FormItem>} />
                    <FormField control={form.control} name={`factors.${factorIndex}.factorResultComments.${commentIndex}.comment`}
                        render={({ field }) => <FormItem><FormLabel>Comment</FormLabel><Textarea placeholder="Comment for this score range" {...field} rows={2}/><FormMessage/></FormItem>} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeResultCommentFromFactor(factorIndex, commentIndex)} className="absolute top-1 right-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3"/>
                    </Button>
                 </Card>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addResultCommentToFactor(factorIndex)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Result Comment for Factor
              </Button>
              <FormMessage>{form.formState.errors.factors?.[factorIndex]?.factorResultComments?.message}</FormMessage>
            </CardContent>
          </Card>
        ))}
        <Button type="button" variant="outline" onClick={() => appendFactor({ id: generateId('factor'), title: '', scoringMethod: 'sum', questions: [{id: generateId('q'), text: '', options: defaultQuestionOptions()}], factorResultComments: [{id: generateId('resComment'), scoreRange: [0,0] as [number,number], categoryLabel: '', comment: ''}] })}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Factor
        </Button>
        <FormMessage>{form.formState.errors.factors?.message || form.formState.errors.factors?.root?.message}</FormMessage>


        <Separator />
        <h3 className="text-xl font-semibold text-primary">Overall Result Comments (총평)</h3>
        {overallCommentFields.map((commentField, index) => (
            <Card key={commentField.id} className="p-3 space-y-2 bg-muted/30 shadow-sm relative">
                <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name={`overallResultComments.${index}.scoreRange.0`}
                    render={({ field }) => <FormItem><FormLabel>Min Total Score</FormLabel><Input type="number" {...field}/><FormMessage/></FormItem>} />
                <FormField control={form.control} name={`overallResultComments.${index}.scoreRange.1`}
                    render={({ field }) => <FormItem><FormLabel>Max Total Score</FormLabel><Input type="number" {...field}/><FormMessage/></FormItem>} />
                </div>
                <FormMessage>{form.formState.errors.overallResultComments?.[index]?.scoreRange?.message}</FormMessage>
                <FormField control={form.control} name={`overallResultComments.${index}.categoryLabel`}
                    render={({ field }) => <FormItem><FormLabel>Overall Category Label</FormLabel><Input placeholder="e.g., 매우 균형적" {...field}/><FormMessage/></FormItem>} />
                <FormField control={form.control} name={`overallResultComments.${index}.comment`}
                    render={({ field }) => <FormItem><FormLabel>Overall Comment</FormLabel><Textarea placeholder="Overall comment for this total score range" {...field} rows={2}/><FormMessage/></FormItem>} />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOverallComment(index)} className="absolute top-1 right-1 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3"/>
                </Button>
            </Card>
        ))}
        <Button type="button" variant="outline" onClick={() => appendOverallComment({ id: generateId('overallC'), scoreRange: [0,0] as [number, number], categoryLabel: '', comment: '' })}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Overall Result Comment
        </Button>
        <FormMessage>{form.formState.errors.overallResultComments?.message || form.formState.errors.overallResultComments?.root?.message}</FormMessage>

        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-popover py-3 border-t -mx-1 px-1">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Psychological Test</Button>
        </div>
      </form>
    </Form>
  );
}

