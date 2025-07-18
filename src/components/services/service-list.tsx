
"use client";

import type { ServiceItem } from '@/types/client';
import { ServiceCard } from '@/components/services/service-card';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface ServiceListProps {
  initialServices: ServiceItem[];
}

export function ServiceList({ initialServices }: ServiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    if (!searchQuery) {
      return initialServices;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return initialServices.filter(service =>
      service.title.toLowerCase().includes(lowercasedQuery) ||
      service.summary.toLowerCase().includes(lowercasedQuery) ||
      service.category.toLowerCase().includes(lowercasedQuery)
    );
  }, [initialServices, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services by title, category, or keyword..."
            className="w-full pl-10 py-6 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">No services found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
