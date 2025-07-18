import type { Project } from '@/types/client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden card-hover shadow-md">
      <CardHeader className="p-0 relative">
        <Image
          src={project.images[0]?.url || 'https://placehold.co/600x400.png'}
          alt={project.images[0]?.alt || project.title}
          data-ai-hint={project.images[0]?.dataAiHint || "project image"}
          width={600}
          height={300} // Adjusted for a better aspect ratio in card
          className="w-full h-48 object-cover" 
        />
        <Badge 
          variant={project.status === 'Completed' ? 'default' : project.status === 'Ongoing' ? 'secondary' : 'outline'} 
          className="absolute top-2 right-2 bg-opacity-80 backdrop-blur-sm"
        >
          {project.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-1 text-primary">{project.title}</CardTitle>
        <CardDescription className="text-xs text-foreground/70 mb-2 line-clamp-2">{project.subtitle}</CardDescription>
        <div className="text-xs text-muted-foreground space-y-1 mt-2">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1.5" />
            {project.state.name}
          </div>
          <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> {/* Placeholder for Ministry icon */}
            {project.ministry.name}
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Start Date: {new Date(project.startDate).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="outline" size="sm" asChild className="w-full button-hover">
          <Link href={`/projects/${project.id}`}>View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
