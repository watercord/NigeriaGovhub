// src/components/projects/feedback-form.tsx
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  userName: z.string().min(2).max(50),
  comment: z.string().min(10).max(1000),
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
  const [currentRating, setCurrentRating] = useState<number | undefined>();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const handleRating = (rate: number) => {
    setCurrentRating(rate);
    setValue("rating", rate, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FeedbackFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId }),
      });

      const result = await res.json();

      if (result.success) {
        toast({ title: "Feedback Submitted", description: result.message });
        reset();
        setCurrentRating(undefined);
        onFeedbackSubmitted?.();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
      <div>
        <Label htmlFor="userName">Your Name</Label>
        <Input id="userName" {...register("userName")} />
        {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
      </div>

      <div>
        <Label htmlFor="rating">Rating (Optional)</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-6 w-6 cursor-pointer",
                  currentRating && star <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="comment">Your Feedback</Label>
        <Textarea id="comment" {...register("comment")} rows={5} />
        {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
