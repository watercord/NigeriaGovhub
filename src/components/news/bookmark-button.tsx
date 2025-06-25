
"use client";

import { useState, useEffect, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleNewsBookmarkAction, checkNewsBookmarkStatusAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  articleId: string;
}

export function BookmarkButton({ articleId }: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(true);
      checkNewsBookmarkStatusAction(articleId)
        .then(status => {
          setIsBookmarked(status);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
  }, [articleId, status]);

  const handleBookmark = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const initialBookmarkedState = isBookmarked;
      // Optimistically update the UI
      setIsBookmarked(!initialBookmarkedState);

      const result = await toggleNewsBookmarkAction(articleId);

      if (!result.success) {
        // Revert on failure and show toast
        setIsBookmarked(initialBookmarkedState);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      } else {
        // Show success toast
        toast({
          description: result.message,
        });
      }
    });
  };

  if (status === 'unauthenticated') {
    return null; // Or show a login prompt button
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBookmark}
      disabled={isLoading || isPending}
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      <Bookmark
        className={cn(
          "h-6 w-6 transition-colors",
          isBookmarked
            ? "text-primary fill-primary"
            : "text-muted-foreground hover:text-primary"
        )}
      />
    </Button>
  );
}
