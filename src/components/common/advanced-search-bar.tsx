"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  type: string;
  createdAt: Date;
}

export function AdvancedSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value, selectedFilter);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save search to history
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery);
      // Redirect to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}&type=${selectedFilter}`;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Save search to history
    saveSearchToHistory(suggestion);
    // Redirect to search results page
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}&type=${selectedFilter}`;
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    // Redirect to search results page
    window.location.href = `/search?q=${encodeURIComponent(query)}&type=${selectedFilter}`;
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (searchQuery.trim()) {
      performSearch(searchQuery, filter);
    }
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Popover open={searchQuery.length > 0}>
        <PopoverTrigger asChild>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search projects, articles, services, opportunities..."
                className="flex-grow text-base p-6 pr-12 bg-background shadow-lg rounded-full"
                aria-label="Search"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="center">
          {/* Search Filters */}
          <div className="flex flex-wrap gap-2 p-3 border-b">
            <Button
              type="button"
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              type="button"
              variant={selectedFilter === "projects" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("projects")}
              className="rounded-full"
            >
              Projects
            </Button>
            <Button
              type="button"
              variant={selectedFilter === "articles" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("articles")}
              className="rounded-full"
            >
              Articles
            </Button>
            <Button
              type="button"
              variant={selectedFilter === "services" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("services")}
              className="rounded-full"
            >
              Services
            </Button>
            <Button
              type="button"
              variant={selectedFilter === "opportunities" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("opportunities")}
              className="rounded-full"
            >
              Opportunities
            </Button>
          </div>

          {/* Search Results or History */}
          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-3 hover:bg-muted cursor-pointer"
                    onClick={() => handleSuggestionClick(result.title)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{result.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {result.subtitle || result.summary}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)}`}
                      >
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : searchHistory.length > 0 ? (
              <div>
                <div className="flex justify-between items-center p-3 border-b">
                  <h3 className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> Recent Searches
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="divide-y">
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-muted cursor-pointer flex items-center"
                      onClick={() => handleHistoryClick(query)}
                    >
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Start typing to search
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}