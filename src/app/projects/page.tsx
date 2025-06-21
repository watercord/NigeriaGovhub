
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Project } from '@/types';
import { ministries, states } from '@/lib/data'; // ministries and states still from mock
import { ProjectCard } from '@/components/projects/project-card';
import { FilterControls } from '@/components/projects/filter-controls';
import { Pagination } from '@/components/common/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { fetchAllProjectsAction } from '@/lib/actions'; // Import the server action

const ITEMS_PER_PAGE = 9;

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<{ ministryId?: string; stateId?: string; date?: Date; status?: string; search?: string }>({ search: initialSearch });

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectsData = await fetchAllProjectsAction(); // Call the server action
        setAllProjects(projectsData);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setAllProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const projectsToDisplay = useMemo(() => {
    let projects = allProjects;
    const searchTerm = (activeFilters.search || "").toLowerCase();

    if (searchTerm) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.subtitle.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    if (activeFilters.ministryId) {
      projects = projects.filter(p => p.ministry.id === activeFilters.ministryId);
    }
    if (activeFilters.stateId) {
      projects = projects.filter(p => p.state.id === activeFilters.stateId);
    }
    if (activeFilters.status) {
      projects = projects.filter(p => p.status === activeFilters.status);
    }
    if (activeFilters.date) {
      const selectedDate = activeFilters.date.getTime();
      projects = projects.filter(p => {
        const startDate = new Date(p.startDate).getTime();
        const endDate = p.expectedEndDate ? new Date(p.expectedEndDate).getTime() : (p.actualEndDate ? new Date(p.actualEndDate).getTime() : Infinity);
        return selectedDate >= startDate && selectedDate <= endDate;
      });
    }

    return projects;
  }, [allProjects, activeFilters]);


  const applyFilters = (newFilters: { ministryId?: string; stateId?: string; date?: Date; status?: string; search?: string }) => {
    setCurrentPage(1);
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setActiveFilters({});
  }

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return projectsToDisplay.slice(startIndex, endIndex);
  }, [projectsToDisplay, currentPage]);

  const totalPages = Math.ceil(projectsToDisplay.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-gradient-to-br from-primary/5 via-background to-background rounded-lg shadow-sm">
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">Government Projects</h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Explore ongoing and completed government initiatives across Nigeria. Filter by ministry, state, status, or date to find projects relevant to you.
        </p>
      </section>

      <FilterControls
        ministries={ministries}
        states={states}
        onFilterChange={applyFilters}
        onClearFilters={clearFilters}
        initialSearch={initialSearch}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden shadow-md">
              <CardHeader className="p-0 relative">
                <Skeleton className="w-full h-48" />
              </CardHeader>
              <CardContent className="p-4 flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : paginatedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}

      {!isLoading && totalPages > 1 && (
         <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  )
}
