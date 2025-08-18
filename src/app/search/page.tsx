"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query) {
      // Filter opportunities based on query
      const filtered = mockOpportunities.filter(opp => 
        opp.title.toLowerCase().includes(query.toLowerCase()) ||
        opp.description.toLowerCase().includes(query.toLowerCase()) ||
        opp.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4 flex items-center justify-center">
          <Search className="h-8 w-8 mr-3" /> Search Results
        </h1>
        <p className="text-lg text-foreground/80">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </section>

      {results.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {results.map((opportunity) => (
            <Card key={opportunity.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{opportunity.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="mb-4">{opportunity.description}</CardDescription>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <p>Category: {opportunity.category}</p>
                    <p>Deadline: {opportunity.deadline}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/opportunity/detail/${opportunity.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No opportunities found for "{query}". Try a different search term.
            </p>
            <Button asChild className="mt-4">
              <Link href="/opportunity">View All Opportunities</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}