import { db } from "@/db/drizzle";
import { project, newsarticle, service, opportunity } from "@/db/schema";
import { like, or, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all"; // all, projects, articles, services, opportunities

  try {
    let results: any[] = [];
    let totalCount = 0;

    if (query) {
      // Search in projects
      if (type === "all" || type === "projects") {
        const projectResults = await db
          .select({
            id: project.id,
            title: project.title,
            subtitle: project.subtitle,
            description: project.description,
            type: sql`'project'`.as("type"),
            createdAt: project.created_at,
          })
          .from(project)
          .where(
            or(
              like(project.title, `%${query}%`),
              like(project.subtitle, `%${query}%`),
              like(project.description, `%${query}%`)
            )
          )
          .orderBy(desc(project.created_at))
          .limit(5);

        results = [...results, ...projectResults];
        totalCount += projectResults.length;
      }

      // Search in news articles
      if (type === "all" || type === "articles") {
        const articleResults = await db
          .select({
            id: newsarticle.id,
            slug: newsarticle.slug,
            title: newsarticle.title,
            summary: newsarticle.summary,
            content: newsarticle.content,
            type: sql`'article'`.as("type"),
            createdAt: newsarticle.publishedDate,
          })
          .from(newsarticle)
          .where(
            or(
              like(newsarticle.title, `%${query}%`),
              like(newsarticle.summary, `%${query}%`),
              like(newsarticle.content, `%${query}%`)
            )
          )
          .orderBy(desc(newsarticle.publishedDate))
          .limit(5);

        results = [...results, ...articleResults];
        totalCount += articleResults.length;
      }

      // Search in services
      if (type === "all" || type === "services") {
        const serviceResults = await db
          .select({
            id: service.id,
            slug: service.slug,
            title: service.title,
            summary: service.summary,
            type: sql`'service'`.as("type"),
            createdAt: service.createdAt,
          })
          .from(service)
          .where(
            or(
              like(service.title, `%${query}%`),
              like(service.summary, `%${query}%`)
            )
          )
          .orderBy(desc(service.createdAt))
          .limit(5);

        results = [...results, ...serviceResults];
        totalCount += serviceResults.length;
      }

      // Search in opportunities
      if (type === "all" || type === "opportunities") {
        const opportunityResults = await db
          .select({
            id: opportunity.id,
            slug: opportunity.slug,
            title: opportunity.title,
            summary: opportunity.summary,
            content: opportunity.content,
            type: sql`'opportunity'`.as("type"),
            createdAt: opportunity.publishedDate,
          })
          .from(opportunity)
          .where(
            or(
              like(opportunity.title, `%${query}%`),
              like(opportunity.summary, `%${query}%`),
              like(opportunity.content, `%${query}%`)
            )
          )
          .orderBy(desc(opportunity.publishedDate))
          .limit(5);

        results = [...results, ...opportunityResults];
        totalCount += opportunityResults.length;
      }

      // Sort results by date and limit to 10
      results.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      results = results.slice(0, 10);
    } else {
      // If no query, return empty results
      results = [];
    }

    return NextResponse.json({ results, totalCount });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}