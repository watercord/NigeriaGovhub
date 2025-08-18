"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { useEffect, useState } from "react";

// Mock data for opportunities
const mockOpportunities = [
  {
    id: "1",
    title: "Agricultural Development Program",
    description: "Funding and support for modern farming techniques and rural development initiatives.",
    fullDescription: "The Agricultural Development Program aims to transform the agricultural sector through modern farming techniques, improved seed varieties, and sustainable farming practices. This program provides funding, training, and technical support to farmers and agricultural cooperatives across Nigeria. The initiative focuses on increasing productivity, improving food security, and creating employment opportunities in rural areas.",
    category: "agriculture",
    categoryId: "agriculture",
    deadline: "2025-12-31",
    requirements: [
      "Must be a registered farmer or agricultural cooperative",
      "Minimum of 2 years farming experience",
      "Valid identification documents",
      "Farm location details and size",
      "Business plan or project proposal"
    ],
    benefits: [
      "Financial support up to ₦500,000",
      "Training on modern farming techniques",
      "Access to improved seed varieties",
      "Technical advisory services",
      "Market linkage opportunities"
    ]
  },
  {
    id: "2",
    title: "Digital Literacy Initiative",
    description: "Training program to improve digital skills in underserved communities.",
    fullDescription: "The Digital Literacy Initiative is designed to bridge the digital divide by providing digital skills training to individuals in underserved communities. The program offers comprehensive training on computer basics, internet usage, email communication, and productivity software. Participants will also learn about digital safety, online banking, and e-commerce platforms. This initiative aims to empower citizens with essential digital skills needed in today's economy.",
    category: "education",
    categoryId: "education",
    deadline: "2025-11-15",
    requirements: [
      "Minimum age of 15 years",
      "Basic reading and writing skills",
      "Valid identification documents",
      "Residence in target communities",
      "Commitment to complete the 8-week program"
    ],
    benefits: [
      "Free digital skills training",
      "Certificate of completion",
      "Access to digital resources",
      "Internship opportunities",
      "Entrepreneurship guidance"
    ]
  },
  {
    id: "3",
    title: "Small Business Grant",
    description: "Financial support for small businesses and startups in key sectors.",
    fullDescription: "The Small Business Grant program provides financial support to small businesses and startups operating in key sectors of the Nigerian economy. The grant aims to stimulate economic growth, create employment opportunities, and encourage innovation. Businesses can apply for funding to expand operations, purchase equipment, develop new products, or enter new markets. The program particularly supports women-owned businesses, youth entrepreneurship, and ventures in rural areas.",
    category: "finance",
    categoryId: "finance",
    deadline: "2025-10-30",
    requirements: [
      "Registered business with CAC",
      "Minimum of 6 months operation history",
      "Valid business registration documents",
      "Bank account details",
      "Business plan and financial projections",
      "Tax identification number"
    ],
    benefits: [
      "Grant funding up to ₦2,000,000",
      "Business mentorship program",
      "Networking opportunities",
      "Marketing support",
      "Access to government procurement opportunities"
    ]
  }
];

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const [opportunity, setOpportunity] = useState<any>(null);
  
  useEffect(() => {
    // Find the opportunity by ID
    const foundOpportunity = mockOpportunities.find(opp => opp.id === params.id);
    setOpportunity(foundOpportunity);
  }, [params.id]);

  if (!opportunity) {
    return (
      <div className="space-y-8 py-8">
        <Button variant="ghost" asChild className="mb-4 pl-0">
          <Link href="/opportunity">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Opportunities
          </Link>
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">Opportunity not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <Button variant="ghost" asChild className="mb-4 pl-0">
        <Link href={`/opportunity/category/${opportunity.categoryId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {opportunity.category.charAt(0).toUpperCase() + opportunity.category.slice(1)} Opportunities
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="mr-1.5 h-4 w-4" />
              {opportunity.category.charAt(0).toUpperCase() + opportunity.category.slice(1)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1.5 h-4 w-4" />
              Deadline: {opportunity.deadline}
            </div>
          </div>
          <CardTitle className="font-headline text-3xl">{opportunity.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-foreground/90">{opportunity.description}</p>
            <p className="mt-4">{opportunity.fullDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-headline text-xl mb-4 text-primary">Requirements</h3>
              <ul className="space-y-2">
                {opportunity.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-headline text-xl mb-4 text-primary">Benefits</h3>
              <ul className="space-y-2">
                {opportunity.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <Button size="lg" className="w-full sm:w-auto">
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}