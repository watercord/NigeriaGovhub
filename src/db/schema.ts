import { mysqlTableCreator, varchar, text, datetime, decimal, int, boolean, index, uniqueIndex, unique, foreignKey } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Create a table factory with no prefix to match existing table names
const mysqlTable = mysqlTableCreator((name) => name);

export const ministry = mysqlTable('ministry', {
  id: varchar('id', { length: 255 }).primaryKey(), // Remove $defaultFn
  name: varchar('name', { length: 255 }).notNull(),
});

export const state = mysqlTable('state', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  capital: varchar('capital', { length: 255 }),
});

// User table
export const user = mysqlTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  emailVerified: datetime('emailVerified'),
  image: varchar('image', { length: 255 }),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 255 }).default('user'),
  created_at: datetime('created_at').default(sql`NOW()`),
  updated_at: datetime('updated_at'),
}, (table) => ({
  emailIdx: index('idx_user_email').on(table.email),
}));

// Account table
export const account = mysqlTable('account', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: int('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => ({
  userIdIdx: index('idx_account_userId').on(table.userId),
  providerProviderAccountIdIdx: uniqueIndex('idx_account_provider_providerAccountId').on(table.provider, table.providerAccountId),
}));

// Session table
export const session = mysqlTable('session', {
  id: varchar('id', { length: 255 }).primaryKey(),
  sessionToken: varchar('sessionToken', { length: 255 }).unique(),
  userId: varchar('userId', { length: 255 }).notNull(),
  expires: datetime('expires').notNull(),
}, (table) => ({
  sessionTokenIdx: index('idx_session_sessionToken').on(table.sessionToken),
  userIdIdx: index('idx_session_userId').on(table.userId),
}));

// VerificationToken table
export const verificationToken = mysqlTable('verificationToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: datetime('expires').notNull(),
}, (table) => ({
  tokenIdx: index('idx_verificationToken_token').on(table.token),
  identifierTokenIdx: uniqueIndex('idx_verificationToken_identifier_token').on(table.identifier, table.token),
}));

// PasswordResetToken table
export const passwordResetToken = mysqlTable('passwordResetToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: datetime('expires').notNull(),
}, (table) => ({
  tokenIdx: index('idx_passwordResetToken_token').on(table.token),
  identifierTokenIdx: uniqueIndex('idx_passwordResetToken_identifier_token').on(table.identifier, table.token),
}));

// Newsarticle table
export const newsarticle = mysqlTable('newsarticle', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  imageUrl: varchar('imageUrl', { length: 255 }),
  dataAiHint: varchar('dataAiHint', { length: 255 }),
  category: varchar('category', { length: 255 }).notNull(),
  publishedDate: datetime('publishedDate').notNull(),
  content: text('content').notNull(),
  createdAt: datetime('createdAt').default(sql`NOW()`),
  updatedAt: datetime('updatedAt').default(sql`NOW()`),
}, (table) => ({
  slugIdx: unique('newsarticle_slug_unique').on(table.slug),
}));

// Bookmarkednewsarticle table
export const bookmarkednewsarticle = mysqlTable('bookmarkednewsarticle', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  news_article_id: varchar('news_article_id', { length: 36 }).notNull(),
  createdAt: datetime('createdAt').default(sql`NOW()`),
}, (table) => ({
  userNewsIdx: unique('idx_bookmarkednewsarticle_user_news').on(table.user_id, table.news_article_id),
}));
// Newscomment table
export const newscomment = mysqlTable('newscomment', {
  id: varchar('id', { length: 36 }).primaryKey(),
  content: text('content').notNull(),
  news_article_id: varchar('news_article_id', { length: 36 }).notNull(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  createdAt: datetime('createdAt').default(sql`NOW()`),
  updatedAt: datetime('updatedAt').default(sql`NOW()`),
}, (table) => ({
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [user.id],
  }).onDelete('cascade'),
  newsArticleFk: foreignKey({
    columns: [table.news_article_id],
    foreignColumns: [newsarticle.id],
  }).onDelete('cascade'),
}));

// Newslike table
export const newslike = mysqlTable('newslike', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  news_article_id: varchar('news_article_id', { length: 36 }).notNull(),
  createdAt: datetime('createdAt').default(sql`NOW()`),
}, (table) => [
  uniqueIndex('idx_newslike_user_news').on(table.user_id, table.news_article_id),
]);

// Project table
export const project = mysqlTable('project', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }).notNull(),
  ministry_id: varchar('ministry_id', { length: 255 }),
  state_id: varchar('state_id', { length: 255 }),
  status: varchar('status', { length: 255 }).notNull(),
  start_date: datetime('start_date').notNull(),
  expected_end_date: datetime('expected_end_date'),
  actual_end_date: datetime('actual_end_date'),
  description: text('description').notNull(),
  images: text('images'),
  videos: text('videos'),
  impact_stats: text('impact_stats'),
  budget: varchar('budget', { length: 255 }),
  expenditure: varchar('expenditure', { length: 255 }),
  created_at: datetime('created_at').default(sql`NOW()`),
  last_updated_at: datetime('last_updated_at').default(sql`NOW()`),
}, (table) => [
  index('idx_project_ministry').on(table.ministry_id),
  index('idx_project_state').on(table.state_id),
]);

// Feedback table
export const feedback = mysqlTable('Feedback', {
  id: varchar('id', { length: 255 }).primaryKey(),
  project_id: varchar('project_id', { length: 255 }).notNull(),
  user_id: varchar('user_id', { length: 255 }),
  user_name: varchar('user_name', { length: 255 }).notNull(),
  comment: text('comment').notNull(),
  rating: int('rating'),
  sentiment_summary: varchar('sentiment_summary', { length: 255 }),
  created_at: datetime('created_at').default(sql`NOW()`),
}, (table) => ({
  projectIdx: index('idx_feedback_project').on(table.project_id),
  userIdx: index('idx_feedback_user').on(table.user_id),
}));

// Projecttag table
export const projecttag = mysqlTable('projecttag', {
  projectId: varchar('projectId', { length: 255 }).notNull(),
  tagId: int('tagId').notNull(),
}, (table) => [
  uniqueIndex('idx_projecttag_project_tag').on(table.projectId, table.tagId),
]);

// Tag table
export const tag = mysqlTable('tag', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

// Service table
export const service = mysqlTable('service', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  iconName: varchar('iconName', { length: 255 }),
  link: varchar('link', { length: 255 }),
  category: varchar('category', { length: 255 }).notNull(),
  imageUrl: varchar('imageUrl', { length: 255 }),
  dataAiHint: varchar('dataAiHint', { length: 255 }),
  createdAt: datetime('createdAt').default(sql`NOW()`),
  updatedAt: datetime('updatedAt').default(sql`NOW()`),
}, (table) => [
  index('idx_service_slug').on(table.slug),
]);

// Video table
export const video = mysqlTable('video', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  thumbnailUrl: varchar('thumbnailUrl', { length: 255 }),
  dataAiHint: varchar('dataAiHint', { length: 255 }),
  description: text('description'),
  createdAt: datetime('createdAt').default(sql`NOW()`),
  updatedAt: datetime('updatedAt').default(sql`NOW()`),
});

// Sitesetting table
export const sitesetting = mysqlTable('sitesetting', {
  id: varchar('id', { length: 255 }).primaryKey(),
  siteName: varchar('siteName', { length: 255 }).notNull(),
  maintenanceMode: boolean('maintenanceMode').notNull().default(false),
  contactEmail: varchar('contactEmail', { length: 255 }).notNull(),
  footerMessage: text('footerMessage').notNull(),
  updatedAt: datetime('updatedAt').default(sql`NOW()`),
});

// Bookmarkedproject table
export const bookmarkedproject = mysqlTable('bookmarkedproject', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  project_id: varchar('project_id', { length: 255 }).notNull(),
  createdAt: datetime('createdAt').default(sql`NOW()`),
}, (table) => ({
  userProjectIdx: uniqueIndex('idx_bookmarkedproject_user_project').on(table.user_id, table.project_id),
}));

// Type exports for use in application
export type User = InferSelectModel<typeof user>;
export type UserInsert = InferInsertModel<typeof user>;
export type Account = InferSelectModel<typeof account>;
export type AccountInsert = InferInsertModel<typeof account>;
export type Session = InferSelectModel<typeof session>;
export type SessionInsert = InferInsertModel<typeof session>;
export type VerificationToken = InferSelectModel<typeof verificationToken>;
export type VerificationTokenInsert = InferInsertModel<typeof verificationToken>;
export type PasswordResetToken = InferSelectModel<typeof passwordResetToken>;
export type PasswordResetTokenInsert = InferInsertModel<typeof passwordResetToken>;
export type NewsArticle = InferSelectModel<typeof newsarticle>;
export type NewsArticleInsert = InferInsertModel<typeof newsarticle>;
export type BookmarkedNewsArticle = InferSelectModel<typeof bookmarkednewsarticle>;
export type BookmarkedNewsArticleInsert = InferInsertModel<typeof bookmarkednewsarticle>;
export type NewsComment = InferSelectModel<typeof newscomment>;
export type NewsCommentInsert = InferInsertModel<typeof newscomment>;
export type NewsLike = InferSelectModel<typeof newslike>;
export type NewsLikeInsert = InferInsertModel<typeof newslike>;
export type Project = InferSelectModel<typeof project>;
export type ProjectInsert = InferInsertModel<typeof project>;
export type Feedback = InferSelectModel<typeof feedback>;
export type FeedbackInsert = InferInsertModel<typeof feedback>;
export type ProjectTag = InferSelectModel<typeof projecttag>;
export type ProjectTagInsert = InferInsertModel<typeof projecttag>;
export type Tag = InferSelectModel<typeof tag>;
export type TagInsert = InferInsertModel<typeof tag>;
export type Service = InferSelectModel<typeof service>;
export type ServiceInsert = InferInsertModel<typeof service>;
export type Video = InferSelectModel<typeof video>;
export type VideoInsert = InferInsertModel<typeof video>;
export type SiteSetting = InferSelectModel<typeof sitesetting>;
export type SiteSettingInsert = InferInsertModel<typeof sitesetting>;
export type BookmarkedProject = InferSelectModel<typeof bookmarkedproject>;
export type BookmarkedProjectInsert = InferInsertModel<typeof bookmarkedproject>;

// Note: Relations are defined in a separate `relations.ts` file