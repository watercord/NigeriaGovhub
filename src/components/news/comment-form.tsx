
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addNewsCommentAction } from "@/lib/actions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "../ui/label";

const commentSchema = z.object({
  content: z.string().min(3, "Comment must be at least 3 characters.").max(1000, "Comment is too long."),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  articleId: string;
}

export function CommentForm({ articleId }: CommentFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit: SubmitHandler<CommentFormData> = async (data) => {
    startTransition(async () => {
      const result = await addNewsCommentAction(articleId, data.content);
      if (result.success) {
        toast({ description: "Comment posted successfully." });
        reset();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to post comment.",
          variant: "destructive",
        });
      }
    });
  };

  const user = session?.user;

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
          <Avatar>
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <Label htmlFor="comment-textarea" className="font-semibold text-base">{user?.name || 'Your Comment'}</Label>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Textarea
            id="comment-textarea"
            placeholder="Write your comment here..."
            rows={4}
            {...register("content")}
            disabled={isPending}
            className="w-full"
          />
          {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button type="submit" disabled={isPending} className="ml-auto button-hover">
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
