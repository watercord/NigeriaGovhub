
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Eye, Newspaper, Server, PlayCircle, Briefcase, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllNewsArticles, getAllServices, getAllProjects, getAllVideosFromDb } from "@/lib/data";
import { NewsCard } from "@/components/news/news-card";
import { ServiceCard } from "@/components/services/service-card";
import { VideoCard } from "@/components/common/video-card";
import type { Project, NewsArticle, ServiceItem, Video } from "@/types/client";
import { useLanguage } from "@/context/language-context";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchHomepageDataAction } from "@/lib/actions";

// export const dynamic = 'force-dynamic'
function HomePageContent() {
  const { dictionary } = useLanguage();
  const t = dictionary.home_page;

  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [popularServices, setPopularServices] = useState<ServiceItem[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [allVideosCount, setAllVideosCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
         const homepageData = await fetchHomepageDataAction();
        
        if (homepageData.error) {
          console.error("Failed to fetch homepage data:", homepageData.error);
        } else {
          setFeaturedProjects(homepageData.projects || []);
          setLatestNews(homepageData.news || []);
          setPopularServices(homepageData.services || []);
          setFeaturedVideos(homepageData.videos || []);
          setAllVideosCount(homepageData.allVideosCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch homepage data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary mb-6">
            {t.hero_title}
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
            {t.hero_subtitle}
          </p>

          <form action="/projects" method="GET" className="mt-8 max-w-2xl mx-auto flex gap-2">
            <Input
                type="search"
                name="search"
                placeholder={t.search_placeholder}
                className="flex-grow text-base p-6 bg-background"
                aria-label="Search for projects"
            />
            <Button type="submit" size="lg" className="p-6 button-hover">
                <Search className="h-5 w-5 mr-2" /> {t.search_button}
            </Button>
          </form>

          <div className="space-x-4 mt-8">
            <Button size="lg" asChild className="button-hover shadow-md">
              <Link href="/projects">{t.explore_projects_button} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="button-hover shadow-md">
              <Link href="/about">{t.learn_more_button}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground">
            {t.how_it_works_title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm card-hover">
              <Eye className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">{t.discover_title}</h3>
              <p className="text-foreground/80 text-sm">
                {t.discover_text}
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm card-hover">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">{t.track_title}</h3>
              <p className="text-foreground/80 text-sm">
                {t.track_text}
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm card-hover">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-4"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18.1H3"/></svg>
              <h3 className="font-headline text-xl font-semibold mb-2 text-foreground">{t.feedback_title}</h3>
              <p className="text-foreground/80 text-sm">
                {t.feedback_text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {isLoading ? (
        <section className="py-16 bg-muted/30 rounded-lg">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          </div>
        </section>
      ) : featuredProjects.length > 0 && (
        <section className="py-16 bg-muted/30 rounded-lg">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <Briefcase className="h-8 w-8 mr-3 text-primary" /> {t.featured_initiatives_title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover shadow-md">
                  <CardHeader className="p-0">
                    <Image
                      src={project.images[0]?.url || 'https://placehold.co/600x400.png'}
                      alt={project.images[0]?.alt || project.title}
                      data-ai-hint={project.images[0]?.dataAiHint || "project image"}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-xl mb-2 text-primary">{project.title}</CardTitle>
                    <CardDescription className="text-sm text-foreground/70 mb-4">
                      Ministry: {project.ministry.name}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" asChild className="w-full button-hover">
                      <Link href={`/projects/${project.id}`}>{t.view_details_button} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="button-hover">
                <Link href="/projects">{t.view_all_projects_button}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Latest News Section */}
       {isLoading ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
             <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          </div>
        </section>
      ) : latestNews.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <Newspaper className="h-8 w-8 mr-3 text-primary" /> {t.latest_news_title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {latestNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="button-hover">
                <Link href="/news">{t.view_all_news_button}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Popular Services Section */}
       {isLoading ? (
        <section className="py-16 bg-muted/30 rounded-lg">
          <div className="container mx-auto px-4">
             <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
          </div>
        </section>
      ) : popularServices.length > 0 && (
        <section className="py-16 bg-muted/30 rounded-lg">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <Server className="h-8 w-8 mr-3 text-primary" /> {t.popular_services_title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {popularServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="button-hover">
                <Link href="/services">{t.explore_all_services_button}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Videos Section */}
      {isLoading ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          </div>
        </section>
      ) : featuredVideos.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl font-bold text-center mb-12 text-foreground flex items-center justify-center">
              <PlayCircle className="h-8 w-8 mr-3 text-primary" /> {t.featured_videos_title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.map((video) => (
                <VideoCard key={video.id} video={video} embed={true} />
              ))}
            </div>
             {allVideosCount > 3 && (
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" asChild className="button-hover" disabled>
                  {/* <Link href="/videos">View All Videos</Link> */}
                   {t.view_all_videos_button}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}

export default HomePageContent;
