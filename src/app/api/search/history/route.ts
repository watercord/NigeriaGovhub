import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple in-memory storage for search history (in a real app, this would be stored in a database)
const searchHistoryMap = new Map<string, string[]>();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value || "anonymous";
    
    const history = searchHistoryMap.get(userId) || [];
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json(
      { error: "Failed to fetch search history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value || "anonymous";
    
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }
    
    // Get current history for user
    let history = searchHistoryMap.get(userId) || [];
    
    // Add new query to the beginning of the history
    history = [query, ...history.filter((item) => item !== query)].slice(0, 10); // Keep only last 10 items
    
    // Save updated history
    searchHistoryMap.set(userId, history);
    
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("Error saving search history:", error);
    return NextResponse.json(
      { error: "Failed to save search history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value || "anonymous";
    
    searchHistoryMap.delete(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing search history:", error);
    return NextResponse.json(
      { error: "Failed to clear search history" },
      { status: 500 }
    );
  }
}
