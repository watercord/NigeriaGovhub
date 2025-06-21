"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { submitProjectFeedback } from '@/lib/actions';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const feedbackSchema = z.object({
  userName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }).max(1000),
  rating: z.number().min(1).max(5).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  projectId: string;
  onFeedbackSubmitted?: () => void; 
}

export function FeedbackForm({ projectId, onFeedbackSubmitted }: FeedbackFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | undefined>(undefined);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const handleRating = (rate: number) => {
    setCurrentRating(rate);
    setValue("rating", rate, { shouldValidate: true });
  }

  const onSubmit: SubmitHandler<FeedbackFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await submitProjectFeedback(projectId, data);
      if (result.success) {
        toast({
          title: "Feedback Submitted",
          description: result.message,
        });
        reset();
        setCurrentRating(undefined);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
      <div>
        <Label htmlFor="userName" className="font-semibold">Your Name</Label>
        <Input
          id="userName"
          {...register("userName")}
          className="mt-1"
          aria-invalid={errors.userName ? "true" : "false"}
        />
        {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>}
      </div>

      <div>
        <Label htmlFor="rating" className="font-semibold">Rating (Optional)</Label>
        <div className="flex space-x-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-6 w-6 cursor-pointer transition-colors",
                  currentRating && star <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                )}
              />
            </button>
          ))}
        </div>
         {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>}
      </div>

      <div>
        <Label htmlFor="comment" className="font-semibold">Your Feedback</Label>
        <Textarea
          id="comment"
          {...register("comment")}
          rows={5}
          className="mt-1"
          aria-invalid={errors.comment ? "true" : "false"}
        />
        {errors.comment && <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto button-hover">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
