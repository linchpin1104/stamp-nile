"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const oxQuizFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().optional(),
  questions: z.array(
    z.object({
      question: z.string().min(5, { message: "Question must be at least 5 characters" }),
      correctAnswer: z.string().min(1, { message: "Please select the correct answer" }),
      explanation: z.string().min(10, { message: "Explanation must be at least 10 characters" }),
    })
  ).min(1, { message: "Please add at least one question" }),
});

type OXQuizFormValues = z.infer<typeof oxQuizFormSchema>;

export function OXQuizForm({ onSubmit, initialData }: { 
  onSubmit: (data: OXQuizFormValues) => void;
  initialData: OXQuizFormValues | null;
}) {
  const form = useForm<OXQuizFormValues>({
    resolver: zodResolver(oxQuizFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      questions: [
        {
          question: "",
          correctAnswer: "",
          explanation: "",
        },
      ],
    },
  });

  const addQuestion = () => {
    const currentQuestions = form.getValues("questions") || [];
    form.setValue("questions", [
      ...currentQuestions,
      {
        question: "",
        correctAnswer: "",
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions") || [];
    if (currentQuestions.length <= 1) return;
    form.setValue(
      "questions",
      currentQuestions.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <Input placeholder="e.g., Parenting Styles Quiz" {...field} />
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
              <Textarea
                placeholder="A brief description of this quiz"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          <div className="font-medium">Questions</div>
          {form.watch("questions")?.map((_, index) => (
            <div
              key={index}
              className="border rounded-md p-4 space-y-4 relative"
            >
              <FormField
                control={form.control}
                name={`questions.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question #{index + 1}</FormLabel>
                    <Input placeholder='e.g., "Is consistent routine important for children&ldquo;s development?"' {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`questions.${index}.correctAnswer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="O" id={`true-${index}`} />
                        <Label htmlFor={`true-${index}`}>O (Yes/True)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="X" id={`false-${index}`} />
                        <Label htmlFor={`false-${index}`}>X (No/False)</Label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`questions.${index}.explanation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <Textarea
                      placeholder="Explain why this answer is correct"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("questions").length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  className="absolute top-4 right-4"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
          >
            Add Question
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Save Quiz
        </Button>
      </form>
    </Form>
  );
} 