
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/lib/actions";
import type { SiteSettings } from "@/types/client";
import { Loader2 } from "lucide-react";

const settingsSchema = z.object({
  siteName: z.string().min(3, "Site name must be at least 3 characters.").max(100).optional().nullable(),
  maintenanceMode: z.boolean(),
  contactEmail: z.string().email("Invalid contact email.").optional().nullable(),
  footerMessage: z.string().max(300, "Footer message too long.").optional().nullable(),
});

export type SiteSettingsFormData = z.infer<typeof settingsSchema>;

const defaultSettings: SiteSettingsFormData = {
  siteName: "NigeriaGovHub",
  maintenanceMode: false,
  contactEmail: "info@nigeriagovhub.gov.ng",
  footerMessage: `© ${new Date().getFullYear()} NigeriaGovHub. All rights reserved.`,
};

export default function SiteSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [initialSettings, setInitialSettings] = useState<SiteSettingsFormData>(defaultSettings);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        const loadSettings = async () => {
          setIsLoadingSettings(true);
          try {
            const fetchedSettings = await fetchSiteSettingsAction();
            const formValues = {
              siteName: fetchedSettings?.siteName ?? defaultSettings.siteName,
              maintenanceMode: fetchedSettings?.maintenanceMode ?? defaultSettings.maintenanceMode,
              contactEmail: fetchedSettings?.contactEmail ?? defaultSettings.contactEmail,
              footerMessage: fetchedSettings?.footerMessage ?? defaultSettings.footerMessage,
            };
            setInitialSettings(formValues);
            reset(formValues);
          } catch (error) {
            console.error("Failed to fetch site settings:", error);
            toast({ title: "Error", description: "Could not load site settings. Using defaults.", variant: "destructive" });
            setInitialSettings(defaultSettings);
            reset(defaultSettings);
          } finally {
            setIsLoadingSettings(false);
          }
        };
        loadSettings();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, reset, pathname]);


  const onSubmit: SubmitHandler<SiteSettingsFormData> = async (data) => {
    const result = await updateSiteSettingsAction(data);
    if (result.success) {
      toast({
        title: "Settings Saved",
        description: "Site settings have been successfully updated.",
      });
      const updatedFormValues = {
        siteName: result.settings?.siteName ?? data.siteName ?? defaultSettings.siteName,
        maintenanceMode: result.settings?.maintenanceMode ?? data.maintenanceMode ?? defaultSettings.maintenanceMode,
        contactEmail: result.settings?.contactEmail ?? data.contactEmail ?? defaultSettings.contactEmail,
        footerMessage: result.settings?.footerMessage ?? data.footerMessage ?? defaultSettings.footerMessage,
      };
      setInitialSettings(updatedFormValues);
      reset(updatedFormValues);
    } else {
      toast({
        title: "Error Saving Settings",
        description: result.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingSettings)) {
     return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading site settings..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Site Settings</CardTitle>
          <CardDescription>Configure global settings for NigeriaGovHub.</CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" {...register("siteName")} className="mt-1" />
              {errors.siteName && <p className="text-sm text-destructive mt-1">{errors.siteName.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactEmail">Default Contact Email</Label>
              <Input id="contactEmail" type="email" {...register("contactEmail")} className="mt-1" />
              {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>}
            </div>
             <div>
              <Label htmlFor="footerMessage">Footer Message</Label>
              <Textarea id="footerMessage" {...register("footerMessage")} className="mt-1" rows={3} />
              {errors.footerMessage && <p className="text-sm text-destructive mt-1">{errors.footerMessage.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>Temporarily make the site unavailable to visitors, except administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
               <Controller
                name="maintenanceMode"
                control={control}
                render={({ field }) => (
                   <Switch
                    id="maintenanceMode"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
            </div>
            {errors.maintenanceMode && <p className="text-sm text-destructive mt-1">{errors.maintenanceMode.message}</p>}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => reset(initialSettings)} disabled={isSubmitting} className="w-full sm:w-auto">
                Reset Changes
            </Button>
            <Button type="submit" className="button-hover w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
        </div>
      </form>
    </div>
  );
}

