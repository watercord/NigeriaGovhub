"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FeedbackItem } from "@/components/projects/feedback-item";
import type { Feedback } from "@/types/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

type FeedbackWithProject = Feedback & { projectTitle: string; projectId: string };

export default function MyFeedbackContent({
  myFeedback,
}: {
  myFeedback: FeedbackWithProject[];
}) {
  const { data: session, status } = useSession();
  const authLoading = status === "loading";
  const user = session?.user;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">Loading your feedback...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground mb-4">
          Please log in to see your feedback.
        </p>
        <Button asChild className="button-hover">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            My Submitted Feedback
          </CardTitle>
          <CardDescription>
            Review all the comments and ratings you&apos;ve provided on various
            projects.
          </CardDescription>
        </CardHeader>
      </Card>

      {myFeedback.length > 0 ? (
        <div className="space-y-6">
          {myFeedback.map((fb) => (
            <Card key={fb.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 p-4 border-b">
                <CardTitle className="text-lg">
                  Feedback on:{" "}
                  <Link
                    href={`/projects/${fb.projectId}`}
                    className="text-primary hover:underline"
                  >
                    {fb.projectTitle}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <FeedbackItem feedback={fb} />
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="button-hover"
                >
                  <Link href={`/projects/${fb.projectId}#feedback-section`}>
                    View on Project Page{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              You haven&apos;t submitted any feedback yet.
            </p>
            <Button asChild className="button-hover">
              <Link href="/projects">
                Explore Projects and Share Your Thoughts
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
