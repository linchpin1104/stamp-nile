"use client";

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { optimizeVideoForMobile } from '@/lib/mobile-optimization';
import { VideoContent } from '@/types';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoContent: VideoContent;
  className?: string;
  showTitle?: boolean;
  autoplay?: boolean;
}

export function VideoPlayer({ 
  videoContent, 
  className, 
  showTitle = true,
  autoplay = false 
}: VideoPlayerProps) {
  const isMobile = useIsMobile();
  
  // Optimize video settings for mobile devices
  const optimizedVideo = optimizeVideoForMobile(videoContent, isMobile);
  
  // Calculate aspect ratio for responsive container
  const aspectRatio = optimizedVideo.aspectRatio || '16/9';
  const [width, height] = aspectRatio.split('/').map(Number);
  const paddingBottom = `${(height / width) * 100}%`;
  
  return (
    <div className={cn("w-full", className)}>
      {showTitle && videoContent.title && (
        <h3 className="text-lg font-medium mb-2">{videoContent.title}</h3>
      )}
      
      <div className="relative w-full" style={{ paddingBottom }}>
        <iframe 
          src={optimizedVideo.url}
          className="absolute top-0 left-0 w-full h-full rounded-md"
          title={videoContent.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen={optimizedVideo.playerOptions?.controls !== false}
          loading={isMobile ? "lazy" : "eager"}
        />
      </div>
      
      {videoContent.description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {videoContent.description}
          {videoContent.duration && (
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
              {videoContent.duration}
            </span>
          )}
        </p>
      )}
    </div>
  );
} 