import Link from 'next/link';
import Image from 'next/image';
import type { Program } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0 relative">
        <Link href={`/programs/${program.slug}`} aria-label={`View program: ${program.title}`}>
          <Image
            src={program.imageUrl}
            alt={program.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
            data-ai-hint="program theme image"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Link href={`/programs/${program.slug}`} className="hover:text-accent transition-colors">
          <CardTitle className="text-xl font-semibold mb-2 leading-tight">{program.title}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-3">{program.description}</CardDescription>
        <div className="text-xs text-foreground/70 mb-3">{program.targetAudience}</div>
        {program.tags && program.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {program.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/programs/${program.slug}`}>
            View Program <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
