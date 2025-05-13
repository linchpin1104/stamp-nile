
"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserForm, type UserFormData } from '@/components/admin/user-form';
import type { User } from '@/types';
import { mockUsers as initialMockUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const generateId = (prefix = "user") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const generateRandomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return format(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())), 'yyyy-MM-dd');
};


export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateUser = (data: UserFormData) => {
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email, // Email is primary
      phoneNumber: data.phoneNumber || undefined, // Phone is optional
      residentialArea: data.residentialArea,
      parentalRole: data.parentalRole,
      children: data.children || [],
      avatarUrl: data.avatarUrl || `https://picsum.photos/seed/${generateId('avatar')}/100/100`,
      registrationDate: data.registrationDate ? format(new Date(data.registrationDate), 'yyyy-MM-dd') : generateRandomDate(),
      customTodoLists: [],
      userMissions: [],
      completedProgramIds: [],
      registeredVouchers: [],
      // Initialize other fields if necessary
      qaSessionResponses: {}, 
      psychTestResponses: {},
      oxQuizResponses: {},
      scenarioResponses: {},
    };

    const storedUsersString = localStorage.getItem('mockUsers');
    let currentUsers: User[] = initialMockUsers;
    if (storedUsersString) {
      try {
        currentUsers = JSON.parse(storedUsersString);
      } catch (error) {
        console.error("Error parsing users from localStorage:", error);
      }
    }
    
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "User Created",
      description: `User "${newUser.name}" has been successfully created.`,
    });
    router.push('/admin/users');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Users
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Add New User</CardTitle>
          <CardDescription>Fill in the details for the new user account.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm onSubmit={handleCreateUser} isEditing={false} />
        </CardContent>
      </Card>
    </div>
  );
}

