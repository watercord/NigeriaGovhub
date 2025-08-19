"use client";

import { OpportunityForm } from "@/components/admin/opportunity-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getOpportunityBySlugAction } from "@/lib/actions";
import type { Opportunity } from "@/types/server";

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!isLoadingAuth && isAdmin) {
        setIsLoading(true);
        try {
          const { id } = await params;
          const opportunityData = await getOpportunityBySlugAction(id);
          if (opportunityData) {
            setOpportunity(opportunityData);
          } else {
            toast({ title: "Error", description: "Opportunity not found.", variant: "destructive" });
            router.push("/dashboard/admin/manage-opportunity");
          }
        } catch (error) {
          console.error("Failed to fetch opportunity:", error);
          toast({ title: "Error", description: "Failed to load opportunity.", variant: "destructive" });
          router.push("/dashboard/admin/manage-opportunity");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        fetchOpportunity();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, pathname, params]);

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading opportunity..."}
        </p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <p className="text-lg">Opportunity not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-start">
        <Button variant="outline" asChild className="button-hover">
          <Link href="/dashboard/admin/manage-opportunity">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Opportunities
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit Opportunity</CardTitle>
          <CardDescription>Update the details of this opportunity.</CardDescription>
        </CardHeader>
        <CardContent>
          <OpportunityForm initialData={opportunity} opportunityId={opportunity.id} />
        </CardContent>
      </Card>
    </div>
  );
}