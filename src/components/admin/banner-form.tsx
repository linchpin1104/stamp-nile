"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { Banner } from '@/types';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';

const bannerSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL or uploaded image is required."),
  linkUrl: z.string().url({ message: "Please enter a valid URL for the link." }).optional().or(z.literal('')),
  order: z.coerce.number().min(0, "Order must be a positive number."),
  isActive: z.boolean().default(true),
});

export type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  initialData?: Banner;
  onSubmit: (data: BannerFormData) => void;
  onCancel: () => void;
}

export function BannerForm({ initialData, onSubmit, onCancel }: BannerFormProps) {
  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      order: 0,
      isActive: true,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData?.imageUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('imageUrl', dataUrl, { shouldValidate: true, shouldDirty: true });
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      // If file input is cleared, but there was an initial URL, reset to that
      // Otherwise, clear the preview and form value if it was a data URL.
      if (initialData?.imageUrl && !initialData.imageUrl.startsWith('data:')) {
        form.setValue('imageUrl', initialData.imageUrl, { shouldValidate: true, shouldDirty: true });
        setImagePreview(initialData.imageUrl);
      } else if (imagePreview?.startsWith('data:')) {
         form.setValue('imageUrl', '', { shouldValidate: true, shouldDirty: true });
         setImagePreview(null);
      }
    }
  };

  const handleSubmit = (values: BannerFormData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer Special Offer" {...field} />
              </FormControl>
              <FormDescription>A short, catchy title for the banner.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Explore our new programs and get 20% off!" {...field} rows={3} />
              </FormControl>
              <FormDescription>A brief description or call to action.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Upload Banner Image</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="file:text-primary file:font-medium file:bg-primary/10 hover:file:bg-primary/20"/>
          </FormControl>
          <FormDescription>Upload an image (e.g., JPG, PNG). This will set the image URL below.</FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (or use upload above)</FormLabel>
              <FormControl>
                <Input
                  type="text" // Changed from "url" to allow data URLs
                  placeholder="https://example.com/banner-image.jpg or will be auto-filled by upload"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // Only update preview from URL if it's not a data URL currently from upload
                    if (!e.target.value.startsWith('data:')) {
                       setImagePreview(e.target.value || null);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Direct URL to an image, or auto-populated if you upload an image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {imagePreview && (
          <div className="mt-2 space-y-1">
            <Label>Image Preview:</Label>
            <Image
              src={imagePreview}
              alt="Banner preview"
              width={300}
              height={150}
              className="rounded-md border object-contain aspect-[2/1] bg-muted/50"
              unoptimized={imagePreview.startsWith('data:')} // Added for data URLs if optimization issues arise
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="linkUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/target-page" {...field} />
              </FormControl>
              <FormDescription>Where the banner should link to when clicked.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>Order in which banners appear (lower numbers first).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Set whether this banner is currently active and displayed on the homepage.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {initialData ? 'Update Banner' : 'Create Banner'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
