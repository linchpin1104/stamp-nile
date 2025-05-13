
"use client";

import Image from 'next/image';
import { Accordion } from '@/components/ui/accordion';
import { WeekAccordionItem } from '@/components/week-accordion-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Share2, Bookmark, FileText, Link2, ExternalLink, Users, Award, MessageSquare, ThumbsUp, Lock, Ticket, BookOpenCheck, PlusCircle, BookText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProgramCompletionModal } from '@/components/program-completion-modal';
import React, { useState, useEffect } from 'react';
import type { User as UserType, ProgramCompletion, Program as ProgramType, DiscussionPost } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, parseISO } from 'date-fns';
import { getProgramBySlug } from '@/services/programService';
import { mockUser as fallbackMockUser, initialMockDiscussionsData } from '@/lib/mock-data';
import { useParams } from 'next/navigation';

interface ProgramDetailPageProps {
  // Params are now obtained via useParams hook
}

export default function ProgramDetailPage({}: ProgramDetailPageProps) {
  const { toast } = useToast();
  const routeParams = useParams();
  
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [program, setProgram] = useState<ProgramType | null | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isProgramCompletedByCurrentUser, setIsProgramCompletedByCurrentUser] = useState(false);
  const [hasActiveVoucherAccess, setHasActiveVoucherAccess] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (typeof routeParams.slug === 'string') {
      setProgramSlug(routeParams.slug);
    } else {
      setProgramSlug(null);
    }
  }, [routeParams.slug]);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; 

    const storedUserProfileString = localStorage.getItem('userProfile');
    let userToSet: UserType = fallbackMockUser;
    if (storedUserProfileString) {
      try {
        userToSet = JSON.parse(storedUserProfileString);
      } catch (e) {
        console.error("Failed to parse userProfile from localStorage", e);
      }
    }
    setCurrentUser(userToSet);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !programSlug) { 
      // If slug is null (e.g. invalid route or param not resolved), set program to null
      if (programSlug === null) setProgram(null);
      return;
    }

    const fetchProgramData = async () => {
      const currentProgramData = await getProgramBySlug(programSlug);
      setProgram(currentProgramData || null);
    };

    fetchProgramData();
  }, [isClient, programSlug]); 


   useEffect(() => {
    if (!program || !currentUser) return;

    const completed = currentUser.programCompletions?.some(pc => pc.programId === program.id);
    setIsProgramCompletedByCurrentUser(!!completed);

    if (process.env.NODE_ENV !== 'production') {
      setHasActiveVoucherAccess(true); // Bypass voucher check in dev
    } else {
      const activeVoucher = currentUser.registeredVouchers?.find(
        v => v.programId === program.id && isAfter(parseISO(v.accessExpiresDate), new Date())
      );
      setHasActiveVoucherAccess(!!activeVoucher);
    }

  }, [program, currentUser]);


  if (!isClient || program === undefined) {
    return <div className="flex justify-center items-center h-64"><p>Loading program...</p></div>;
  }

  if (program === null) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Program Not Found</h1>
        <p className="text-muted-foreground">The program you are looking for does not exist or has been moved.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
          </Link>
        </Button>
      </div>
    );
  }

  const canAccessContent = isProgramCompletedByCurrentUser || hasActiveVoucherAccess;
  const programWeeks = program.weeks || [];
  const activeWeekId = programWeeks.length > 0 ? programWeeks[0].id : null;

  const handleOpenCompletionModal = () => {
    if (!currentUser || !program) return;
    if (!hasActiveVoucherAccess && !isProgramCompletedByCurrentUser) {
        toast({
            title: "Access Required",
            description: "You need to register a voucher for this program or complete it to mark satisfaction.",
            variant: "destructive"
        });
        return;
    }
    setShowCompletionModal(true);
  };

  const handleCloseCompletionModal = (satisfactionScore?: number) => {
    setShowCompletionModal(false);
    if (!currentUser || !program || satisfactionScore === undefined) {
        if(satisfactionScore === undefined && isProgramCompletedByCurrentUser === false) {
             toast({ title: "Program completion not fully recorded", description: "Please provide a satisfaction rating to complete the program.", variant: "destructive" });
        }
        return;
    }

    const newCompletion: ProgramCompletion = {
        programId: program.id,
        completionDate: format(new Date(), 'yyyy-MM-dd'),
        satisfactionScore: satisfactionScore,
    };

    const updatedCompletions = [
        ...(currentUser.programCompletions?.filter(pc => pc.programId !== program.id) || []),
        newCompletion
    ];

    const updatedUser: UserType = { ...currentUser, programCompletions: updatedCompletions };

    setCurrentUser(updatedUser); 
    localStorage.setItem('userProfile', JSON.stringify(updatedUser)); 

    setIsProgramCompletedByCurrentUser(true);
    toast({ title: "Program Completed!", description: `Congratulations on completing "${program.title}". Your rating has been saved.` });
  };

  const programDiscussions = initialMockDiscussionsData.filter(d => d.programId === program.id && !d.user.toLowerCase().includes("admin"));


  return (
    <div className="space-y-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
            <Link href="/programs"><ArrowLeft className="mr-2 h-4 w-4" /> All Programs</Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl">
        <CardContent className="p-0 md:p-0">
          <div className="md:flex">
            <div className="md:w-1/3 relative">
              <Image
                src={program.imageUrl}
                alt={program.title}
                width={600}
                height={400}
                className="w-full h-64 md:h-full object-cover"
                data-ai-hint="program details image"
                priority
              />
            </div>
            <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">{program.title}</h1>
                <p className="text-base text-muted-foreground mb-4">{program.targetAudience}</p>
                {program.tags && program.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {program.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-foreground/90 leading-relaxed mb-6">{program.longDescription || program.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                {!isProgramCompletedByCurrentUser ? (
                     <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleOpenCompletionModal}>
                        Mark Program as Completed <Award className="ml-2 h-5 w-5"/>
                     </Button>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Badge variant="default" className="text-lg py-2 px-4 bg-green-600 text-white">
                            <ThumbsUp className="mr-2 h-5 w-5"/> Program Completed!
                        </Badge>
                        <Button size="lg" variant="outline" asChild>
                            <Link href={`/programs/${program.slug}/report`}>
                                <BookText className="mr-2 h-5 w-5"/> View My Report
                            </Link>
                        </Button>
                    </div>
                )}
                 {!hasActiveVoucherAccess && !isProgramCompletedByCurrentUser && (
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/profile#vouchers_tab">
                            <Ticket className="mr-2 h-4 w-4"/> Register Voucher
                        </Link>
                    </Button>
                )}
                <Button variant="outline" size="icon" aria-label="Share Program">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Bookmark Program">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="content"><BookOpenCheck className="mr-2 h-4 w-4"/>Program Content</TabsTrigger>
          <TabsTrigger value="resources"><FileText className="mr-2 h-4 w-4"/>Company Resources</TabsTrigger>
          <TabsTrigger value="community"><Users className="mr-2 h-4 w-4"/>Community</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">Weekly Curriculum</h2>
            {canAccessContent ? (
                programWeeks.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-1" defaultValue={`week-${programWeeks.find(w => w.id === activeWeekId)?.weekNumber || programWeeks[0].weekNumber}`}>
                    {programWeeks.map((week) => (
                    <WeekAccordionItem
                        key={week.id}
                        week={week}
                        programSlug={program.slug}
                        isActive={week.id === activeWeekId}
                        isCompleted={currentUser?.programCompletions?.some(pc => pc.programId === program.id)} 
                    />
                    ))}
                </Accordion>
                ) : (
                <p className="text-muted-foreground">No weekly content available for this program yet.</p>
                )
            ) : (
                <Card className="text-center py-10 bg-muted/50">
                    <CardHeader>
                        <Lock className="h-12 w-12 text-primary mx-auto mb-3"/>
                        <CardTitle className="text-xl text-primary">Content Locked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            You need to register a voucher or purchase this program to access its content.
                        </p>
                        <Button asChild className="mt-4 bg-accent hover:bg-accent/80 text-accent-foreground">
                            <Link href="/profile#vouchers_tab">Register Voucher</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">Company Specific Resources</h2>
            {program.companySpecificDocuments && program.companySpecificDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {program.companySpecificDocuments.map(doc => (
                <Card key={doc.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        {doc.type === 'resource_link' ? <Link2 className="mr-2 h-5 w-5" /> : <FileText className="mr-2 h-5 w-5" />}
                        {doc.title}
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                    <Badge variant="outline" className="mb-2 capitalize text-xs">{doc.type.replace(/_/g, ' ')}</Badge>
                    {doc.audience && <p className="text-xs text-muted-foreground mb-2">Audience: {doc.audience}</p>}
                    {doc.url && (
                        <Button variant="link" asChild className="p-0 h-auto text-accent">
                            <a
                                href={doc.url}
                                download={doc.type !== 'resource_link' && doc.url.match(/\.(pdf|docx?|pptx?|xlsx?|txt)$/i) ? doc.title.replace(/[^a-z0-9_.-]/gi, '_') + (doc.url.match(/\.(pdf|docx?|pptx?|xlsx?|txt)$/i)?.[0] || '') : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {doc.type !== 'resource_link' && doc.url.match(/\.(pdf|docx?|pptx?|xlsx?|txt)$/i) ? 'Download Document' : 'Access Resource'}
                                <ExternalLink className="ml-1 h-3 w-3 inline" />
                            </a>
                        </Button>
                    )}
                    {doc.content && <p className="text-sm text-foreground/80 mt-2 line-clamp-4">{doc.content}</p>}
                    {!doc.url && !doc.content && <p className="text-sm text-muted-foreground">No content or link provided.</p>}
                    </CardContent>
                </Card>
                ))}
            </div>
            ) : (
            <p className="text-muted-foreground">No company-specific resources are attached to this program.</p>
            )}
        </TabsContent>

        <TabsContent value="community" className="mt-6">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl text-primary flex items-center"><Users className="mr-3 h-6 w-6"/>Program Community</CardTitle>
                        <CardDescription>Connect with other parents in this program.</CardDescription>
                    </div>
                    <Button variant="outline" disabled>
                        <PlusCircle className="mr-2 h-4 w-4" /> Start New Discussion
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {programDiscussions.length > 0 ? (
                        programDiscussions.map(discussion => (
                            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-primary hover:underline cursor-pointer">
                                         <span className="cursor-not-allowed">{discussion.topic} (View Soon)</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        By {discussion.user} on {discussion.date}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/80 line-clamp-2">{discussion.snippet}</p>
                                </CardContent>
                                <CardContent className="pt-2 flex justify-end">
                                     <Button variant="link" size="sm" disabled>
                                        View Full Discussion (Soon)
                                     </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                No discussions yet for "{program.title}". Be the first to start one!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {showCompletionModal && (
        <ProgramCompletionModal
          isOpen={showCompletionModal}
          onClose={handleCloseCompletionModal}
          programTitle={program.title}
        />
      )}
    </div>
  );
}
