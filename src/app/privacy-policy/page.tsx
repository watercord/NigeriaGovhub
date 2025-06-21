
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
          <h2>1. Introduction</h2>
          <p>
            Welcome to NigeriaGovHub (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at [info@nigeriagovhub.gov.ng - Placeholder].
          </p>
          <p>
            This privacy notice describes how we might use your information if you:
            <ul>
              <li>Visit our website at [https://nigeriagovhub.gov.ng - Placeholder]</li>
              <li>Engage with us in other related ways ― including any sales, marketing, or events</li>
            </ul>
            In this privacy notice, if we refer to:
            <ul>
              <li>&quot;Website&quot;, we are referring to any website of ours that references or links to this policy</li>
              <li>&quot;Services&quot;, we are referring to our Website, and other related services, including any sales, marketing, or events</li>
            </ul>
          </p>

          <h2>2. What Information Do We Collect?</h2>
          <p>
            <strong>Personal information you disclose to us:</strong> We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website (such as posting messages in our online forums or entering competitions, contests or giveaways) or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Website, the choices you make and the products and features you use. The personal information we collect may include the following: Name, Email Address, Usernames, Passwords, Contact Preferences.
          </p>
          <p>
            <strong>Information automatically collected:</strong> We automatically collect certain information when you visit, use or navigate the Website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Website and other technical information.
          </p>

          <h2>3. How Do We Use Your Information?</h2>
          <p>
            We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. 
            <ul>
                <li>To facilitate account creation and logon process.</li>
                <li>To post testimonials (with your consent).</li>
                <li>Request feedback.</li>
                <li>To enable user-to-user communications (with consent).</li>
                <li>To manage user accounts.</li>
                <li>To send administrative information to you.</li>
                <li>To protect our Services.</li>
                <li>To respond to user inquiries/offer support to users.</li>
            </ul>
          </p>
          
          <h2>4. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, Legal Obligations, Vital Interests.
          </p>

          <h2>5. How Long Do We Keep Your Information?</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
          </p>

          <h2>6. How Do We Keep Your Information Safe?</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>
          
          <h2>7. What Are Your Privacy Rights?</h2>
          <p>
            In some regions (like the European Economic Area and the UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information.
          </p>
          <p>If you are a resident in the European Economic Area or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority.</p>

          <h2>8. Updates To This Notice</h2>
          <p>
            We may update this privacy notice from time to time. The updated version will be indicated by an updated &quot;Revised&quot; date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
          </p>

          <h2>9. How Can You Contact Us About This Notice?</h2>
          <p>
            If you have questions or comments about this notice, you may email us at [info@nigeriagovhub.gov.ng - Placeholder] or by post to:
            <br />
            NigeriaGovHub<br />
            [Relevant Ministry/Department Address - Placeholder]<br />
            Abuja, FCT, Nigeria
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
