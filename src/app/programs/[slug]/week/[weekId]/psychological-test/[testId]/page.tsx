"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Brain, CheckCircle } from 'lucide-react';
import type { 
  Program, 
  Week, 
  PsychologicalTestContent, 
  PsychologicalFactor as _PsychologicalFactor, 
  User as UserType, 
  UserPsychTestResponseItem as UserPsychologicalTestResponseItem 
} from '@/types';
import { getProgramBySlug } from '@/services/programService';
import { useToast } from '@/hooks/use-toast';
import { mockUser as fallbackMockUser } from '@/lib/mock-data';

// Replace empty interface with type alias that extends the base type
type UserResponse = UserPsychologicalTestResponseItem;

export default function PsychologicalTestPage() {
  const { slug: routeSlug, weekId: routeWeekId, testId: routeTestId } = useParams();
  const { toast } = useToast();

  const [programSlug, setProgramSlugState] = useState<string | null>(null);
  const [weekId, setWeekIdState] = useState<string | null>(null);
  const [testId, setTestIdState] = useState<string | null>(null);

  const [program, setProgram] = useState<Program | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [testContent, setTestContent] = useState<PsychologicalTestContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [currentFactorIndex, setCurrentFactorIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [factorScores, setFactorScores] = useState<Record<string, number>>({});
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (typeof routeSlug === 'string') setProgramSlugState(routeSlug); else setProgramSlugState(null);
  }, [routeSlug]);
  useEffect(() => {
    if (typeof routeWeekId === 'string') setWeekIdState(routeWeekId); else setWeekIdState(null);
  }, [routeWeekId]);
  useEffect(() => {
    if (typeof routeTestId === 'string') setTestIdState(routeTestId); else setTestIdState(null);
  }, [routeTestId]);
  
  useEffect(() => {
    const storedUserProfileString = localStorage.getItem('userProfile');
    if (storedUserProfileString) {
      try {
        setCurrentUser(JSON.parse(storedUserProfileString));
      } catch (e) {
        console.error("Failed to parse userProfile from localStorage", e);
        setCurrentUser(fallbackMockUser);
      }
    } else {
      setCurrentUser(fallbackMockUser);
    }
  }, []);


  useEffect(() => {
    const loadTestData = async () => {
      if (!programSlug || !weekId || !testId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const fetchedProgram = await getProgramBySlug(programSlug);
      if (fetchedProgram) {
        setProgram(fetchedProgram);
        const currentWeek = fetchedProgram.weeks?.find(w => w.id === weekId);
        if (currentWeek) {
          setWeek(currentWeek);
          const learningElement = currentWeek.learningElements?.find(el => el.type === 'psychological_test' && el.id === testId);
          if (learningElement && learningElement.type === 'psychological_test') {
            setTestContent(learningElement.content);
          } else {
            toast({ title: "Error", description: "Psychological test not found in this week.", variant: "destructive" });
            setTestContent(null);
          }
        } else {
          toast({ title: "Error", description: "Week not found.", variant: "destructive" });
          setWeek(null);
        }
      } else {
        toast({ title: "Error", description: "Program not found.", variant: "destructive" });
        setProgram(null);
      }
      setIsLoading(false);
    };
    if (programSlug && weekId && testId) {
        loadTestData();
    } else if (routeSlug === null || routeWeekId === null || routeTestId === null) {
        setIsLoading(false);
    }
  }, [programSlug, weekId, testId, toast, routeSlug, routeWeekId, routeTestId]);

  const handleResponseChange = (factorId: string, questionId: string, value: string) => {
    const numericValue = parseInt(value, 10);
    setUserResponses(prev => {
      const existingResponseIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingResponseIndex > -1) {
        const updated = [...prev];
        updated[existingResponseIndex] = { factorId, questionId, value: numericValue };
        return updated;
      }
      return [...prev, { factorId, questionId, value: numericValue }];
    });
  };

  const currentFactor = testContent?.factors[currentFactorIndex];
  const allQuestionsInCurrentFactorAnswered = currentFactor?.questions.every(q =>
    userResponses.some(r => r.questionId === q.id)
  );

  const handleTestCompletionAndSave = useCallback(() => {
    if (!testContent || !currentUser || userResponses.length === 0 && testContent.factors.reduce((sum, f) => sum + f.questions.length, 0) > 0) {
        setShowResults(true);
        return;
    }
    
    const updatedUser = {
        ...currentUser,
        psychTestResponses: {
            ...(currentUser.psychTestResponses || {}),
            [testContent.id]: userResponses,
        },
    };
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser); 
    toast({ title: "Test Responses Saved", description: "Your test results have been recorded."});
    setShowResults(true);
  }, [testContent, currentUser, userResponses, toast]);
  
  const calculateResultsAndShow = useCallback(() => {
    if (!testContent) {
        setShowResults(true); 
        return;
    }
    const scores: Record<string, number> = {};
    let totalScoreForOverall = 0;
    let totalQuestionsForOverallAverage = 0;

    testContent.factors.forEach(factor => {
      let factorScore = 0;
      let questionsInFactor = 0;
      factor.questions.forEach(q => {
        const response = userResponses.find(r => r.questionId === q.id);
        if (response) {
          factorScore += response.value;
          questionsInFactor++;
        }
      });

      if (factor.scoringMethod === 'average' && questionsInFactor > 0) {
        scores[factor.id] = factorScore / questionsInFactor;
      } else if (questionsInFactor > 0) { 
        scores[factor.id] = factorScore;
      } else {
        scores[factor.id] = 0; 
      }
      
      if (testContent.overallScoringMethod === 'average') {
        totalScoreForOverall += factorScore; 
        totalQuestionsForOverallAverage += questionsInFactor;
      } else { 
         totalScoreForOverall += scores[factor.id]; 
      }
    });
    setFactorScores(scores);

    if (testContent.overallScoringMethod === 'average' && totalQuestionsForOverallAverage > 0) {
        setOverallScore(totalScoreForOverall / totalQuestionsForOverallAverage);
    } else if (testContent.overallScoringMethod === 'sum' && testContent.factors.length > 0) {
        setOverallScore(totalScoreForOverall);
    } else {
        setOverallScore(null); 
    }
    
    handleTestCompletionAndSave();

  }, [testContent, userResponses, handleTestCompletionAndSave]);


  const handleNextFactor = () => {
    if (currentFactor && allQuestionsInCurrentFactorAnswered) {
      if (currentFactorIndex < (testContent?.factors.length || 0) - 1) {
        setCurrentFactorIndex(prev => prev + 1);
      } else {
        calculateResultsAndShow();
      }
    } else {
      toast({ title: "Incomplete", description: "Please answer all questions in this section.", variant: "destructive" });
    }
  };

  const getResultComment = (score: number, comments: PsychologicalTestContent['overallResultComments']) => {
    const matchedComment = comments.find(c => score >= c.scoreRange[0] && score <= c.scoreRange[1]);
    return matchedComment || { categoryLabel: 'N/A', comment: 'No specific comment for this score range.'};
  };


  if (isLoading || !currentUser) {
    return <div className="flex justify-center items-center h-64"><p>Loading test...</p></div>;
  }

  if (!testContent || !program || !week) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Test Not Found</h1>
        <p className="text-muted-foreground">The psychological test you are looking for does not exist or could not be loaded.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program/Week
          </Link>
        </Button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="outline" size="sm" asChild>
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Week Content
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Brain className="h-12 w-12 text-primary mx-auto mb-3"/>
            <CardTitle className="text-2xl text-primary">Test Results: {testContent.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {testContent.factors.map(factor => {
              const score = factorScores[factor.id];
              const displayScore = typeof score === 'number' ? score : 0;
              const result = getResultComment(displayScore, factor.factorResultComments);
              return (
                <Card key={factor.id} className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-accent">{factor.title}</CardTitle>
                    <CardDescription>Score: {displayScore?.toFixed(2)} ({result.categoryLabel})</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{result.comment}</p>
                  </CardContent>
                </Card>
              );
            })}
            {overallScore !== null && (
              <Card className="mt-6 border-primary">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Overall Assessment (총평)</CardTitle>
                     <CardDescription>Overall Score: {overallScore.toFixed(2)} ({getResultComment(overallScore, testContent.overallResultComments).categoryLabel})</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{getResultComment(overallScore, testContent.overallResultComments).comment}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
                <CheckCircle className="mr-2 h-4 w-4" /> Done
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!currentFactor) {
     return <div className="text-center py-10"><p>Error: No current factor to display for the test.</p></div>;
  }


  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild>
        <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Week Content
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{testContent.title}</CardTitle>
          {testContent.description && <CardDescription>{testContent.description}</CardDescription>}
           <p className="text-sm text-muted-foreground pt-2">Section {currentFactorIndex + 1} of {testContent.factors.length}: <span className="font-semibold text-foreground">{currentFactor.title}</span></p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentFactor.questions.map((question, qIndex) => (
            <div key={question.id} className="p-4 border rounded-md bg-secondary/10">
              <Label htmlFor={`q-${question.id}`} className="text-base font-medium text-foreground/90 block mb-3">
                {qIndex + 1}. {question.text}
              </Label>
              <RadioGroup
                id={`q-${question.id}`}
                onValueChange={(value) => handleResponseChange(currentFactor.id, question.id, value)}
                value={userResponses.find(r => r.questionId === question.id)?.value.toString()}
                className="space-y-2"
              >
                {question.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-2 p-2 rounded hover:bg-primary/10 transition-colors">
                    <RadioGroupItem value={option.value.toString()} id={`opt-${option.id}`} />
                    <Label htmlFor={`opt-${option.id}`} className="font-normal cursor-pointer flex-1">{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleNextFactor} disabled={!allQuestionsInCurrentFactorAnswered}>
            {currentFactorIndex < testContent.factors.length - 1 ? 'Next Section' : 'View Results'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
