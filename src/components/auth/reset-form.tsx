
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useState, useTransition } from 'react';
import { resetAction } from '@/lib/actions';
import { useLanguage } from '@/context/language-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const resetSchema = z.object({
  email: z.string().email({ message: "An email is required." }),
});

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const { dictionary } = useLanguage();
  const t = dictionary.reset_password_page;

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit: SubmitHandler<ResetFormData> = (data) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      resetAction(data.email)
        .then((res) => {
          setError(res.error);
          setSuccess(res.success);
        });
    });
  };

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!success && (
             <div>
              <Label htmlFor="email">{t.email_label}</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1"
                disabled={isPending}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t.error_title}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
              <Alert variant="default" className="bg-emerald-500/15 border-emerald-500 text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>{t.success_title}</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
              </Alert>
          )}
          <Button type="submit" className="w-full button-hover" disabled={isPending || !!success}>
            {isPending ? t.sending : t.send_reset_link_button}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="w-full" asChild>
          <Link href="/login">
            {t.back_to_login}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
