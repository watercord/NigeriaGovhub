
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserAction } from '@/lib/actions';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/context/language-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { PasswordInput } from '../common/password-input';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { toast } = useToast();
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { dictionary } = useLanguage();
  const t = dictionary.signup_page;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (formData) => {
    setIsLoadingCredentials(true);
    setError("");
    setSuccess("");

    const result = await createUserAction({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSuccess(result.message);
      toast({
        title: "Account Created",
        description: result.message,
      });
      reset();
    } else {
      setError(result.message || "Could not create your account. Please try again.");
      toast({
        title: "Signup Failed",
        description: result.message || "An error occurred.",
        variant: "destructive",
      });
    }
    setIsLoadingCredentials(false);
  };

  const handleGoogleSignUp = async () => {
    setIsLoadingGoogle(true);
    await signIn('google', { callbackUrl: '/dashboard/user' });
  };

  const overallLoading = isLoadingCredentials || isLoadingGoogle;

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        className="w-full button-hover"
        onClick={handleGoogleSignUp}
        disabled={overallLoading}
      >
        {isLoadingGoogle ? 'Processing...' : (
          <>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.5 0 256S110.3 0 244 0c69.8 0 130.8 28.4 175.2 72.9L358.3 167.1C329.3 139.2 290.5 121.4 244 121.4c-73.3 0-133.5 58.4-133.5 130.6s60.2 130.6 133.5 130.6c76.8 0 114.1-51.7 117.8-76.3H244V261.8h244z"></path>
            </svg>
            {t.google_signup}
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            {t.or_continue_with}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">{t.name_label}</Label>
          <Input
            id="name"
            {...register("name")}
            className="mt-1"
            aria-invalid={errors.name ? "true" : "false"}
            disabled={overallLoading}
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">{t.email_label}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1"
            aria-invalid={errors.email ? "true" : "false"}
            disabled={overallLoading}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">{t.password_label}</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...register("password")}
            className="mt-1"
            aria-invalid={errors.password ? "true" : "false"}
            disabled={overallLoading}
          />
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t.confirm_password_label}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="mt-1"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            disabled={overallLoading}
          />
          {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {success && (
            <Alert variant="default" className="bg-emerald-500/15 border-emerald-500 text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
            </Alert>
        )}

        <Button type="submit" className="w-full button-hover" disabled={overallLoading}>
          {isLoadingCredentials ? t.creating_account : t.signup_button}
        </Button>
      </form>
    </div>
  );
}
