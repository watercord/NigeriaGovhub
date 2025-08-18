"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

// Mock data for opportunities
const mockOpportunities = [
  {
    id: "1",
    title: "Agricultural Development Program",
    description: "Funding and support for modern farming techniques and rural development initiatives.",
    category: "agriculture",
    categoryId: "agriculture",
    deadline: "2025-12-31",
  },
  {
    id: "2",
    title: "Digital Literacy Initiative",
    description: "Training program to improve digital skills in underserved communities.",
    category: "education",
    categoryId: "education",
    deadline: "2025-11-15",
  },
  {
    id: "3",
    title: "Small Business Grant",
    description: "Financial support for small businesses and startups in key sectors.",
    category: "finance",
    categoryId: "finance",
    deadline: "2025-10-30",
  },
  {
    id: "4",
    title: "Healthcare Infrastructure Fund",
    description: "Investment in healthcare facilities and medical equipment across states.",
    category: "healthcare",
    categoryId: "healthcare",
    deadline: "2025-12-01",
  },
  {
    id: "5",
    title: "Tech Innovation Challenge",
    description: "Competition for tech startups with funding for the best solutions.",
    category: "technology",
    categoryId: "technology",
    deadline: "2025-09-20",
  },
  {
    id: "6",
    title: "Road Infrastructure Project",
    description: "Development and maintenance of key road networks in major cities.",
    category: "infrastructure",
    categoryId: "infrastructure",
    deadline: "2025-11-30",
  },
];

const categoryDetails: Record<string, { name: string; description: string }> = {
  finance: {
    name: "Finance",
    description: "Explore financial opportunities, grants, and funding programs available for individuals and businesses."
  },
  agriculture: {
    name: "Agriculture",
    description: "Find agricultural development programs, farming support, and rural development initiatives."
  },
  education: {
    name: "Education",
    description: "Discover educational programs, scholarships, and training opportunities for students and professionals."
  },
  healthcare: {
    name: "Healthcare",
    description: "Access healthcare initiatives, medical programs, and health development opportunities."
  },
  technology: {
    name: "Technology",
    description: "Engage with tech innovation programs, digital initiatives, and technology development projects."
  },
  infrastructure: {
    name: "Infrastructure",
    description: "Learn about infrastructure development projects and construction opportunities."
  }
};

export default function OpportunityCategoryPage({ params }: { params: { categoryId: string } }) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  useEffect(() => {
    // Filter opportunities by category
    const filtered = mockOpportunities.filter(opp => opp.categoryId === params.categoryId);
    setOpportunities(filtered);
  }, [params.categoryId]);

  const categoryInfo = categoryDetails[params.categoryId] || { 
    name: params.categoryId, 
    description: `Opportunities in the ${params.categoryId} sector` 
  };

  return (
    <div className="space-y-8 py-8">
      <section>
        <Button variant="ghost" asChild className="mb-4 pl-0">
          <Link href="/opportunity">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Opportunities
          </Link>
        </Button>
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">
          {categoryInfo.name} Opportunities
        </h1>
        <p className="text-lg text-foreground/80 mb-6">
          {categoryInfo.description}
        </p>
      </section>

      {opportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{opportunity.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="mb-4">{opportunity.description}</CardDescription>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Deadline: {opportunity.deadline}</p>
                </div>
                <Button asChild>
                  <Link href={`/opportunity/detail/${opportunity.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">No opportunities available in this category at the moment. Please check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}