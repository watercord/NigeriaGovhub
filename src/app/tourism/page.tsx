
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Mountain, Trees } from "lucide-react";
import Image from "next/image";
import Tourism from "@/components/common/visit-nigria.jpeg";

export default function TourismPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Globe className="h-10 w-10 mr-3" /> Travel & Tourism in Nigeria
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Discover Nigeria's diverse landscapes, attractions, and hospitality.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Experience the Beauty of Nigeria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image
            src={Tourism}
            alt="Nigerian landscape"
            width={800}
            height={400}
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="beautiful landscape"
          />
          <p>
            Nigeria offers a wealth of travel experiences, from bustling cities and serene beaches to ancient historical sites and breathtaking natural wonders. Whether you're interested in ecotourism, cultural immersion, or adventure, Nigeria has something for every traveler.
          </p>
          <p>
            Explore information on:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Major Tourist Attractions and Destinations</li>
            <li>National Parks and Wildlife Reserves</li>
            <li>Travel Advisories and Safety Tips</li>
            <li>Visa Information for Tourists (if applicable)</li>
            <li>Cultural Tourism and Heritage Sites</li>
            <li>Accommodation and Transportation Options</li>
          </ul>
          <p>
            Plan your next adventure and experience the warmth and vibrancy of Nigeria.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Mountain className="mr-2 h-5 w-5"/> National Parks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Discover Nigeria's protected natural areas and wildlife. <a href="http://nigeriaparkservice.gov.ng/" className="text-lime-600 underline text-base">Visit the National Parks</a></p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Trees className="mr-2 h-5 w-5"/> Ecotourism Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Learn about sustainable travel options and community-based tourism projects. <a href="https://ntda.gov.ng/about.us.php" className="text-lime-600 underline text-base">Visit NTDA</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
