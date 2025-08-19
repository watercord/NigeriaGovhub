// src/types/client.ts
import type * as LucideIcons from 'lucide-react';
import type { ComponentType } from 'react';

export interface ImpactStat {
  label: string;
  value: string;
  iconName?: keyof typeof LucideIcons;
  icon?: ComponentType<any>;
}

export interface NewsComment {
  id: string;
  content: string;
  createdAt: Date | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface UserDashboardStats {
  feedbackSubmitted: number;
  bookmarkedProjects: number;
  bookmarkedNews: number;
  averageRating: number;
}

export type ServiceItems = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  iconName: keyof typeof LucideIcons | null;
  icon?: ComponentType<any>;
  link: string | null;
  category: string;
  imageUrl: string | null;
  dataAiHint: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ProjectFormData = {
  title: string;
  subtitle: string;
  ministryId: string;
  stateId: string;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'On Hold';
  startDate: Date;
  expectedEndDate?: Date | null;
  description: string;
  budget?: number | null;
  expenditure?: number | null;
  tags?: string;
  images?: { url: string; alt: string; dataAiHint?: string }[];
};

export type NewsArticleFormData = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  publishedDate: Date;
  content: string;
  imageUrl?: string | null;
  dataAiHint?: string | null;
};

export type ServiceFormData = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  link?: string | null;
  imageUrl?: string | null;
  dataAiHint?: string | null;
  iconName?: keyof typeof LucideIcons | null;
};

export type VideoFormData = {
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  dataAiHint?: string | null;
  description?: string | null;
};

export type OpportunityFormData = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  publishedDate: Date;
  content: string;
  imageUrl?: string | null;
  dataAiHint?: string | null;
};
