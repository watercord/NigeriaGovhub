import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase } from "lucide-react";

const categories = [
  { id: "finance", name: "Finance", description: "Financial opportunities and funding programs" },
  { id: "agriculture", name: "Agriculture", description: "Agricultural development and farming opportunities" },
  { id: "education", name: "Education", description: "Educational programs and scholarships" },
  { id: "healthcare", name: "Healthcare", description: "Healthcare initiatives and programs" },
  { id: "technology", name: "Technology", description: "Tech innovation and digital programs" },
  { id: "infrastructure", name: "Infrastructure", description: "Infrastructure development projects" },
];

export default function OpportunityPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Briefcase className="h-10 w-10 mr-3" /> Opportunities
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Explore various opportunities across different sectors in Nigeria. Find programs that match your interests and goals.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="mb-4">{category.description}</CardDescription>
              <Button asChild className="w-full">
                <Link href={`/opportunity/category/${category.id}`}>Explore {category.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}