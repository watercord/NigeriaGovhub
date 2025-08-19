import { db } from "@/db/drizzle";
import { opportunity } from "@/db/schema";
import { like, or, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  try {
    // Build and execute the search query without reassigning the typed builder
    let results: any[];

    if (query && category) {
      results = await db
        .select()
        .from(opportunity)
        .where(
          and(
            or(
              like(opportunity.title, `%${query}%`),
              like(opportunity.summary, `%${query}%`),
              like(opportunity.content, `%${query}%`)
            ),
            like(opportunity.category, `%${category}%`)
          )
        )
        .orderBy(desc(opportunity.publishedDate));
    } else if (query) {
      results = await db
        .select()
        .from(opportunity)
        .where(
          or(
            like(opportunity.title, `%${query}%`),
            like(opportunity.summary, `%${query}%`),
            like(opportunity.content, `%${query}%`)
          )
        )
        .orderBy(desc(opportunity.publishedDate));
    } else if (category) {
      results = await db
        .select()
        .from(opportunity)
        .where(like(opportunity.category, `%${category}%`))
        .orderBy(desc(opportunity.publishedDate));
    } else {
      results = await db
        .select()
        .from(opportunity)
        .orderBy(desc(opportunity.publishedDate));
    }

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    console.error("Error searching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to search opportunities" },
      { status: 500 }
    );
  }
}
