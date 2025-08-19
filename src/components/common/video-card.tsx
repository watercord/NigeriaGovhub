
import type { Video } from '@/types/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface VideoCardProps {
  video: Video;
  embed?: boolean; // If true, embeds video directly. If false, shows thumbnail and title.
}

export function VideoCard({ video, embed = false }: VideoCardProps) {
  return (
    <Card className="overflow-hidden card-hover shadow-md">
      <CardHeader className="p-0">
        {embed ? (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={video.url}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            ></iframe>
          </div>
        ) : (
          video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
              data-ai-hint={video.dataAiHint || "video thumbnail"}
            />
          )
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="font-headline text-md mb-1 text-primary">{video.title}</CardTitle>
        {video.description && (
          <CardDescription className="text-xs text-foreground/70 line-clamp-2">
            {video.description}
          </CardDescription>
        )}
      </CardContent>
      {/* Optionally, add a footer for a link if not embedded */}
      {/* <CardFooter>
        <Button variant="outline" size="sm" asChild>
          <Link href={video.url} target="_blank" rel="noopener noreferrer">Watch Video</Link>
        </Button>
      </CardFooter> */}
    </Card>
  );
}
