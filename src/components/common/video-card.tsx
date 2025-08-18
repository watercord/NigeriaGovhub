import type { Video } from '@/types/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface VideoCardProps {
  video: Video;
  embed?: boolean; // If true, embeds video directly. If false, shows thumbnail and title.
}

// Function to convert YouTube URL to embed format
const convertToEmbedUrl = (url: string): string => {
  // Handle different YouTube URL formats
  let videoId = '';
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeWatchRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
  const watchMatch = url.match(youtubeWatchRegex);
  
  // Format: https://youtu.be/VIDEO_ID
  const youtuBeRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
  const shortMatch = url.match(youtuBeRegex);
  
  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
  const embedMatch = url.match(embedRegex);
  
  if (watchMatch) {
    videoId = watchMatch[1];
  } else if (shortMatch) {
    videoId = shortMatch[1];
  } else if (embedMatch) {
    videoId = embedMatch[1];
  } else {
    // If no match, return original URL
    return url;
  }
  
  // Return embed URL
  return `https://www.youtube.com/embed/${videoId}`;
};

export function VideoCard({ video, embed = false }: VideoCardProps) {
  const embedUrl = convertToEmbedUrl(video.url);
  
  return (
    <Card className="overflow-hidden card-hover shadow-md">
      <CardHeader className="p-0">
        {embed ? (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
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