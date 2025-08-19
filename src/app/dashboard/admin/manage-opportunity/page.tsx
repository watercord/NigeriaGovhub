"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Newspaper, Edit, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState, useTransition, useCallback } from "react";
import type { Opportunity } from "@/types/server";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import Link from "next/link";
import { deleteOpportunity, fetchAllOpportunitiesAction } from "@/lib/actions";

export default function ManageOpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  const fetchAdminOpportunities = useCallback(async () => {
    if (!isLoadingAuth && isAdmin) {
      setIsLoadingData(true);
      try {
        const fetchedOpportunities = await fetchAllOpportunitiesAction();
        setOpportunities(fetchedOpportunities);
      } catch (error) {
        console.error("Failed to fetch opportunities for admin:", error);
        toast({ title: "Error", description: "Failed to load opportunities.", variant: "destructive" });
        setOpportunities([]);
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [isAdmin, isLoadingAuth, toast]);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        fetchAdminOpportunities();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, fetchAdminOpportunities, pathname]);

  const handleDeleteOpportunity = async () => {
    if (!opportunityToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteOpportunity(opportunityToDelete.id);
      if (result.success) {
        toast({ title: "Opportunity Deleted", description: result.message });
        setOpportunities((prevOpportunities) => prevOpportunities.filter((a) => a.id !== opportunityToDelete.id));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setOpportunityToDelete(null);
    });
  };

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading opportunities..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><Newspaper className="mr-2 h-6 w-6"/>Manage Opportunities</CardTitle>
            <CardDescription>Add, edit, and publish opportunities from the database.</CardDescription>
          </div>
          <Button asChild className="button-hover w-full sm:w-auto">
            <Link href="/dashboard/admin/manage-opportunity/add">
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Opportunity
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No opportunities found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                opportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={opportunity.title}>{opportunity.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{opportunity.category}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(opportunity.publishedDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Opportunity Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/manage-opportunity/edit/${opportunity.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Opportunity
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                             <Link href={`/opportunities/${opportunity.slug}`} target="_blank" rel="noopener noreferrer">View Opportunity</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setOpportunityToDelete(opportunity)}
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Opportunity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       {opportunityToDelete && (
        <AlertDialog open={!!opportunityToDelete} onOpenChange={() => setOpportunityToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the opportunity titled "{opportunityToDelete.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpportunityToDelete(null)} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOpportunity}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Opportunity"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}