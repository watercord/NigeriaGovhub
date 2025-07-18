import type { Feedback as AppFeedback } from '@/types/server';

export interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  feedback?: AppFeedback;
  sentimentSummary?: string;
}

export interface DeleteUserResult {
  success: boolean;
  message: string;
}

export interface CreateUserResult {
  success: boolean;
  message: string;
}

// interface ActionResult<T = null> {
//   success: boolean;
//   message: string;
//   item?: T;
//   errorDetails?: string;
// }

// interface SiteSettingsResult extends ActionResult {
//   settings?: SiteSettings | null;
// }
