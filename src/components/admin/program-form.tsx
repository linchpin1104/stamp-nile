"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Program } from '@/types';
import { useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const companyDocumentSchema = z.object({
  id: z.string().default(() => `doc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`),
  title: z.string().min(1, "Document title is required."),
  type: z.enum(['article', 'resource_link', 'policy_info', 'support_document']),
  content: z.string().optional(),
  url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  audience: z.string().optional(),
}).refine(data => {
    if (data.type === 'resource_link') return !!data.url && data.url.trim() !== '';
    return true;
  }, {
  message: "URL is required for Resource Link type.",
  path: ["url"],
}).refine(data => {
    if (data.type !== 'resource_link') return !!data.content && data.content.trim() !== '';
    return true;
  }, {
  message: "Content is required if not a resource link.",
  path: ["content"],
});


const programSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  slug: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  longDescription: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image." }).optional().or(z.literal('')),
  targetAudience: z.string().min(3, { message: "Target audience is required." }),
  paymentType: z.enum(['free', 'paid']),
  price: z.string().optional(),
  currency: z.string().optional(),
  paymentLink: z.string().url({ message: "Please enter a valid URL for the payment link." }).optional().or(z.literal('')),
  tagsString: z.string().optional(),
  companySpecificDocuments: z.array(companyDocumentSchema).optional(),
}).refine((data) => {
  if (data.paymentType === 'paid') {
    // Check for price
    const price = parseFloat(data.price || '0');
    if (isNaN(price) || price <= 0) {
      return false;
    }
    // Check for currency
    if (!data.currency) {
      return false;
    }
    // Check for payment link
    if (!data.paymentLink) {
      return false;
    }
  }
  return true;
}, {
  message: "Paid programs require price, currency, and payment link.",
  path: ["paymentType"],
});

type ProgramFormData = z.infer<typeof programSchema>;

interface ProgramFormProps {
  initialData?: Program;
  onSubmit: (data: ProgramFormData) => void;
}

export function ProgramForm({ initialData, onSubmit }: ProgramFormProps) {
  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: initialData 
      ? {
          ...initialData,
          tagsString: initialData.tags?.join(', ') || '',
          companySpecificDocuments: initialData.companySpecificDocuments || [],
          price: initialData.price ? initialData.price.toString() : undefined,
          paymentType: initialData.paymentType || 'free',
          currency: initialData.currency || '',
          paymentLink: initialData.paymentLink || '',
        }
      : {
          title: '',
          slug: '',
          description: '',
          longDescription: '',
          imageUrl: '',
          targetAudience: '',
          tagsString: '',
          paymentType: 'free',
          price: '',
          currency: '',
          paymentLink: '',
          companySpecificDocuments: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "companySpecificDocuments",
  });

  const watchedTitle = form.watch("title");

  useEffect(() => {
    if (watchedTitle && !form.getValues("slug") && !initialData?.slug) { 
      form.setValue("slug", generateSlugFromName(watchedTitle), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedTitle, form, initialData]);


  const handleSubmit = (values: ProgramFormData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Toddler Sleep Solutions" {...field} />
              </FormControl>
              <FormDescription>The main title of the program.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Slug (URL Path)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., toddler-sleep-solutions" {...field} />
              </FormControl>
              <FormDescription>
                The URL-friendly version of the title. Auto-generated if left empty for new programs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief summary of the program (for cards and previews)." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A full description for the program details page." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Link to the program's cover image. Uses a default placeholder if empty. (e.g. https://picsum.photos/seed/your-seed/600/400)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Parents of infants (0-12 months)" {...field} />
              </FormControl>
              <FormDescription>Who is this program for?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Whether this program is free or requires payment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("paymentType") === "paid" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0.01" step="0.01" placeholder="e.g., 19.99" {...field} />
                  </FormControl>
                  <FormDescription>Price for the program</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      <SelectItem value="KRW">KRW (Korean Won)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Currency for the price</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Link</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/payment" {...field} />
                  </FormControl>
                  <FormDescription>External payment link</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="tagsString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., infant care, work-life balance, sleep training" {...field} />
              </FormControl>
              <FormDescription>Comma-separated list of tags.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>Company Specific Documents</CardTitle>
            <FormDescription>Manage documents like company policies or family welfare programs.</FormDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((fieldItem, index) => ( // Renamed field to fieldItem to avoid conflict
              <div key={fieldItem.id} className="p-4 border rounded-md space-y-3 relative">
                <FormField
                  control={form.control}
                  name={`companySpecificDocuments.${index}.title`}
                  render={({ field: docField }) => (
                    <FormItem>
                      <FormLabel>Document Title</FormLabel>
                      <FormControl><Input {...docField} placeholder="e.g., Parental Leave Policy" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`companySpecificDocuments.${index}.type`}
                  render={({ field: docField }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={(value) => {
                        docField.onChange(value);
                        // Reset URL or Content based on type change
                        if (value === 'resource_link') {
                           form.setValue(`companySpecificDocuments.${index}.content`, '');
                        } else {
                           form.setValue(`companySpecificDocuments.${index}.url`, '');
                        }
                      }} defaultValue={docField.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="article">Article/Text</SelectItem>
                          <SelectItem value="resource_link">Resource Link</SelectItem>
                          <SelectItem value="policy_info">Policy Info</SelectItem>
                          <SelectItem value="support_document">Support Document</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {form.watch(`companySpecificDocuments.${index}.type`) === 'resource_link' ? (
                    <FormField
                    control={form.control}
                    name={`companySpecificDocuments.${index}.url`}
                    render={({ field: docField }) => (
                        <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl><Input type="url" {...docField} placeholder="https://example.com/document.pdf" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 ) : (
                    <FormField
                    control={form.control}
                    name={`companySpecificDocuments.${index}.content`}
                    render={({ field: docField }) => (
                        <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl><Textarea {...docField} placeholder="Enter document content or summary here..." rows={3} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 )}
                <FormField
                  control={form.control}
                  name={`companySpecificDocuments.${index}.audience`}
                  render={({ field: docField }) => (
                    <FormItem>
                      <FormLabel>Audience (Optional)</FormLabel>
                      <FormControl><Input {...docField} placeholder="e.g., All Employees, Returning Parents" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ 
                id: `doc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, 
                title: '', 
                type: 'article', // Default type
                content: '', // Default to content for article
                url: '', 
                audience: '' 
              })}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Company Document
            </Button>
            <FormMessage>{(form.formState.errors as Record<string, { message?: string }>)?.companySpecificDocuments?.message}</FormMessage>
          </CardContent>
        </Card>


        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {initialData ? 'Update Program' : 'Create Program'}
        </Button>
      </form>
    </Form>
  );
}

