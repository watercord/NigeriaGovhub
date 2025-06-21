import type { Feedback } from '@/types';
import { FeedbackItem } from './feedback-item';

interface FeedbackListProps {
  feedbackItems: Feedback[];
}

export function FeedbackList({ feedbackItems }: FeedbackListProps) {
  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No feedback yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  // Sort feedback by newest first
  const sortedFeedback = [...feedbackItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      {sortedFeedback.map(item => (
        <FeedbackItem key={item.id} feedback={item} />
      ))}
    </div>
  );
}
