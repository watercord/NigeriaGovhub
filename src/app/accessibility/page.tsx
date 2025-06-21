
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

export default function AccessibilityPage() {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);


  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">Accessibility Statement</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          NigeriaGovHub is committed to ensuring digital accessibility for people with disabilities.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardContent className="prose prose-sm sm:prose-base max-w-none py-8 px-6 text-foreground/90">
          <h2>Our Commitment</h2>
          <p>
            NigeriaGovHub is committed to making its website accessible, in accordance with relevant national and international standards, including the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>

          <h2>Measures to Support Accessibility</h2>
          <p>NigeriaGovHub takes the following measures to ensure accessibility of its website:</p>
          <ul>
            <li>Include accessibility as part of our mission statement.</li>
            <li>Integrate accessibility into our procurement practices.</li>
            <li>Appoint an accessibility officer and/or ombudsperson.</li>
            <li>Provide continual accessibility training for our staff.</li>
            <li>Assign clear accessibility targets and responsibilities.</li>
            <li>Employ formal accessibility quality assurance methods.</li>
          </ul>

          <h2>Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. NigeriaGovHub is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard. We are actively working to achieve full conformance.
          </p>
          
          <h2>Technical Specifications</h2>
          <p>Accessibility of NigeriaGovHub relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:</p>
          <ul>
            <li>HTML</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
          <p>These technologies are relied upon for conformance with the accessibility standards used.</p>

          <h2>Limitations and Alternatives</h2>
          <p>Despite our best efforts to ensure accessibility of NigeriaGovHub, there may be some limitations. Please contact us if you observe an issue not listed below.</p>
          <p>Known limitations for NigeriaGovHub:</p>
          <ul>
            <li><strong>User-generated content:</strong> Uploaded images or documents by users may not always have text alternatives. We monitor user comments and contributions and typically repair issues within a reasonable timeframe. Please report any issues you encounter.</li>
            <li><strong>Third-party integrations:</strong> Some embedded third-party content or services may not fully conform to our accessibility standards. We are working with these providers to improve accessibility.</li>
          </ul>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of NigeriaGovHub. Please let us know if you encounter accessibility barriers on NigeriaGovHub:
          </p>
          <ul>
            <li><Mail className="inline h-4 w-4 mr-1" />E-mail: <a href="mailto:accessibility@nigeriagovhub.gov.ng" className="text-primary hover:underline">accessibility@nigeriagovhub.gov.ng</a> (Placeholder)</li>
            <li><Phone className="inline h-4 w-4 mr-1" />Phone: [Placeholder Phone Number]</li>
            <li><MapPin className="inline h-4 w-4 mr-1" />Postal Address: [Placeholder Address]</li>
          </ul>
          <p>We try to respond to feedback within 5 business days.</p>

          <h2>Assessment Approach</h2>
          <p>
            NigeriaGovHub assessed the accessibility of its website by the following approaches:
          </p>
          <ul>
            <li>Self-evaluation</li>
            <li>External evaluation (planned for future iterations)</li>
          </ul>
          
          <h2>Date</h2>
          {currentDate ? <p>This statement was created on {currentDate}.</p> : <p>Loading date...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
