"use server"

import type * as LucideIcons from 'lucide-react';
import type { Ministry, State, Project, Feedback, ImpactStat, Video, User, NewsArticle, ServiceItem, SiteSettings, UserDashboardStats, NewsComment } from '@/types/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/drizzle';
import { user, project, feedback, newsarticle, newscomment, newslike, bookmarkednewsarticle, bookmarkedproject, service, video, sitesetting, projecttag, tag, account, session } from '../db/schema';
import * as relations from '../db/relations';
import { eq, and, sql, isNotNull, desc, asc } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';
import { ministries, states } from './mock-data';

// --- Mock Data for Ministries and States ---


// --- Helper function to parse JSON fields safely ---
function safeParseJsonArray<T>(input: string | null | undefined, fallback: T[]): T[] {
  if (!input) return fallback;
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// --- Helper function to map Drizzle Project to Project ---
const mapPrismaProjectToAppProject = (
  drizzleProject: InferSelectModel<typeof project> & {
    feedback?: (InferSelectModel<typeof feedback> & { user?: InferSelectModel<typeof user> | null })[];
    projectTags?: { tag: InferSelectModel<typeof tag> }[];
  }
): Project => {
  const images = safeParseJsonArray<{ url: string; alt: string; dataAiHint?: string }>(
    drizzleProject.images,
    []
  ).map((img) => ({
    url: img.url || '',
    alt: img.alt || '',
    dataAiHint: img.dataAiHint,
  })) as { url: string; alt: string; dataAiHint?: string }[];

  const videos = safeParseJsonArray<Video>(drizzleProject.videos, []).map((video) => ({
    id: video.id || '',
    title: video.title || '',
    url: video.url || '',
    thumbnailUrl: video.thumbnailUrl || null,
    dataAiHint: video.dataAiHint || null,
    description: video.description || null,
    createdAt: video.createdAt ? new Date(video.createdAt) : null,
    updatedAt: video.updatedAt ? new Date(video.updatedAt) : null,
  })) as Video[];

  const impactStats = safeParseJsonArray<ImpactStat>(drizzleProject.impact_stats, []).map((stat) => ({
    label: stat.label || '',
    value: stat.value || '',
  })) as ImpactStat[];

  const ministry = drizzleProject.ministry_id
    ? ministries.find((m) => m.id === drizzleProject.ministry_id) || { id: '', name: 'Unknown Ministry' }
    : { id: '', name: 'Unknown Ministry' };

  const state = drizzleProject.state_id
    ? states.find((s) => s.id === drizzleProject.state_id) || { id: '', name: 'Unknown State', capital: null }
    : { id: '', name: 'Unknown State', capital: null };

  return {
    id: drizzleProject.id,
    title: drizzleProject.title,
    subtitle: drizzleProject.subtitle,
    ministry_id: drizzleProject.ministry_id,
    state_id: drizzleProject.state_id,
    status: drizzleProject.status as 'Planned' | 'Ongoing' | 'Completed' | 'On Hold',
    startDate: new Date(drizzleProject.start_date),
    expectedEndDate: drizzleProject.expected_end_date ? new Date(drizzleProject.expected_end_date) : null,
    actualEndDate: drizzleProject.actual_end_date ? new Date(drizzleProject.actual_end_date) : null,
    description: drizzleProject.description,
    images,
    impactStats,
    budget: drizzleProject.budget !== null ? Number(drizzleProject.budget) : null,
    expenditure: drizzleProject.expenditure !== null ? Number(drizzleProject.expenditure) : undefined,
    lastUpdatedAt: drizzleProject.last_updated_at ? new Date(drizzleProject.last_updated_at) : null,
    tags: drizzleProject.projectTags?.map((pt) => pt.tag.name) || [],
    feedback: drizzleProject.feedback?.map((f) => mapPrismaFeedbackToAppFeedback(f)) || [],
    ministry,
    state,
  };
};

// --- Helper function to map Drizzle Feedback to Feedback ---
const mapPrismaFeedbackToAppFeedback = (
  drizzleFeedback: InferSelectModel<typeof feedback> & { user?: InferSelectModel<typeof user> | null }
): Feedback => {
  return {
    id: drizzleFeedback.id,
    project_id: drizzleFeedback.project_id,
    user_id: drizzleFeedback.user_id,
    user_name: drizzleFeedback.user_name,
    comment: drizzleFeedback.comment,
    rating: drizzleFeedback.rating,
    sentiment_summary: drizzleFeedback.sentiment_summary,
    created_at: drizzleFeedback.created_at ? new Date(drizzleFeedback.created_at) : null,
    user: drizzleFeedback.user ? mapPrismaUserToAppUser(drizzleFeedback.user) : null,
  };
};

// --- Helper function to map Drizzle User to User ---
const mapPrismaUserToAppUser = (drizzleUser: InferSelectModel<typeof user>): User => {
  return {
    id: drizzleUser.id,
    name: drizzleUser.name,
    email: drizzleUser.email,
    emailVerified: drizzleUser.emailVerified ? new Date(drizzleUser.emailVerified) : null,
    image: drizzleUser.image,
    role: drizzleUser.role as 'user' | 'admin' | null,
    created_at: drizzleUser.created_at ? new Date(drizzleUser.created_at) : null,
    password: drizzleUser.password,
    updated_at: drizzleUser.updated_at ? new Date(drizzleUser.updated_at) : null,
  };
};

// --- Helper function to map Drizzle NewsArticle to NewsArticle ---
const mapPrismaNewsToAppNews = (drizzleNews: InferSelectModel<typeof newsarticle>): Omit<NewsArticle, 'comments' | 'likeCount' | 'isLikedByUser'> => {
  return {
    id: drizzleNews.id,
    slug: drizzleNews.slug,
    title: drizzleNews.title,
    summary: drizzleNews.summary,
    imageUrl: drizzleNews.imageUrl,
    dataAiHint: drizzleNews.dataAiHint,
    category: drizzleNews.category,
    publishedDate: drizzleNews.publishedDate,
    content: drizzleNews.content,
    createdAt: drizzleNews.createdAt ? new Date(drizzleNews.createdAt) : null,
    updatedAt: drizzleNews.updatedAt ? new Date(drizzleNews.updatedAt) : null,
  };
};

// --- Helper function to map Drizzle Service to ServiceItem ---
const mapPrismaServiceToAppServiceItem = (drizzleService: InferSelectModel<typeof service>): ServiceItem => {
  return {
    id: drizzleService.id,
    slug: drizzleService.slug,
    title: drizzleService.title,
    summary: drizzleService.summary,
    link: drizzleService.link,
    category: drizzleService.category,
    imageUrl: drizzleService.imageUrl,
    dataAiHint: drizzleService.dataAiHint,
    iconName: drizzleService.iconName as keyof typeof LucideIcons | null,
    createdAt: drizzleService.createdAt ? new Date(drizzleService.createdAt) : null,
    updatedAt: drizzleService.updatedAt ? new Date(drizzleService.updatedAt) : null,
  };
};

// --- Helper function to map Drizzle Video to Video ---
const mapPrismaVideoToAppVideo = (drizzleVideo: InferSelectModel<typeof video>): Video => {
  return {
    id: drizzleVideo.id,
    title: drizzleVideo.title,
    url: drizzleVideo.url,
    thumbnailUrl: drizzleVideo.thumbnailUrl,
    dataAiHint: drizzleVideo.dataAiHint,
    description: drizzleVideo.description,
    createdAt: drizzleVideo.createdAt ? new Date(drizzleVideo.createdAt) : null,
    updatedAt: drizzleVideo.updatedAt ? new Date(drizzleVideo.updatedAt) : null,
  };
};

// --- Helper function to map Drizzle SiteSetting to SiteSettings ---
const mapPrismaSiteSettingToAppSiteSetting = (drizzleSetting: InferSelectModel<typeof sitesetting>): SiteSettings => {
  return {
    id: drizzleSetting.id,
    siteName: drizzleSetting.siteName,
    maintenanceMode: drizzleSetting.maintenanceMode,
    contactEmail: drizzleSetting.contactEmail,
    footerMessage: drizzleSetting.footerMessage,
    updatedAt: drizzleSetting.updatedAt ? new Date(drizzleSetting.updatedAt) : null,
  };
};

// --- Project Data Functions ---
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const projectWithDetails = await db.query.project.findFirst({
      where: eq(project.id, id),
      with: {
        feedback: {
          orderBy: [desc(feedback.created_at)],
          with: { user: true },
        },
        projectTags: { with: { tag: true } },
      },
    });
    if (!projectWithDetails) return null;
    return mapPrismaProjectToAppProject(projectWithDetails);
  } catch (error) {
    console.error('Error fetching project by ID with Drizzle:', error);
    throw error;
  }
};

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const drizzleProjects = await db.query.project.findMany({
      orderBy: [desc(project.last_updated_at)],
      with: {
        projectTags: { with: { tag: true } },
        feedback: {
          orderBy: [desc(feedback.created_at)],
          with: { user: true },
        },
      },
    });
    return drizzleProjects.map(mapPrismaProjectToAppProject);
  } catch (error) {
    console.error('Error fetching all projects with Drizzle:', error);
    return [];
  }
};

export type ProjectCreationData = {
  title: string;
  subtitle: string;
  ministry_id: string | null;
  state_id: string | null;
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold';
  start_date: Date;
  expected_end_date?: Date | null;
  description: string;
  budget?: number | null;
  expenditure?: number | null;
  tags?: string[];
  images?: { url: string; alt: string; dataAiHint?: string }[];
  videos?: Video[];
  impact_stats?: ImpactStat[];
};

export const createProjectInDb = async (projectData: ProjectCreationData): Promise<Project | null> => {
  try {
    console.log('[createProjectInDb] Starting with data:', projectData);
    // Validate ministry_id and state_id against mock data
    if (projectData.ministry_id && !ministries.find(m => m.id === projectData.ministry_id)) {
      throw new Error(`Invalid ministry_id: ${projectData.ministry_id}`);
    }
    if (projectData.state_id && !states.find(s => s.id === projectData.state_id)) {
      throw new Error(`Invalid state_id: ${projectData.state_id}`);
    }

    const { tags, images, videos, impact_stats, ...scalarData } = projectData;
    const newProjectId = uuidv4();
    console.log('[createProjectInDb] New project ID:', newProjectId);
    await db.transaction(async (tx) => {
      console.log('[createProjectInDb] Starting transaction');
      await tx.insert(project).values({
        ...scalarData,
        id: newProjectId,
        last_updated_at: new Date(),
        created_at: new Date(),
        start_date: new Date(scalarData.start_date),
        expected_end_date: scalarData.expected_end_date ? new Date(scalarData.expected_end_date) : null,
        budget: scalarData.budget != null ? String(scalarData.budget) : null,
        expenditure: scalarData.expenditure != null ? String(scalarData.expenditure) : null,
        images: images ? JSON.stringify(images) : null,
        videos: videos ? JSON.stringify(videos) : null,
        impact_stats: impact_stats ? JSON.stringify(impact_stats) : null,
      });
      console.log('[createProjectInDb] Inserted project');

      if (tags && tags.length > 0) {
        const uniqueTags = [...new Set(tags)];
        console.log('[createProjectInDb] Processing tags:', uniqueTags);
        for (const tagName of uniqueTags) {
          let tagRecord = await tx.select().from(tag).where(eq(tag.name, tagName)).limit(1).then(res => res[0]);
          if (!tagRecord) {
            await tx.insert(tag).values({ name: tagName });
            tagRecord = await tx.select().from(tag).where(eq(tag.name, tagName)).limit(1).then(res => res[0]);
            console.log('[createProjectInDb] Created tag:', tagName);
          }
          await tx.insert(projecttag).values({
            projectId: newProjectId,
            tagId: tagRecord.id,
          });
          console.log('[createProjectInDb] Linked tag:', tagName);
        }
      }
      console.log('[createProjectInDb] Transaction completed');
    });

    const newProject = await db.query.project.findFirst({
      where: eq(project.id, newProjectId),
      with: {
        projectTags: { with: { tag: true } },
        feedback: { with: { user: true } },
      },
    });

    console.log('[createProjectInDb] Retrieved new project:', newProject);
    return newProject ? mapPrismaProjectToAppProject(newProject) : null;
  } catch (error) {
    console.error('[createProjectInDb] Error:', error);
    throw error;
  }
};

export const updateProjectInDb = async (id: string, projectData: Partial<ProjectCreationData>): Promise<Project | null> => {
  try {
    // Validate ministry_id and state_id against mock data
    if (projectData.ministry_id && !ministries.find(m => m.id === projectData.ministry_id)) {
      throw new Error(`Invalid ministry_id: ${projectData.ministry_id}`);
    }
    if (projectData.state_id && !states.find(s => s.id === projectData.state_id)) {
      throw new Error(`Invalid state_id: ${projectData.state_id}`);
    }

    const { tags, images, videos, impact_stats, ...scalarData } = projectData;

    const baseUpdateData = {
      ...scalarData,
      start_date: scalarData.start_date ? new Date(scalarData.start_date) : undefined,
      expected_end_date: scalarData.expected_end_date === null ? null : scalarData.expected_end_date ? new Date(scalarData.expected_end_date) : undefined,
      budget: scalarData.budget !== undefined ? String(scalarData.budget) : undefined,
      expenditure: scalarData.expenditure !== undefined ? String(scalarData.expenditure) : undefined,
      images: images !== undefined ? JSON.stringify(images) : undefined,
      videos: videos !== undefined ? JSON.stringify(videos) : undefined,
      impact_stats: impact_stats !== undefined ? JSON.stringify(impact_stats) : undefined,
      last_updated_at: new Date(),
    };

    await db.transaction(async (tx) => {
      if (tags !== undefined) {
        await tx.delete(projecttag).where(eq(projecttag.projectId, id));
        if (tags.length > 0) {
          const uniqueTags = [...new Set(tags)];
          for (const tagName of uniqueTags) {
            let tagRecord = await tx.select().from(tag).where(eq(tag.name, tagName)).limit(1).then(res => res[0]);
            if (!tagRecord) {
              await tx.insert(tag).values({ name: tagName });
              tagRecord = await tx.select().from(tag).where(eq(tag.name, tagName)).limit(1).then(res => res[0]);
            }
            await tx.insert(projecttag).values({
              projectId: id,
              tagId: tagRecord.id,
            });
          }
        }
      }

      await tx.update(project).set(baseUpdateData).where(eq(project.id, id));
    });

    const updatedProject = await db.query.project.findFirst({
      where: eq(project.id, id),
      with: {
        projectTags: { with: { tag: true } },
        feedback: {
          orderBy: [desc(feedback.created_at)],
          with: { user: true },
        },
      },
    });

    return updatedProject ? mapPrismaProjectToAppProject(updatedProject) : null;
  } catch (error) {
    console.error(`Error updating project with ID "${id}" in DB with Drizzle:`, error);
    throw error;
  }
};

export const deleteProjectFromDb = async (id: string): Promise<boolean> => {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(projecttag).where(eq(projecttag.projectId, id));
      await tx.delete(feedback).where(eq(feedback.project_id, id));
      await tx.delete(bookmarkedproject).where(eq(bookmarkedproject.project_id, id));
      await tx.delete(project).where(eq(project.id, id));
    });
    return true;
  } catch (error) {
    console.error(`Error deleting project with ID "${id}" from DB with Drizzle:`, error);
    return false;
  }
};

// --- Feedback Data Functions ---
export const addFeedbackToProject = async (
  projectId: string,
  feedbackData: { userName: string; comment: string; rating?: number | null; sentimentSummary?: string | null; userId?: string | null }
): Promise<Feedback | null> => {
  try {
    const newFeedbackId = uuidv4();
    await db.insert(feedback).values({
      id: newFeedbackId,
      project_id: projectId,
      user_name: feedbackData.userName,
      comment: feedbackData.comment,
      rating: feedbackData.rating ?? null,
      sentiment_summary: feedbackData.sentimentSummary ?? null,
      user_id: feedbackData.userId ?? null,
      created_at: new Date(),
    });
    const savedFeedback = await db.select().from(feedback).where(eq(feedback.id, newFeedbackId)).limit(1).then(res => res[0]);
    return savedFeedback ? mapPrismaFeedbackToAppFeedback({ ...savedFeedback, user: null }) : null;
  } catch (error) {
    console.error('Error adding feedback to project with Drizzle:', error);
    return null;
  }
};

export const getAllFeedbackWithProjectTitles = async (): Promise<Array<Feedback & { projectTitle: string }>> => {
  try {
    const feedbackWithProjects = await db.query.feedback.findMany({
      with: {
        project: {
          columns: { title: true },
        },
        user: true,
      },
      orderBy: [desc(feedback.created_at)],
    });

    return feedbackWithProjects.map(fb => ({
      ...mapPrismaFeedbackToAppFeedback({ ...fb, user: fb.user || null }),
      projectTitle: fb.project?.title || 'Unknown Project',
    }));
  } catch (error) {
    console.error('Error fetching all feedback with project titles using Drizzle:', error);
    return [];
  }
};

// --- User Management Functions ---
export async function getUsers(): Promise<User[]> {
  try {
    const users = await db.select().from(user).orderBy(desc(user.created_at));
    return users.map(mapPrismaUserToAppUser);
  } catch (error) {
    console.error('Error fetching users with Drizzle:', error);
    return [];
  }
};

export async function deleteUserById(userId: string): Promise<{ success: boolean; error?: any }> {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(newscomment).where(eq(newscomment.user_id, userId));
      await tx.delete(newslike).where(eq(newslike.user_id, userId));
      await tx.delete(bookmarkednewsarticle).where(eq(bookmarkednewsarticle.user_id, userId));
      await tx.delete(bookmarkedproject).where(eq(bookmarkedproject.user_id, userId));
      await tx.delete(account).where(eq(account.userId, userId));
      await tx.delete(session).where(eq(session.userId, userId));
      await tx.update(feedback).set({ user_id: null }).where(eq(feedback.user_id, userId));
      await tx.delete(user).where(eq(user.id, userId));
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting user profile and related data with Drizzle:', error);
    return { success: false, error };
  }
};

export async function getUserProfileFromDb(userId: string): Promise<User | null> {
  try {
    const [userRecord] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    return userRecord ? mapPrismaUserToAppUser(userRecord) : null;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId} from DB with Drizzle:`, error);
    return null;
  }
};

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [userRecord] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return userRecord ? mapPrismaUserToAppUser(userRecord) : null;
  } catch (error) {
    console.error(`Error fetching user by email ${email} from DB with Drizzle:`, error);
    throw error;
  }
};

export const getFullUserByEmail = async (email: string) => {
  try {
    const [userRecord] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return userRecord ? mapPrismaUserToAppUser(userRecord) : null;
  } catch (error) {
    console.error(`Error fetching user by email ${email} from DB with Drizzle:`, error);
    return null;
  }
};

// --- News Data Functions ---
export type NewsArticleCreationData = Omit<InferSelectModel<typeof newsarticle>, 'id' | 'createdAt' | 'updatedAt'>;
export type ServiceCreationData = {
  slug: string;
  title: string;
  summary: string;
  link: string | null;
  category: string;
  imageUrl: string | null;
  dataAiHint: string | null;
  iconName: string | null;
};
export type VideoCreationData = Omit<InferSelectModel<typeof video>, 'id' | 'createdAt' | 'updatedAt'>;

export const getNewsArticleBySlug = async (slug: string, userId?: string): Promise<NewsArticle | null> => {
  try {
    const newsArticle = await db.query.newsarticle.findFirst({
      where: eq(newsarticle.slug, slug),
      with: {
        newscomments: {
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
          },
          orderBy: [desc(newscomment.createdAt)],
        },
      },
    });
    if (!newsArticle) return null;
    const likeCount = await db.select({ count: sql`COUNT(*)` })
      .from(newslike)
      .where(eq(newslike.news_article_id, newsArticle.id))
      .then(res => Number(res[0].count));
    let isLiked = false;
    if (userId) {
      const like = await db.select()
        .from(newslike)
        .where(and(eq(newslike.user_id, userId), eq(newslike.news_article_id, newsArticle.id)))
        .limit(1);
      isLiked = like.length > 0;
    }
    return {
      ...mapPrismaNewsToAppNews(newsArticle),
      likeCount,
      isLikedByUser: isLiked,
      comments: newsArticle.newscomments?.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt ? new Date(c.createdAt) : null,
        user: c.user
          ? { id: c.user.id, name: c.user.name, image: c.user.image }
          : { id: '', name: 'Anonymous', image: null },
      })) || [],
    };
  } catch (error) {
    console.error(`Error fetching news article by slug "${slug}" with Drizzle:`, error);
    return null;
  }
};

export const getNewsArticleById = async (id: string): Promise<NewsArticle | null> => {
  try {
    const [newsArticle] = await db.select().from(newsarticle).where(eq(newsarticle.id, id)).limit(1);
    if (!newsArticle) return null;
    return {
      ...mapPrismaNewsToAppNews(newsArticle),
      comments: [],
      likeCount: 0,
      isLikedByUser: false,
    };
  } catch (error) {
    console.error(`Error fetching news article by ID "${id}" with Drizzle:`, error);
    return null;
  }
};

export const getAllNewsArticles = async (): Promise<NewsArticle[]> => {
  try {
    const newsArticles = await db.select().from(newsarticle).orderBy(desc(newsarticle.publishedDate));
    return newsArticles.map(article => ({
      ...mapPrismaNewsToAppNews(article),
      comments: [],
      likeCount: 0,
      isLikedByUser: false,
    }));
  } catch (error) {
    console.error('Error fetching all news articles with Drizzle:', error);
    return [];
  }
};

export const createNewsArticleInDb = async (newsData: NewsArticleCreationData): Promise<NewsArticle | null> => {
  try {
    const newArticleId = uuidv4();
    await db.insert(newsarticle).values({
      id: newArticleId,
      ...newsData,
      publishedDate: new Date(newsData.publishedDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const newArticle = await db.select().from(newsarticle).where(eq(newsarticle.id, newArticleId)).limit(1).then(res => res[0]);
    return newArticle ? {
      ...mapPrismaNewsToAppNews(newArticle),
      comments: [],
      likeCount: 0,
      isLikedByUser: false,
    } : null;
  } catch (error) {
    console.error('Error creating news article in DB with Drizzle:', error);
    throw error;
  }
};

export const updateNewsArticleInDb = async (id: string, newsData: Partial<NewsArticleCreationData>): Promise<NewsArticle | null> => {
  try {
    const dataToUpdate = {
      ...newsData,
      publishedDate: newsData.publishedDate ? new Date(newsData.publishedDate) : undefined,
      imageUrl: newsData.imageUrl === '' ? null : newsData.imageUrl,
      dataAiHint: newsData.dataAiHint === '' ? null : newsData.dataAiHint,
      updatedAt: new Date(),
    };
    await db.update(newsarticle).set(dataToUpdate).where(eq(newsarticle.id, id));
    const updatedArticle = await db.select().from(newsarticle).where(eq(newsarticle.id, id)).limit(1).then(res => res[0]);
    return updatedArticle ? {
      ...mapPrismaNewsToAppNews(updatedArticle),
      comments: [],
      likeCount: 0,
      isLikedByUser: false,
    } : null;
  } catch (error) {
    console.error(`Error updating news article with ID "${id}" in DB with Drizzle:`, error);
    throw error;
  }
};

export const deleteNewsArticleFromDb = async (id: string): Promise<boolean> => {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(newscomment).where(eq(newscomment.news_article_id, id));
      await tx.delete(newslike).where(eq(newslike.news_article_id, id));
      await tx.delete(bookmarkednewsarticle).where(eq(bookmarkednewsarticle.news_article_id, id));
      await tx.delete(newsarticle).where(eq(newsarticle.id, id));
    });
    return true;
  } catch (error) {
    console.error(`Error deleting news article with ID "${id}" from DB with Drizzle:`, error);
    return false;
  }
};

// --- Services Data Functions ---
export const getAllServices = async (): Promise<ServiceItem[]> => {
  try {
    const drizzleServices = await db.select().from(service).orderBy(asc(service.title));
    return drizzleServices.map(mapPrismaServiceToAppServiceItem);
  } catch (error) {
    console.error('Error fetching all services with Drizzle:', error);
    return [];
  }
};

export const getServiceBySlug = async (slug: string): Promise<ServiceItem | undefined> => {
  try {
    const [serviceRecord] = await db.select().from(service).where(eq(service.slug, slug)).limit(1);
    return serviceRecord ? mapPrismaServiceToAppServiceItem(serviceRecord) : undefined;
  } catch (error) {
    console.error(`Error fetching service by slug "${slug}" with Drizzle:`, error);
    return undefined;
  }
};

export const getServiceById = async (id: string): Promise<ServiceItem | null> => {
  try {
    const [serviceRecord] = await db.select().from(service).where(eq(service.id, id)).limit(1);
    return serviceRecord ? mapPrismaServiceToAppServiceItem(serviceRecord) : null;
  } catch (error) {
    console.error(`Error fetching service by ID "${id}" with Drizzle:`, error);
    return null;
  }
};

export const createServiceInDb = async (serviceData: ServiceCreationData): Promise<ServiceItem | null> => {
  try {
    console.log('[createServiceInDb] Starting with serviceData:', serviceData);
    const newServiceId = uuidv4();
    console.log('[createServiceInDb] New service ID:', newServiceId);
    await db.insert(service).values({
      id: newServiceId,
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('[createServiceInDb] Inserted service');
    const newService = await db.select().from(service).where(eq(service.id, newServiceId)).limit(1).then(res => res[0]);
    console.log('[createServiceInDb] Retrieved new service:', newService);
    return newService ? mapPrismaServiceToAppServiceItem(newService) : null;
  } catch (error) {
    console.error('[createServiceInDb] Error:', error);
    throw error;
  }
};

export const updateServiceInDb = async (id: string, serviceData: Partial<ServiceCreationData>): Promise<ServiceItem | null> => {
  try {
    const dataToUpdate = {
      ...serviceData,
      iconName: serviceData.iconName === '' ? null : serviceData.iconName,
      link: serviceData.link === '' ? null : serviceData.link,
      imageUrl: serviceData.imageUrl === '' ? null : serviceData.imageUrl,
      dataAiHint: serviceData.dataAiHint === '' ? null : serviceData.dataAiHint,
      updatedAt: new Date(),
    };
    await db.update(service).set(dataToUpdate).where(eq(service.id, id));
    const updatedService = await db.select().from(service).where(eq(service.id, id)).limit(1).then(res => res[0]);
    return updatedService ? mapPrismaServiceToAppServiceItem(updatedService) : null;
  } catch (error) {
    console.error(`Error updating service with ID "${id}" in DB with Drizzle:`, error);
    throw error;
  }
};

export const deleteServiceFromDb = async (id: string): Promise<boolean> => {
  try {
    await db.delete(service).where(eq(service.id, id));
    return true;
  } catch (error) {
    console.error(`Error deleting service with ID "${id}" from DB with Drizzle:`, error);
    return false;
  }
};

// --- Video Data Functions ---
export const getAllVideosFromDb = async (): Promise<Video[]> => {
  try {
    const drizzleVideos = await db.select().from(video).orderBy(desc(video.createdAt));
    return drizzleVideos.map(mapPrismaVideoToAppVideo);
  } catch (error) {
    console.error('Error fetching all videos with Drizzle:', error);
    return [];
  }
};

export const getVideoById = async (id: string): Promise<Video | null> => {
  try {
    const [videoRecord] = await db.select().from(video).where(eq(video.id, id)).limit(1);
    return videoRecord ? mapPrismaVideoToAppVideo(videoRecord) : null;
  } catch (error) {
    console.error(`Error fetching video by ID "${id}" with Drizzle:`, error);
    return null;
  }
};

export const createVideoInDb = async (videoData: VideoCreationData): Promise<Video | null> => {
  try {
    const newVideoId = uuidv4();
    await db.insert(video).values({
      id: newVideoId,
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const newVideo = await db.select().from(video).where(eq(video.id, newVideoId)).limit(1).then(res => res[0]);
    return newVideo ? mapPrismaVideoToAppVideo(newVideo) : null;
  } catch (error) {
    console.error('Error creating video in DB with Drizzle:', error);
    throw error;
  }
};

export const updateVideoInDb = async (id: string, videoData: Partial<VideoCreationData>): Promise<Video | null> => {
  try {
    const dataToUpdate = {
      ...videoData,
      thumbnailUrl: videoData.thumbnailUrl === '' ? null : videoData.thumbnailUrl,
      dataAiHint: videoData.dataAiHint === '' ? null : videoData.dataAiHint,
      description: videoData.description === '' ? null : videoData.description,
      updatedAt: new Date(),
    };
    await db.update(video).set(dataToUpdate).where(eq(video.id, id));
    const updatedVideo = await db.select().from(video).where(eq(video.id, id)).limit(1).then(res => res[0]);
    return updatedVideo ? mapPrismaVideoToAppVideo(updatedVideo) : null;
  } catch (error) {
    console.error(`Error updating video with ID "${id}" in DB with Drizzle:`, error);
    throw error;
  }
};

export const deleteVideoFromDb = async (id: string): Promise<boolean> => {
  try {
    await db.delete(video).where(eq(video.id, id));
    return true;
  } catch (error) {
    console.error(`Error deleting video with ID "${id}" from DB with Drizzle:`, error);
    return false;
  }
};

// --- Site Settings Data Functions ---
const SITE_SETTINGS_ID = "global_settings";

export const getSiteSettingsFromDb = async (): Promise<SiteSettings | null> => {
  try {
    const [settings] = await db.select().from(sitesetting).where(eq(sitesetting.id, SITE_SETTINGS_ID)).limit(1);
    if (settings) {
      return mapPrismaSiteSettingToAppSiteSetting(settings);
    }
    return {
      id: SITE_SETTINGS_ID,
      siteName: "NigeriaGovHub",
      maintenanceMode: false,
      contactEmail: "info@example.com",
      footerMessage: `© ${new Date().getFullYear()} NigeriaGovHub. All rights reserved.`,
      updatedAt: null,
    };
  } catch (error) {
    console.error("Error fetching site settings from DB with Drizzle:", error);
    return null;
  }
};

export const updateSiteSettingsInDb = async (settingsData: Partial<Omit<SiteSettings, 'id'>>): Promise<SiteSettings | null> => {
  try {
    const dataToUpsert = {
      siteName: settingsData.siteName ?? "NigeriaGovHub",
      maintenanceMode: settingsData.maintenanceMode ?? false,
      contactEmail: settingsData.contactEmail ?? "info@example.com",
      footerMessage: settingsData.footerMessage ?? `© ${new Date().getFullYear()} NigeriaGovHub. All rights reserved.`,
      updatedAt: new Date(),
      id: SITE_SETTINGS_ID,
    };

    const [existingSettings] = await db.select().from(sitesetting).where(eq(sitesetting.id, SITE_SETTINGS_ID)).limit(1);

    let updatedSettings;
    if (existingSettings) {
      await db.update(sitesetting).set(dataToUpsert).where(eq(sitesetting.id, SITE_SETTINGS_ID));
      updatedSettings = await db.select().from(sitesetting).where(eq(sitesetting.id, SITE_SETTINGS_ID)).limit(1).then(res => res[0]);
    } else {
      await db.insert(sitesetting).values(dataToUpsert);
      updatedSettings = await db.select().from(sitesetting).where(eq(sitesetting.id, SITE_SETTINGS_ID)).limit(1).then(res => res[0]);
    }

    return updatedSettings ? mapPrismaSiteSettingToAppSiteSetting(updatedSettings) : null;
  } catch (error) {
    console.error("Error updating site settings in DB with Drizzle:", error);
    throw error;
  }
};

// --- User Dashboard Functions ---
export const getUserDashboardStatsFromDb = async (userId: string): Promise<UserDashboardStats> => {
  try {
    const feedbackCount = await db.select({ count: sql`COUNT(*)` })
      .from(feedback)
      .where(eq(feedback.user_id, userId))
      .then(res => Number(res[0].count));
    const ratingAgg = await db.select({ avg: sql`AVG(${feedback.rating})` })
      .from(feedback)
      .where(and(eq(feedback.user_id, userId), isNotNull(feedback.rating)))
      .then(res => Number(res[0].avg) || 0);
    const bookmarkedProjectsCount = await db.select({ count: sql`COUNT(*)` })
      .from(bookmarkedproject)
      .where(eq(bookmarkedproject.user_id, userId))
      .then(res => Number(res[0].count));
    const bookmarkedNewsCount = await db.select({ count: sql`COUNT(*)` })
      .from(bookmarkednewsarticle)
      .where(eq(bookmarkednewsarticle.user_id, userId))
      .then(res => Number(res[0].count));
    return {
      feedbackSubmitted: feedbackCount,
      bookmarkedProjects: bookmarkedProjectsCount,
      bookmarkedNews: bookmarkedNewsCount,
      averageRating: ratingAgg,
    };
  } catch (error) {
    console.error('Error fetching user dashboard stats with Drizzle:', error);
    return { feedbackSubmitted: 0, bookmarkedProjects: 0, bookmarkedNews: 0, averageRating: 0 };
  }
};

export const getUserFeedbackFromDb = async (userId: string): Promise<Array<Feedback & { projectTitle: string; projectId: string }>> => {
  try {
    const feedbackWithProjects = await db.query.feedback.findMany({
      where: eq(feedback.user_id, userId),
      with: {
        project: {
          columns: { id: true, title: true },
        },
        user: true,
      },
      orderBy: [desc(feedback.created_at)],
    });

    return feedbackWithProjects.map(fb => ({
      ...mapPrismaFeedbackToAppFeedback({ ...fb, user: fb.user || null }),
      projectTitle: fb.project?.title || 'Unknown Project',
      projectId: fb.project_id,
    }));
  } catch (error) {
    console.error('Error fetching user feedback with Drizzle:', error);
    return [];
  }
};

export const updateUserNameInDb = async (userId: string, name: string): Promise<User | null> => {
  try {
    await db.update(user).set({ name }).where(eq(user.id, userId));
    const [updatedUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    return updatedUser ? mapPrismaUserToAppUser(updatedUser) : null;
  } catch (error) {
    console.error(`Error updating user name for user ${userId} with Drizzle:`, error);
    return null;
  }
};

// --- News Bookmark Functions ---
export const getUserBookmarkedNewsFromDb = async (userId: string): Promise<NewsArticle[]> => {
  try {
    const bookmarks = await db.query.bookmarkednewsarticle.findMany({
      where: eq(bookmarkednewsarticle.user_id, userId),
      with: {
        newsarticle: {
          columns: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            imageUrl: true,
            dataAiHint: true,
            category: true,
            publishedDate: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [desc(bookmarkednewsarticle.createdAt)],
    });
    return bookmarks.map(bookmark => ({
      ...mapPrismaNewsToAppNews(bookmark.newsarticle!),
      comments: [],
      likeCount: 0,
      isLikedByUser: true,
    }));
  } catch (error) {
    console.error('Error fetching user bookmarked news with Drizzle:', error);
    return [];
  }
};

export const isNewsArticleBookmarked = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    const bookmark = await db.select()
      .from(bookmarkednewsarticle)
      .where(and(eq(bookmarkednewsarticle.user_id, userId), eq(bookmarkednewsarticle.news_article_id, articleId)))
      .limit(1);
    return bookmark.length > 0;
  } catch (error) {
    console.error(`Error checking bookmark for user ${userId} and article ${articleId} with Drizzle:`, error);
    return false;
  }
};

export const addNewsBookmarkInDb = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    await db.insert(bookmarkednewsarticle).values({
      id: uuidv4(),
      user_id: userId,
      news_article_id: articleId,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error adding news bookmark with Drizzle:', error);
    throw error;
  }
};

export const removeNewsBookmarkInDb = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    await db.delete(bookmarkednewsarticle)
      .where(and(eq(bookmarkednewsarticle.user_id, userId), eq(bookmarkednewsarticle.news_article_id, articleId)));
    return true;
  } catch (error) {
    console.error('Error removing news bookmark with Drizzle:', error);
    throw error;
  }
};

// --- Project Bookmark Functions ---
export const getUserBookmarkedProjectsFromDb = async (userId: string): Promise<Project[]> => {
  try {
    const bookmarks = await db.query.bookmarkedproject.findMany({
      where: eq(bookmarkedproject.user_id, userId),
      with: {
        project: {
          columns: {
            id: true,
            title: true,
            subtitle: true,
            ministry_id: true,
            state_id: true,
            status: true,
            start_date: true,
            expected_end_date: true,
            actual_end_date: true,
            description: true,
            images: true,
            videos: true,
            impact_stats: true,
            budget: true,
            expenditure: true,
            last_updated_at: true,
            created_at: true,
          },
          with: {
            projectTags: { with: { tag: true } },
            feedback: { with: { user: true } },
          },
        },
      },
      orderBy: [desc(bookmarkedproject.createdAt)],
    });
    return bookmarks.map(bookmark => mapPrismaProjectToAppProject(bookmark.project!));
  } catch (error) {
    console.error('Error fetching user bookmarked projects with Drizzle:', error);
    return [];
  }
};

export const isProjectBookmarked = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    const bookmark = await db.select()
      .from(bookmarkedproject)
      .where(and(eq(bookmarkedproject.user_id, userId), eq(bookmarkedproject.project_id, projectId)))
      .limit(1);
    return bookmark.length > 0;
  } catch (error) {
    console.error(`Error checking project bookmark for user ${userId} and project ${projectId} with Drizzle:`, error);
    return false;
  }
};

export const addProjectBookmarkInDb = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    await db.insert(bookmarkedproject).values({
      id: uuidv4(),
      user_id: userId,
      project_id: projectId,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error adding project bookmark with Drizzle:', error);
    throw error;
  }
};

export const removeProjectBookmarkInDb = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    await db.delete(bookmarkedproject)
      .where(and(eq(bookmarkedproject.user_id, userId), eq(bookmarkedproject.project_id, projectId)));
    return true;
  } catch (error) {
    console.error('Error removing project bookmark with Drizzle:', error);
    throw error;
  }
};

// --- News Like Functions ---
export const addNewsLikeInDb = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    await db.insert(newslike).values({
      id: uuidv4(),
      user_id: userId,
      news_article_id: articleId,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error adding news like with Drizzle:', error);
    throw error;
  }
};

export const removeNewsLikeInDb = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    await db.delete(newslike)
      .where(and(eq(newslike.user_id, userId), eq(newslike.news_article_id, articleId)));
    return true;
  } catch (error) {
    console.error('Error removing news like with Drizzle:', error);
    throw error;
  }
};

export const toggleNewsLikeInDb = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    const existingLike = await db.select()
      .from(newslike)
      .where(and(eq(newslike.user_id, userId), eq(newslike.news_article_id, articleId)))
      .limit(1);

    if (existingLike.length > 0) {
      await db.delete(newslike)
        .where(and(eq(newslike.user_id, userId), eq(newslike.news_article_id, articleId)));
      return false;
    } else {
      await db.insert(newslike).values({
        id: uuidv4(),
        user_id: userId,
        news_article_id: articleId,
        createdAt: new Date(),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling news like with Drizzle:', error);
    throw error;
  }
};

// --- News Comment Functions ---
export const addNewsCommentInDb = async (articleId: string, userId: string, content: string) => {
  try {
    console.log('[addNewsCommentInDb] Starting with articleId:', articleId, 'userId:', userId, 'content:', content);
    const newCommentId = uuidv4();
    console.log('[addNewsCommentInDb] New comment ID:', newCommentId);
    await db.insert(newscomment).values({
      id: newCommentId,
      user_id: userId,
      news_article_id: articleId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('[addNewsCommentInDb] Inserted comment');
    const newComment = await db
      .select({
        id: newscomment.id,
        content: newscomment.content,
        createdAt: newscomment.createdAt,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(newscomment)
      .leftJoin(user, eq(newscomment.user_id, user.id))
      .where(eq(newscomment.id, newCommentId))
      .then(res => res[0]);
    console.log('[addNewsCommentInDb] Retrieved comment:', newComment);
    return newComment
      ? {
          id: newComment.id,
          content: newComment.content,
          createdAt: newComment.createdAt,
          user: newComment.user || { id: '', name: 'Anonymous', image: null },
        }
      : null;
  } catch (error) {
    console.error('[addNewsCommentInDb] Error:', error);
    throw error;
  }
};

export const deleteNewsCommentFromDb = async (commentId: string): Promise<boolean> => {
  try {
    await db.delete(newscomment).where(eq(newscomment.id, commentId));
    return true;
  } catch (error) {
    console.error(`Error deleting news comment with ID "${commentId}" with Drizzle:`, error);
    return false;
  }
};

// --- Helper functions to access mock data ---
export const getAllStates = async (): Promise<State[]> => {
  return states;
};

export const getAllMinistries = async (): Promise<Ministry[]> => {
  return ministries;
};

// export const ministries = mockMinistries;
// export const states = mockStates;