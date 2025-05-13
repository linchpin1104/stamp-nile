
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockUsers as initialMockUsers } from '@/lib/mock-data'; 
import type { User } from '@/types';
import { UsersDataTable } from '@/components/admin/users-data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const BANNED_USERS_STORAGE_KEY = 'bannedUsers'; 

const generateRandomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return format(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())), 'yyyy-MM-dd');
};


export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsersString = localStorage.getItem('mockUsers');
    let currentUsers: User[] = [];
    const ensureEmail = (user: User): User => ({
      ...user,
      email: user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      registrationDate: user.registrationDate || generateRandomDate() 
    });

    if (storedUsersString) {
      try {
        currentUsers = JSON.parse(storedUsersString).map(ensureEmail);
      } catch (error) {
        console.error("Error parsing users from localStorage:", error);
        currentUsers = initialMockUsers.map(ensureEmail);
        localStorage.setItem('mockUsers', JSON.stringify(currentUsers));
      }
    } else {
      currentUsers = initialMockUsers.map(ensureEmail);
      localStorage.setItem('mockUsers', JSON.stringify(currentUsers));
    }
    setUsers(currentUsers);
    setIsLoading(false);
  }, []);

  const handleBanUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to ban "${userName}"? This is a placeholder action.`)) {
      const storedBannedUsers = localStorage.getItem(BANNED_USERS_STORAGE_KEY);
      let bannedUsersList: string[] = [];
      if (storedBannedUsers) {
        bannedUsersList = JSON.parse(storedBannedUsers);
      }
      if (!bannedUsersList.includes(userName)) { 
        bannedUsersList.push(userName);
      }
      localStorage.setItem(BANNED_USERS_STORAGE_KEY, JSON.stringify(bannedUsersList));
      
      toast({
        title: "User Banned (Placeholder)",
        description: `User "${userName}" (ID: ${userId}) has been marked as banned. Implement actual status update.`,
      });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`)) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers)); 
      toast({
        title: "User Deleted",
        description: `User "${userName}" has been successfully deleted.`,
        variant: "destructive",
      });
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
          <p className="text-muted-foreground">View and manage all user accounts.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/admin/users/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New User
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersDataTable data={users} onBanUser={handleBanUser} onDeleteUser={handleDeleteUser} />
        </CardContent>
      </Card>
    </div>
  );
}

