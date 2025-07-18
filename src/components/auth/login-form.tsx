'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { PasswordInput } from '../common/password-input';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const { dictionary } = useLanguage();
  const t = dictionary.login_page;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoadingCredentials(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: searchParams.get('redirect') || '/dashboard/user',
      });

      if (result?.error) {
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push(searchParams.get('redirect') || '/dashboard/user');
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      console.error('Login error:', error);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    const redirectUrl = searchParams.get('redirect') || '/dashboard/user';
    await signIn('google', { callbackUrl: redirectUrl });
  };

  const overallLoading = isLoadingCredentials || isLoadingGoogle;

  return (
    <div className="space-y-6">
      {/* Uncomment if Google provider is configured */}
      {/* <Button
        variant="outline"
        className="w-full button-hover"
        onClick={handleGoogleSignIn}
        disabled={overallLoading}
      >
        {isLoadingGoogle ? t.processing : (
          <>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.5 0 256S110.3 0 244 0c69.8 0 130.8 28.4 175.2 72.9L358.3 167.1C329.3 139.2 290.5 121.4 244 121.4c-73.3 0-133.5 58.4-133.5 130.6s60.2 130.6 133.5 130.6c76.8 0 114.1-51.7 117.8-76.3H244V261.8h244z"></path>
            </svg>
            {t.google_signin}
          </>
        )}
      </Button> */}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t.or_continue_with}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="email">{t.email_label}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.password_label}</Label>
            <Button variant="link" asChild className="text-xs p-0 h-auto">
              <Link href="/reset">{t.forgot_password_link || 'Forgot password?'}</Link>
            </Button>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register('password')}
            className="mt-1"
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full button-hover" disabled={overallLoading}>
          {isLoadingCredentials ? t.logging_in : t.login_button}
        </Button>
      </form>
    </div>
  );
}