import { getNewsArticleBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarDays, Tag, ArrowLeft, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { LikeButton } from "@/components/news/like-button";
import { BookmarkButton } from "@/components/news/bookmark-button";
import { CommentForm } from "@/components/news/comment-form";
import { CommentList } from "@/components/news/comment-list";
import type { NewsArticle } from "@/types/server";
import sanitizeHtml from "sanitize-html";

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  console.log(`[NewsArticlePage] Fetching article with slug: ${slug}, userId: ${session?.user?.id || "none"}`);
  let article: NewsArticle | null = null;
  try {
    article = await getNewsArticleBySlug(slug, session?.user?.id);
  } catch (error: any) {
    console.error(`[NewsArticlePage] Error fetching article with slug: ${slug}`, {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack,
    });
  }

  if (!article) {
    console.log(`[NewsArticlePage] Article not found for slug: ${slug}`);
    notFound();
  }

  const sanitizedContent = sanitizeHtml(article.content, {
    allowedTags: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "b",
      "i",
      "strong",
      "em",
      "a",
      "img",
      "table",
      "tr",
      "td",
      "th",
      "thead",
      "tbody",
      "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "target"],
      img: ["src", "alt"],
    },
  });

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Button variant="outline" asChild className="mb-4 button-hover">
        <Link href="/news">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Link>
      </Button>
      <Card className="overflow-hidden shadow-lg">
        {article.imageUrl && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              style={{ objectFit: "cover" }}
              data-ai-hint={article.dataAiHint || "news article"}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary flex-1">
            {article.title}
          </CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Published: {format(new Date(article.publishedDate), "PPP")}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1.5" />
              Category: <Badge variant="secondary" className="ml-1">{article.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm sm:prose-base max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <LikeButton
            articleId={article.id}
            initialIsLiked={article.isLikedByUser}
            initialLikeCount={article.likeCount}
          />
          {session?.user && <BookmarkButton articleId={article.id} />}
        </CardFooter>
      </Card>

      <Separator />

      <section id="comments-section" className="space-y-6">
        <h2 className="font-headline text-2xl font-bold text-foreground flex items-center">
          <MessageSquare className="h-6 w-6 mr-3 text-primary" /> Comments ({article.comments.length})
        </h2>

        {session?.user ? (
          <CommentForm articleId={article.id} />
        ) : (
          <Card className="text-center p-6">
            <p className="text-muted-foreground">You must be logged in to leave a comment.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href={`/login?redirect=/news/${article.slug}`}>
                Log In or Sign Up
              </Link>
            </Button>
          </Card>
        )}

        <CommentList comments={article.comments} />
      </section>
    </div>
  );
}