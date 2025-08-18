
"use client";

import Link from 'next/link';
import { Logo } from '@/components/common/logo';
import { LanguageToggle } from '@/components/common/language-toggle';
import { Button } from '@/components/ui/button';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, LogIn, LogOut, UserPlus, ChevronDown, Newspaper, Briefcase, Heart, Landmark, Scale, Users, Globe, Palette, Bike, MessageSquare, Menu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/context/language-context';

const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode, className?: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link href={href} className={cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-foreground/80",
      className
    )}>
      {children}
    </Link>
  );
};

const NavDropdown = ({ label, icon: Icon, items }: { label: string; icon?: React.ElementType; items: { href: string; label: string; icon?: React.ElementType }[] }) => {
  const pathname = usePathname();
  const isGroupActive = items.some(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn(
          "text-sm font-medium hover:text-primary px-2",
          isGroupActive ? "text-primary" : "text-foreground/80"
        )}>
          {Icon && <Icon className="mr-1 h-4 w-4" />}
          {label}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full justify-start px-2 py-1.5">
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.label}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { dictionary } = useLanguage();
  const t = dictionary.header;
  const user = session?.user;
  const isLoading = status === "loading";

  const handleLogout = () => {
    const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
    signOut({ callbackUrl });
  };

  const publicServicesItems = [
    { href: "/benefits", label: t.benefits, icon: Landmark },
    { href: "/health", label: t.health, icon: Heart },
    { href: "/taxes", label: t.taxes, icon: Scale },
    { href: "/business", label: t.business, icon: Briefcase },
  ];

  const exploreNigeriaItems = [
    { href: "/culture", label: t.culture, icon: Palette },
    { href: "/tourism", label: t.tourism, icon: Globe },
    { href: "/sports", label: t.sports, icon: Bike },
  ];

  const governmentCitizenshipItems = [
    { href: "/immigration", label: t.immigration, icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden lg:flex items-center space-x-1">
          <NavLink href="/" className="px-2">{t.home}</NavLink>
          <NavLink href="/projects" className="px-2">{t.projects}</NavLink>
          <NavLink href="/articles" className="px-2">{t.news}</NavLink>
          <NavLink href="/opportunity" className="px-2">{t.opportunities}</NavLink>
          <NavLink href="/services" className="px-2">{t.services}</NavLink>
          <NavDropdown label={t.public_services} items={publicServicesItems} />
          <NavDropdown label={t.explore_nigeria} items={exploreNigeriaItems} />
          <NavDropdown label={t.govt_citizenship} items={governmentCitizenshipItems} />
          <NavLink href="/site-feedback" className="px-2">{t.feedback}</NavLink>
        </nav>
        <div className="flex items-center space-x-2">
          <LanguageToggle />
          {isLoading ? (
             <Button variant="ghost" size="sm" className="opacity-50 hidden sm:inline-flex">Loading...</Button>
          ) : user ? (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/user')} className="button-hover hidden sm:inline-flex">
                <LayoutDashboard className="mr-2 h-4 w-4" /> {t.dashboard}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="button-hover hidden sm:inline-flex">
                <LogOut className="mr-2 h-4 w-4" /> {t.logout}
              </Button>
               <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/user')} className="button-hover sm:hidden">
                <LayoutDashboard className="h-5 w-5" />
                 <span className="sr-only">{t.dashboard}</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="button-hover hidden sm:inline-flex">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />{t.login}</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="button-hover hidden sm:inline-flex">
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />{t.signup}</Link>
              </Button>
               <Button variant="ghost" size="icon" asChild className="button-hover sm:hidden">
                <Link href="/login"><LogIn className="h-5 w-5" /><span className="sr-only">{t.login}</span></Link>
              </Button>
            </>
          )}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

const MobileNav = () => {
  const { dictionary } = useLanguage();
  const t = dictionary.header;

  const publicServicesItems = [
    { href: "/benefits", label: t.benefits, icon: Landmark },
    { href: "/health", label: t.health, icon: Heart },
    { href: "/taxes", label: t.taxes, icon: Scale },
    { href: "/business", label: t.business, icon: Briefcase },
  ];

  const exploreNigeriaItems = [
    { href: "/culture", label: t.culture, icon: Palette },
    { href: "/tourism", label: t.tourism, icon: Globe },
    { href: "/sports", label: t.sports, icon: Bike },
  ];

  const governmentCitizenshipItems = [
    { href: "/immigration", label: t.immigration, icon: Users },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t.toggle_menu}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild><NavLink href="/" className="w-full">{t.home}</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/projects" className="w-full">{t.projects}</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/articles" className="w-full">{t.news}</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/opportunity" className="w-full">Opportunities</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/services" className="w-full">{t.services}</NavLink></DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t.public_services}</DropdownMenuLabel>
        {publicServicesItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full">{item.icon && <item.icon className="mr-2 h-4 w-4" />}{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t.explore_nigeria}</DropdownMenuLabel>
         {exploreNigeriaItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full">{item.icon && <item.icon className="mr-2 h-4 w-4" />}{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t.govt_citizenship}</DropdownMenuLabel>
        {governmentCitizenshipItems.map(item => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink href={item.href} className="w-full">{item.icon && <item.icon className="mr-2 h-4 w-4" />}{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
         <DropdownMenuSeparator />
        <DropdownMenuItem asChild><NavLink href="/site-feedback" className="w-full"><MessageSquare className="mr-2 h-4 w-4" />{t.site_feedback}</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/about" className="w-full">{t.about}</NavLink></DropdownMenuItem>
        <DropdownMenuItem asChild><NavLink href="/contact" className="w-full">{t.contact}</NavLink></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
