"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Clock, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  type: string;
  createdAt: Date;
}

export default function SearchResultsPage() {
  const { dictionary } = useLanguage();
  const t = dictionary.search_page;
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("type") || "all";

  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filter);

  // Fetch search history on component mount
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use localStorage
      const history = localStorage.getItem("searchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const saveSearchToHistory = (query: string) => {
    try {
      // Get current history
      const history = localStorage.getItem("searchHistory");
      let historyArray: string[] = [];
      
      if (history) {
        historyArray = JSON.parse(history);
      }
      
      // Add new query to the beginning of the history
      historyArray = [query, ...historyArray.filter((item) => item !== query)].slice(0, 10); // Keep only last 10 items
      
      // Save updated history
      localStorage.setItem("searchHistory", JSON.stringify(historyArray));
      setSearchHistory(historyArray);
    } catch (error) {
      console.error("Error saving search to history:", error);
    }
  };

  const clearSearchHistory = () => {
    try {
      localStorage.removeItem("searchHistory");
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  };

  const performSearch = async (query: string, filter: string = "all") => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${filter}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error performing search:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save search to history
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery);
      // Update URL with new search query
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchQuery);
      url.searchParams.set("type", selectedFilter);
      window.history.pushState({}, "", url);
      // Perform search
      performSearch(searchQuery, selectedFilter);
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    // Update URL with new filter
    const url = new URL(window.location.href);
    url.searchParams.set("type", filter);
    window.history.pushState({}, "", url);
    // Perform search
    performSearch(searchQuery, filter);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-100 text-blue-800";
      case "article":
        return "bg-green-100 text-green-800";
      case "service":
        return "bg-purple-100 text-purple-800";
      case "opportunity":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Project";
      case "article":
        return "Article";
      case "service":
        return "Service";
      case "opportunity":
        return "Opportunity";
      default:
        return type;
    }
  };

  const getTypeLink = (type: string, id: string) => {
    switch (type) {
      case "project":
        return `/projects/${id}`;
      case "article":
        return `/articles/${id}`;
      case "service":
        return `/services/${id}`;
      case "opportunity":
        return `/opportunities/${id}`;
      default:
        return "#";
    }
  };

  // Perform initial search if there's a query
  useEffect(() => {
    if (query) {
      performSearch(query, filter);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
      
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="flex-grow text-base p-6 bg-background"
            aria-label="Search"
          />
          <Button type="submit" size="lg" className="p-6 button-hover">
            <Search className="h-5 w-5 mr-2" /> {t.search_button}
          </Button>
        </div>
      </form>

      {/* Search Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          type="button"
          variant={selectedFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("all")}
          className="rounded-full"
        >
          {t.all_filter}
        </Button>
        <Button
          type="button"
          variant={selectedFilter === "projects" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("projects")}
          className="rounded-full"
        >
          {t.projects_filter}
        </Button>
        <Button
          type="button"
          variant={selectedFilter === "articles" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("articles")}
          className="rounded-full"
        >
          {t.articles_filter}
        </Button>
        <Button
          type="button"
          variant={selectedFilter === "services" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("services")}
          className="rounded-full"
        >
          {t.services_filter}
        </Button>
        <Button
          type="button"
          variant={selectedFilter === "opportunities" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("opportunities")}
          className="rounded-full"
        >
          {t.opportunities_filter}
        </Button>
      </div>

      {/* Search Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid gap-6">
          {searchResults.map((result) => (
            <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>
                    <Link 
                      href={getTypeLink(result.type, result.id)} 
                      className="hover:text-primary transition-colors"
                    >
                      {result.title}
                    </Link>
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)}`}
                  >
                    {getTypeLabel(result.type)}
                  </span>
                </div>
                {result.subtitle && (
                  <CardDescription>{result.subtitle}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {result.summary || result.content?.substring(0, 200) + "..."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.no_results} "{searchQuery}"</p>
        </div>
      ) : searchHistory.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t.recent_searches}</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearchHistory}
            >
              <X className="h-4 w-4 mr-2" /> {t.clear_history}
            </Button>
          </div>
          <div className="grid gap-2">
            {searchHistory.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setSearchQuery(query);
                  performSearch(query);
                }}
              >
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                {query}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.start_searching}</p>
        </div>
      )}
    </div>
  );
}