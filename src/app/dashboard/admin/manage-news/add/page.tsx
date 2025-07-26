"use client";

import NewsArticleForm from "@/components/admin/news-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AddNewsArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, pathname]);

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-start">
        <Button variant="outline" asChild className="button-hover">
          <Link href="/dashboard/admin/manage-news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage News
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add New News Article</CardTitle>
          <CardDescription>Fill in the details below to create a new news article.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsArticleForm initialData={undefined} />
        </CardContent>
      </Card>
    </div>
  );
}

