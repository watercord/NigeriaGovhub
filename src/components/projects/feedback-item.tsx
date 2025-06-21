import type { Feedback } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquareText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface FeedbackItemProps {
  feedback: Feedback;
}

export function FeedbackItem({ feedback }: FeedbackItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="p-2 sm:p-4 bg-background border-border shadow-sm">
      <CardHeader className="flex flex-row items-start space-x-3 p-2 pt-0 sm:p-4 sm:pt-0 mb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.userName)}&background=random`} alt={feedback.userName} />
          <AvatarFallback>{getInitials(feedback.userName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base font-semibold text-foreground">{feedback.userName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
          </p>
        </div>
        {feedback.rating && (
          <div className="flex items-center text-sm text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < feedback.rating! ? 'fill-current' : ''}`}
              />
            ))}
            <span className="ml-1 sr-only">{feedback.rating} out of 5 stars</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="text-sm text-foreground/90 p-2 sm:p-4 pt-0">
        <p className="whitespace-pre-wrap">{feedback.comment}</p>
      </CardContent>
      {feedback.sentimentSummary && (
        <CardFooter className="p-2 sm:p-4 pt-2">
          <Badge variant="outline" className="text-xs flex items-center">
            <MessageSquareText className="h-3 w-3 mr-1.5" />
            Sentiment: {feedback.sentimentSummary}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
