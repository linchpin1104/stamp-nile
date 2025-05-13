"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@/types';
import { mockUsers as initialMockUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Edit, CalendarDays, Users, MapPin, Phone, Mail, Baby } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label'; 

export default function ViewUserPage() {
  const _router = useRouter();
  const { userId: routeUserId } = useParams();
  
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
      }));
      if (storedUsersString) {
        try {
          currentUsers = JSON.parse(storedUsersString).map((u:User) => ({
            ...u,
            email: u.email || `${u.name.toLowerCase().replace(' ','.')}@example.com`,
          }));
        } catch (error) {
          console.error("Error parsing users from localStorage:", error);
        }
      }
      const foundUser = currentUsers.find(u => u.id === userId);
      setUser(foundUser || null);
      setIsLoading(false);
    } else if (routeUserId === null) {
        setIsLoading(false);
    }
  }, [userId, routeUserId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading user details...</p></div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">User Not Found</h1>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }
  
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Users
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
            </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center border-b pb-6">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                <AvatarImage src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200`} alt={user.name} data-ai-hint="user avatar large"/>
                <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl text-primary">{user.name}</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="capitalize text-sm">{user.parentalRole}</Badge>
            </CardDescription>
             {user.registrationDate && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <CalendarDays className="mr-1 h-3 w-3"/> Joined: {format(new Date(user.registrationDate), "MMMM d, yyyy")}
                </div>
            )}
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <p className="flex items-center text-foreground"><Mail className="mr-2 h-4 w-4 text-primary"/> {user.email}</p>
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                <p className="flex items-center text-foreground"><Phone className="mr-2 h-4 w-4 text-primary"/> {user.phoneNumber || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Residential Area</Label>
                <p className="flex items-center text-foreground"><MapPin className="mr-2 h-4 w-4 text-primary"/> {user.residentialArea}</p>
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Number of Children</Label>
                <p className="flex items-center text-foreground"><Users className="mr-2 h-4 w-4 text-primary"/> {user.children.length}</p>
            </div>

            {user.children.length > 0 && (
            <div className="md:col-span-2 pt-4 mt-2 border-t">
                <h3 className="text-md font-semibold text-primary mb-3 flex items-center"><Baby className="mr-2 h-5 w-5"/>Children Information</h3>
                <ul className="space-y-3">
                {user.children.map((child, index) => (
                    <li key={child.id || index} className="p-3 border rounded-md bg-muted/30 text-sm">
                    <p><strong>Child {index + 1} Birth Year:</strong> {child.birthYear}</p>
                    <p className="text-xs text-muted-foreground">Approx. Age: {currentYear - child.birthYear} years old</p>
                    </li>
                ))}
                </ul>
            </div>
            )}
        </CardContent>
         <CardFooter className="border-t pt-4">
            <p className="text-xs text-muted-foreground">User ID: {user.id}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
