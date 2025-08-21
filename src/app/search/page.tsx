import { Suspense } from "react";
import { SearchClient } from "./search-client";

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SearchClient />
    </Suspense>
  );
}