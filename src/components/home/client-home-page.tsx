"use client";

import { useEffect, useState } from 'react';
import type { Program, User } from '@/types';
import { mockUser as fallbackMockUser } from '@/lib/mock-data';
import { UserDashboardSummary } from '@/components/home/user-dashboard-summary';
import { MoodSelector } from '@/components/mood/mood-selector';
import { ProgramCard } from '@/components/program-card';
import { isAfter, parseISO } from 'date-fns';

interface ClientHomePageProps {
  recommendedPrograms: Partial<Program>[];
}

export function ClientHomePage({ recommendedPrograms }: ClientHomePageProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUserPrograms, setActiveUserPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persistCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    localStorage.setItem('userName', updatedUser.name);
    localStorage.setItem('userEmail', updatedUser.email);
    if (updatedUser.phoneNumber) {
      localStorage.setItem('userPhoneNumber', updatedUser.phoneNumber);
    } else {
      localStorage.removeItem('userPhoneNumber');
    }
  };

  useEffect(() => {
    const loadUserData = () => {
      setIsLoading(true);
      try {
        const storedUserProfileString = localStorage.getItem('userProfile');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        let user: User | null = null;

        if (isAuthenticated && storedUserProfileString) {
          try {
            user = JSON.parse(storedUserProfileString);
          } catch (e) {
            console.error("Failed to parse userProfile from localStorage", e);
            // user remains null
          }
        } else if (isAuthenticated) {
          user = {
            ...fallbackMockUser,
            name: localStorage.getItem('userName') || fallbackMockUser.name,
            email: localStorage.getItem('userEmail') || fallbackMockUser.email,
            phoneNumber: localStorage.getItem('userPhoneNumber') || fallbackMockUser.phoneNumber,
            moodLog: [],
          };
          persistCurrentUser(user);
        }

        if (user && !user.moodLog) {
          user.moodLog = [];
          persistCurrentUser(user);
        }
        setCurrentUser(user);

        // Calculate active programs
        if (user && recommendedPrograms.length > 0) {
          const userActiveProgramsResult = recommendedPrograms.filter(program => {
            if (!program.id) return false;
            
            // Check if program is completed by looking at programCompletions
            const isCompleted = user.programCompletions?.some(
              completion => completion.programId === program.id
            );
            if (isCompleted) return false;

            const activeVoucher = user.registeredVouchers?.find(
              v => v.programId === program.id && isAfter(parseISO(v.accessExpiresDate), new Date())
            );
            return !!activeVoucher;
          }) as Program[];
          
          setActiveUserPrograms(userActiveProgramsResult);
        } else {
          setActiveUserPrograms([]);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [recommendedPrograms]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[20rem]">
        <p className="text-muted-foreground text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* User-specific content that depends on authentication state */}
      {currentUser && (
        <>
          <UserDashboardSummary user={currentUser} activePrograms={activeUserPrograms} />
          <MoodSelector currentUser={currentUser} onMoodSaved={persistCurrentUser} />
        </>
      )}

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">
            {currentUser ? 'Other Programs You Might Like' : 'Recommended for You'}
          </h2>
        </div>
        {recommendedPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedPrograms.map((program) => (
              program.id && <ProgramCard key={program.id} program={program as Program} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No programs currently recommended. Please check back later or update your profile.
          </p>
        )}
      </section>
    </>
  );
} 