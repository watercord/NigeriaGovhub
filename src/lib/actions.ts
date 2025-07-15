"use server";
import 'dotenv/config';
import { revalidatePath } from 'next/cache';
import { summarizeFeedbackSentiment, type SummarizeFeedbackSentimentInput } from '@/ai/flows/summarize-feedback-sentiment';
import {
  addFeedbackToProject as saveFeedbackToDb,
  deleteUserById as removeUserFromDb,
  getUserProfileFromDb,
  createProjectInDb as saveProjectToDb,
  updateProjectInDb,
  deleteProjectFromDb,
  getAllProjects as fetchAllProjectsFromDb,
  getAllNewsArticles as fetchAllNewsArticlesFromDb,
  getVideoById as getVideoByIdFromDb,
  getAllServices as fetchAllServicesFromDb,
  getUsers as fetchAllUsersFromDb,
  getNewsArticleById as getNewsArticleByIdFromDb,
  getServiceById as getServiceByIdFromDb,
  getAllVideosFromDb as fetchAllVideosFromDb,
  getAllFeedbackWithProjectTitles as fetchAllFeedbackWithProjectTitlesFromDb,
  type ProjectCreationData,
  createNewsArticleInDb as saveNewsArticleToDb,
  type NewsArticleCreationData,
  updateNewsArticleInDb,
  deleteNewsArticleFromDb,
  createServiceInDb as saveServiceToDb,
  type ServiceCreationData,
  updateServiceInDb,
  deleteServiceFromDb,
  createVideoInDb as saveVideoToDb,
  type VideoCreationData,
  updateVideoInDb,
  deleteVideoFromDb,
  getSiteSettingsFromDb,
  updateSiteSettingsInDb,
  getUserDashboardStatsFromDb,
  getUserFeedbackFromDb,
  updateUserNameInDb,
  addNewsBookmarkInDb,
  removeNewsBookmarkInDb,
  isNewsArticleBookmarked,
  getUserBookmarkedNewsFromDb,
  addNewsCommentInDb,
  toggleNewsLikeInDb,
  getUserByEmail,
  getFullUserByEmail,
} from './data';
import { db } from '../db/drizzle';
import { user, project, newsarticle, service, video, verificationToken, passwordResetToken, feedback, ministry, state } from '../db/schema';
import type { Feedback as AppFeedback, User as AppUser, Project as AppProject, NewsArticle as AppNewsArticle, ServiceItem as AppServiceItem, Video as AppVideo, NewsArticleFormData, ProjectFormData, ServiceFormData, VideoFormData, SiteSettings, UserDashboardStats } from '@/types';
import type { SiteSettingsFormData } from '@/app/dashboard/admin/site-settings/page';
import { eq, and, ne, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { createHash } from 'crypto';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createVerificationToken, getVerificationTokenByToken } from './verification-token';
import { sendVerificationEmail, sendPasswordResetEmail } from './mail';
import { createPasswordResetToken, getPasswordResetTokenByToken } from './password-reset-token';

export interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  feedback?: AppFeedback;
  sentimentSummary?: string;
}

export async function submitProjectFeedback(
  projectId: string,
  formData: { userName: string; comment: string; rating?: number; userId?: string | null }
): Promise<SubmitFeedbackResult> {
  try {
    const sentimentInput: SummarizeFeedbackSentimentInput = {
      feedback: formData.comment,
    };
    const sentimentOutput = await summarizeFeedbackSentiment(sentimentInput);

    const feedbackToSave = {
      userName: formData.userName,
      comment: formData.comment,
      rating: formData.rating,
      sentimentSummary: sentimentOutput.sentimentSummary,
      userId: formData.userId || null,
    };

    const savedFeedback = await saveFeedbackToDb(projectId, feedbackToSave);

    if (!savedFeedback) {
      return { success: false, message: "Failed to save feedback to the database." };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard/admin/manage-feedback');
    revalidatePath(`/dashboard/user/feedback`);
    revalidatePath(`/dashboard/user`);

    return {
      success: true,
      message: 'Feedback submitted successfully!',
      feedback: savedFeedback,
      sentimentSummary: sentimentOutput.sentimentSummary,
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: `Failed to submit feedback: ${errorMessage}` };
  }
}

export interface DeleteUserResult {
  success: boolean;
  message: string;
}

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  try {
    const { success, error } = await removeUserFromDb(userId);

    if (success) {
      revalidatePath("/dashboard/admin/manage-users");
      return { success: true, message: "User profile deleted successfully." };
    } else {
      console.error("Drizzle delete error (user):", error);
      return { success: false, message: `Failed to delete user profile: ${error?.message || 'Unknown error'}` };
    }
  } catch (error) {
    console.error('Error in deleteUser server action:', error);
    let errorMessage = 'An unexpected error occurred while deleting the user profile.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

export async function getUserProfile(userId: string): Promise<AppUser | null> {
  try {
    const profile = await getUserProfileFromDb(userId);
    return profile;
  } catch (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return null;
  }
}

interface ActionResult<T = null> {
  success: boolean;
  message: string;
  item?: T;
  errorDetails?: string;
}

export async function addProject(
  formData: ProjectFormData
): Promise<ActionResult<AppProject>> {
  try {
    const dataToSave: ProjectCreationData = {
      title: formData.title,
      subtitle: formData.subtitle,
      ministry_id: formData.ministryId,
      state_id: formData.stateId,
      status: formData.status,
      start_date: formData.startDate,
      expected_end_date: formData.expectedEndDate ?? null,
      description: formData.description,
      budget: formData.budget ? Number(formData.budget) : null,
      expenditure: formData.expenditure ? Number(formData.expenditure) : null,
      tags: formData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    };

    const newProject = await saveProjectToDb(dataToSave);
    if (!newProject) {
      return { success: false, message: 'Failed to save project to the database.' };
    }

    revalidatePath('/projects');
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/');
    return { success: true, message: 'Project added successfully!', item: newProject };
  } catch (error) {
    console.error('Error adding project:', error);
    let errorMessage = 'An unexpected error occurred while adding the project.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Duplicate entry') && error.message.includes('title')) {
        errorMessage = 'A project with this title already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function updateProject(
  id: string,
  formData: ProjectFormData
): Promise<ActionResult<AppProject>> {
  try {
    const dataToUpdate: Partial<ProjectCreationData> = {
      title: formData.title,
      subtitle: formData.subtitle,
      ministry_id: formData.ministryId,
      state_id: formData.stateId,
      status: formData.status,
      start_date: formData.startDate,
      expected_end_date: formData.expectedEndDate,
      description: formData.description,
      budget: formData.budget !== undefined && formData.budget !== null ? Number(formData.budget) : null,
      expenditure: formData.expenditure !== undefined && formData.expenditure !== null ? Number(formData.expenditure) : null,
      tags: formData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    };

    const updatedProject = await updateProjectInDb(id, dataToUpdate);
    if (!updatedProject) {
      return { success: false, message: 'Failed to update project in the database.' };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/');
    return { success: true, message: 'Project updated successfully!', item: updatedProject };
  } catch (error) {
    console.error('Error updating project:', error);
    let errorMessage = 'An unexpected error occurred while updating the project.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Duplicate entry') && error.message.includes('title')) {
        errorMessage = 'A project with this title already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const success = await deleteProjectFromDb(id);
    if (!success) {
      return { success: false, message: 'Failed to delete project from the database.' };
    }
    revalidatePath('/projects');
    revalidatePath('/dashboard/admin/manage-projects');
    revalidatePath('/');
    return { success: true, message: 'Project deleted successfully!' };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the project.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function getProjectByIdAction(id: string): Promise<AppProject | null> {
  try {
    const projectResult = await db
      .select({
        project: {
          id: project.id,
          title: project.title,
          subtitle: project.subtitle,
          ministry_id: project.ministry_id,
          state_id: project.state_id,
          status: project.status,
          start_date: project.start_date,
          expected_end_date: project.expected_end_date,
          actual_end_date: project.actual_end_date,
          description: project.description,
          images: project.images,
          videos: project.videos,
          impact_stats: project.impact_stats,
          budget: project.budget,
          expenditure: project.expenditure,
          created_at: project.created_at,
          last_updated_at: project.last_updated_at,
        },
        ministry: {
          id: ministry.id,
          name: ministry.name,
        },
        state: {
          id: state.id,
          name: state.name,
          capital: state.capital,
        },
      })
      .from(project)
      .leftJoin(ministry, eq(project.ministry_id, ministry.id))
      .leftJoin(state, eq(project.state_id, state.id))
      .where(eq(project.id, id));

    if (!projectResult || projectResult.length === 0) return null;

    const projectData = projectResult[0];

    const feedbackResults = await db
      .select({
        id: feedback.id,
        project_id: feedback.project_id,
        user_id: feedback.user_id,
        user_name: feedback.user_name,
        comment: feedback.comment,
        rating: feedback.rating,
        sentiment_summary: feedback.sentiment_summary,
        created_at: feedback.created_at,
      })
      .from(feedback)
      .where(eq(feedback.project_id, id));

    return {
      ...projectData.project,
      ministry: projectData.ministry || { id: '', name: '' },
      state: projectData.state || { id: '', name: '', capital: null },
      startDate: projectData.project.start_date,
      expectedEndDate: projectData.project.expected_end_date,
      actualEndDate: projectData.project.actual_end_date,
      impactStats: projectData.project.impact_stats ? JSON.parse(projectData.project.impact_stats) : [],
      lastUpdatedAt: projectData.project.last_updated_at ? new Date(projectData.project.last_updated_at) : new Date(),
      tags: [],
      status: projectData.project.status as 'Planned' | 'Ongoing' | 'Completed' | 'On Hold',
      images: projectData.project.images
        ? (typeof projectData.project.images === 'string'
            ? JSON.parse(projectData.project.images)
            : projectData.project.images
          ).map((img: any) => ({
            url: img.url || '',
            alt: img.alt || '',
            dataAiHint: img.dataAiHint || undefined,
          }))
        : [],
      videos: projectData.project.videos
        ? (typeof projectData.project.videos === 'string'
            ? JSON.parse(projectData.project.videos)
            : projectData.project.videos
          ).map((video: any) => ({
            id: video.id || '',
            title: video.title || '',
            url: video.url || '',
            thumbnailUrl: video.thumbnailUrl || null,
            dataAiHint: video.dataAiHint || null,
            description: video.description || null,
            createdAt: new Date(video.createdAt),
            updatedAt: new Date(video.updatedAt),
          }))
        : undefined,
     budget: projectData.project.budget !== undefined && projectData.project.budget !== null
  ? Number(projectData.project.budget)
  : null,

  expenditure: projectData.project.expenditure !== undefined && projectData.project.expenditure !== null
  ? Number(projectData.project.expenditure)
  : null,
      feedback: feedbackResults.map(f => ({
  ...f,
  created_at: f.created_at ? new Date(f.created_at) : null,
})),

    };
  } catch (error) {
    console.error(`Error fetching project by ID ${id}:`, error);
    return null;
  }
}

export async function addNewsArticle(
  newsData: NewsArticleFormData
): Promise<ActionResult<AppNewsArticle>> {
  try {
    const existingArticle = await db
      .select()
      .from(newsarticle)
      .where(eq(newsarticle.slug, newsData.slug))
      .limit(1);

    if (existingArticle.length > 0) {
      return { success: false, message: `A news article with the slug "${newsData.slug}" already exists.` };
    }

    const dataToSave: NewsArticleCreationData = {
      title: newsData.title,
      slug: newsData.slug,
      summary: newsData.summary,
      category: newsData.category,
      publishedDate: newsData.publishedDate,
      content: newsData.content,
      imageUrl: newsData.imageUrl ?? null,
      dataAiHint: newsData.dataAiHint ?? null,
    };

    const newArticle = await saveNewsArticleToDb(dataToSave);
    if (!newArticle) {
      return { success: false, message: 'Failed to save news article to the database.' };
    }

    revalidatePath('/news');
    revalidatePath(`/news/${newArticle.slug}`);
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/');
    return { success: true, message: 'News article added successfully!', item: newArticle };
  } catch (error) {
    console.error('Error adding news article:', error);
    let errorMessage = 'An unexpected error occurred while adding the news article.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Duplicate entry') && error.message.includes('slug')) {
        errorMessage = 'A news article with this slug already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function updateNewsArticle(
  id: string,
  newsData: NewsArticleFormData
): Promise<ActionResult<AppNewsArticle>> {
  try {
    if (newsData.slug) {
      const existingArticle = await db
        .select()
        .from(newsarticle)
        .where(and(eq(newsarticle.slug, newsData.slug), ne(newsarticle.id, id)))
        .limit(1);

      if (existingArticle.length > 0) {
        return { success: false, message: `Another news article with the slug "${newsData.slug}" already exists.` };
      }
    }

    const dataToUpdate: Partial<NewsArticleCreationData> = {
      title: newsData.title,
      slug: newsData.slug,
      summary: newsData.summary,
      category: newsData.category,
      publishedDate: newsData.publishedDate,
      content: newsData.content,
      imageUrl: newsData.imageUrl,
      dataAiHint: newsData.dataAiHint,
    };

    const updatedArticle = await updateNewsArticleInDb(id, dataToUpdate);
    if (!updatedArticle) {
      return { success: false, message: 'Failed to update news article in the database.' };
    }

    revalidatePath('/news');
    revalidatePath(`/news/${updatedArticle.slug}`);
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/');
    return { success: true, message: 'News article updated successfully!', item: updatedArticle };
  } catch (error) {
    console.error('Error updating news article:', error);
    let errorMessage = 'An unexpected error occurred while updating the news article.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Duplicate entry') && error.message.includes('slug')) {
        errorMessage = 'A news article with this slug already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function deleteNewsArticle(id: string): Promise<ActionResult> {
  try {
    const success = await deleteNewsArticleFromDb(id);
    if (!success) {
      return { success: false, message: 'Failed to delete news article from the database.' };
    }

    revalidatePath('/news');
    revalidatePath('/dashboard/admin/manage-news');
    revalidatePath('/');
    return { success: true, message: 'News article deleted successfully!' };
  } catch (error) {
    console.error('Error deleting news article:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the news article.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function addService(
  serviceData: ServiceFormData
): Promise<ActionResult<AppServiceItem>> {
  try {
    const existingService = await db
      .select()
      .from(service)
      .where(eq(service.slug, serviceData.slug))
      .limit(1);

    if (existingService.length > 0) {
      return { success: false, message: `A service with the slug "${serviceData.slug}" already exists.` };
    }

    const dataToSave: ServiceCreationData = {
      title: serviceData.title,
      slug: serviceData.slug,
      summary: serviceData.summary,
      category: serviceData.category,
      link: serviceData.link ?? null,
      imageUrl: serviceData.imageUrl ?? null,
      dataAiHint: serviceData.dataAiHint ?? null,
      iconName: serviceData.iconName ?? null,
    };

    const newService = await saveServiceToDb(dataToSave);
    if (!newService) {
      return { success: false, message: 'Failed to save service to the database.' };
    }

    revalidatePath('/services');
    revalidatePath(`/services/${newService.slug}`);
    revalidatePath('/dashboard/admin/manage-services');
    revalidatePath('/');
    return { success: true, message: 'Service added successfully!', item: newService };
  } catch (error) {
    console.error('Error adding service:', error);
    let errorMessage = 'An unexpected error occurred while adding the service.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Duplicate entry') && error.message.includes('slug')) {
        errorMessage = 'A service with this slug already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function updateService(
  id: string,
  serviceData: ServiceFormData
): Promise<ActionResult<AppServiceItem>> {
  try {
    if (serviceData.slug) {
      const existingService = await db
        .select()
        .from(service)
        .where(and(eq(service.slug, serviceData.slug), ne(service.id, id)))
        .limit(1);

      if (existingService.length > 0) {
        return { success: false, message: `Another service with the slug "${serviceData.slug}" already exists.` };
      }
    }

    const dataToUpdate: Partial<ServiceCreationData> = {
      title: serviceData.title,
      slug: serviceData.slug,
      summary: serviceData.summary,
      category: serviceData.category,
      link: serviceData.link ?? null,
      imageUrl: serviceData.imageUrl ?? null,
      dataAiHint: serviceData.dataAiHint ?? null,
      iconName: serviceData.iconName ?? null,
    };

    const updatedService = await updateServiceInDb(id, dataToUpdate);
    if (!updatedService) {
      return { success: false, message: 'Failed to update service in the database.' };
    }

    revalidatePath('/services');
    revalidatePath(`/services/${updatedService.slug}`);
    revalidatePath('/dashboard/admin/manage-services');
    revalidatePath('/');
    return { success: true, message: 'Service updated successfully!', item: updatedService };
  } catch (error) {
    console.error('Error updating service:', error);
    let errorMessage = 'An unexpected error occurred while updating the service.';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Duplicate entry') && error.message.includes('slug')) {
        errorMessage = 'A service with this slug already exists.';
      }
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const success = await deleteServiceFromDb(id);
    if (!success) {
      return { success: false, message: 'Failed to delete service from the database.' };
    }

    revalidatePath('/services');
    revalidatePath('/dashboard/admin/manage-services');
    revalidatePath('/');
    return { success: true, message: 'Service deleted successfully!' };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the service.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function fetchAllProjectsAction(): Promise<AppProject[]> {
  try {
    return await fetchAllProjectsFromDb();
  } catch (error) {
    console.error("Error fetching all projects in action:", error);
    throw new Error("Failed to fetch projects via action.");
  }
}

export async function addVideo(
  videoData: VideoFormData
): Promise<ActionResult<AppVideo>> {
  try {
    const dataToSave: VideoCreationData = {
      title: videoData.title,
      url: videoData.url,
      thumbnailUrl: videoData.thumbnailUrl ?? null,
      dataAiHint: videoData.dataAiHint ?? null,
      description: videoData.description ?? null,
    };

    const newVideo = await saveVideoToDb(dataToSave);
    if (!newVideo) {
      return { success: false, message: 'Failed to save video to the database.' };
    }

    revalidatePath('/dashboard/admin/manage-videos');
    revalidatePath('/');
    return { success: true, message: 'Video added successfully!', item: newVideo };
  } catch (error) {
    console.error('Error adding video:', error);
    let errorMessage = 'An unexpected error occurred while adding the video.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function getVideoByIdAction(id: string): Promise<AppVideo | null> {
  try {
    const video = await getVideoByIdFromDb(id);
    return video;
  } catch (error) {
    console.error(`Error in getVideoByIdAction for ID ${id}:`, error);
    return null;
  }
}

export async function updateVideo(
  id: string,
  videoData: Partial<VideoFormData>
): Promise<{ success: boolean; message: string; errorDetails?: any }> {
  try {
    const dataToUpdate: Partial<VideoCreationData> = {
      title: videoData.title,
      url: videoData.url,
      thumbnailUrl: videoData.thumbnailUrl,
      dataAiHint: videoData.dataAiHint,
      description: videoData.description,
    };

    const updatedVideo = await updateVideoInDb(id, dataToUpdate);
    if (!updatedVideo) {
      return { success: false, message: 'Failed to update video in the database.' };
    }

    revalidatePath('/dashboard/admin/manage-videos');
    revalidatePath('/');
    return { success: true, message: 'Video updated successfully!' };
  } catch (error) {
    console.error('Error updating video:', error);
    return { success: false, message: 'An unexpected error occurred while updating video.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  try {
    const success = await deleteVideoFromDb(id);
    if (!success) {
      return { success: false, message: 'Failed to delete video from the database.' };
    }

    revalidatePath('/dashboard/admin/manage-videos');
    revalidatePath('/');
    return { success: true, message: 'Video deleted successfully!' };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the video.', errorDetails: error instanceof Error ? error.stack : undefined };
  }
}

export async function fetchAdminDashboardStats() {
  try {
    const [projectCount, userCount, newsCount, serviceCount, videoCount] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)`.as('count') }).from(project).then(r => r[0].count),
      db.select({ count: sql<number>`COUNT(*)`.as('count') }).from(user).then(r => r[0].count),
      db.select({ count: sql<number>`COUNT(*)`.as('count') }).from(newsarticle).then(r => r[0].count),
      db.select({ count: sql<number>`COUNT(*)`.as('count') }).from(service).then(r => r[0].count),
      db.select({ count: sql<number>`COUNT(*)`.as('count') }).from(video).then(r => r[0].count),
    ]);

    return { totalProjects: projectCount, totalUsers: userCount, totalNewsArticles: newsCount, totalServices: serviceCount, totalVideos: videoCount };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw new Error("Failed to load dashboard statistics.");
  }
}

interface SiteSettingsResult extends ActionResult {
  settings?: SiteSettings | null;
}

export async function fetchSiteSettingsAction(): Promise<SiteSettings | null> {
  try {
    return await getSiteSettingsFromDb();
  } catch (error) {
    console.error("Error fetching site settings via action:", error);
    return null;
  }
}

export async function updateSiteSettingsAction(
  formData: SiteSettingsFormData
): Promise<SiteSettingsResult> {
  try {
    const settingsToSave: Partial<SiteSettings> = {
      siteName: formData.siteName ?? undefined,
      contactEmail: formData.contactEmail ?? undefined,
      footerMessage: formData.footerMessage ?? undefined,
    };
    const updatedSettings = await updateSiteSettingsInDb(settingsToSave);
    if (!updatedSettings) {
      return { success: false, message: 'Failed to save site settings to the database.' };
    }
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/dashboard/admin/site-settings');

    return { success: true, message: 'Site settings updated successfully!', settings: updatedSettings };
  } catch (error) {
    console.error('Error updating site settings via action:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while saving site settings.',
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export interface CreateUserResult {
  success: boolean;
  message: string;
}

export async function createUserAction(data: { name: string; email: string; password?: string }): Promise<CreateUserResult> {
  try {
    const existingUser = await getFullUserByEmail(data.email);
    if (existingUser) {
      return { success: false, message: "An account with this email already exists." };
    }

    let hashedPassword = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    } else {
      return { success: false, message: "Password is required for credentials signup." };
    }

    const sanitizedEmail = data.email.trim().toLowerCase();
    const hash = createHash('md5').update(sanitizedEmail).digest('hex');
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=mp`;

    const userId = crypto.randomUUID();
    await db
      .insert(user)
      .values({
        id: userId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        updated_at: new Date(),
        image: gravatarUrl,
      })
      .execute();

    const [newUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!newUser) {
      return { success: false, message: "Failed to retrieve newly created user." };
    }

    const verificationToken = await createVerificationToken(data.email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    return { success: true, message: "Verification email sent! Please check your inbox." };
  } catch (error) {
    console.error("Error creating user:", error);
    let errorMessage = "An unexpected error occurred during user creation.";
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry') && error.message.includes('email')) {
        errorMessage = 'An account with this email already exists.';
      } else {
        errorMessage = error.message;
      }
    }
    return { success: false, message: errorMessage };
  }
}

export async function newVerificationAction(token: string): Promise<{ success?: string; error?: string }> {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await db
    .update(user)
    .set({ emailVerified: new Date(), email: existingToken.identifier })
    .where(eq(user.id, existingUser.id));

  await db.delete(verificationToken).where(eq(verificationToken.token, existingToken.token));

  return { success: "Email verified successfully!" };
}

export async function fetchAllNewsArticlesAction(): Promise<AppNewsArticle[]> {
  try {
    return await fetchAllNewsArticlesFromDb();
  } catch (error) {
    console.error("Error fetching all news articles in action:", error);
    throw new Error("Failed to fetch news articles via action.");
  }
}

export async function fetchAllServicesAction(): Promise<AppServiceItem[]> {
  try {
    return await fetchAllServicesFromDb();
  } catch (error) {
    console.error("Error fetching all services in action:", error);
    throw new Error("Failed to fetch services via action.");
  }
}

export async function fetchAllUsersAction(): Promise<AppUser[]> {
  try {
    return await fetchAllUsersFromDb();
  } catch (error) {
    console.error("Error fetching all users in action:", error);
    throw new Error("Failed to fetch users via action.");
  }
}

export async function fetchAllVideosAction(): Promise<AppVideo[]> {
  try {
    return await fetchAllVideosFromDb();
  } catch (error) {
    console.error("Error fetching all videos in action:", error);
    throw new Error("Failed to fetch videos via action.");
  }
}

export async function fetchAllFeedbackWithProjectTitlesAction(): Promise<Array<AppFeedback & { projectTitle: string }>> {
  try {
    return await fetchAllFeedbackWithProjectTitlesFromDb();
  } catch (error) {
    console.error("Error fetching all feedback in action:", error);
    throw new Error("Failed to fetch feedback via action.");
  }
}

export async function getUserDashboardStatsAction(): Promise<UserDashboardStats> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  try {
    return await getUserDashboardStatsFromDb(session.user.id);
  } catch (error) {
    console.error("Error getting user dashboard stats:", error);
    return {
      feedbackSubmitted: 0,
      bookmarkedProjects: 0,
      bookmarkedNews: 0,
      averageRating: 0,
    };
  }
}

export async function getUserFeedbackAction(): Promise<Array<AppFeedback & { projectTitle: string; projectId: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  try {
    return await getUserFeedbackFromDb(session.user.id);
  } catch (error) {
    console.error("Error getting user feedback:", error);
    return [];
  }
}

export async function updateUserNameAction(newName: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "User not authenticated" };
  }
  try {
    const updatedUser = await updateUserNameInDb(session.user.id, newName);
    if (!updatedUser) {
      return { success: false, message: "Failed to update user name in database." };
    }
    revalidatePath('/dashboard/user/profile');
    revalidatePath('/dashboard/user');

    return { success: true, message: "Name updated successfully." };
  } catch (error) {
    console.error("Error updating user name:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function getUserBookmarkedNewsAction(): Promise<AppNewsArticle[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  try {
    return await getUserBookmarkedNewsFromDb(session.user.id);
  } catch (error) {
    console.error("Error getting user bookmarked news:", error);
    return [];
  }
}

export async function checkNewsBookmarkStatusAction(articleId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return false;
  }
  return await isNewsArticleBookmarked(session.user.id, articleId);
}

export async function toggleNewsBookmarkAction(articleId: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to bookmark articles." };
  }

  try {
    const isBookmarked = await isNewsArticleBookmarked(session.user.id, articleId);

    if (isBookmarked) {
      await removeNewsBookmarkInDb(session.user.id, articleId);
      revalidatePath(`/dashboard/user/bookmarked-news`);
      revalidatePath(`/dashboard/user`);
      return { success: true, message: "Article removed from bookmarks." };
    } else {
      await addNewsBookmarkInDb(session.user.id, articleId);
      revalidatePath(`/dashboard/user/bookmarked-news`);
      revalidatePath(`/dashboard/user`);
      return { success: true, message: "Article added to bookmarks." };
    }
  } catch (error) {
    console.error("Error toggling news bookmark:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function addNewsCommentAction(articleId: string, content: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to comment." };
  }

  if (!content || content.trim().length < 3) {
    return { success: false, message: "Comment must be at least 3 characters long." };
  }

  try {
    await addNewsCommentInDb(articleId, session.user.id, content);

    const [article] = await db.select({ slug: newsarticle.slug }).from(newsarticle).where(eq(newsarticle.id, articleId));
    if (article) {
      revalidatePath(`/news/${article.slug}`);
    }

    return { success: true, message: "Comment added." };
  } catch (error) {
    console.error("Error adding news comment:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function toggleNewsLikeAction(articleId: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to like articles." };
  }

  try {
    await toggleNewsLikeInDb(articleId, session.user.id);

    const [article] = await db.select({ slug: newsarticle.slug }).from(newsarticle).where(eq(newsarticle.id, articleId));
    if (article) {
      revalidatePath(`/news/${article.slug}`);
    }

    return { success: true, message: "Like status updated." };
  } catch (error) {
    console.error("Error toggling news like:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function resetAction(email: string): Promise<{ success?: string; error?: string }> {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "No account found with that email." };
  }

  const passwordResetToken = await createPasswordResetToken(email);
  await sendPasswordResetEmail(passwordResetToken.identifier, passwordResetToken.token);

  return { success: "Password reset email sent!" };
}

export async function newPasswordAction(password: string, token: string | null): Promise<{ success?: string; error?: string }> {
  if (!token) {
    return { error: "Missing token!" };
  }

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired." };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);

  if (!existingUser) {
    return { error: "No account found for this token." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.update(user).set({ password: hashedPassword }).where(eq(user.id, existingUser.id));

  await db.delete(passwordResetToken).where(eq(passwordResetToken.token, existingToken.token));

  return { success: "Password updated successfully!" };
}

export async function fetchHomepageDataAction() {
  try {
    const [projectsData, newsData, servicesData, videosData] = await Promise.all([
      fetchAllProjectsFromDb(),
      fetchAllNewsArticlesFromDb(),
      fetchAllServicesFromDb(),
      fetchAllVideosFromDb(),
    ]);

    return {
      projects: projectsData.slice(0, 3),
      news: newsData.slice(0, 3),
      services: servicesData.slice(0, 3),
      videos: videosData.slice(0, 3),
      allVideosCount: videosData.length,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      projects: [],
      news: [],
      services: [],
      videos: [],
      allVideosCount: 0,
      error: "Failed to load page data.",
    };
  }
}

export async function getNewsArticleByIdAction(id: string): Promise<AppNewsArticle | null> {
  try {
    const article = await getNewsArticleByIdFromDb(id);
    return article;
  } catch (error) {
    console.error(`Error in getNewsArticleByIdAction for ID ${id}:`, error);
    return null;
  }
}

export async function getServiceByIdAction(id: string): Promise<AppServiceItem | null> {
  try {
    const service = await getServiceByIdFromDb(id);
    return service;
  } catch (error) {
    console.error(`Error in getServiceByIdAction for ID ${id}:`, error);
    return null;
  }
}