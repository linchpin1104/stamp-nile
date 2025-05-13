import { z } from 'zod';
import type { Program, Week } from '@/types';
import { ValidationError } from './errors';

// Define a more precise type for validation results
type ValidatedProgram = Omit<z.infer<typeof programSchema>, 'id'>;
type ValidatedWeek = Omit<z.infer<typeof weekSchema>, 'id'>;

/**
 * Program schema for validation
 */
export const programSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title is too long'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description is too long'),
  longDescription: z.string().max(5000, 'Long description is too long').optional(),
  imageUrl: z.string().url('Invalid image URL'),
  targetAudience: z.string().min(2, 'Target audience must be at least 2 characters'),
  weeks: z.array(
    z.object({
      id: z.string().optional(), // Optional for creation
      weekNumber: z.number().int().positive('Week number must be positive'),
      title: z.string().min(2, 'Week title must be at least 2 characters'),
      summary: z.string().optional(),
    })
  ).optional().default([]),
  tags: z.array(z.string()).optional(),
  companySpecificDocuments: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(2, 'Document title must be at least 2 characters'),
      type: z.enum(['article', 'resource_link', 'policy_info', 'support_document']),
      content: z.string().optional(),
      url: z.string().url('Invalid document URL').optional(),
      audience: z.string().optional(),
    })
  ).optional(),
});

/**
 * Week schema for validation
 */
export const weekSchema = z.object({
  weekNumber: z.number().int().positive('Week number must be positive'),
  title: z.string().min(2, 'Week title must be at least 2 characters'),
  summary: z.string().optional(),
  sequentialCompletionRequired: z.boolean().optional(),
});

/**
 * Validate program data
 * @param data Program data to validate
 * @param isUpdate Whether this is an update operation (affects required fields)
 * @returns The validated program data
 * @throws ValidationError if validation fails
 */
export function validateProgram(data: Record<string, any>, isUpdate = false): ValidatedProgram {
  try {
    const schema = isUpdate 
      ? programSchema.partial() // Make all fields optional for updates
      : programSchema;
    
    return schema.parse(data) as ValidatedProgram;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message, 
        firstError.path.join('.')
      );
    }
    throw error;
  }
}

/**
 * Validate week data
 * @param data Week data to validate
 * @param isUpdate Whether this is an update operation
 * @returns The validated week data
 * @throws ValidationError if validation fails
 */
export function validateWeek(data: Record<string, any>, isUpdate = false): ValidatedWeek {
  try {
    const schema = isUpdate 
      ? weekSchema.partial() // Make all fields optional for updates
      : weekSchema;
    
    return schema.parse(data) as ValidatedWeek;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message, 
        firstError.path.join('.')
      );
    }
    throw error;
  }
}

/**
 * Sanitizes text input to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes an object's string properties
 * @param obj Object containing string properties
 * @returns New object with sanitized strings
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj } as T;
  
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value) as unknown as T[typeof key];
      } else if (value !== null && typeof value === 'object') {
        sanitized[key] = sanitizeObject(value as Record<string, unknown>) as unknown as T[typeof key];
      }
    }
  }
  
  return sanitized;
} 