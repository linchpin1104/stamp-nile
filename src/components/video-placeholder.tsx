import { PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VideoPlaceholderProps {
  title: string;
  src?: string; // Actual video src if available for iframe
}

export function VideoPlaceholder({ title, src }: VideoPlaceholderProps) {
  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        {src ? (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={src}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video bg-muted flex flex-col items-center justify-center p-6 text-center">
            <PlayCircle className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">Video content will be displayed here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
