import { Card, CardContent } from "@/components/ui/card";
import { getAllOpportunities } from "@/lib/data";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Newspaper } from "lucide-react";
import type { Opportunity } from "@/types/server";

interface CategoryOpportunitiesPageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function CategoryOpportunitiesPage({ params }: CategoryOpportunitiesPageProps) {
  const { categoryId } = await params;
  
  // In a real implementation, you would filter opportunities by category
  // For now, we'll just get all opportunities
  const allOpportunities: Opportunity[] = await getAllOpportunities();

  // Filter opportunities by category (case-insensitive)
  const categoryOpportunities = allOpportunities.filter(opp => 
    opp.category.toLowerCase() === categoryId.toLowerCase()
  );

  // Format category name for display
  const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
            <Newspaper className="h-10 w-10 mr-3" /> {categoryName} Opportunities
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Explore the latest opportunities in {categoryName} from NigeriaGovHub and related government entities.
        </p>
      </section>
      {categoryOpportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryOpportunities.map(opportunity => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">No opportunities available in the {categoryName} category at the moment. Please check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}