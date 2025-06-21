
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateUserNameAction } from "@/lib/actions";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  email: z.string().email("Invalid email address.").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const authLoading = status === 'loading';
  const user = session?.user;

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, status, router, setValue]);

  const onSubmitName: SubmitHandler<ProfileFormData> = async (data) => {
    if (!data.name) return;

    const result = await updateUserNameAction(data.name);

    if (result.success) {
      await updateSession({ name: data.name });
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
     return (
        <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">Please log in to view your profile.</p>
             <Button asChild className="button-hover" onClick={() => router.push('/login')}>
                Go to Login
            </Button>
        </div>
    );
  }

  const currentName = user.name || "User";
  const currentEmail = user.email || "No email";
  const initialAvatarName = user.name || user.email?.split('@')[0] || "User";

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Profile</CardTitle>
          <CardDescription>Manage your personal information and account settings.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader className="items-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                        <Image
                            src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(initialAvatarName)}&background=13714C&color=fff&size=128&font-size=0.4`}
                            alt={currentName}
                            width={128}
                            height={128}
                            className="rounded-full border-4 border-primary shadow-md object-cover"
                        />
                    </div>
                    <CardTitle className="font-headline text-xl">{currentName}</CardTitle>
                    <CardDescription>{currentEmail}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-center">
                    <p className="text-xs text-muted-foreground">Avatar can be changed via your social provider or Gravatar for email-based accounts. Direct upload feature coming soon.</p>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmitName)} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...register("name")} className="mt-1" placeholder="Your full name"/>
                            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address (Cannot be changed here)</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="mt-1 bg-muted/50 cursor-not-allowed"
                                readOnly
                                disabled
                            />
                            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                            <p className="text-xs text-muted-foreground mt-1">Email changes for OAuth accounts are managed via the provider. For credentials accounts, this requires a dedicated verification process.</p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" className="button-hover" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Name Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
