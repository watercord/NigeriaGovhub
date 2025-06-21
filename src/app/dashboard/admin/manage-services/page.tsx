
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Server, Edit, Trash2, Loader2 } from "lucide-react";
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
import type { ServiceItem } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { deleteService, fetchAllServicesAction } from "@/lib/actions"; // Use Server Action

export default function ManageServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';

  const fetchAdminServices = useCallback(async () => {
    if (!isLoadingAuth && isAdmin) {
      setIsLoadingData(true);
      try {
        const fetchedServices = await fetchAllServicesAction(); // Use Server Action
        setServices(fetchedServices);
      } catch (error) {
        console.error("Failed to fetch services for admin:", error);
        toast({ title: "Error", description: "Failed to load services.", variant: "destructive" });
        setServices([]);
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
        fetchAdminServices();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, fetchAdminServices, pathname]);

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteService(serviceToDelete.id);
      if (result.success) {
        toast({ title: "Service Deleted", description: result.message });
        setServices((prevServices) => prevServices.filter((s) => s.id !== serviceToDelete.id));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setServiceToDelete(null);
    });
  };

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading services..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><Server className="mr-2 h-6 w-6"/>Manage Services</CardTitle>
            <CardDescription>Add, edit, and update government service listings.</CardDescription>
          </div>
          <Button asChild className="button-hover w-full sm:w-auto">
            <Link href="/dashboard/admin/manage-services/add">
              <PlusCircle className="mr-2 h-4 w-4"/> Add New Service
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
                <TableHead>Link/Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 && !isLoadingData ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No services found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={service.title}>{service.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={service.link || service.slug}>{service.link || `/services/${service.slug}`}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Service Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/manage-services/edit/${service.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Service
                            </Link>
                          </DropdownMenuItem>
                          {service.link ? (
                            <DropdownMenuItem asChild><a href={service.link} target="_blank" rel="noopener noreferrer">Visit External Link</a></DropdownMenuItem>
                          ) : service.slug ? (
                            <DropdownMenuItem asChild><Link href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer">View Service Page</Link></DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setServiceToDelete(service)}
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Service
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

      {serviceToDelete && (
        <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service titled &quot;{serviceToDelete.title}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setServiceToDelete(null)} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteService}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Service"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
