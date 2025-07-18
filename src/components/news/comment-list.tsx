
import type { NewsComment } from '@/types/client';
import { CommentItem } from './comment-item';

interface CommentListProps {
  comments: NewsComment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-card rounded-lg">
        <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(item => (
        <CommentItem key={item.id} comment={item} />
      ))}
    </div>
  );
}
