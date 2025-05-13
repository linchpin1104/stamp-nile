"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, KeyRound, User, Phone, Mail, MapPin, Users, CalendarDays, Smile } from 'lucide-react';
import type { ChildInfo } from '@/types';

const generateId = (prefix = "child") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [numberOfChildren, setNumberOfChildren] = useState<number>(0);
  const [childrenBirthYears, setChildrenBirthYears] = useState<Array<{id: string, year: string}>>([]);
  const [residentialArea, setResidentialArea] = useState('');
  const [parentalRole, setParentalRole] = useState<'mother' | 'father' | 'grandparent' | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    setChildrenBirthYears(currentBirthYears => {
      const newBirthYears = [];
      for (let i = 0; i < numberOfChildren; i++) {
        if (i < currentBirthYears.length) {
          newBirthYears.push(currentBirthYears[i]);
        } else {
          newBirthYears.push({ id: generateId(), year: '' });
        }
      }
      return newBirthYears;
    });
  }, [numberOfChildren]);

  const handleChildBirthYearChange = (index: number, year: string) => {
    const updatedBirthYears = [...childrenBirthYears];
    updatedBirthYears[index] = {...updatedBirthYears[index], year };
    setChildrenBirthYears(updatedBirthYears);
  };

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (phoneNumber.trim() && !/^\d{3}-\d{3,4}-\d{4}$/.test(phoneNumber)) { 
        setError('Please enter a valid phone number (010-XXXX-XXXX) or leave it blank.');
        return;
    }
    if (parentalRole === '') {
        setError('Please select your role.');
        return;
    }
    if (numberOfChildren > 0 && childrenBirthYears.some(child => !child.year || isNaN(parseInt(child.year)) || parseInt(child.year) < 1950 || parseInt(child.year) > new Date().getFullYear() )) {
        setError('Please enter a valid birth year for all children.');
        return;
    }


    const childrenData: ChildInfo[] = childrenBirthYears.map(child => ({
        id: child.id,
        birthYear: parseInt(child.year),
    }));

    // In a real app, call API to register user
    console.log('Registering user:', { 
        name, 
        email,
        phoneNumber, 
        password, 
        numberOfChildren, 
        children: childrenData,
        residentialArea,
        parentalRole 
    });
    // Simulate successful registration and login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email); // Store email
    if (phoneNumber.trim()) {
        localStorage.setItem('userPhoneNumber', phoneNumber);
    } else {
        localStorage.removeItem('userPhoneNumber');
    }
    localStorage.setItem('userProfile', JSON.stringify({
        id: generateId('user'), // Add a user ID
        name,
        email,
        phoneNumber: phoneNumber.trim() || undefined,
        children: childrenData,
        residentialArea,
        parentalRole
    }));

    router.push('/'); // Redirect to homepage
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
          <CardDescription>Join Parenting Pathways and start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10 py-3 text-base"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 py-3 text-base"/>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="phoneNumber" type="tel" placeholder="010-1234-5678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="pl-10 py-3 text-base"/>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="parentalRole">Your Role</Label>
                <Select onValueChange={(value) => setParentalRole(value as 'mother' | 'father' | 'grandparent')} value={parentalRole}>
                    <SelectTrigger className="py-3 text-base">
                        <Smile className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <span className="pl-6"><SelectValue placeholder="Select your role" /></span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mother">Mother (엄마)</SelectItem>
                        <SelectItem value="father">Father (아빠)</SelectItem>
                        <SelectItem value="grandparent">Grandparent (조부모)</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="residentialArea">Residential Area</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="residentialArea" type="text" placeholder="e.g., Seoul, Gangnam-gu" value={residentialArea} onChange={(e) => setResidentialArea(e.target.value)} required className="pl-10 py-3 text-base"/>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numberOfChildren">Number of Children</Label>
              <Select onValueChange={(value) => setNumberOfChildren(parseInt(value))} value={numberOfChildren.toString()}>
                <SelectTrigger className="py-3 text-base">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <span className="pl-6"><SelectValue placeholder="Select number of children" /></span>
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num === 0 ? 'None' : num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {numberOfChildren > 0 && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/30">
                <Label className="text-base font-medium">Children's Birth Years</Label>
                {childrenBirthYears.map((child, index) => (
                  <div key={child.id} className="space-y-1">
                    <Label htmlFor={`childBirthYear-${index}`}>Child {index + 1} Birth Year</Label>
                    <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                        id={`childBirthYear-${index}`}
                        type="number"
                        placeholder={`YYYY (e.g., ${currentYear - 2})`}
                        value={child.year}
                        onChange={(e) => handleChildBirthYearChange(index, e.target.value)}
                        required
                        min="1950"
                        max={currentYear.toString()}
                        className="pl-10 py-3 text-base"
                        />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="pl-10 py-3 text-base"/>
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10 py-3 text-base"/>
                </div>
                </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

