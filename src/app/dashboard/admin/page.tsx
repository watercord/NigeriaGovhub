
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, ShieldAlert, Settings, Newspaper, Server, MessageSquare, PlayCircleIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminDashboardStats } from "@/lib/actions";

interface DashboardStats {
  totalProjects: number;
  totalUsers: number;
  totalNewsArticles: number;
  totalServices: number;
  totalVideos: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
      } else {
        // Fetch stats if admin
        const loadStats = async () => {
          setIsLoadingStats(true);
          try {
            const fetchedStats = await fetchAdminDashboardStats();
            setStats(fetchedStats);
          } catch (error) {
            console.error("Failed to fetch admin dashboard stats:", error);
            toast({ title: "Error", description: "Could not load dashboard statistics.", variant: "destructive"});
            setStats({
              totalProjects: 0,
              totalUsers: 0,
              totalNewsArticles: 0,
              totalServices: 0,
              totalVideos: 0,
            });
          } finally {
            setIsLoadingStats(false);
          }
        };
        loadStats();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, pathname]);

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingStats)) {
     return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || status === 'unauthenticated' ? "Verifying access..." : "Loading dashboard data..."}
        </p>
      </div>
    );
  }

  const adminName = session?.user?.name || 'Admin';
  const adminAvatarName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Admin';
  const adminAvatarUrl = session?.user?.image;

  const pendingApprovals = 5;
  const siteHealth = "Good";

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardHeader>
           <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:space-x-4 space-y-2 sm:space-y-0">
            <Image
                src={adminAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminAvatarName)}&background=13714C&color=fff&font-size=0.5`}
                alt={adminName}
                width={80}
                height={80}
                className="rounded-full border-2 border-primary shrink-0"
            />
            <div>
                <CardTitle className="font-headline text-3xl text-primary">Administrator Dashboard</CardTitle>
                <CardDescription className="text-md text-foreground/80">Manage NigeriaGovHub content and users.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects ?? <Loader2 className="h-6 w-6 animate-spin" />}</div>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? <Loader2 className="h-6 w-6 animate-spin" />}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Articles</CardTitle>
            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalNewsArticles ?? <Loader2 className="h-6 w-6 animate-spin" />}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Services</CardTitle>
            <Server className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalServices ?? <Loader2 className="h-6 w-6 animate-spin" />}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Videos</CardTitle>
            <PlayCircleIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVideos ?? <Loader2 className="h-6 w-6 animate-spin" />}</div>
          </CardContent>
        </Card>
         <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingApprovals}</div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Health</CardTitle>
            <ShieldAlert className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{siteHealth}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Admin Tools</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-projects" className="flex items-start space-x-3">
                    <BarChart3 className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Projects</p>
                        <p className="text-xs text-muted-foreground">Add, edit, or remove project listings.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-users" className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Users</p>
                        <p className="text-xs text-muted-foreground">View user activity and manage accounts.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-news" className="flex items-start space-x-3">
                    <Newspaper className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage News</p>
                        <p className="text-xs text-muted-foreground">Create, edit, and publish news articles.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-services" className="flex items-start space-x-3">
                    <Server className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Services</p>
                        <p className="text-xs text-muted-foreground">Add or update government service listings.</p>
                    </div>
                </Link>
            </Button>
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-videos" className="flex items-start space-x-3">
                    <PlayCircleIcon className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Videos</p>
                        <p className="text-xs text-muted-foreground">Add, edit, or remove video content.</p>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/manage-feedback" className="flex items-start space-x-3">
                    <MessageSquare className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Manage Feedback</p>
                        <p className="text-xs text-muted-foreground">Review and moderate user feedback.</p>
                    </div>
                </Link>
            </Button>
            <Button variant="outline" asChild className="button-hover justify-start p-6 text-left h-auto">
                <Link href="/dashboard/admin/site-settings" className="flex items-start space-x-3">
                    <Settings className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold">Site Settings</p>
                        <p className="text-xs text-muted-foreground">Configure global application settings.</p>
                    </div>
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

