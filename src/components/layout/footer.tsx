
"use client";

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { useLanguage } from '@/context/language-context';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { dictionary } = useLanguage();
  const t = dictionary.footer;

  return (
    <footer className="bg-muted/50 text-muted-foreground py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo />
            <p className="mt-2 text-sm">
              {t.tagline}
            </p>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">{t.quick_links}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">{t.home}</Link></li>
              <li><Link href="/projects" className="hover:text-primary transition-colors">{t.projects}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">{t.about}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t.contact}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">{t.legal}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">{t.privacy_policy}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">{t.terms_of_service}</Link></li>
              <li><Link href="/accessibility" className="hover:text-primary transition-colors">{t.accessibility}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">{t.connect}</h3>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/profile.php?id=61577181247931" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook size={20} /></Link>
              <Link href="https://x.com/nigeriansgovhub" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter size={20} /></Link>
              <Link href="https://www.instagram.com/nigeriansgovhub/" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram size={20} /></Link>
              {/* <Link href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin size={20} /></Link>
              <Link href="#" aria-label="YouTube" className="hover:text-primary transition-colors"><Youtube size={20} /></Link> */}
            </div>
            <p className="mt-4 text-sm">
              {/* {t.ministry_info}<br /> */}
              {/* {t.address} */}
            </p>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm">
          <p>{t.copyright.replace('{year}', currentYear.toString())}</p>
          {/* <p className="mt-1">{t.initiative}</p> */}
        </div>
      </div>
    </footer>
  );
}
