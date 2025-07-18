
import type { ServiceItem } from '@/types/client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;
  return (
    <Card className="flex flex-col h-full overflow-hidden card-hover shadow-md">
      {service.imageUrl && (
         <CardHeader className="p-0 relative">
            <Image
                src={service.imageUrl}
                alt={service.title}
                data-ai-hint={service.dataAiHint || "service image"}
                width={600}
                height={300}
                className="w-full h-48 object-cover"
            />
        </CardHeader>
      )}
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center mb-2">
          {Icon && <Icon className="h-6 w-6 mr-2 text-primary" />}
          <CardTitle className="font-headline text-lg text-primary">{service.title}</CardTitle>
        </div>
        <CardDescription className="text-sm text-foreground/70 line-clamp-3">{service.summary}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="secondary" size="sm" asChild className="w-full button-hover">
          <Link href={service.link || `/services/${service.slug}`}>
            Access Service <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
