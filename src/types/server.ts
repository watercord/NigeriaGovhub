// src/types/server.ts
import type { InferSelectModel } from 'drizzle-orm';
import type {
  project,
  newsarticle,
  service,
  video,
  sitesetting,
  user,
  feedback,
  tag,
  ministry,
  state,
  opportunity as opportunityTable,
} from '../db/schema';

export type Ministry = InferSelectModel<typeof ministry> & {
  id: string;
  name: string;
};

export type State = InferSelectModel<typeof state> & {
  id: string;
  name: string;
  capital?: string | null;
};

export type Feedback = InferSelectModel<typeof feedback> & {
  id: string;
  project_id: string;
  user_id: string | null;
  user_name: string;
  comment: string;
  rating: number | null;
  sentiment_summary: string | null;
  created_at: Date | null;
  user?: User | null;
};

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

export const videoFormSchemaRaw = {
  title: (z: any) => z.string().min(5, "Title must be at least 5 characters.").max(200),
  url: (z: any) => z.string().url("Must be a valid URL (e.g., from Cloudinary or YouTube embed)."),
  thumbnailUrl: (z: any) => z.string().url("Must be a valid URL.").optional().or(z.literal('')).nullable(),
  dataAiHint: (z: any) => z.string().max(50, "AI hint for thumbnail too long (max 2 words).").optional().nullable(),
  description: (z: any) => z.string().max(500, "Description too long.").optional().nullable(),
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
  impactStats: ImpactStat[]; // only label/value
  budget: number | null;
  expenditure: number | null;
  tags: string[];
  lastUpdatedAt: Date | null;
  feedback: Feedback[];
  ministry_id: string | null;
  state_id: string | null;
};

export const projectFormSchemaRaw = {
  title: (z: typeof import('zod')) =>
    z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  subtitle: (z: typeof import('zod')) =>
    z.string().max(255, 'Subtitle must be 255 characters or less').optional(),
  ministryId: (z: typeof import('zod')) =>
    z.string().optional(),
  stateId: (z: typeof import('zod')) =>
    z.string().optional(),
  status: (z: typeof import('zod')) =>
    z.enum(['Planned', 'Ongoing', 'Completed', 'On Hold']),
  startDate: (z: typeof import('zod')) =>
    z.date({ required_error: 'Start date is required' }),
  expectedEndDate: (z: typeof import('zod')) =>
    z.date().nullable(),
  description: (z: typeof import('zod')) =>
    z.string().min(1, 'Description is required'),
  budget: (z: typeof import('zod')) =>
    z.number().positive('Budget must be positive').nullable(),
  expenditure: (z: typeof import('zod')) =>
    z.number().positive('Expenditure must be positive').nullable(),
  tags: (z: typeof import('zod')) =>
    z.string().optional(),
  images: (z: typeof import('zod')) =>
    z
      .array(
        z.object({
          url: z.string().url('Invalid URL'),
          alt: z.string().min(1, 'Alt text is required'),
          dataAiHint: z.string().optional(),
        })
      )
      .optional(),
};



export type User = InferSelectModel<typeof user> & {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: 'user' | 'admin' | null;
  created_at: Date | null;
  password: string | null;
  updated_at: Date | null;
};

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



// ⚠️ iconName/icon removed
export type ServiceItem = InferSelectModel<typeof service> & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  link: string | null;
  imageUrl: string | null;
  dataAiHint: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
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


export interface ImpactStat {
  label: string;
  value: string;
  
}

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

export type Opportunity = InferSelectModel<typeof opportunityTable> & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  dataAiHint: string | null;
  publishedDate: Date;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export const opportunityFormSchemaRaw = {
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
