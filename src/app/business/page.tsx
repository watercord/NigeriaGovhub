
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, LineChart, Building2 } from "lucide-react";
import Image from "next/image";
import Business from '@/components/common/FEG.jpeg';

export default function BusinessPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Briefcase className="h-10 w-10 mr-3" /> Business & Industry
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Information on investing, starting a business, and industrial development in Nigeria.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Fostering Economic Growth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image
            src={Business}
            alt="Business and industry concept"
            width={800}
            height={400}
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="city skyline factory"
          />
          <p>
            Nigeria is a dynamic market with significant opportunities for investment and business growth. The government is committed to creating a conducive environment for both local and foreign investors.
          </p>
          <p>
            This section provides resources on:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Business Registration and Licensing (CAC)</li>
            <li>Investment Incentives and Policies (NIPC)</li>
            <li>Sector-Specific Opportunities (e.g., Agriculture, Technology, Manufacturing)</li>
            <li>Trade Information and Export Promotion</li>
            <li>Support for Small and Medium Enterprises (SMEs)</li>
            <li>Industrial Parks and Special Economic Zones</li>
          </ul>
          <p>
            Explore how to navigate the business landscape, leverage available support, and contribute to Nigeria's economic prosperity.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><LineChart className="mr-2 h-5 w-5"/> Investment Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Connect with the Nigerian Investment Promotion Commission <a href="https://www.nipc.gov.ng/" target="_blank" rel="noopener noreferrer" className="text-lime-600 underline text-base">(NIPC)</a></p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Building2 className="mr-2 h-5 w-5"/> SME Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Find resources from SMEDAN and other agencies supporting SMEs. <a href="https://smedan.gov.ng/" target="_blank" rel="noopener noreferrer" className="text-lime-600 underline text-base">(SMEDAN)</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
