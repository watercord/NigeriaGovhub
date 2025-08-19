import { getOpportunityBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarDays, Tag, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import sanitizeHtml from "sanitize-html";

interface OpportunityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const { slug } = await params;
  
  console.log(`[OpportunityPage] Fetching opportunity with slug: ${slug}`);
  let opportunity = null;
  try {
    opportunity = await getOpportunityBySlug(slug);
  } catch (error: any) {
    console.error(`[OpportunityPage] Error fetching opportunity with slug: ${slug}`, {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack,
    });
  }

  if (!opportunity) {
    console.log(`[OpportunityPage] Opportunity not found for slug: ${slug}`);
    notFound();
  }

  const sanitizedContent = sanitizeHtml(opportunity.content, {
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
        <Link href="/opportunities">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Opportunities
        </Link>
      </Button>
      <Card className="overflow-hidden shadow-lg">
        {opportunity.imageUrl && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={opportunity.imageUrl}
              alt={opportunity.title}
              fill
              style={{ objectFit: "cover" }}
              data-ai-hint={opportunity.dataAiHint || "opportunity"}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary flex-1">
            {opportunity.title}
          </CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Published: {format(new Date(opportunity.publishedDate), "PPP")}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1.5" />
              Category: <Badge variant="secondary" className="ml-1">{opportunity.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm sm:prose-base max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </CardContent>
      </Card>
    </div>
  );
}