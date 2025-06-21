
import { Card, CardContent } from "@/components/ui/card";
import { getAllServices } from "@/lib/data";
import { ServiceCard } from "@/components/services/service-card";
import { Server } from "lucide-react";
import type { ServiceItem } from "@/types";

// This page is now a Server Component, fetching data directly
export default async function ServicesPage() {
  const allServices: ServiceItem[] = await getAllServices();

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
            <Server className="h-10 w-10 mr-3" /> Government Services
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Access a wide range of online services offered by the Nigerian government.
        </p>
      </section>
      {allServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-muted-foreground">No services listed at the moment. Please check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
