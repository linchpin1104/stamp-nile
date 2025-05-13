"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, CheckSquare, CheckCircle2, XCircle } from 'lucide-react';
import type { Program, Week, OXQuizContent, User as UserType, UserOXQuizResponseItem } from '@/types';
import { getProgramBySlug } from '@/services/programService';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { mockUser as fallbackMockUser } from '@/lib/mock-data';

// Use type alias instead of empty interface
type UserResponse = UserOXQuizResponseItem;

export default function OXQuizPage() {
  const { slug: routeSlug, weekId: routeWeekId, quizId: routeQuizId } = useParams();
  const { toast } = useToast();

  const [programSlug, setProgramSlugState] = useState<string | null>(null);
  const [weekId, setWeekIdState] = useState<string | null>(null);
  const [quizId, setQuizIdState] = useState<string | null>(null);

  const [program, setProgram] = useState<Program | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [quizContent, setQuizContent] = useState<OXQuizContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (typeof routeSlug === 'string') setProgramSlugState(routeSlug); else setProgramSlugState(null);
  }, [routeSlug]);
  
  useEffect(() => {
    if (typeof routeWeekId === 'string') setWeekIdState(routeWeekId); else setWeekIdState(null);
  }, [routeWeekId]);
  
  useEffect(() => {
    if (typeof routeQuizId === 'string') setQuizIdState(routeQuizId); else setQuizIdState(null);
  }, [routeQuizId]);

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
    const loadQuizData = async () => {
      if (!programSlug || !weekId || !quizId) {
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
          const learningElement = currentWeek.learningElements?.find(el => el.type === 'ox_quiz' && el.id === quizId);
          if (learningElement && learningElement.type === 'ox_quiz') {
            setQuizContent(learningElement.content);
          } else {
            toast({ title: "Error", description: "O/X Quiz not found in this week.", variant: "destructive" });
            setQuizContent(null);
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

    if (programSlug && weekId && quizId) {
        loadQuizData();
    } else if (routeSlug === null || routeWeekId === null || routeQuizId === null) {
        setIsLoading(false);
    }
  }, [programSlug, weekId, quizId, toast, routeSlug, routeWeekId, routeQuizId]);

  const currentQuestion = quizContent?.questions[currentQuestionIndex];

  const handleAnswer = (answer: boolean) => {
    if (!currentQuestion) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) {
      toast({ title: "No Answer", description: "Please select O or X.", variant: "destructive" });
      return;
    }
    setUserResponses(prev => [...prev, { questionId: currentQuestion.id, userAnswer: selectedAnswer }]);
    setAnswerSubmitted(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizContent?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
    } else {
      handleQuizCompletion();
    }
  };

  const handleQuizCompletion = useCallback(() => {
    if (!quizContent || !currentUser || (userResponses.length === 0 && quizContent.questions.length > 0)) {
      setShowResults(true); 
      return;
    }
    const updatedUser = {
        ...currentUser,
        oxQuizResponses: {
            ...(currentUser.oxQuizResponses || {}),
            [quizContent.id]: userResponses,
        },
    };
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser); 
    toast({ title: "Quiz Responses Saved", description: "Your quiz results have been recorded."});
    setShowResults(true);
  }, [quizContent, currentUser, userResponses, toast]);


  if (isLoading || !currentUser) {
    return <div className="flex justify-center items-center h-64"><p>Loading quiz...</p></div>;
  }

  if (!quizContent || !program || !week) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Quiz Not Found</h1>
        <p className="text-muted-foreground">The O/X Quiz you are looking for does not exist or could not be loaded.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}` : "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Program/Week
          </Link>
        </Button>
      </div>
    );
  }

  if (showResults) {
    let correctAnswers = 0;
    quizContent.questions.forEach(q => {
      const userResponse = userResponses.find(r => r.questionId === q.id);
      if (userResponse && userResponse.userAnswer === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const scorePercentage = quizContent.questions.length > 0 ? (correctAnswers / quizContent.questions.length) * 100 : 0;

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button variant="outline" size="sm" asChild>
          <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}`: "/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Week Content
          </Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CheckSquare className="h-12 w-12 text-primary mx-auto mb-3"/>
            <CardTitle className="text-2xl text-primary">Quiz Results: {quizContent.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-center">
              You answered {correctAnswers} out of {quizContent.questions.length} questions correctly. ({scorePercentage.toFixed(0)}%)
            </p>
            <Separator />
            <h3 className="text-md font-semibold text-primary">Review Your Answers:</h3>
            {quizContent.questions.map((q, idx) => {
              const userRes = userResponses.find(r => r.questionId === q.id);
              const isCorrect = userRes?.userAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className={cn("p-3", isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                  <p className="font-medium">{idx + 1}. {q.statement}</p>
                  <p className="text-sm">Your answer: <span className="font-semibold">{userRes?.userAnswer ? 'O (True)' : 'X (False)'}</span></p>
                  <p className="text-sm">Correct answer: <span className="font-semibold">{q.correctAnswer ? 'O (True)' : 'X (False)'}</span>
                    {isCorrect ? <CheckCircle2 className="inline ml-1 h-4 w-4 text-green-600"/> : <XCircle className="inline ml-1 h-4 w-4 text-red-600"/>}
                  </p>
                  {q.explanation && <p className="text-xs text-muted-foreground mt-1">Explanation: {q.explanation}</p>}
                </Card>
              );
            })}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}`: "/programs")}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Done
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!currentQuestion) {
     return <div className="text-center py-10"><p>Error: No current question to display.</p></div>;
  }


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" asChild>
        <Link href={programSlug && weekId ? `/programs/${programSlug}/week/${weekId}` : (programSlug ? `/programs/${programSlug}`: "/programs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Week Content
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{quizContent.title}</CardTitle>
          {quizContent.description && <CardDescription>{quizContent.description}</CardDescription>}
          <p className="text-sm text-muted-foreground pt-2">Question {currentQuestionIndex + 1} of {quizContent.questions.length}</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-md bg-secondary/10 min-h-[100px] flex items-center justify-center">
              <p className="text-lg font-medium text-center text-foreground/90">
                {currentQuestion.statement}
              </p>
            </div>

            {!answerSubmitted ? (
                <div className="flex justify-around items-center pt-4">
                    <Button 
                        onClick={() => handleAnswer(true)} 
                        variant={selectedAnswer === true ? "default" : "outline"}
                        size="lg" 
                        className={cn("text-2xl w-24 h-24 rounded-full shadow-md transition-all transform hover:scale-105", selectedAnswer === true && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2")}
                    >
                        O
                    </Button>
                    <Button 
                        onClick={() => handleAnswer(false)}
                        variant={selectedAnswer === false ? "default" : "outline"}
                        size="lg" 
                        className={cn("text-2xl w-24 h-24 rounded-full shadow-md transition-all transform hover:scale-105", selectedAnswer === false && "bg-destructive text-destructive-foreground ring-2 ring-destructive ring-offset-2")}
                    >
                        X
                    </Button>
                </div>
            ) : (
                <div className="p-4 rounded-md text-center">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                        <div className="text-green-600">
                            <CheckCircle2 className="h-10 w-10 mx-auto mb-2"/>
                            <p className="font-semibold text-lg">Correct!</p>
                        </div>
                    ) : (
                        <div className="text-red-600">
                            <XCircle className="h-10 w-10 mx-auto mb-2"/>
                            <p className="font-semibold text-lg">Incorrect.</p>
                            <p className="text-sm">The correct answer was: {currentQuestion.correctAnswer ? 'O (True)' : 'X (False)'}</p>
                        </div>
                    )}
                    {currentQuestion.explanation && (
                        <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-2 rounded">{currentQuestion.explanation}</p>
                    )}
                </div>
            )}

        </CardContent>
        <CardFooter className="flex justify-end">
           {!answerSubmitted ? (
             <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>Submit Answer</Button>
           ) : (
             <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quizContent.questions.length - 1 ? 'Next Question' : 'View Results'}
             </Button>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
