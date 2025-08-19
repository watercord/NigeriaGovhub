import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { CalendarDays, Tag } from "lucide-react";
import type { Opportunity } from "@/types/server";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {opportunity.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={opportunity.imageUrl}
            alt={opportunity.title}
            fill
            style={{ objectFit: "cover" }}
            data-ai-hint={opportunity.dataAiHint || "opportunity"}
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <h3 className="font-headline text-xl font-bold text-primary line-clamp-2">
          {opportunity.title}
        </h3>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-foreground/80 line-clamp-3">
          {opportunity.summary}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            {format(new Date(opportunity.publishedDate), "PPP")}
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1.5" />
            <Badge variant="secondary">{opportunity.category}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" asChild className="w-full button-hover">
          <Link href={`/opportunities/${opportunity.slug}`}>
            Read More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}