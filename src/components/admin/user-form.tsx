"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { User } from '@/types';
import { PlusCircle, Trash2, User as UserIcon, Phone, Mail, MapPin, Smile, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

const generateId = (prefix = "child") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const childInfoSchema = z.object({
  id: z.string().default(() => generateId()),
  birthYear: z.coerce.number().min(1950, "Invalid year").max(new Date().getFullYear(), "Invalid year"),
});

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }), // Email is required
  phoneNumber: z.string().regex(/^\d{3}-\d{3,4}-\d{4}$/, { message: "Phone number must be in 010-XXXX-XXXX format." }).optional().or(z.literal('')), // Phone is optional
  residentialArea: z.string().min(2, { message: "Residential area is required." }),
  parentalRole: z.enum(['mother', 'father', 'grandparent']),
  children: z.array(childInfoSchema).optional(),
  registrationDate: z.string().optional(), 
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  isEditing?: boolean;
}

export function UserForm({ initialData, onSubmit, isEditing = false }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          email: initialData.email, // Email is required
          phoneNumber: initialData.phoneNumber || '', // Optional phone
          children: initialData.children?.map(c => ({...c, id: c.id || generateId() })) || [],
          registrationDate: initialData.registrationDate ? format(parseISO(initialData.registrationDate), "yyyy-MM-dd") : undefined,
          avatarUrl: initialData.avatarUrl || '',
        }
      : {
          name: '',
          email: '', // Email is required
          phoneNumber: '', // Optional phone
          residentialArea: '',
          parentalRole: undefined,
          children: [],
          registrationDate: format(new Date(), "yyyy-MM-dd"), 
          avatarUrl: '',
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });
  
  const currentYear = new Date().getFullYear();

  const handleSubmit = (values: UserFormData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl><Input placeholder="User's full name" {...field} className="pl-10"/></FormControl>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl><Input type="email" placeholder="user@example.com" {...field} className="pl-10"/></FormControl>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl><Input placeholder="010-1234-5678" {...field} className="pl-10"/></FormControl>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="parentalRole"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Parental Role</FormLabel>
                 <div className="relative">
                    <Smile className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="pl-10"><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                        <SelectContent>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="residentialArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residential Area</FormLabel>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl><Input placeholder="e.g., Seoul, Gangnam-gu" {...field} className="pl-10"/></FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Avatar URL (Optional)</FormLabel>
                <FormControl><Input type="url" placeholder="https://example.com/avatar.jpg" {...field}/></FormControl>
                <FormDescription>URL for the user's profile picture. Uses a default if empty.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />
        
        {isEditing && (
            <FormField
                control={form.control}
                name="registrationDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Registration Date</FormLabel>
                     <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl><Input type="date" {...field} className="pl-10" /></FormControl>
                     </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}


        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Children Information</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ id: generateId(), birthYear: currentYear -1 })}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Child
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-3 border rounded-md space-y-2 relative bg-muted/20">
                 <FormField
                  control={form.control}
                  name={`children.${index}.birthYear`}
                  render={({ field: childField }) => (
                    <FormItem>
                      <FormLabel>Child {index + 1} Birth Year</FormLabel>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder={`YYYY (e.g., ${currentYear - 2})`} 
                                {...childField} 
                                className="pl-10"
                                onChange={e => childField.onChange(parseInt(e.target.value) || '')}
                            />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-destructive hover:text-destructive/20 h-7 w-7"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No children added.</p>}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </form>
    </Form>
  );
}

