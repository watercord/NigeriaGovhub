"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Opportunity } from "@/types/server";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search/opportunities?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || "Failed to search opportunities");
      }
    } catch (err) {
      setError("An error occurred while searching");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
          Search Opportunities
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Find the latest opportunities, initiatives, and programs from NigeriaGovHub
        </p>
      </section>

      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        query && !loading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No opportunities found matching your search.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}