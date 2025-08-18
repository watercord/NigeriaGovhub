import { Card, CardContent } from "@/components/ui/card";
import { getAllNewsArticles } from "@/lib/data";
import { NewsCard } from "@/components/news/news-card";
import { Newspaper } from "lucide-react";
import type { NewsArticle } from "@/types/client";

// This page is a Server Component, so we can fetch data directly
export default async function ArticlesPage() {
  const allArticles: NewsArticle[] = await getAllNewsArticles();

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
            <Newspaper className="h-10 w-10 mr-3" /> Articles & Updates
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Stay informed with the latest articles, announcements, and stories from NigeriaGovHub and related government initiatives.
        </p>
      </section>
      {allArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allArticles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">No articles available at the moment. Please check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}