
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Settings, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserDashboardStatsAction } from "@/lib/actions";
import type { UserDashboardStats } from "@/types";
import { useLanguage } from "@/context/language-context";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const { dictionary } = useLanguage();
  const t = dictionary.user_dashboard;

  const isLoadingAuth = status === 'loading';
  const isLoadingStats = status === 'authenticated' && stats === null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      getUserDashboardStatsAction()
        .then(setStats)
        .catch(error => {
          console.error("Failed to fetch dashboard stats:", error);
          setStats({
            feedbackSubmitted: 0,
            bookmarkedProjects: 0,
            averageRating: 0,
          });
        });
    }
  }, [status, router]);


  if (isLoadingAuth || isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  const user = session?.user;
  if (!user) {
    return (
         <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
            <p className="ml-3 text-lg">Redirecting to login...</p>
        </div>
    );
  }

  const userName = user.name || user.email?.split('@')[0] || "User";
  const avatarName = user.name || user.email?.split('@')[0] || "User";
  const avatarUrl = user.image;


  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:space-x-4 space-y-2 sm:space-y-0">
            <Image
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=13714C&color=fff&font-size=0.5`}
                alt={userName}
                width={80}
                height={80}
                className="rounded-full border-2 border-primary shrink-0"
            />
            <div>
                <CardTitle className="font-headline text-3xl text-primary">{t.title.replace('{name}', userName)}</CardTitle>
                <CardDescription className="text-md text-foreground/80">{t.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.feedback_submitted}</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.feedbackSubmitted}</div>
            <p className="text-xs text-muted-foreground">
              {t.feedback_description}
            </p>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.bookmarked_projects}</CardTitle>
            <Star className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookmarkedProjects}</div>
            <p className="text-xs text-muted-foreground">
              {t.bookmarked_description}
            </p>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.average_rating}</CardTitle>
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating.toFixed(1)} / 5</div>
            <p className="text-xs text-muted-foreground">
             {t.average_rating_description}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">{t.quick_actions}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/user/profile" className="flex items-start space-x-3">
                    <Settings className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">{t.manage_profile}</p>
                        <p className="text-xs text-muted-foreground">{t.manage_profile_description}</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/user/feedback" className="flex items-start space-x-3">
                    <FileText className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">{t.view_my_feedback}</p>
                        <p className="text-xs text-muted-foreground">{t.view_my_feedback_description}</p>
                    </div>
                </Link>
            </Button>
            <Button variant="default" asChild className="button-hover justify-start p-6 text-left h-auto sm:col-span-2 lg:col-span-1">
                <Link href="/projects" className="flex items-start space-x-3">
                    <MessageSquare className="h-6 w-6 mt-1"/>
                    <div>
                        <p className="font-semibold">{t.explore_projects}</p>
                        <p className="text-xs ">{t.explore_projects_description}</p>
                    </div>
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
