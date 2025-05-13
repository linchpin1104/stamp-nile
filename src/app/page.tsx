import Link from 'next/link';
import { Suspense } from 'react';
import { BookOpenText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLightweightPrograms } from '@/services/programService';
import { RollingBanner } from '@/components/home/rolling-banner';
import { ClientHomePage } from '@/components/home/client-home-page';

// Define a recommended program limit
const RECOMMENDED_PROGRAM_LIMIT = 3;

// Server Component
export default async function HomePage() {
  // Fetch recommended programs on the server
  let recommendedPrograms = [];
  
  try {
    // Fetch lightweight program data for performance
    recommendedPrograms = await getLightweightPrograms(RECOMMENDED_PROGRAM_LIMIT);
  } catch (error) {
    console.error("Failed to fetch recommended programs:", error);
    // Leave recommendedPrograms as an empty array
  }

  return (
    <div className="space-y-12">
      {/* Static or SSR parts */}
      <RollingBanner />

      {/* Client-side interactive parts wrapped in client component */}
      <Suspense fallback={<div className="min-h-[30rem] flex justify-center items-center">
        <p className="text-muted-foreground text-lg">Loading your experience...</p>
      </div>}>
        <ClientHomePage recommendedPrograms={recommendedPrograms} />
      </Suspense>

      <div className="text-center mb-12">
        <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/programs">
            Explore All Programs
            <BookOpenText className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-3xl font-semibold tracking-tight text-primary mb-6">Popular Topics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {['Infant Sleep', 'Toddler Nutrition', 'Positive Discipline', 'School Readiness', 'Teen Communication'].map(topic => (
             <Button variant="outline" key={topic} className="py-6 text-base hover:bg-secondary/50">
               {topic}
             </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
