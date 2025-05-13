
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, KeyRound } from 'lucide-react'; // Changed Phone to Mail icon

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Mock login handler
  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    // Retrieve stored user profile for mock login.
    const storedUserProfile = localStorage.getItem('userProfile');
    const mockRegisteredUser = storedUserProfile ? JSON.parse(storedUserProfile) : null;

    if (mockRegisteredUser && email === mockRegisteredUser.email && password === 'password123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', mockRegisteredUser.name);
      localStorage.setItem('userEmail', mockRegisteredUser.email);
      if (mockRegisteredUser.phoneNumber) {
        localStorage.setItem('userPhoneNumber', mockRegisteredUser.phoneNumber);
      }
      router.push('/'); 
    } else if (email === 'test@example.com' && password === 'password123') { // Fallback mock user
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', 'Test User'); 
      localStorage.setItem('userEmail', 'test@example.com');
      localStorage.setItem('userProfile', JSON.stringify({
        id: 'testuser-fallback',
        name: 'Test User',
        email: 'test@example.com',
        children: [{ id: 'child1', birthYear: 2022 }],
        residentialArea: 'Seoul',
        parentalRole: 'mother'
      }));
      router.push('/');
    } else {
      setError('Invalid email or password. Try "test@example.com" and "password123" or your registered credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue your parenting journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 py-3 text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 py-3 text-base"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-accent hover:underline">
              Sign up
            </Link>
          </p>
          <div className="relative w-full my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          {/* Placeholder for social logins */}
          <Button variant="outline" className="w-full">
            Sign in with Google (Coming Soon)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

