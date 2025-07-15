
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Star, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState, useCallback } from "react";
import type { Feedback } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { fetchAllFeedbackWithProjectTitlesAction } from "@/lib/actions"; // Use Server Action

type AggregatedFeedback = Feedback & { projectTitle: string };

export default function ManageFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [allFeedback, setAllFeedback] = useState<AggregatedFeedback[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  const loadFeedback = useCallback(async () => {
    if (isAdmin) {
      setIsLoadingData(true);
      try {
        const feedbackList = await fetchAllFeedbackWithProjectTitlesAction(); // Use Server Action
        setAllFeedback(feedbackList);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
        toast({ title: "Error", description: "Failed to load feedback.", variant: "destructive"});
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
        return;
      }
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
        return;
      }
      loadFeedback();
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, pathname, loadFeedback]);

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading feedback..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><MessageSquare className="mr-2 h-6 w-6"/>Manage User Feedback</CardTitle>
            <CardDescription>Review and moderate user feedback from all projects.</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Comment (Snippet)</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFeedback.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No feedback found.
                    </TableCell>
                </TableRow>
              ) : (
                allFeedback.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-medium max-w-[150px] truncate" title={fb.projectTitle}>{fb.projectTitle}</TableCell>
                    <TableCell className="max-w-[100px] truncate" title={fb.user_name}>{fb.user_name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={fb.comment}>{fb.comment}</TableCell>
                    <TableCell>
                      {fb.rating ? (
                        <div className="flex items-center">
                          {fb.rating} <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400"/>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fb.sentiment_summary ? <Badge variant="outline">{fb.sentiment_summary}</Badge> : <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>{formatDistanceToNow(fb.created_at ? new Date(fb.created_at) : new Date(), { addSuffix: true }) as string}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Feedback Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>View Full Feedback</DropdownMenuItem>
                          <DropdownMenuItem disabled>Mark as Reviewed</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" disabled>Delete Feedback</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
