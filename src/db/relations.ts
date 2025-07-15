import { relations } from 'drizzle-orm';
import { user, project, feedback, newsarticle, newscomment, newslike, bookmarkednewsarticle, bookmarkedproject, service, video, sitesetting, projecttag, tag, account, session } from '../db/schema';

// User Relations
export const userRelations = relations(user, ({ many }) => ({
  feedback: many(feedback),
  newscomments: many(newscomment),
  newslikes: many(newslike),
  bookmarkedNews: many(bookmarkednewsarticle),
  bookmarkedProjects: many(bookmarkedproject),
  accounts: many(account),
  sessions: many(session),
}));

// Project Relations
export const projectRelations = relations(project, ({ many, one }) => ({
  feedback: many(feedback),
  projectTags: many(projecttag),
  bookmarkedBy: many(bookmarkedproject),
}));

// Feedback Relations
export const feedbackRelations = relations(feedback, ({ one }) => ({
  project: one(project, {
    fields: [feedback.project_id],
    references: [project.id],
  }),
  user: one(user, {
    fields: [feedback.user_id],
    references: [user.id],
  }),
}));

// News Article Relations
export const newsArticleRelations = relations(newsarticle, ({ many }) => ({
  newscomments: many(newscomment),
  newslikes: many(newslike),
  bookmarkedBy: many(bookmarkednewsarticle),
}));

// News Comment Relations
export const newsCommentRelations = relations(newscomment, ({ one }) => ({
  newsarticle: one(newsarticle, {
    fields: [newscomment.news_article_id],
    references: [newsarticle.id],
  }),
  user: one(user, {
    fields: [newscomment.user_id],
    references: [user.id],
  }),
}));

// News Like Relations
export const newsLikeRelations = relations(newslike, ({ one }) => ({
  newsarticle: one(newsarticle, {
    fields: [newslike.news_article_id],
    references: [newsarticle.id],
  }),
  user: one(user, {
    fields: [newslike.user_id],
    references: [user.id],
  }),
}));

// Bookmarked News Article Relations
export const bookmarkedNewsArticleRelations = relations(bookmarkednewsarticle, ({ one }) => ({
  newsarticle: one(newsarticle, {
    fields: [bookmarkednewsarticle.news_article_id],
    references: [newsarticle.id],
  }),
  user: one(user, {
    fields: [bookmarkednewsarticle.user_id],
    references: [user.id],
  }),
}));

// Bookmarked Project Relations
export const bookmarkedProjectRelations = relations(bookmarkedproject, ({ one }) => ({
  project: one(project, {
    fields: [bookmarkedproject.project_id],
    references: [project.id],
  }),
  user: one(user, {
    fields: [bookmarkedproject.user_id],
    references: [user.id],
  }),
}));

// Project Tag Relations
export const projectTagRelations = relations(projecttag, ({ one }) => ({
  project: one(project, {
    fields: [projecttag.projectId],
    references: [project.id],
  }),
  tag: one(tag, {
    fields: [projecttag.tagId],
    references: [tag.id],
  }),
}));

// Tag Relations
export const tagRelations = relations(tag, ({ many }) => ({
  projectTags: many(projecttag),
}));

// Account Relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Session Relations
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Service Relations (no relations defined as per schema)
export const serviceRelations = relations(service, () => ({}));

// Video Relations (no relations defined as per schema)
export const videoRelations = relations(video, () => ({}));

// Site Settings Relations (no relations defined as per schema)
export const siteSettingsRelations = relations(sitesetting, () => ({}));