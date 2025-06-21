
import type { NewsArticle } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden card-hover shadow-md">
      <CardHeader className="p-0 relative">
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.title}
            data-ai-hint={article.dataAiHint || "news image"}
            width={600}
            height={300}
            className="w-full h-48 object-cover"
          />
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-1 text-primary hover:underline">
          <Link href={`/news/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-xs text-foreground/70 mb-2 line-clamp-3">{article.summary}</CardDescription>
        <div className="text-xs text-muted-foreground space-y-1 mt-2">
          <div className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            {format(new Date(article.publishedDate), 'PPP')}
          </div>
          <div className="flex items-center">
            <Tag className="h-3 w-3 mr-1.5" />
            {article.category}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="outline" size="sm" asChild className="w-full button-hover">
          <Link href={`/news/${article.slug}`}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
