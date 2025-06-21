
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Users, Shield } from "lucide-react";
import Image from "next/image";

export default function BenefitsPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Gift className="h-10 w-10 mr-3" /> Citizen Benefits & Support
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Information on social welfare programs, grants, and support available to Nigerian citizens.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Supporting Our Citizens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Community support concept" 
            width={800} 
            height={400} 
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="community helping hands"
          />
          <p>
            The Nigerian government offers various programs and initiatives designed to provide support and benefits to its citizens, particularly the vulnerable and those in need. This section aims to centralize information on these opportunities.
          </p>
          <p>
            Learn about:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>National Social Investment Programs (NSIP) components like N-Power, Conditional Cash Transfers.</li>
            <li>Educational grants and scholarships.</li>
            <li>Youth empowerment schemes.</li>
            <li>Housing assistance programs.</li>
            <li>Support for persons with disabilities.</li>
            <li>Pension schemes and retiree benefits.</li>
          </ul>
          <p>
            Discover eligibility criteria, application processes, and contact information for relevant agencies.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Users className="mr-2 h-5 w-5"/> Social Investment Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Access information on NSIP and other social programs. (Placeholder)</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Shield className="mr-2 h-5 w-5"/> Pension Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Information from the National Pension Commission (PenCom). (Placeholder)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
