
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import Image from "next/image";

export default function HealthPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Heart className="h-10 w-10 mr-3" /> Health & Wellness
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Information on public health initiatives, services, and resources in Nigeria.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Promoting a Healthy Nation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Healthcare professionals" 
            width={800} 
            height={400} 
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="doctor patient"
          />
          <p>
            The Nigerian government is committed to ensuring the health and well-being of its citizens. This section provides access to information about various health programs, policies, and healthcare facilities.
          </p>
          <p>
            Key areas of focus include:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Primary Healthcare Services</li>
            <li>National Health Insurance Scheme (NHIS)</li>
            <li>Disease Prevention and Control</li>
            <li>Maternal and Child Health</li>
            <li>Emergency Medical Services</li>
          </ul>
          <p>
            Explore available resources, find nearby health centers, and learn about ongoing campaigns to improve public health outcomes across the nation.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for more specific content like links to health portals, statistics, etc. */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Find a Health Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Locate hospitals, clinics, and primary healthcare centers near you. (Placeholder)</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Health Advisories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Stay updated on current health alerts and preventive measures. (Placeholder)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
