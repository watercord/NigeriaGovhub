
"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  LogOut,
  BarChart3,
  ShieldAlert,
  Home,
  Newspaper,
  Server,
  MessageSquare,
  PlayCircleIcon,
  Loader2,
  Bookmark,
} from "lucide-react";
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/context/language-context";

const DashboardSidebarContent = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { dictionary } = useLanguage();
  const t = dictionary.dashboard_sidebar;


  const handleLogout = async () => {
    const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
    await signOut({ callbackUrl });
  };

  const closeMobileSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpenMobile(false);
    }
  }

  const commonLinks = [
    { href: "/dashboard/user", label: t.overview, icon: LayoutDashboard },
    { href: "/dashboard/user/profile", label: t.profile_settings, icon: Settings },
    { href: "/dashboard/user/feedback", label: t.my_feedback, icon: FileText },
    { href: "/dashboard/user/bookmarked-news", label: t.bookmarked_news, icon: Bookmark },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: t.admin_overview, icon: ShieldAlert },
    { href: "/dashboard/admin/manage-users", label: t.manage_users, icon: Users },
    { href: "/dashboard/admin/manage-projects", label: t.manage_projects, icon: BarChart3 },
    { href: "/dashboard/admin/manage-news", label: t.manage_news, icon: Newspaper },
    { href: "/dashboard/admin/manage-services", label: t.manage_services, icon: Server },
    { href: "/dashboard/admin/manage-videos", label: t.manage_videos, icon: PlayCircleIcon },
    { href: "/dashboard/admin/manage-feedback", label: t.manage_feedback, icon: MessageSquare },
    { href: "/dashboard/admin/site-settings", label: t.site_settings, icon: Settings },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="p-2">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/">
                <SidebarMenuButton onClick={closeMobileSidebar} isActive={pathname === '/'} tooltip={t.homepage}>
                  <Home />
                  {t.homepage}
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>

          {commonLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton onClick={closeMobileSidebar} isActive={pathname === link.href} tooltip={link.label}>
                  <link.icon />
                  {link.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {isAdmin && (
            <>
              <SidebarMenuSubButton className="font-semibold text-muted-foreground mt-4 mb-1 px-2">{t.admin_tools}</SidebarMenuSubButton>
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton onClick={closeMobileSidebar} isActive={pathname === link.href} tooltip={link.label}>
                      <link.icon />
                      {link.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
          <LogOut className="mr-2" /> {t.logout}
        </Button>
      </SidebarFooter>
    </>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentPath = pathname;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [status, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-primary" />
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-primary" />
        <p className="ml-4 text-lg">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar">
         <DashboardSidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:hidden">
                 <Logo />
                <SidebarTrigger />
            </div>
            <div className="hidden md:flex items-center justify-end mb-4">
                <SidebarTrigger />
            </div>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
