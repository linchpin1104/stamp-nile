"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Filter, UserX, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPrograms } from '@/lib/mock-data';
import type { Program } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const initialMockDiscussions = [
  { id: 'd1', programId: 'program1', program: 'Stamp36: Returning Parent Program (Infancy)', topic: 'Childcare anxieties', user: 'Alex Doe', date: '2024-07-20', snippet: 'I\'m feeling really anxious about finding reliable childcare...', status: 'active' },
  { id: 'd2', programId: 'program2', program: 'Navigating Toddler Transitions', topic: 'Tantrum tips?', user: 'Jamie Lee', date: '2024-07-19', snippet: 'My toddler has been having major tantrums. Any advice?', status: 'active' },
  { id: 'd3', programId: 'program1', program: 'Stamp36: Returning Parent Program (Infancy)', topic: 'Balancing work and pumping', user: 'Chris P.', date: '2024-07-18', snippet: 'Looking for tips on how to manage pumping schedules once I\'m back in the office.', status: 'flagged' },
  { id: 'd4', programId: 'program3', program: 'Mindful Parenting for Preschoolers', topic: 'Mindful listening success story!', user: 'Pat K.', date: '2024-07-17', snippet: 'Tried the mindful listening exercise and it really helped connect with my preschooler!', status: 'resolved' },
];

const BANNED_USERS_STORAGE_KEY = 'bannedUsers';

export default function ProgramDiscussionsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDiscussions, setFilteredDiscussions] = useState(initialMockDiscussions);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load programs from localStorage or use mockPrograms
    const storedProgramsString = localStorage.getItem('mockPrograms');
    if (storedProgramsString) {
      try {
        setPrograms(JSON.parse(storedProgramsString));
      } catch (error) {
        console.error("Error parsing programs from localStorage:", error);
        setPrograms(mockPrograms); // Fallback to initial mock if parsing fails
      }
    } else {
      setPrograms(mockPrograms); // Use initial mock if nothing in localStorage
    }

    // Load banned users
    const storedBannedUsers = localStorage.getItem(BANNED_USERS_STORAGE_KEY);
    if (storedBannedUsers) {
      setBannedUsers(JSON.parse(storedBannedUsers));
    }
  }, []);

  useEffect(() => {
    let discussions = initialMockDiscussions;
    // Filter by banned users first
    discussions = discussions.filter(d => !bannedUsers.includes(d.user));

    if (selectedProgram !== "all") {
      discussions = discussions.filter(d => d.programId === selectedProgram);
    }
    if (searchTerm) {
      discussions = discussions.filter(d =>
        d.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredDiscussions(discussions);
  }, [selectedProgram, searchTerm, bannedUsers]);

  const handleBanUser = (userName: string) => {
    if (confirm(`Are you sure you want to ban the user "${userName}"? All their posts will be hidden.`)) {
      const updatedBannedUsers = [...bannedUsers];
      if (!updatedBannedUsers.includes(userName)) {
        updatedBannedUsers.push(userName);
      }
      setBannedUsers(updatedBannedUsers);
      localStorage.setItem(BANNED_USERS_STORAGE_KEY, JSON.stringify(updatedBannedUsers));
      toast({
        title: "User Banned",
        description: `User "${userName}" has been banned. Their posts are now hidden.`,
      });
    }
  };


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Program Discussions & Community Content</h1>
        <p className="text-muted-foreground">Monitor and moderate community discussions across all programs.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Discussion Threads</CardTitle>
            <CardDescription>Review, moderate, and engage with community posts.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-full md:w-[280px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDiscussions.map(discussion => (
              <Card key={discussion.id} className={`border-l-4 ${discussion.status === 'flagged' ? 'border-destructive bg-destructive/5' : discussion.status === 'resolved' ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-primary hover:underline cursor-pointer">
                       <Link href={`/admin/program-discussions/${discussion.id}`}>{discussion.topic}</Link>
                    </CardTitle>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                      discussion.status === 'flagged' ? 'bg-destructive/20 text-destructive-foreground' :
                      discussion.status === 'resolved' ? 'bg-green-500/20 text-green-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {discussion.status}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    In <span className="font-medium text-foreground">{discussion.program}</span> by <span className="font-medium text-foreground">{discussion.user}</span> on {discussion.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 line-clamp-2">{discussion.snippet}</p>
                </CardContent>
                <CardFooter className="pt-3 flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" asChild>
                    <Link href={`/admin/program-discussions/${discussion.id}`}>View Thread</Link>
                  </Button>
                  {discussion.status === 'flagged' && (
                    <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10">
                       <EyeOff className="mr-2 h-4 w-4" /> Hide Comment
                    </Button>
                  )}
                   <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => handleBanUser(discussion.user)}
                    >
                       <UserX className="mr-2 h-4 w-4" /> Ban User
                    </Button>
                </CardFooter>
              </Card>
            ))}
             {filteredDiscussions.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3" />
                    <p>No discussions match your current filters or all posts by banned users are hidden.</p>
                </div>
            )}
          </div>
          {/* Placeholder for pagination */}
          <div className="mt-6 flex justify-center">
            <Button variant="outline" disabled={filteredDiscussions.length < 5}>Load More Discussions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
