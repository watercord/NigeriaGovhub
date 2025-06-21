"use client";

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

export const dynamic = 'force-dynamic';
export default function LoginPage() {
  const { dictionary } = useLanguage();
  const t = dictionary.login_page;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 text-primary">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <CardTitle className="mt-6 text-3xl font-headline font-bold text-primary">
              {t.title}
            </CardTitle>
            <CardDescription>
              {t.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.no_account}{' '}
              <Button variant="link" asChild className="p-0 font-medium text-primary hover:text-primary/80">
                <Link href="/signup">
                  {t.signup_link}
                </Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
