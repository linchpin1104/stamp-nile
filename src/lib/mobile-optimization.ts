/**
 * Mobile optimization utilities
 * 
 * This file contains utility functions to help optimize content for mobile devices.
 */

import { LearningElement, VideoContent, Program } from '@/types';

/**
 * Optimizes video content for mobile viewing
 * @param videoContent The original video content
 * @param isMobile Whether the current device is mobile
 * @returns Optimized video content
 */
export function optimizeVideoForMobile(videoContent: VideoContent, isMobile: boolean): VideoContent {
  if (!isMobile) return videoContent;

  return {
    ...videoContent,
    // Use mobile-specific URL if available, otherwise use the original
    url: videoContent.mobileUrl || videoContent.url,
    // Ensure proper aspect ratio for mobile
    aspectRatio: videoContent.mobileAspectRatio || videoContent.aspectRatio || '16/9',
    // Set appropriate player options based on device
    playerOptions: {
      ...videoContent.playerOptions,
      controls: true, // Always show controls on mobile
      autoplay: false, // Disable autoplay on mobile to save data
      preload: 'metadata', // Only preload metadata on mobile
      responsive: true,
      fluid: true, // Make video fluid/responsive
      playbackRates: [0.75, 1, 1.25, 1.5], // Allow speed control for mobile users
    }
  };
}

/**
 * Optimizes text content for mobile viewing
 * @param text The original text content
 * @param isMobile Whether the current device is mobile
 * @returns Optimized text content with appropriate length for device
 */
export function optimizeTextForMobile(text: string, isMobile: boolean): string {
  if (!isMobile) return text;
  
  // For very long text, consider providing a condensed version for mobile
  if (text.length > 300) {
    // This is a simplified example - in a real app, you might have specific 
    // mobile versions of text or use a more sophisticated truncation method
    return text.substring(0, 300) + '...';
  }
  
  return text;
}

/**
 * Check if an interactive element needs a simpler mobile version
 * @param element Learning element to check
 * @returns Boolean indicating if it should use a simplified mobile version
 */
export function shouldUseMobileVariant(element: LearningElement): boolean {
  // Elements that might need simplified mobile variants
  const complexElementTypes = [
    'psychological_test',
    'interactive_scenario_link',
    'action_item',
    'video_choice_group'
  ];
  
  return complexElementTypes.includes(element.type);
}

/**
 * Adds mobile-specific metadata to a program
 * @param program The program to enhance
 * @returns Enhanced program with mobile metadata
 */
export function enhanceProgramForMobile(program: Program): Program {
  return {
    ...program,
    mobileOptimized: true,
    // Calculate estimated mobile reading time (simplified example)
    mobileMetadata: {
      estimatedReadingTime: Math.round(
        program.longDescription.length / 600 + // Reading speed factor
        (program.weeks?.length || 0) * 5 // Time per week factor
      ),
      requiresWifi: program.weeks?.some(week => 
        week.learningElements?.some(element => 
          element.type === 'video' || element.type === 'video_choice_group'
        )
      ) || false,
      offlineSupport: false // Default value, could be configured per program
    }
  };
} 