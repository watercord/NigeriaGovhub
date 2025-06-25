
"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleNewsLikeAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  articleId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

export function LikeButton({ articleId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    if (status !== "authenticated") {
      router.push(`/login?redirect=/news/${articleId}`);
      return;
    }

    startTransition(async () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      const result = await toggleNewsLikeAction(articleId);

      if (!result.success) {
        // Revert on failure
        setIsLiked(isLiked);
        setLikeCount(likeCount);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      aria-label={isLiked ? "Unlike article" : "Like article"}
      className="button-hover"
    >
      <Heart
        className={cn(
          "h-4 w-4 mr-2 transition-colors",
          isLiked
            ? "text-red-500 fill-red-500"
            : "text-muted-foreground"
        )}
      />
      <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
    </Button>
  );
}
