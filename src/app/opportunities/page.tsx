import { Card, CardContent } from "@/components/ui/card";
import { getAllOpportunities } from "@/lib/data";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Newspaper } from "lucide-react";
import type { Opportunity } from "@/types/server";

// This page is a Server Component, so we can fetch data directly
export default async function OpportunitiesPage() {
  const allOpportunities: Opportunity[] = await getAllOpportunities();

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
            <Newspaper className="h-10 w-10 mr-3" /> Opportunities
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Explore the latest opportunities, initiatives, and programs from NigeriaGovHub and related government entities.
        </p>
      </section>
      {allOpportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allOpportunities.map(opportunity => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">No opportunities available at the moment. Please check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}