
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus, Trash2, Users as UsersIcon, Edit, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useEffect, useState, useTransition, useCallback } from "react";
import type { User as AppUser } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteUser as deleteUserAction, fetchAllUsersAction } from "@/lib/actions"; // Use Server Action

export default function ManageUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const isLoadingAuth = status === 'loading';
  const isUserNotAuthenticated = status === 'unauthenticated';
  const isAdmin = session?.user?.role === 'admin';
  const currentUserId = session?.user?.id;

  const loadUsers = useCallback(async () => {
    if (isAdmin) {
      setIsLoadingData(true);
      try {
        const allUsers = await fetchAllUsersAction(); // Use Server Action
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({ title: "Error", description: "Failed to load user data.", variant: "destructive" });
        setUsers([]);
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isUserNotAuthenticated) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace("/dashboard/user");
      } else {
        loadUsers();
      }
    }
  }, [session, status, isLoadingAuth, isUserNotAuthenticated, isAdmin, router, toast, loadUsers, pathname]);

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) return;

    if (userToDelete.id === currentUserId) {
      toast({
        title: "Action Denied",
        description: "Administrators cannot delete their own profiles from this interface.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }

    startTransition(async () => {
      const result = await deleteUserAction(userToDelete.id!);
      if (result.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
        toast({ title: "User Profile Deleted", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setUserToDelete(null);
    });
  };

  if (isLoadingAuth || isUserNotAuthenticated || (status === 'authenticated' && !isAdmin) || (isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-3 text-lg">
          {isLoadingAuth || isUserNotAuthenticated ? "Verifying access..." : "Loading user data..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center"><UsersIcon className="mr-2 h-6 w-6"/>Manage Users</CardTitle>
            <CardDescription>View, edit, and manage user profiles from the database.</CardDescription>
          </div>
          {/* <Button className="button-hover w-full sm:w-auto" disabled>
            <UserPlus className="mr-2 h-4 w-4" /> Add New User (Coming Soon)
          </Button> */}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && !isLoadingData ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No user profiles found in the database.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">User Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* <DropdownMenuItem disabled> <Edit className="mr-2 h-4 w-4" /> Edit User (Coming Soon)</DropdownMenuItem> */}
                          {/* <DropdownMenuItem disabled={isPending || user.id === currentUserId}> */}
                            {user.role === 'user' ? 'Make Admin (Coming Soon)' : 'Make User (Coming Soon)'}
                          {/* </DropdownMenuItem> */}
                          {/* <DropdownMenuItem disabled={isPending || user.id === currentUserId}> */}
                            {/* Deactivate User (Coming Soon) */}
                          {/* </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-destructive focus:bg-destructive/20 focus:text-destructive-foreground"
                            disabled={isPending || user.id === currentUserId}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User Profile
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

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the user profile for &quot;{userToDelete.name || userToDelete.email}&quot; from the application&apos;s user table. This disassociates their feedback but does NOT automatically delete their NextAuth.js accounts or sessions if using OAuth.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isPending ? "Deleting Profile..." : "Yes, Delete Profile"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

