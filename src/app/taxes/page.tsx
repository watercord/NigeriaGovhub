
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import Image from "next/image";

export default function TaxesPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Scale className="h-10 w-10 mr-3" /> Taxation in Nigeria
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Understanding your tax obligations and accessing tax-related services.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Your Guide to Nigerian Taxes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Taxation concept image" 
            width={800} 
            height={400} 
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="calculator documents"
          />
          <p>
            Taxes are a vital component of national development, funding public services and infrastructure. This section aims to provide clarity on the Nigerian tax system, helping citizens and businesses understand their responsibilities and how to comply.
          </p>
          <p>
            Key information available includes:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Types of Taxes (e.g., Personal Income Tax, VAT, Company Income Tax)</li>
            <li>Tax Identification Number (TIN) registration</li>
            <li>Online tax filing procedures</li>
            <li>Information on tax incentives and exemptions</li>
            <li>Contact details for the Federal Inland Revenue Service (FIRS) and State Internal Revenue Services.</li>
          </ul>
          <p>
            We encourage all eligible individuals and businesses to fulfill their tax obligations promptly to contribute to Nigeria's growth and development.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl">FIRS Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Access the official Federal Inland Revenue Service portal for e-filing and tax information. (Placeholder for link)</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Tax Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Estimate your tax liabilities with our helpful tools. (Placeholder)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
