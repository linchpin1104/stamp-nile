"use client";

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchInputProps {
  initialValue?: string;
}

export function SearchInput({ initialValue = '' }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    startTransition(() => {
      // Update the URL with the search parameter
      const params = new URLSearchParams();
      if (term) params.set('search', term);
      
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      
      router.push(url);
    });
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="search"
        placeholder="Search programs by title, age, or topic..."
        className={`pl-10 py-3 text-base border-primary/50 focus:border-primary ${
          isPending ? 'opacity-70' : ''
        }`}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={isPending}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
        </div>
      )}
    </div>
  );
} 