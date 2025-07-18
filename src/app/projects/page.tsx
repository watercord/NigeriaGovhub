
import { fetchAllProjectsAction } from '@/lib/actions';
import { Suspense } from 'react';
import ProjectsPageContent from '@/components/projects/projects-page-content'; // We’ll move this to a separate client file

export default async function ProjectsPage() {
  const allProjects = await fetchAllProjectsAction();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPageContent initialProjects={allProjects} />
    </Suspense>
  );
}
