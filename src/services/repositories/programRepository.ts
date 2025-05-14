import { db, createRateLimiter } from '@/lib/firebase';
import type { Program } from '@/types';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreError,
  writeBatch,
  serverTimestamp,
  DocumentReference as _DocumentReference,
  getCountFromServer,
  runTransaction,
  CollectionReference as _CollectionReference,
  WithFieldValue,
  Firestore as _Firestore,
  setDoc as _setDoc,
  updateDoc as _updateDoc,
} from 'firebase/firestore';
import { mockPrograms as fallbackMockPrograms } from '@/lib/mock-data';
import { 
  DatabaseError, 
  DocumentNotFoundError, 
  NetworkError, 
  logError,
  ValidationError,
} from '@/lib/errors';
import { CacheStrategy, createTypedCache } from '@/lib/cache';

// Error codes for better tracking
export enum RepositoryErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WRITE_ERROR = 'WRITE_ERROR',
  READ_ERROR = 'READ_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Repository interfaces
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<string | null>;
  update(id: string, data: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export interface ProgramRepository extends Repository<Program> {
  getBySlug(slug: string): Promise<Program | null>;
  getPaginated(pageSize?: number, lastId?: string): Promise<{
    programs: Program[];
    lastId?: string;
    hasMore: boolean;
  }>;
  /**
   * Get programs with only selected fields for improved performance
   * @param fields Array of field names to include
   * @param maxResults Maximum number of programs to return
   */
  getFieldsOnly(fields: string[], maxResults?: number): Promise<Partial<Program>[]>;
  
  /**
   * Create or update multiple programs in a single batch operation
   * @param programs Programs to create or update (without IDs for create, with IDs for update)
   * @returns Map of program index to resulting ID
   */
  batchCreateOrUpdate(programs: Array<Program | Omit<Program, 'id'>>): Promise<Map<number, string>>;
  
  /**
   * Get program IDs with a specific tag
   * @param tag Tag to search for
   */
  getProgramIdsByTag(tag: string): Promise<string[]>;
  
  /**
   * Invalidate cache for a specific program
   */
  invalidateCache(programId?: string): void;
}

// Program-specific cache with proper typing
const programCache = createTypedCache<Program>('program');
const programListCache = createTypedCache<Program[]>('programList');
const programPaginationCache = createTypedCache<{
  programs: Program[];
  lastId?: string;
  hasMore: boolean;
}>('programPagination');

// Rate limiter for Firestore operations
const rateLimitedOperation = createRateLimiter(300); // 300 ops per minute max

// Firestore program converter with validation
const programConverter: FirestoreDataConverter<Program> = {
  toFirestore(program: WithFieldValue<Program>): DocumentData {
    // Validation for required fields
    const title = program.title as string | undefined;
    const slug = program.slug as string | undefined;
    
    if (!title?.trim()) {
      throw new ValidationError('Program title is required');
    }
    
    if (!slug?.trim()) {
      throw new ValidationError('Program slug is required');
    }
    
    // Normalize and clean data
    const data: DocumentData = { ...program };
    
    // Add timestamps for tracking
    data.updatedAt = serverTimestamp();
    if (!data.createdAt) {
      data.createdAt = serverTimestamp();
    }
    
    // Deep-clone nested objects to prevent Firestore reference issues
    if (data.weeks && Array.isArray(data.weeks)) {
      data.weeks = data.weeks.map((week: Record<string, unknown>) => ({ 
        ...week,
        // Normalize and validate week data
        weekNumber: typeof week.weekNumber === 'number' ? week.weekNumber : parseInt(String(week.weekNumber), 10),
      }));
    }
    
    if (data.companySpecificDocuments && Array.isArray(data.companySpecificDocuments) && data.companySpecificDocuments.length > 0) {
      data.companySpecificDocuments = data.companySpecificDocuments.map((doc: Record<string, unknown>) => ({ ...doc }));
    }
    
    return data;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Program {
    const data = snapshot.data(options)!;
    
    // Transform timestamps if needed
    const { createdAt, updatedAt, ...rest } = data;
    
    // Convert Firestore timestamps to ISO strings for easier use in the app
    const program = {
      id: snapshot.id,
      ...rest,
      createdAt: createdAt ? new Date(createdAt.seconds * 1000).toISOString() : undefined,
      updatedAt: updatedAt ? new Date(updatedAt.seconds * 1000).toISOString() : undefined,
    } as unknown as Program; // Cast to unknown first, then to Program
    
    return program;
  }
};

/**
 * Maps Firebase errors to our application error types
 */
function handleFirestoreError(error: unknown, operation: string, context?: Record<string, unknown>): never {
  // Firebase error handling
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case 'not-found':
        throw new DocumentNotFoundError('Document', String(context?.id || 'unknown'));
      case 'permission-denied':
        throw new DatabaseError(`Permission denied during ${operation}`, RepositoryErrorCode.PERMISSION_DENIED);
      case 'unavailable':
        throw new NetworkError(`Network error during ${operation}: ${error.message}`);
      case 'aborted':
        throw new DatabaseError(`Transaction aborted during ${operation}`, RepositoryErrorCode.TRANSACTION_ERROR);
      default:
        throw new DatabaseError(
          `Firestore error during ${operation}: ${error.message}`, 
          `${RepositoryErrorCode.UNKNOWN_ERROR}_${error.code}`
        );
    }
  }
  
  // Handle validation errors
  if (error instanceof ValidationError) {
    throw error;
  }
  
  // Re-throw unknown errors
  if (error instanceof Error) {
    throw new DatabaseError(
      `Error during ${operation}: ${error.message}`, 
      RepositoryErrorCode.UNKNOWN_ERROR
    );
  }
  
  throw new DatabaseError(
    `Unknown error during ${operation}`, 
    RepositoryErrorCode.UNKNOWN_ERROR
  );
}

// Firestore implementation of ProgramRepository with enhanced error handling and caching
export class FirestoreProgramRepository implements ProgramRepository {
  private collection;
  private collectionName: string;
  private readonly useFallbackInDev: boolean;

  constructor(collectionName: string = 'programs', options: { useFallbackInDev?: boolean } = {}) {
    this.collectionName = collectionName;
    this.collection = collection(db, collectionName).withConverter(programConverter);
    this.useFallbackInDev = options.useFallbackInDev ?? true;
  }

  // Cache key generation helpers
  private getItemCacheKey(id: string): string {
    return id;
  }
  
  private getSlugCacheKey(slug: string): string {
    return `slug:${slug}`;
  }
  
  private getPaginationCacheKey(pageSize: number, lastId?: string): string {
    return `page:${pageSize}:${lastId || 'first'}`;
  }

  async getAll(): Promise<Program[]> {
    try {
      // Check cache first
      const cached = programListCache.get('all');
      if (cached) return cached;
      
      // Rate limit to prevent Firebase quota issues
      return await rateLimitedOperation(async () => {
        const querySnapshot = await getDocs(this.collection);
        const programs = querySnapshot.docs.map(doc => doc.data());
        
        // Cache the result
        programListCache.set('all', programs, {
          ttl: 5 * 60 * 1000, // 5 minutes
          strategy: CacheStrategy.MEMORY_AND_PERSIST,
          tags: ['programs']
        });
        
        return programs;
      });
    } catch (error) {
      logError(error, { operation: 'getAll', collection: this.collectionName });
      
      // In development, return mock data as fallback
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        console.warn('Using mock program data as fallback');
        return this.getFallbackPrograms();
      }
      
      // In production, propagate the error
      return handleFirestoreError(error, 'getting all programs', { collection: this.collectionName }) as never;
    }
  }

  async getById(id: string): Promise<Program | null> {
    if (!id) return null;
    
    try {
      // Check cache first
      const cacheKey = this.getItemCacheKey(id);
      const cached = programCache.get(cacheKey);
      if (cached) return cached;
      
      return await rateLimitedOperation(async () => {
        const docRef = doc(this.collection, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const program = docSnap.data();
          
          // Cache the result
          programCache.set(cacheKey, program, {
            ttl: 5 * 60 * 1000, // 5 minutes
            strategy: CacheStrategy.MEMORY_AND_PERSIST,
            tags: ['programs', `program:${id}`]
          });
          
          return program;
        }
        
        return null;
      });
    } catch (error) {
      logError(error, { operation: 'getById', id, collection: this.collectionName });
      
      // In development, return mock data as fallback
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        const fallbackPrograms = this.getFallbackPrograms();
        return fallbackPrograms.find(p => p.id === id) || null;
      }
      
      // In production, propagate the error
      return handleFirestoreError(error, 'getting program by ID', { id, collection: this.collectionName }) as never;
    }
  }

  async getBySlug(slug: string): Promise<Program | null> {
    if (!slug) return null;
    
    try {
      // Check cache first
      const cacheKey = this.getSlugCacheKey(slug);
      const cached = programCache.get(cacheKey);
      if (cached) return cached;
      
      return await rateLimitedOperation(async () => {
        const q = query(this.collection, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Assuming slugs are unique, return the first match
          const program = querySnapshot.docs[0].data();
          
          // Cache by both slug and ID
          programCache.set(cacheKey, program, {
            ttl: 5 * 60 * 1000, // 5 minutes
            strategy: CacheStrategy.MEMORY_AND_PERSIST,
            tags: ['programs', `program:${program.id}`]
          });
          
          // Also cache by ID
          programCache.set(this.getItemCacheKey(program.id), program, {
            ttl: 5 * 60 * 1000, // 5 minutes
            strategy: CacheStrategy.MEMORY_AND_PERSIST,
            tags: ['programs', `program:${program.id}`]
          });
          
          return program;
        }
        
        return null;
      });
    } catch (error) {
      logError(error, { operation: 'getBySlug', slug, collection: this.collectionName });
      
      // In development, return mock data as fallback
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        const fallbackPrograms = this.getFallbackPrograms();
        return fallbackPrograms.find(p => p.slug === slug) || null;
      }
      
      // In production, propagate the error
      return handleFirestoreError(error, 'getting program by slug', { slug, collection: this.collectionName }) as never;
    }
  }

  async create(programData: Omit<Program, 'id'>): Promise<string | null> {
    try {
      return await rateLimitedOperation(async () => {
        // Use transaction to verify slug uniqueness
        return await runTransaction(db, async (_transaction) => {
          // Check if slug already exists
          const slugQuery = query(this.collection, where("slug", "==", programData.slug));
          const slugSnapshot = await getDocs(slugQuery);
          
          if (!slugSnapshot.empty) {
            throw new ValidationError(`Program with slug '${programData.slug}' already exists`);
          }
          
          // Add new document
          const docRef = await addDoc(this.collection, programData as Program);
          
          // Invalidate caches
          this.invalidateCache();
          
          return docRef.id;
        });
      });
    } catch (error) {
      logError(error, { 
        operation: 'create', 
        programTitle: programData.title,
        collection: this.collectionName 
      });
      
      // Always propagate this error as it's a write operation
      return handleFirestoreError(error, 'creating program', { 
        programTitle: programData.title,
        collection: this.collectionName 
      }) as never;
    }
  }

  async update(programId: string, programData: Partial<Program>): Promise<boolean> {
    try {
      return await rateLimitedOperation(async () => {
        // Use a transaction for consistent updates
        return await runTransaction(db, async (_transaction) => {
          const docRef = doc(this.collection, programId);
          const docSnap = await _transaction.get(docRef);
          
          if (!docSnap.exists()) {
            throw new DocumentNotFoundError('Program', programId);
          }
          
          // Check for slug uniqueness if slug is being updated
          if (programData.slug) {
            const currentProgram = docSnap.data();
            if (programData.slug !== currentProgram.slug) {
              const slugQuery = query(this.collection, where("slug", "==", programData.slug));
              const slugSnapshot = await getDocs(slugQuery);
              
              if (!slugSnapshot.empty && slugSnapshot.docs[0].id !== programId) {
                throw new ValidationError(`Program with slug '${programData.slug}' already exists`);
              }
            }
          }
          
          // Update the document
          _transaction.update(docRef, {
            ...programData,
            updatedAt: serverTimestamp()
          });
          
          // Invalidate caches
          this.invalidateCache(programId);
          
          return true;
        });
      });
    } catch (error) {
      logError(error, { 
        operation: 'update', 
        id: programId,
        collection: this.collectionName 
      });
      
      // Always propagate this error as it's a write operation
      return handleFirestoreError(error, 'updating program', { 
        id: programId,
        collection: this.collectionName 
      }) as never;
    }
  }

  async delete(programId: string): Promise<boolean> {
    try {
      return await rateLimitedOperation(async () => {
        const docRef = doc(this.collection, programId);
        await deleteDoc(docRef);
        
        // Invalidate caches
        this.invalidateCache(programId);
        
        return true;
      });
    } catch (error) {
      logError(error, { 
        operation: 'delete', 
        id: programId,
        collection: this.collectionName 
      });
      
      // Always propagate this error as it's a write operation
      return handleFirestoreError(error, 'deleting program', { 
        id: programId,
        collection: this.collectionName 
      }) as never;
    }
  }

  async getPaginated(pageSize: number = 10, lastId?: string): Promise<{
    programs: Program[];
    lastId?: string;
    hasMore: boolean;
  }> {
    try {
      // Check cache first
      const cacheKey = this.getPaginationCacheKey(pageSize, lastId);
      const cached = programPaginationCache.get(cacheKey);
      if (cached) return cached;
      
      return await rateLimitedOperation(async () => {
        let q = query(
          this.collection,
          orderBy('title'),
          firestoreLimit(pageSize + 1) // Get one extra to determine if there are more
        );
        
        // If lastId is provided, start after that document
        if (lastId) {
          const lastDocRef = doc(this.collection, lastId);
          const lastDocSnap = await getDoc(lastDocRef);
          
          if (lastDocSnap.exists()) {
            q = query(q, startAfter(lastDocSnap));
          }
        }
        
        const querySnapshot = await getDocs(q);
        
        // Check if we have more results
        const hasMore = querySnapshot.docs.length > pageSize;
        
        // Don't return the extra document used to check if there are more
        const programs = querySnapshot.docs
          .slice(0, pageSize)
          .map(doc => doc.data());
        
        // Get the last ID for next pagination
        const lastDocInPage = querySnapshot.docs[pageSize - 1];
        const result = {
          programs,
          lastId: lastDocInPage?.id,
          hasMore
        };
        
        // Cache the result
        programPaginationCache.set(cacheKey, result, {
          ttl: 5 * 60 * 1000, // 5 minutes
          strategy: CacheStrategy.MEMORY_ONLY,
          tags: ['programs', 'pagination']
        });
        
        return result;
      });
    } catch (error) {
      logError(error, { 
        operation: 'getPaginated', 
        pageSize, 
        lastId,
        collection: this.collectionName 
      });
      
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        console.warn('Using mock program data for pagination as fallback');
        const allPrograms = this.getFallbackPrograms();
        
        // Find the index of the last document
        let startIndex = 0;
        if (lastId) {
          const lastIndex = allPrograms.findIndex(p => p.id === lastId);
          startIndex = lastIndex !== -1 ? lastIndex + 1 : 0;
        }
        
        // Get the requested page
        const programs = allPrograms.slice(startIndex, startIndex + pageSize);
        
        return {
          programs,
          lastId: programs.length > 0 ? programs[programs.length - 1].id : undefined,
          hasMore: startIndex + pageSize < allPrograms.length
        };
      }
      
      return handleFirestoreError(error, 'fetching paginated programs', { 
        pageSize, 
        lastId,
        collection: this.collectionName 
      }) as never;
    }
  }

  async getFieldsOnly(fields: string[], maxResults: number = 20): Promise<Partial<Program>[]> {
    try {
      const allPrograms = await this.getAll();
      return allPrograms.slice(0, maxResults).map(program => {
        const result: Partial<Program> = { id: program.id };
        
        fields.forEach(field => {
          if (field in program) {
            result[field as keyof Program] = program[field as keyof Program];
          }
        });
        
        return result;
      });
    } catch (error) {
      logError(error, { 
        operation: 'getFieldsOnly', 
        fields, 
        maxResults,
        collection: this.collectionName 
      });
      
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        const fallbackPrograms = this.getFallbackPrograms();
        return fallbackPrograms.slice(0, maxResults).map(program => {
          const result: Partial<Program> = { id: program.id };
          
          fields.forEach(field => {
            if (field in program) {
              result[field as keyof Program] = program[field as keyof Program];
            }
          });
          
          return result;
        });
      }
      
      return handleFirestoreError(error, 'fetching fields-only programs', { 
        fields, 
        maxResults,
        collection: this.collectionName 
      }) as never;
    }
  }
  
  async batchCreateOrUpdate(programs: Array<Program | Omit<Program, 'id'>>): Promise<Map<number, string>> {
    try {
      // Maximum batch size is 500 in Firestore
      if (programs.length > 500) {
        throw new ValidationError('Batch size exceeds Firebase maximum of 500 operations');
      }
      
      return await rateLimitedOperation(async () => {
        const batch = writeBatch(db);
        const resultMap = new Map<number, string>();
        
        // Process each program
        for (let i = 0; i < programs.length; i++) {
          const program = programs[i];
          
          // Check if it's an update or create
          if ('id' in program && program.id) {
            // It's an update
            const programRef = doc(this.collection, program.id);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...programDataWithoutId } = program;
            
            // Apply converter's validation logic
            const data = programConverter.toFirestore(programDataWithoutId as WithFieldValue<Program>);
            batch.update(programRef, data);
            resultMap.set(i, program.id);
          } else {
            // It's a creation
            const newProgramRef = doc(this.collection);
            
            // Apply converter's validation logic
            const data = programConverter.toFirestore(program as WithFieldValue<Program>);
            batch.set(newProgramRef, data);
            resultMap.set(i, newProgramRef.id);
          }
        }
        
        // Commit the batch
        await batch.commit();
        
        // Invalidate caches
        this.invalidateCache();
        
        return resultMap;
      });
    } catch (error) {
      logError(error, { 
        operation: 'batchCreateOrUpdate', 
        count: programs.length,
        collection: this.collectionName 
      });
      
      return handleFirestoreError(error, 'batch creating/updating programs', { 
        count: programs.length,
        collection: this.collectionName 
      }) as never;
    }
  }
  
  async getProgramIdsByTag(tag: string): Promise<string[]> {
    try {
      return await rateLimitedOperation(async () => {
        const q = query(
          this.collection,
          where("tags", "array-contains", tag)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.id);
      });
    } catch (error) {
      logError(error, { 
        operation: 'getProgramIdsByTag', 
        tag,
        collection: this.collectionName 
      });
      
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        const fallbackPrograms = this.getFallbackPrograms();
        return fallbackPrograms
          .filter(p => p.tags && Array.isArray(p.tags) && p.tags.includes(tag))
          .map(p => p.id);
      }
      
      return handleFirestoreError(error, 'getting program IDs by tag', { 
        tag,
        collection: this.collectionName 
      }) as never;
    }
  }
  
  async count(): Promise<number> {
    try {
      return await rateLimitedOperation(async () => {
        const snapshot = await getCountFromServer(this.collection);
        return snapshot.data().count;
      });
    } catch (error) {
      logError(error, { 
        operation: 'count',
        collection: this.collectionName 
      });
      
      if (process.env.NODE_ENV !== 'production' && this.useFallbackInDev) {
        const fallbackPrograms = this.getFallbackPrograms();
        return fallbackPrograms.length;
      }
      
      return handleFirestoreError(error, 'counting programs', { 
        collection: this.collectionName 
      }) as never;
    }
  }

  invalidateCache(programId?: string): void {
    if (programId) {
      // Invalidate specific program cache
      programCache.remove(this.getItemCacheKey(programId));
    } else {
      // Invalidate all program caches
      programListCache.clear();
      programPaginationCache.clear();
    }
  }

  private getFallbackPrograms(): Program[] {
    return fallbackMockPrograms;
  }
}

// Factory function to create the appropriate repository based on environment
export function createProgramRepository(options: { 
  useFallbackInDev?: boolean,
  useLocalStorage?: boolean
} = {}): ProgramRepository {
  // Check if we're in a build environment
  const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production';
  
  // Always use mock data during build time to prevent Firestore errors
  if (isBuildTime) {
    console.log('Using mock repository during build time');
    return new MockProgramRepository();
  }
  
  // Default to Firestore implementation
  return new FirestoreProgramRepository('programs', options);
}

// Add a MockProgramRepository for build time
class MockProgramRepository implements ProgramRepository {
  constructor() {}

  async getAll(): Promise<Program[]> {
    return fallbackMockPrograms;
  }

  async getById(id: string): Promise<Program | null> {
    return fallbackMockPrograms.find(p => p.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Program | null> {
    return fallbackMockPrograms.find(p => p.slug === slug) || null;
  }

  async create(data: Omit<Program, 'id'>): Promise<string | null> {
    return 'mock-id-' + Date.now();
  }

  async update(id: string, data: Partial<Program>): Promise<boolean> {
    return true;
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }

  async getPaginated(pageSize: number = 10, lastId?: string): Promise<{
    programs: Program[];
    lastId?: string;
    hasMore: boolean;
  }> {
    const all = fallbackMockPrograms;
    return {
      programs: all.slice(0, pageSize),
      lastId: all.length > pageSize ? all[pageSize-1].id : undefined,
      hasMore: all.length > pageSize
    };
  }

  async getFieldsOnly(fields: string[], maxResults?: number): Promise<Partial<Program>[]> {
    const result = fallbackMockPrograms.map(p => {
      const partial: Partial<Program> = { id: p.id };
      fields.forEach(field => {
        if (field in p) {
          partial[field as keyof Program] = p[field as keyof Program];
        }
      });
      return partial;
    });
    
    return maxResults ? result.slice(0, maxResults) : result;
  }

  async batchCreateOrUpdate(programs: Array<Program | Omit<Program, 'id'>>): Promise<Map<number, string>> {
    const result = new Map<number, string>();
    programs.forEach((_, index) => {
      result.set(index, 'mock-id-' + Date.now() + '-' + index);
    });
    return result;
  }

  async getProgramIdsByTag(tag: string): Promise<string[]> {
    return fallbackMockPrograms
      .filter(p => p.tags?.includes(tag))
      .map(p => p.id);
  }

  async count(): Promise<number> {
    return fallbackMockPrograms.length;
  }

  invalidateCache(programId?: string): void {
    // No-op for mock repository
  }
} 