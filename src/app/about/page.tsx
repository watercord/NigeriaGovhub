import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Target, Eye } from "lucide-react";
import Image from "next/image";
import About from "@/components/common/Ab.jpg";

export default function AboutPage() {
  return (
    <div className="space-y-12 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">About NigeriaGovHub</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Fostering transparency, accountability, and citizen engagement in Nigerian governance.
        </p>
      </section>

      <section>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl font-semibold text-foreground mb-4">Our Mission</h2>
            <p className="text-foreground/90 mb-4 leading-relaxed">
             NigeriaGovHub is an independent civic-tech platform dedicated to connecting Nigerians with reliable, up-to-date information about government institutions, services, and initiatives.            </p>
            <p className="text-foreground/90 leading-relaxed">
Our mission is to make it easier for every Nigerian — home or abroad — to access public services, understand how government works, and stay informed about the positive progress being made across the country.

We:

Provide a searchable directory of government websites, contacts, and functions.

Highlight useful public services, reforms, and programs.

Share verified government updates, agency spotlights, and good news.

Publish simplified guides on how to access key public services.

While we are not affiliated with any government agency, we occasionally collaborate with official institutions to verify information, receive updates, or share achievements with the public.

Whether you're a student, business owner, civil servant, or citizen looking to engage with public institutions — NigeriaGovHub is your trusted guide.

📬 Contact Us
For corrections, partnership inquiries, or media requests, please email:
[your@email.com]

⚖ Disclaimer (for /disclaimer or footer section)
NigeriaGovHub is an independent information platform and is not owned, managed, or officially endorsed by the Federal Government of Nigeria or any government agency.

All logos, agency names, and trademarks appearing on this site belong to their respective institutions. We use them for identification and informational purposes only.

We gather data from:

Official government websites and public announcements

Direct agency communication (upon request)

Verified media sources and public records

Where possible, we confirm information with agency representatives. However, users should always refer to the official websites or contact the agency directly for the most current and authoritative information.

NigeriaGovHub shall not be held liable for decisions made based on third-party information displayed on this platform.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <Image
              src={About}
              alt="Diverse group of people collaborating"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="people collaboration"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-semibold text-center mb-10 text-foreground">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-6 card-hover">
              <CardHeader className="items-center">
                <ShieldCheck className="h-12 w-12 text-primary mb-3" />
                <CardTitle className="font-headline text-xl">Comprehensive Project Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm">
                  Access detailed information on a wide range of government projects, including budgets, timelines, and implementing ministries.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 card-hover">
              <CardHeader className="items-center">
                <Target className="h-12 w-12 text-primary mb-3" />
                <CardTitle className="font-headline text-xl">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm">
                  Stay updated on the status and milestones of key initiatives, ensuring accountability from start to finish.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 card-hover">
              <CardHeader className="items-center">
                <Eye className="h-12 w-12 text-primary mb-3" />
                <CardTitle className="font-headline text-xl">Citizen Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm">
                  Provide feedback, share your observations, and contribute to a more responsive and effective government.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-semibold text-foreground mb-4">Our Commitment</h2>
        <p className="text-foreground/90 leading-relaxed">
          NigeriaGovHub is committed to maintaining accuracy, impartiality, and timeliness in the information we provide. We work closely with government agencies to ensure data integrity and strive to present complex information in an easy-to-understand format. Your participation is vital to our success and to building a more transparent Nigeria.
        </p>
      </section>
    </div>
  );
}
