
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { PasswordInput } from '../common/password-input';


const newPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export function NewPasswordForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { dictionary } = useLanguage();
  const t = dictionary.new_password_page;

  const { register, handleSubmit, formState: { errors } } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onSubmit: SubmitHandler<NewPasswordFormData> = (data) => {
    setError("");
    setSuccess("");

    if (!token) {
        setError("Missing password reset token.");
        return;
    }

    startTransition(() => {
  fetch("/api/new-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: data.password, token }),
  })
    .then(async (res) => {
      const result = await res.json();
      setError(result.error);
      setSuccess(result.success);
    })
    .catch(() => {
      setError("Something went wrong. Please try again.");
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
              <Label htmlFor="password">{t.password_label}</Label>
              <PasswordInput
                id="password"
                {...register("password")}
                className="mt-1"
                disabled={isPending}
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
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
            {isPending ? t.resetting : t.reset_password_button}
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
