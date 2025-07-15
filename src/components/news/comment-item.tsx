import type { NewsComment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CommentItemProps {
  comment: NewsComment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="bg-muted/30 border-0 shadow-none">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
            <Avatar className="h-9 w-9">
                <AvatarImage src={comment.user.image ?? undefined} alt={comment.user.name ?? 'User'} />
                <AvatarFallback>{comment.user.name ? getInitials(comment.user.name) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-sm font-semibold text-foreground">{comment.user.name || 'Anonymous'}</CardTitle>
                <CardDescription className="text-xs">
                    {formatDistanceToNow(new Date(comment.createdAt ?? new Date()), { addSuffix: true })}
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent className="text-sm text-foreground/90 p-4 pt-0">
            <p className="whitespace-pre-wrap">{comment.content}</p>
        </CardContent>
    </Card>
  );
}