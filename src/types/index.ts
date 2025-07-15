import type * as LucideIcons from 'lucide-react';
import type { InferSelectModel } from 'drizzle-orm';
import type { project, newsarticle, service, video, sitesetting, user, feedback, tag, ministry, state } from '../db/schema';
import type { ComponentType } from 'react';

export type Ministry = InferSelectModel<typeof ministry> & {
  id: string;
  name: string;
};

export type State = InferSelectModel<typeof state> & {
  id: string;
  name: string;
  capital?: string | null; // Added to match db/schema.ts
};

// src/types/index.ts
export type Feedback = InferSelectModel<typeof feedback> & {
  id: string;
  project_id: string;
  user_id: string | null;
  user_name: string;
  comment: string;
  rating: number | null;
  sentiment_summary: string | null;
  created_at: Date | null;
  user?: User | null; // Allow null
};

export interface ImpactStat {
  label: string;
  value: string;
  iconName?: keyof typeof LucideIcons;
  icon?: ComponentType<any>;
}

export type Video = InferSelectModel<typeof video> & {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  dataAiHint: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Tag = InferSelectModel<typeof tag> & {
  id: number;
  name: string;
};

export type Project = InferSelectModel<typeof project> & {
  id: string;
  title: string;
  subtitle: string;
  ministry: Ministry;
  state: State;
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold';
  startDate: Date;
  expectedEndDate: Date | null;
  actualEndDate: Date | null;
  description: string;
  images: { url: string; alt: string; dataAiHint?: string }[];
  videos?: Video[];
  impactStats: ImpactStat[];
  budget: number | null;
  expenditure: number | null;
  tags: string[];
  lastUpdatedAt: Date | null; // Changed to Date | null to match db/schema.ts
  feedback: Feedback[];
  ministry_id: string | null;
  state_id: string | null;
};
export type User = InferSelectModel<typeof user> & {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: 'user' | 'admin' | null;
  created_at: Date | null;
  password: string | null; // Add password
  updated_at: Date | null; // Add updated_at
};

export interface NewsComment {
  id: string;
  content: string;
  createdAt: Date | null; // Allow null
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type NewsArticle = InferSelectModel<typeof newsarticle> & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  dataAiHint: string | null;
  category: string;
  publishedDate: Date | null;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  comments: NewsComment[];
  likeCount: number;
  isLikedByUser: boolean;
};

export type ServiceItem = InferSelectModel<typeof service> & {
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

export const projectFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(150),
  subtitle: (z: any) => z.string().min(10, "Subtitle must be at least 10 characters.").max(250),
  ministryId: (z: any) => z.string().min(1, "Ministry is required."),
  stateId: (z: any) => z.string().min(1, "State is required."),
  status: (z: any) => z.enum(['Planned', 'Ongoing', 'Completed', 'On Hold']),
  startDate: (z: any) => z.coerce.date({ required_error: "Start date is required." }),
  expectedEndDate: (z: any) => z.coerce.date().optional().nullable(),
  description: (z: any) => z.string().min(20, "Description must be at least 20 characters."),
  budget: (z: any) => z.preprocess(
    (val: any) => (val === "" || val === null || val === undefined) ? null : Number(val),
    z.number().positive("Budget must be a positive number.").optional().nullable()
  ),
  expenditure: (z: any) => z.preprocess(
    (val: any) => (val === "" || val === null || val === undefined) ? null : Number(val),
    z.number().positive("Expenditure must be a positive number.").optional().nullable()
  ),
  tags: (z: any) => z.string().optional(),
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
};

export const newsArticleFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(200),
  slug: (z: any) => z.string().min(3, "Slug must be at least 3 characters.").max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens."),
  summary: (z: any) => z.string().min(10, "Summary must be at least 10 characters.").max(500),
  category: (z: any) => z.string().min(2, "Category must be at least 2 characters.").max(50),
  publishedDate: (z: any) => z.coerce.date({ required_error: "Published date is required."}),
  content: (z: any) => z.string()
    .min(50, "Content must be at least 50 characters.")
    .max(12000, "Content must not exceed 12,000 characters."),
  imageUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint too long.").optional().nullable(),
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

export const serviceFormSchemaRaw = {
  title: (z: any) => z.string().min(3, "Title must be at least 3 characters.").max(150),
  slug: (z: any) => z.string().min(3, "Slug must be at least 3 chars.").max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens."),
  summary: (z: any) => z.string().min(10, "Summary must be at least 10 characters.").max(500),
  category: (z: any) => z.string().min(2, "Category must be at least 2 characters.").max(50),
  link: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  imageUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint too long (max 2 words).").optional().nullable(),
  iconName: (z: any) => z.string().max(50, "Icon name too long.").optional().nullable(),
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

export const videoFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(200),
  url: (z: any) => z.string().url("Must be a valid URL (e.g., from Cloudinary or YouTube embed)."),
  thumbnailUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint for thumbnail too long (max 2 words).").optional().nullable(),
  description: (z: any) => z.string().max(500, "Description too long.").optional().nullable(),
};

export type VideoFormData = {
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  dataAiHint?: string | null;
  description?: string | null;
};

export type SiteSettings = InferSelectModel<typeof sitesetting> & {
  id: string;
  siteName: string | null | undefined;
  maintenanceMode: boolean;
  contactEmail: string | null | undefined;
  footerMessage: string | null | undefined;
  updatedAt: Date | null;
};

export type UserDashboardStats = {
  feedbackSubmitted: number;
  bookmarkedProjects: number;
  bookmarkedNews: number;
  averageRating: number;
};