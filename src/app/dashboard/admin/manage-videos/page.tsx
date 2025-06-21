
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, PlayCircleIcon, Edit, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import React, { useEffect, useState, useTransition, useCallback } from "react";
import type { Video } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { deleteVideo, fetchAllVideosAction } from "@/lib/actions"; // Use Server Action
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageVideosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  const fetchAdminVideos = useCallback(async () => {
    if (!isLoadingAuth && isAdmin) {
      setIsLoadingData(true);
      try {
        const fetchedVideos = await fetchAllVideosAction(); // Use Server Action
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Failed to fetch videos for admin:", error);
        toast({ title: "Error", description: "Failed to load videos.", variant: "destructive" });
        setVideos([]);
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [isAdmin, isLoadingAuth, toast]);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        fetchAdminVideos();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, fetchAdminVideos, pathname]);

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    startDeleteTransition(async () => {
      const result = await deleteVideo(videoToDelete.id);
      if (result.success) {
        toast({ title: "Video Deleted", description: result.message });
        setVideos((prevVideos) => prevVideos.filter((v) => v.id !== videoToDelete.id));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setVideoToDelete(null);
    });
  };

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading videos..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><PlayCircleIcon className="mr-2 h-6 w-6"/>Manage Videos</CardTitle>
            <CardDescription>Add, edit, and manage video content for the platform.</CardDescription>
          </div>
          <Button asChild className="button-hover w-full sm:w-auto">
            <Link href="/dashboard/admin/manage-videos/add">
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Video
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No videos found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          width={80}
                          height={50}
                          className="rounded object-cover aspect-video"
                          data-ai-hint={video.dataAiHint || "video thumbnail"}
                        />
                      ) : (
                        <div className="w-20 h-[calc(20*9/16)] bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No Thumb</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={video.title}>{video.title}</TableCell>
                    <TableCell className="max-w-sm truncate" title={video.description || undefined}>{video.description || <span className="text-muted-foreground">N/A</span>}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Video Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/manage-videos/edit/${video.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Video
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                             <a href={video.url} target="_blank" rel="noopener noreferrer">View Video</a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setVideoToDelete(video)}
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Video
                          </DropdownMenuItem>
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
       {videoToDelete && (
        <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the video titled &quot;{videoToDelete.title}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setVideoToDelete(null)} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteVideo}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Video"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
