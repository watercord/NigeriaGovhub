
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function DisclaimerPage() {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">Disclaimer</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          NigeriaGovHub is committed to transparency and providing accurate information about Nigerian government services.
        </p>
      </section>

      <Card className="shadow-lg">
        <CardContent className="prose prose-sm sm:prose-base max-w-none py-8 px-6 text-foreground/90">
          <h2>General Information</h2>
          <p>
            NigeriaGovHub is a civic-tech platform created to provide simplified, organized, and accessible information about Nigerian government services, public projects, agencies, rights education, and related news.
          </p>
          <p>
            While we strive for accuracy and clarity, NigeriaGovHub is an independent platform and not officially affiliated with any government agency of Nigeria.
          </p>

          <h2>No Legal or Official Advice</h2>
          <p>The information provided on this Website is for general knowledge, education, and public awareness only.</p>
          <p>We do not:</p>
          <ul>
            <li>Offer legal, professional, or official government advice.</li>
            <li>Guarantee that all content is 100% current, complete, or accurate at all times.</li>
            <li>Represent any government body, political group, or administrative agency.</li>
          </ul>
          <p>For official inquiries or decisions, please consult recognized government websites, legal professionals, or official institutions directly.</p>

          <h2>Third-Party Content and Links</h2>
          <p>The Website may include:</p>
          <ul>
            <li>Links to external government portals, agencies, news sources, or partner platforms.</li>
            <li>Embedded documents, forms, videos, and maps.</li>
          </ul>
          <p>We are not responsible for the accuracy, availability, or practices of third-party websites. Following any external link is at your own discretion.</p>

          <h2>Content Submissions</h2>
          <p>Some of our content is contributed by writers, researchers, or users. While we review and moderate these submissions, we are not liable for the accuracy, views, or opinions expressed by contributors.</p>
          <p>Submitted content:</p>
          <ul>
            <li>Must be original or properly attributed</li>
            <li>May be edited or rejected if it doesn't meet our editorial standards</li>
          </ul>

          <h2>No Warranty</h2>
          <p>All information on NigeriaGovHub is provided "as is," with no guarantees:</p>
          <ul>
            <li>No warranty of accuracy, reliability, or suitability</li>
            <li>No assurance of uninterrupted access or error-free functionality</li>
          </ul>
          <p>Use of this Website is at your own risk.</p>

          <h2>Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, NigeriaGovHub shall not be held liable for any loss, injury, or damage — including but not limited to:</p>
          <ul>
            <li>Decisions made based on Website content</li>
            <li>Incomplete or outdated information</li>
            <li>Site downtime, technical errors, or content removal</li>
          </ul>

          <h2>Contact Us</h2>
          <p>If you have questions or believe any information on the Website is inaccurate or misleading, please notify us:</p>
          <p>NigeriaGovHub Team<br />
          📧 <a href="mailto:hello@nigeriagovhub.com" className="text-primary hover:underline">hello@nigeriagovhub.com</a><br />
          🌐 <a href="/contact" className="text-primary hover:underline">www.nigeriagovhub.com/contact</a></p>
          
          <h2>Effective Date</h2>
          <p>This disclaimer is effective as of August 2, 2025.</p>
          
          <h2>Website Information</h2>
          <p>Website: <a href="/" className="text-primary hover:underline">www.nigeriagovhub.com</a><br />
          Owner: NigeriaGovHub Team</p>
        </CardContent>
      </Card>
    </div>
  );
}
