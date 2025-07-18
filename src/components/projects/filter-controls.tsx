
"use client";

import type { Ministry, State } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { CalendarIcon, FilterX, Search } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface FilterControlsProps {
  ministries: Ministry[];
  states: State[];
  onFilterChange: (filters: { ministryId?: string; stateId?: string; date?: Date, status?: string; search?: string }) => void;
  onClearFilters: () => void;
  initialSearch?: string;
}

const projectStatuses = ['Ongoing', 'Completed', 'Planned', 'On Hold'];

export function FilterControls({ ministries, states, onFilterChange, onClearFilters, initialSearch = '' }: FilterControlsProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedMinistry, setSelectedMinistry] = useState<string | undefined>();
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const handleApplyFilters = () => {
    onFilterChange({
      search,
      ministryId: selectedMinistry,
      stateId: selectedState,
      date: selectedDate,
      status: selectedStatus,
    });
  };

  const handleClear = () => {
    setSearch('');
    setSelectedMinistry(undefined);
    setSelectedState(undefined);
    setSelectedDate(undefined);
    setSelectedStatus(undefined);
    onClearFilters();
  }

  return (
    <Card className="p-6 mb-8 shadow-lg bg-card">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1 lg:col-span-2">
          <Label htmlFor="search-filter">Search by Keyword</Label>
          <Input
            id="search-filter"
            placeholder="Search project titles or descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ministry-filter">Ministry</Label>
          <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
            <SelectTrigger id="ministry-filter" className="w-full">
              <SelectValue placeholder="All Ministries" />
            </SelectTrigger>
            <SelectContent>
              {ministries.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="state-filter">State</Label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger id="state-filter" className="w-full">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              {states.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 lg:col-span-5 lg:col-start-4 lg:justify-self-end">
          <Button onClick={handleApplyFilters} className="w-full button-hover">
            <Search className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          <Button onClick={handleClear} variant="outline" className="w-full button-hover">
             <FilterX className="mr-2 h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>
    </Card>
  );
}
