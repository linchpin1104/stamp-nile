import { Suspense } from 'react';
import { getPrograms, getLightweightPrograms } from '@/services/programService';
import type { Program } from '@/types';
import { SearchInput } from '@/components/programs/search-input';
import { ProgramCard } from '@/components/program-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Number of programs to display per page
const DEFAULT_PAGE_SIZE = 9;

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string; };
}) {
  // Get search parameters from URL
  const searchTerm = searchParams.search || '';
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = DEFAULT_PAGE_SIZE;
  
  // Fetch programs data
  let allPrograms: Program[] = [];
  let displayedPrograms: Program[] = [];
  let totalPages = 1;
  
  try {
    if (searchTerm) {
      // For search, we need all programs to filter
      allPrograms = await getPrograms();
      
      // Filter on the server based on search term
      const filtered = allPrograms.filter(program =>
        program.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.targetAudience?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      // Calculate pagination
      totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      
      // Apply pagination after filtering
      const startIndex = (currentPage - 1) * pageSize;
      displayedPrograms = filtered.slice(startIndex, startIndex + pageSize);
    } else {
      // For no search, use lightweight approach
      const lightweightPrograms = await getLightweightPrograms(pageSize * 3) as Program[];
      allPrograms = lightweightPrograms;
      
      // Calculate pagination
      totalPages = Math.max(1, Math.ceil(lightweightPrograms.length / pageSize));
      
      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      displayedPrograms = lightweightPrograms.slice(startIndex, startIndex + pageSize);
    }
  } catch (error) {
    console.error("Error fetching programs:", error);
    displayedPrograms = [];
    totalPages = 1;
  }

  // Helper to generate page URLs
  function getPageUrl(pageNum: number): string {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (pageNum > 1) params.set('page', pageNum.toString());
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Explore Our Programs</h1>
        <p className="text-lg text-muted-foreground">
          Find the perfect guidance for your parenting journey, tailored to different stages and needs.
        </p>
        
        <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse bg-muted rounded"></div>}>
          <SearchInput initialValue={searchTerm} />
        </Suspense>
      </section>

      <Suspense fallback={<div className="text-center py-10">Loading programs...</div>}>
        {displayedPrograms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {displayedPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {currentPage > 1 && (
                    <Button asChild variant="outline">
                      <a href={getPageUrl(1)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> First page
                      </a>
                    </Button>
                  )}
                  
                  {currentPage > 1 && (
                    <Button asChild variant="outline">
                      <a href={getPageUrl(currentPage - 1)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                      </a>
                    </Button>
                  )}
                  
                  <div className="px-4 py-2 bg-muted rounded flex items-center">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  {currentPage < totalPages && (
                    <Button asChild variant="outline">
                      <a href={getPageUrl(currentPage + 1)}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-10 text-lg">
            {allPrograms.length === 0 && !searchTerm 
              ? "No programs available at the moment. Please check back soon!" 
              : "No programs match your search."}
          </p>
        )}
      </Suspense>
    </div>
  );
}
