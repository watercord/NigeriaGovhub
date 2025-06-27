
"use server";

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
  getAllServices as fetchAllServicesFromDb,
  getUsers as fetchAllUsersFromDb,
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
  addNewsCommentToDb,
  toggleNewsLikeInDb,
  getUserByEmail,
  getFullUserByEmail
} from './data';
import type { Feedback as AppFeedback, User as AppUser, Project as AppProject, NewsArticle as AppNewsArticle, ServiceItem as AppServiceItem, Video as AppVideo, NewsArticleFormData, ProjectFormData, ServiceFormData, VideoFormData, SiteSettings, UserDashboardStats } from '@/types';
import type { SiteSettingsFormData } from '@/app/dashboard/admin/site-settings/page';
import prisma from './prisma';
import { Prisma } from '@prisma/client';
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
  formData: { userName: string; comment: string; rating?: number; userId?: string | null; }
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
      console.error("Prisma delete error (public.users):", error);
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
  expected_end_date: formData.expectedEndDate ?? null, // Explicitly set to null for new projects
  description: formData.description,
  budget: formData.budget ? Number(formData.budget) : undefined,
 expenditure: formData.expenditure ? Number(formData.expenditure) : undefined,
  tags: formData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
  images: [],
  videos: [],
  impact_stats: [],
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
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('title')) {
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
      budget:
  formData.budget !== undefined && formData.budget !== null
    ? Number(formData.budget)
    : undefined,

expenditure:
  formData.expenditure !== undefined && formData.expenditure !== null
    ? Number(formData.expenditure)
    : undefined,
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
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('title')) {
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


export async function addNewsArticle(
  newsData: NewsArticleFormData
): Promise<ActionResult<AppNewsArticle>> {
  try {
    const existingArticleBySlug = await prisma.newsarticle.findUnique({ where: { slug: newsData.slug }});
    if (existingArticleBySlug) {
      return { success: false, message: `A news article with the slug "${newsData.slug}" already exists.`};
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
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
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
      const existingArticleBySlug = await prisma.newsarticle.findFirst({
        where: {
          slug: newsData.slug,
          id: { not: id }
        }
      });
      if (existingArticleBySlug) {
        return { success: false, message: `Another news article with the slug "${newsData.slug}" already exists.`};
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
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
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
    const existingServiceBySlug = await prisma.service.findUnique({ where: { slug: serviceData.slug } });
    if (existingServiceBySlug) {
      return { success: false, message: `A service with the slug "${serviceData.slug}" already exists.` };
    }

    const dataToSave: ServiceCreationData = {
      id: crypto.randomUUID(),
      updatedAt: new Date(),
      title: serviceData.title,
      slug: serviceData.slug,
      // updatedAt: serviceData.updatedAt,
      summary: serviceData.summary,
      category: serviceData.category,
      link: serviceData.link,
      imageUrl: serviceData.imageUrl,
      dataAiHint: serviceData.dataAiHint ?? null,
      iconName: serviceData.iconName,
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
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
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
      const existingServiceBySlug = await prisma.service.findFirst({
        where: {
          slug: serviceData.slug,
          id: { not: id }
        }
      });
      if (existingServiceBySlug) {
        return { success: false, message: `Another service with the slug "${serviceData.slug}" already exists.` };
      }
    }

    const dataToUpdate: Partial<ServiceCreationData> = {
      title: serviceData.title,
      slug: serviceData.slug,
      summary: serviceData.summary,
      category: serviceData.category,
      link: serviceData.link,
      imageUrl: serviceData.imageUrl,
      dataAiHint: serviceData.dataAiHint,
      iconName: serviceData.iconName,
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
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
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
      id: crypto.randomUUID(),
      updatedAt: new Date(),
      title: videoData.title,
      url: videoData.url,
      thumbnailUrl: videoData.thumbnailUrl ?? null,
      dataAiHint: videoData.dataAiHint ?? null,
      description: videoData.description ?? null,
    }

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

export async function updateVideo(
  id: string,
  videoData: VideoFormData
): Promise<ActionResult<AppVideo>> {
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
    return { success: true, message: 'Video updated successfully!', item: updatedVideo };
  } catch (error) {
    console.error('Error updating video:', error);
    let errorMessage = 'An unexpected error occurred while updating the video.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage, errorDetails: error instanceof Error ? error.stack : undefined };
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


// --- Admin Dashboard Stats ---
export async function fetchAdminDashboardStats() {
  try {
    const totalProjects = await prisma.project.count();
    const totalUsers = await prisma.user.count();
    const totalNewsArticles = await prisma.newsarticle.count();
    const totalServices = await prisma.service.count();
    const totalVideos = await prisma.video.count();
    return { totalProjects, totalUsers, totalNewsArticles, totalServices, totalVideos };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw new Error("Failed to load dashboard statistics.");
  }
}

// --- Site Settings Actions ---
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
      siteName: formData.siteName,
      maintenanceMode: formData.maintenanceMode,
      contactEmail: formData.contactEmail,
      footerMessage: formData.footerMessage,
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
      errorDetails: error instanceof Error ? error.stack : undefined
    };
  }
}

// --- User Creation Action for Credentials Signup ---
interface CreateUserResult {
  success: boolean;
  message: string;
}

export async function createUserAction(data: { name: string; email: string; password?: string }): Promise<CreateUserResult> {
  try {
    let existingUser;
    try {
       existingUser = await getUserByEmail(data.email);
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2020') {
            return { success: false, message: "An account with this email already exists but has a data issue. Please try logging in with your original method (e.g., Google) or contact support." };
        }
        throw e;
    }

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

    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        password: hashedPassword,
        updated_at: new Date(),
        image: gravatarUrl,

      },
    });

    const verificationToken = await createVerificationToken(data.email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    return { success: true, message: "Verification email sent! Please check your inbox." };
  } catch (error) {
    console.error("Error creating user:", error);
    let errorMessage = "An unexpected error occurred during user creation.";
    if (error instanceof Error) {
        if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
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

  await prisma.user.update({
      where: { id: existingUser.id },
      data: {
          emailVerified: new Date(),
          email: existingToken.identifier,
      }
  });

  await prisma.verificationToken.delete({
      where: { token: existingToken.token }
  });

  return { success: "Email verified successfully!" };
}


// --- Server Actions for Fetching Data for Admin Pages ---
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

// --- NEW Server Actions for User Dashboard ---

export async function getUserDashboardStatsAction(): Promise<UserDashboardStats> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  try {
    return await getUserDashboardStatsFromDb(session.user.id);
  } catch (error) {
    console.error("Error getting user dashboard stats:", error);
    // Return default/empty stats on error
    return {
      feedbackSubmitted: 0,
      bookmarkedProjects: 0,
      bookmarkedNews: 0,
      averageRating: 0,
    };
  }
}

export async function getUserFeedbackAction(): Promise<Array<AppFeedback & { projectTitle: string, projectId: string }>> {
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

export async function updateUserNameAction(newName: string): Promise<{ success: boolean; message: string; }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "User not authenticated" };
  }
  try {
    const updatedUser = await updateUserNameInDb(session.user.id, newName);
    if (!updatedUser) {
        return { success: false, message: "Failed to update user name in database." };
    }
    // Revalidate paths that show user name
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

export async function toggleNewsBookmarkAction(articleId: string): Promise<{ success: boolean; message: string; }> {
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


// --- NEW Server Actions for News Comments and Likes ---

export async function addNewsCommentAction(articleId: string, content: string): Promise<{ success: boolean; message: string; }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to comment." };
  }

  if (!content || content.trim().length < 3) {
    return { success: false, message: "Comment must be at least 3 characters long." };
  }

  try {
    await addNewsCommentToDb(articleId, session.user.id, content);

    const article = await prisma.newsarticle.findUnique({ where: { id: articleId }, select: { slug: true } });
    if (article) {
      revalidatePath(`/news/${article.slug}`);
    }

    return { success: true, message: "Comment added." };
  } catch (error) {
    console.error("Error adding news comment:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function toggleNewsLikeAction(articleId: string): Promise<{ success: boolean; message: string; }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to like articles." };
  }

  try {
    await toggleNewsLikeInDb(articleId, session.user.id);

    const article = await prisma.newsarticle.findUnique({ where: { id: articleId }, select: { slug: true } });
    if (article) {
      revalidatePath(`/news/${article.slug}`);
    }

    return { success: true, message: "Like status updated." };
  } catch (error) {
    console.error("Error toggling news like:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// --- Forgot/Reset Password Actions ---

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

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated successfully!" };
}
// function createHash(arg0: string) {
//   throw new Error('Function not implemented.');
// }

