
"use client";

import { ServiceForm } from "@/components/admin/service-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getServiceByIdAction } from "@/lib/actions";
import type { ServiceItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const serviceId = params.id as string;
  const { toast } = useToast();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
        return;
      }
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
        return;
      }

      if (serviceId) {
        setIsLoadingData(true);
        getServiceByIdAction(serviceId)
          .then(data => {
            if (data) {
              setService(data);
            } else {
              toast({ title: "Error", description: "Service not found.", variant: "destructive" });
              router.replace("/dashboard/admin/manage-services");
            }
          })
          .catch(err => {
            console.error("Failed to fetch service:", err);
            toast({ title: "Error", description: "Failed to load service.", variant: "destructive" });
          })
          .finally(() => setIsLoadingData(false));
      } else if (!serviceId) {
          toast({ title: "Error", description: "Service ID is missing.", variant: "destructive" });
          router.replace("/dashboard/admin/manage-services");
          setIsLoadingData(false);
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, serviceId, pathname]);

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData && !service)) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-60" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
         <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-lg">
                {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading service data..."}
            </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-start">
        <Button variant="outline" asChild className="button-hover">
          <Link href="/dashboard/admin/manage-services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Services
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit Service</CardTitle>
          <CardDescription>Modify the details below to update the service listing.</CardDescription>
        </CardHeader>
        <CardContent>
          {service && <ServiceForm initialData={service} serviceId={service.id} />}
        </CardContent>
      </Card>
    </div>
  );
}
