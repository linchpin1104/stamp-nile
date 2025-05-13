"use client";

import Link from 'next/link';
import { Stamp, Home, BookOpenText, UserCircle, LogIn, LogOut, Settings, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react'; 

// Mock auth state
const useMockAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Simulate checking auth status
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    if (authStatus) {
      setUserName(localStorage.getItem('userName'));
      setUserEmail(localStorage.getItem('userEmail'));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhoneNumber');
    localStorage.removeItem('userProfile'); 
    setIsAuthenticated(false);
    setUserName(null);
    setUserEmail(null);
  };

  return { isAuthenticated, userName, userEmail, logout };
};


export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, userName, userEmail, logout } = useMockAuth(); 

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/programs', label: 'Programs', icon: BookOpenText },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const displayName = userName || "User";
  const displayIdentifier = userEmail || "user@example.com"; // Use email as identifier

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <Stamp className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight">STAMP</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-accent",
                pathname === item.href ? "text-accent font-semibold" : "text-foreground/70"
              )}
            >
              {item.label}
            </Link>
          ))}
           {isAuthenticated && (
             <Link
                href="/admin"
                className={cn(
                  "transition-colors hover:text-accent",
                  pathname.startsWith('/admin') ? "text-accent font-semibold" : "text-foreground/70"
                )}
              >
                <ShieldCheck className="inline-block mr-1 h-4 w-4" /> Admin
              </Link>
           )}
        </nav>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://picsum.photos/seed/${displayName.replace(/\s+/g, '')}/100/100`} alt={displayName} data-ai-hint="user avatar" />
                    <AvatarFallback>{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground flex items-center">
                      <Mail className="inline-block mr-1.5 h-3 w-3" />
                      {displayIdentifier}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#"> 
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

