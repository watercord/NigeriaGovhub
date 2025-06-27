
"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerificationAction } from "@/lib/actions";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export const VerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing verification token!");
      return;
    }

    newVerificationAction(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });

  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex items-center justify-center w-full">
        <Card className="w-[400px] shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Confirming your verification</CardTitle>
                <CardDescription>Please wait while we verify your email.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[100px]">
                {!success && !error && (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                )}
                {success && (
                    <div className="flex flex-col items-center gap-2 text-emerald-600">
                        <CheckCircle className="h-8 w-8" />
                        <p>{success}</p>
                    </div>
                )}
                {error && (
                     <div className="flex flex-col items-center gap-2 text-destructive">
                        <XCircle className="h-8 w-8" />
                        <p>{error}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button variant="link" className="w-full" asChild>
                    <Link href="/login">
                        Back to login
                    </Link>
                 </Button>
            </CardFooter>
        </Card>
    </div>
  );
};
export const VerificationFormSkeleton = () => {
    return (
        <Card className="w-[400px] shadow-md">
            <CardHeader className="text-center">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full mx-auto mt-2" />
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[100px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}
