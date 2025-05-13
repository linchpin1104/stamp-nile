import type { Program } from '@/types';
import { createProgramRepository, ProgramRepository } from './repositories/programRepository';
import { CacheStrategy, createTypedCache } from '@/lib/cache';

// Constants
const LIGHTWEIGHT_FIELDS = ['title', 'description', 'imageUrl', 'slug', 'targetAudience', 'tags'];
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Create typed caches for different program data types
const programCache = createTypedCache<Program>('program');
const programListCache = createTypedCache<Program[]>('programList');
const paginationCache = createTypedCache<{
  programs: Program[];
  lastId?: string;
  hasMore: boolean;
}>('programPagination');
const lightweightCache = createTypedCache<Partial<Program>[]>('lightweightPrograms');

/**
 * Program Service - Provides business logic for programs
 * Uses repository pattern for data access with improved caching
 */
class ProgramService {
  private repository: ProgramRepository;
  private cacheStrategy: CacheStrategy;
  private cacheTTL: number;

  constructor(
    repository?: ProgramRepository, 
    options?: { 
      cacheStrategy?: CacheStrategy, 
      cacheTTL?: number, 
      useFallbackInDev?: boolean 
    }
  ) {
    // Allow dependency injection for testing
    this.repository = repository || createProgramRepository({
      useFallbackInDev: options?.useFallbackInDev ?? true
    });
    
    // In production use memory-only by default to reduce localStorage pressure
    // In development use memory & persist for better debugging experience
    this.cacheStrategy = options?.cacheStrategy ?? 
      (process.env.NODE_ENV === 'production' 
        ? CacheStrategy.MEMORY_ONLY 
        : CacheStrategy.MEMORY_AND_PERSIST);
        
    this.cacheTTL = options?.cacheTTL ?? DEFAULT_CACHE_TTL;
  }

  /**
   * Get all programs
   * @returns Promise with array of programs
   */
  async getPrograms(): Promise<Program[]> {
    try {
      // Check cache first
      const cached = programListCache.get('all');
      if (cached) return cached;
      
      // Get programs from repository
      const programs = await this.repository.getAll();
      
      // Cache the result
      programListCache.set('all', programs, { 
        ttl: this.cacheTTL, 
        strategy: this.cacheStrategy,
        tags: ['programs']
      });
      
      return programs;
    } catch (error) {
      console.error('Error fetching all programs:', error);
      // Return empty array instead of null to avoid null checks
      return [];
    }
  }

  /**
   * Get a program by ID
   * @param id - Program ID to find
   * @returns Promise with program or null if not found
   */
  async getProgramById(id: string): Promise<Program | null> {
    if (!id) {
      console.error("Invalid program ID provided");
      return null;
    }
    
    try {
      // Let repository handle caching as it's more efficient
      return await this.repository.getById(id);
    } catch (error) {
      console.error(`Error fetching program by ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Get a program by slug
   * @param slug - URL-friendly identifier for the program
   * @returns Promise with program or null if not found
   */
  async getProgramBySlug(slug: string): Promise<Program | null> {
    if (!slug) {
      console.error("Invalid program slug provided");
      return null;
    }
    
    try {
      // Let repository handle caching as it's more efficient
      return await this.repository.getBySlug(slug);
    } catch (error) {
      console.error(`Error fetching program by slug ${slug}:`, error);
      return null;
    }
  }

  /**
   * Create a new program
   * @param programData - Program data without ID
   * @returns Promise with new program ID or null if creation failed
   */
  async createProgram(programData: Omit<Program, 'id'>): Promise<string | null> {
    try {
      // Basic validation
      if (!programData.title?.trim() || !programData.slug?.trim()) {
        throw new Error("Program title and slug are required");
      }
      
      // Let repository handle validation and creation
      const newProgramId = await this.repository.create(programData);
      
      if (newProgramId) {
        // Invalidate caches that might contain program lists
        this.invalidateCache();
      }
      
      return newProgramId;
    } catch (error) {
      console.error("Error creating program:", error);
      return null;
    }
  }

  /**
   * Create or update multiple programs at once
   * @param programs - Array of programs to create or update
   * @returns Promise with a map of the input index to the resulting program ID
   */
  async batchCreateOrUpdatePrograms(
    programs: Array<Program | Omit<Program, 'id'>>
  ): Promise<Map<number, string>> {
    try {
      // Basic validation
      if (!programs.length) {
        return new Map();
      }
      
      // Validate each program
      programs.forEach((program, index) => {
        if (!program.title?.trim() || !program.slug?.trim()) {
          throw new Error(`Program at index ${index} is missing title or slug`);
        }
      });
      
      // Let repository handle the batch operation
      const result = await this.repository.batchCreateOrUpdate(programs);
      
      // Invalidate all caches
      this.invalidateCache();
      
      return result;
    } catch (error) {
      console.error("Error batch creating/updating programs:", error);
      return new Map();
    }
  }

  /**
   * Update an existing program
   * @param programId - ID of program to update
   * @param programData - Partial program data with fields to update
   * @returns Promise with success indicator
   */
  async updateProgram(programId: string, programData: Partial<Program>): Promise<boolean> {
    if (!programId) {
      console.error("Invalid program ID provided for update");
      return false;
    }

    try {
      // Let repository handle validation, consistency checks and update
      const success = await this.repository.update(programId, programData);
      
      if (success) {
        // Invalidate specific program cache and any list caches
        this.invalidateCache(programId);
      }
      
      return success;
    } catch (error) {
      console.error(`Error updating program ${programId}:`, error);
      return false;
    }
  }

  /**
   * Delete a program
   * @param programId - ID of program to delete
   * @returns Promise with success indicator
   */
  async deleteProgram(programId: string): Promise<boolean> {
    if (!programId) {
      console.error("Invalid program ID provided for deletion");
      return false;
    }
    
    try {
      // Let repository handle the deletion
      const success = await this.repository.delete(programId);
      
      if (success) {
        // Invalidate all caches
        this.invalidateCache();
      }
      
      return success;
    } catch (error) {
      console.error(`Error deleting program ${programId}:`, error);
      return false;
    }
  }

  /**
   * Get programs with pagination
   * @param pageSize - Number of programs per page
   * @param lastId - ID of the last program from previous page (for pagination)
   * @returns Promise with paginated programs, last ID, and hasMore flag
   */
  async getPaginatedPrograms(pageSize: number = DEFAULT_PAGE_SIZE, lastId?: string): Promise<{
    programs: Program[];
    lastId?: string;
    hasMore: boolean;
  }> {
    try {
      // Create cache key
      const cacheKey = `${pageSize}:${lastId || 'first'}`;
      
      // Check cache
      const cached = paginationCache.get(cacheKey);
      if (cached) return cached;
      
      // Fetch from repository
      const result = await this.repository.getPaginated(pageSize, lastId);
      
      // Cache results
      paginationCache.set(cacheKey, result, { 
        ttl: this.cacheTTL, 
        strategy: this.cacheStrategy,
        tags: ['programs', 'pagination']
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching paginated programs:', error);
      return { programs: [], hasMore: false };
    }
  }

  /**
   * Gets a lightweight list of programs with only essential fields
   * for use in cards, search results, etc.
   * 
   * @param pageSize Maximum number of programs to return
   * @returns Promise with array of partial programs
   */
  async getLightweightPrograms(pageSize: number = 20): Promise<Partial<Program>[]> {
    try {
      // Check cache
      const cacheKey = `top:${pageSize}`;
      const cached = lightweightCache.get(cacheKey);
      if (cached) return cached;
      
      // Get lightweight programs from repository
      const programs = await this.repository.getFieldsOnly(LIGHTWEIGHT_FIELDS, pageSize);
      
      // Cache results
      lightweightCache.set(cacheKey, programs, {
        ttl: this.cacheTTL,
        strategy: this.cacheStrategy,
        tags: ['programs', 'lightweight']
      });
      
      return programs;
    } catch (error) {
      console.error('Error fetching lightweight programs:', error);
      return [];
    }
  }

  /**
   * Get programs by tag
   * @param tag Tag to filter programs by
   * @returns Promise with array of programs that have the specified tag
   */
  async getProgramsByTag(tag: string): Promise<Program[]> {
    if (!tag) {
      console.error("Invalid tag provided");
      return [];
    }
    
    try {
      // Check cache
      const cacheKey = `tag:${tag}`;
      const cached = programListCache.get(cacheKey);
      if (cached) return cached;
      
      // Get program IDs first (more efficient than full programs)
      const programIds = await this.repository.getProgramIdsByTag(tag);
      
      // Early return if no programs found
      if (!programIds.length) return [];
      
      // Fetch full programs in parallel
      const programPromises = programIds.map(id => this.getProgramById(id));
      const programs = await Promise.all(programPromises);
      
      // Filter out any null results from failed fetches
      const validPrograms = programs.filter(Boolean) as Program[];
      
      // Cache results
      programListCache.set(cacheKey, validPrograms, {
        ttl: this.cacheTTL,
        strategy: this.cacheStrategy,
        tags: ['programs', `tag:${tag}`]
      });
      
      return validPrograms;
    } catch (error) {
      console.error(`Error fetching programs by tag ${tag}:`, error);
      return [];
    }
  }

  /**
   * Count all programs
   * @returns Promise with the number of programs
   */
  async countPrograms(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      console.error('Error counting programs:', error);
      return 0;
    }
  }

  /**
   * Invalidate program caches
   * @param programId Optional program ID to invalidate specific program
   */
  invalidateCache(programId?: string): void {
    if (programId) {
      // Invalidate specific program
      this.repository.invalidateCache(programId);
    } else {
      // Invalidate all program-related caches
      this.repository.invalidateCache();
      programListCache.clear();
      paginationCache.clear();
      lightweightCache.clear();
    }
  }
}

// Singleton instance
const programService = new ProgramService();

// Public API
export const getPrograms = () => programService.getPrograms();
export const getProgramById = (id: string) => programService.getProgramById(id);
export const getProgramBySlug = (slug: string) => programService.getProgramBySlug(slug);
export const createProgram = (data: Omit<Program, 'id'>) => programService.createProgram(data);
export const updateProgram = (id: string, data: Partial<Program>) => programService.updateProgram(id, data);
export const deleteProgram = (id: string) => programService.deleteProgram(id);
export const getPaginatedPrograms = (pageSize?: number, lastId?: string) => 
  programService.getPaginatedPrograms(pageSize, lastId);
export const getLightweightPrograms = (pageSize?: number) => 
  programService.getLightweightPrograms(pageSize);
export const getProgramsByTag = (tag: string) => 
  programService.getProgramsByTag(tag);
export const countPrograms = () => 
  programService.countPrograms();
export const batchCreateOrUpdatePrograms = (programs: Array<Program | Omit<Program, 'id'>>) => 
  programService.batchCreateOrUpdatePrograms(programs);
export const invalidateProgramCache = (programId?: string) => 
  programService.invalidateCache(programId);

// For dependency injection in tests
export default ProgramService;


