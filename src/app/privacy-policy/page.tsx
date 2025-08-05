
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="space-y-8 py-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">Privacy Policy</h1>
                <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">Effective Date: August 2, 2025</p>
                <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto"><a href="https://www.nigeriagovhub.com/privacy-policy">Website: www.nigeriagovhub.com</a></p>
                <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">Owner: NigeriaGovHub Team</p>
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
          <h2><strong>1. Introduction</strong></h2>
          <p>
            Welcome to NigeriaGovHub (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). respects your privacy and is committed to protecting any personal information you share with us through our website at www.nigeriagovhub.com ("the Website")
          </p>
          <p>
            This Privacy Policy explains what data we collect, how we use it, and your rights related to that information.
            {/* <ul>
              <li>Visit our website at [https://nigeriagovhub.gov.ng - Placeholder]</li>
              <li>Engage with us in other related ways ― including any sales, marketing, or events</li>
            </ul>
            In this privacy notice, if we refer to:
            <ul>
              <li>&quot;Website&quot;, we are referring to any website of ours that references or links to this policy</li>
              <li>&quot;Services&quot;, we are referring to our Website, and other related services, including any sales, marketing, or events</li>
            </ul> */}
          </p>

          <h2><strong>2. Information We Collect;</strong></h2>
          <p>
            <strong>a. Personal Information (Only if You Provide It)</strong> This includes:
          </p>
          <p>
             -Name<br/>
            -Email address<br/>
            -Article or feedback submissions<br/>
            -Any other information you choose to submit through contact forms or content contribution forms<br/>
            -We do not collect sensitive personal data (e.g. financial info, biometric data) unless explicitly required and voluntarily provided.
          </p>
          <p>
            <strong>
             b. Automatically Collected Data;
             </strong> <br/>
            <strong> When you visit our website, we may collect:</strong><br/> 
-IP address
<br/>
-Browser type and version
<br/>
-Pages visited
<br/>
-Time spent on pages
<br/>
-Referral source
<br/>
-Device type
<br/>
-This is collected through tools like Google Analytics and helps us understand how visitors use the site.

          </p>
          {/* <p>
            <strong>Information automatically collected:</strong> We automatically collect certain information when you visit, use or navigate the Website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Website and other technical information.
          </p> */}

          <h2> <strong>3. How We Use Your Information</strong></h2>
          <p><strong>
We use the information collected to: </strong> </p>
<p>
  -Provide and improve our content and services <br/>

-Respond to your feedback or article submissions<br/>

-Communicate updates or newsletters (only with your consent)<br/>

-Monitor and analyze site usage<br/>

-Maintain security and prevent spam or abuse
</p>
          
          <h2><strong>4. Cookies</strong></h2>
          <p>
Our website uses cookies to enhance your experience. Cookies are small files stored on your device to remember your preferences or analyze website traffic.

You may disable cookies in your browser settings, but some features of the site may not work properly without them.
          </p>

          <h2><strong>5. Third-Party Services</strong></h2>
          <p><strong>
We use trusted third-party services such as: </strong><br/>

-Google Analytics (for site traffic insights)<br/>

-Netlify (for hosting and form handling)<br/>

-Google Forms (for collecting user-submitted content)<br/>

-These third-party tools may collect anonymous usage data. We do not control how they handle your data beyond what is publicly disclosed in their privacy policies.
          </p>

          <h2><strong>6. Data Security</strong></h2>
          <p>
We take reasonable measures to protect your information using encryption, secure hosting, and access control. However, no method of transmission over the internet is 100% secure.
          </p>
          
          <h2>7. Data Retention</h2>
          <p>
            -We retain user-submitted content (e.g. feedback or articles) indefinitely unless removal is requested.<br/>

-Analytics data is stored for a limited time (typically 14–26 months via Google Analytics settings).
</p>

          <h2>8. Your Rights</h2><br/>
          <strong>
You have the right to:
</strong><br/>
          <p>

-Request access to personal data you’ve provided

-Request correction or deletion of your data

-Opt out of newsletter or communication services

-To make a request, contact us at: hello@nigeriagovhub.com
          </p>

          <h2><strong>9. Children’s Privacy</strong></h2>
          <p>
            -NigeriaGovHub is not directed at children under the age of 13. We do not knowingly collect personal information from minors. If you believe a child has submitted personal information, please contact us and we will delete it promptly.

          </p>
          <h2><strong>10. Changes to This Policy</strong></h2>
          <p>
            We may update this Privacy Policy periodically. Updates will be posted on this page with the “Effective Date” modified. Continued use of the site means you accept the changes.
          </p>
          <h2><strong>11. Contact Us</strong></h2>
          <p>
For questions or concerns about this Privacy Policy, contact:            <br />
            
NigeriaGovHub Team<br />
           <a href="mailto:hello@nigeriagovhub.com">hello@nigeriagovhub.com</a> <br />
           <a href="http://www.nigeriagovhub.com/contact">http://www.nigeriagovhub.com/contact</a><br />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
