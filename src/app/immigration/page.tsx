
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plane, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Nis from '@/components/common/NIS.jpg';

export default function ImmigrationPage() {
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center">
          <Users className="h-10 w-10 mr-3" /> Immigration & Citizenship
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Services related to visas, passports, residency, and Nigerian citizenship.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Navigating Immigration and Citizenship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <Image
            src={Nis}
            alt="Immigration services concept"
            width={800}
            height={400}
            className="w-full rounded-lg mb-6 shadow-md object-cover"
            data-ai-hint="passport airport"
          />
          <p>
            The Nigeria Immigration Service (NIS) is responsible for the control of persons entering or leaving Nigeria, issuance of travel documents, and administration of citizenship matters. This section provides information and links to essential services.
          </p>
          <p>
            Key services and information include:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Passport Application and Renewal (Nigerian ePassport)</li>
            <li>Visa Application (Tourist, Business, Work, etc.)</li>
            <li>Requirements for Entry and Exit</li>
            <li>Residency Permits for Foreign Nationals</li>
            <li>Information on Nigerian Citizenship by Birth, Registration, or Naturalization</li>
            <li>ECOWAS Travel Certificate</li>
          </ul>
          <p>
            Access official portals, download necessary forms, and find information on fees and processing times.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><Plane className="mr-2 h-5 w-5"/> Visa Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Find information and apply for various types of Nigerian visas. <a href="https://www.visahq.com/nigeria/" className="text-lime-600 underline text-base">Visit VisaHq</a></p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><ShieldCheck className="mr-2 h-5 w-5"/> Citizenship Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">Learn about the pathways to becoming a Nigerian citizen. <a href="https://immigration.gov.ng/" className="text-lime-600 underline text-base">Visit the NIS Portal</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
