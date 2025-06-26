
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsCard } from "@/components/news/news-card";
import type { NewsArticle } from "@/types";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Bookmark, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserBookmarkedNewsAction } from "@/lib/actions";

export default function MyBookmarkedNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarkedNews, setBookmarkedNews] = useState<NewsArticle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authLoading = status === 'loading';
  const user = session?.user;

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setError(null);
    try {
      const newsData = await getUserBookmarkedNewsAction();
      setBookmarkedNews(newsData);
    } catch (err: any) {
      console.error("Failed to load bookmarked news:", err);
      setError("Could not load your bookmarked articles. Please try again later.");
      setBookmarkedNews([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadBookmarks();
    }
  }, [status, loadBookmarks, router]);

  if (authLoading || (status === 'authenticated' && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">Loading your saved articles...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">Please log in to see your bookmarked articles.</p>
             <Button asChild className="button-hover">
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12 bg-destructive/10 border-destructive">
        <CardContent>
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-xl text-destructive-foreground mb-2">An Error Occurred</p>
          <p className="text-destructive-foreground/80 mb-6">{error}</p>
          <Button onClick={() => loadBookmarks()} variant="destructive" className="button-hover">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><Bookmark className="mr-2 h-6 w-6"/>My Bookmarked News</CardTitle>
          <CardDescription>Review all the news articles you've saved for later reading.</CardDescription>
        </CardHeader>
      </Card>

      {bookmarkedNews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedNews.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">You haven't bookmarked any news articles yet.</p>
            <Button asChild className="button-hover">
              <Link href="/news">Explore News Articles</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
