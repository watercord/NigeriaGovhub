
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Newspaper, Edit, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
import React, { useEffect, useState, useTransition, useCallback } from "react";
import type { NewsArticle } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import Link from "next/link";
import { deleteNewsArticle, fetchAllNewsArticlesAction } from "@/lib/actions"; // Use Server Action

export default function ManageNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  const fetchAdminNews = useCallback(async () => {
    if (!isLoadingAuth && isAdmin) {
      setIsLoadingData(true);
      try {
        const fetchedNews = await fetchAllNewsArticlesAction(); // Use Server Action
        setNewsArticles(fetchedNews);
      } catch (error) {
        console.error("Failed to fetch news articles for admin:", error);
        toast({ title: "Error", description: "Failed to load news articles.", variant: "destructive" });
        setNewsArticles([]);
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
        fetchAdminNews();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, fetchAdminNews, pathname]);

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteNewsArticle(articleToDelete.id);
      if (result.success) {
        toast({ title: "News Article Deleted", description: result.message });
        setNewsArticles((prevArticles) => prevArticles.filter((a) => a.id !== articleToDelete.id));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setArticleToDelete(null);
    });
  };

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading news..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><Newspaper className="mr-2 h-6 w-6"/>Manage News Articles</CardTitle>
            <CardDescription>Add, edit, and publish news articles from the database.</CardDescription>
          </div>
          <Button asChild className="button-hover w-full sm:w-auto">
            <Link href="/dashboard/admin/manage-news/add">
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Article
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsArticles.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No news articles found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                newsArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={article.title}>{article.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{article.category}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(article.publishedDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Article Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/manage-news/edit/${article.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Article
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                             <Link href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer">View Article</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setArticleToDelete(article)}
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Article
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

       {articleToDelete && (
        <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the news article titled &quot;{articleToDelete.title}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setArticleToDelete(null)} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteArticle}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Article"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
