
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function TermsOfServicePage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">Terms of Service</h1>
        {lastUpdatedDate ? (
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Last Updated: {lastUpdatedDate}
            </p>
        ) : (
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">Loading date...</p>
        )}
      </section>

      <Card className="shadow-lg">
        <CardContent className="prose prose-sm sm:prose-base max-w-none py-8 px-6 text-foreground/90">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using NigeriaGovHub.com (the “Website”), you agree to be bound by these Terms of Service (“Terms”), including our Privacy Policy and Disclaimer. If you do not agree with these Terms, please do not use the Website.
          </p>

          <h2>2. Purpose of the Website</h2>
          <p>
            NigeriaGovHub is a civic-tech platform dedicated to:<br></br>
            Providing public access to verified information about Nigerian government services, agencies, and projects.
            Publishing civic education content, news updates, and public sector guides.
            Promoting transparency, awareness, and public service literacy in Nigeria.
            This Website is not affiliated with any government agency or political party.

          </p>

          <h2>3. Use of Content</h2>
          <p>
            All content provided on this Website is for general informational purposes only.You may:
            Read, share, and link to articles on the Website.
            Use information for personal or educational purposes.
            You may not:
            Reproduce, republish, or redistribute content for commercial purposes without permission.
            Misrepresent content as your own.
            Modify, copy, or scrape large amounts of data from the site without written consent.
          </p>

          <h2>4. User Submissions</h2>
          <p>
When you submit feedback, article suggestions, or other content (including via Google Forms), you grant NigeriaGovHub the right to:

Review, edit, and publish the content on our platform.

Attribute your submission or publish it anonymously, at our discretion.

We reserve the right to reject or remove any submission that violates our editorial standards or legal policies.
          </p>

          <h2>5. Accuracy of Information</h2>
          <p>
We strive to ensure that all information on the Website is accurate and up-to-date. However:

We do not guarantee the completeness or reliability of all information.

Government policies, agencies, and services may change without notice.

Always verify sensitive or time-sensitive information directly from official government sources.

          </p>

          <h2>6. Third-Party Links</h2>
          <p>
This Website contains links to third-party websites, including government portals, services, and partner resources. NigeriaGovHub is not responsible for:

The accuracy, content, or availability of external websites.

Any losses or damages that occur from interacting with third-party platforms.
          </p>
  

          <h2>7. Intellectual Property</h2>
            <p>
All content, branding, and materials on this Website (unless otherwise stated) are the intellectual property of NigeriaGovHub. Unauthorized use, duplication, or redistribution is prohibited.

You may reference or cite our content with proper attribution.    </p>      
          <h2 className="text-green-900 size-lg">8. Limitation of Liability</h2>
          <p>
NigeriaGovHub and its team shall not be held liable for:

Errors or omissions in content.

Losses, damages, or legal issues arising from your use of the Website.

Website downtime, data loss, or technical errors.

All content is provided "as is" without warranties of any kind.

          </p>

          <h2>9. Modifications to Terms</h2>
          <p>
We reserve the right to update or modify these Terms at any time. Updates will be reflected with a revised “Effective Date” at the top of this page. Your continued use of the Website after changes indicates your acceptance of the updated Terms.

          </p>

          <h2>10. Modifications and Interruptions</h2>
          <p>
            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the Site without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
          </p>
          
          <h2>11. Governing Law</h2>
          <p>
These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from your use of the Website shall be resolved in accordance with Nigerian law.
          </p>

          <h2>14. Contact Us</h2>
           <p>
If you have questions about these Terms, please contact:
            <br />
            NigeriaGovHub<br />
           <a href="mailto:hello@nigeriagovhub.com">hello@nigeriagovhub.com</a> <br />
           <a href="http://www.nigeriagovhub.com/contact">http://www.nigeriagovhub.com/contact</a><br />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
