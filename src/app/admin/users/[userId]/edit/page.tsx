
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { UserForm, type UserFormData } from '@/components/admin/user-form';
import type { User } from '@/types';
import { mockUsers as initialMockUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const generateRandomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return format(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())), 'yyyy-MM-dd');
};


export default function EditUserPage() {
  const router = useRouter();
  const { userId: routeUserId } = useParams();
  const { toast } = useToast();

  const [userId, setUserIdState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof routeUserId === 'string') {
      setUserIdState(routeUserId);
    } else {
      setUserIdState(null);
    }
  }, [routeUserId]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      const storedUsersString = localStorage.getItem('mockUsers');
      let currentUsers: User[] = initialMockUsers.map(u => ({
        ...u, 
        email: u.email || `${u.name.toLowerCase().replace(' ','.')}@example.com`,
        registrationDate: u.registrationDate || generateRandomDate()
      }));

      if (storedUsersString) {
        try {
          currentUsers = JSON.parse(storedUsersString).map((u:User) => ({
            ...u, 
            email: u.email || `${u.name.toLowerCase().replace(' ','.')}@example.com`,
            registrationDate: u.registrationDate || generateRandomDate()
          }));
        } catch (error) {
          console.error("Error parsing users from localStorage:", error);
        }
      }
      const foundUser = currentUsers.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        toast({ title: "Error", description: "User not found.", variant: "destructive" });
        router.push('/admin/users');
      }
      setIsLoading(false);
    } else if (routeUserId === null) {
        setIsLoading(false);
    }
  }, [userId, router, toast, routeUserId]);

  const handleUpdateUser = (data: UserFormData) => {
    if (!user || !userId) return;

    const updatedUserData: User = {
      ...user, 
      name: data.name,
      email: data.email, 
      phoneNumber: data.phoneNumber || undefined, 
      residentialArea: data.residentialArea,
      parentalRole: data.parentalRole,
      children: data.children || [],
      avatarUrl: data.avatarUrl || user.avatarUrl, 
      registrationDate: data.registrationDate ? format(new Date(data.registrationDate), 'yyyy-MM-dd') : user.registrationDate,
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
    
    const userIndex = currentUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      currentUsers[userIndex] = updatedUserData;
      localStorage.setItem('mockUsers', JSON.stringify(currentUsers));
      setUser(updatedUserData); 
      toast({ title: "User Updated", description: "User details saved successfully." });
      router.push('/admin/users');
    } else {
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading user details...</p></div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        User not found. <Link href="/admin/users" className="text-accent underline">Go back</Link>.
      </div>
    );
  }

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
          <CardTitle className="text-2xl text-primary">Edit User: {user.name}</CardTitle>
          <CardDescription>Modify the user's information.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm initialData={user} onSubmit={handleUpdateUser} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}
