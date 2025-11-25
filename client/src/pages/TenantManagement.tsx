import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, Users, Trash2, Edit, Ban, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";

/**
 * Tenant Management Page - Super Admin Only
 * Manage all organizations/tenants in the system
 */
export default function TenantManagement() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: number; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Redirect if not super admin
  if (!authLoading && user?.role !== "super_admin") {
    setLocation("/");
    return null;
  }

  const { data: organizations, isLoading, refetch } = trpc.organizations.list.useQuery();

  const createMutation = trpc.organizations.create.useMutation({
    onSuccess: () => {
      toast.success("Tenant created successfully");
      setIsCreateDialogOpen(false);
      setNewTenantName("");
      setNewTenantSlug("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create tenant: ${error.message}`);
    },
  });

  const deleteMutation = trpc.organizations.delete.useMutation({
    onSuccess: () => {
      toast.success("Tenant deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete tenant: ${error.message}`);
    },
  });

  const suspendMutation = trpc.organizations.suspend.useMutation({
    onSuccess: () => {
      toast.success("Tenant suspended successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to suspend tenant: ${error.message}`);
    },
  });

  const unsuspendMutation = trpc.organizations.unsuspend.useMutation({
    onSuccess: () => {
      toast.success("Tenant activated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to activate tenant: ${error.message}`);
    },
  });

  const handleCreateTenant = () => {
    if (!newTenantName.trim() || !newTenantSlug.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    createMutation.mutate({
      name: newTenantName.trim(),
      slug: newTenantSlug.trim().toLowerCase(),
    });
  };

  const handleDeleteTenant = (id: number, name: string) => {
    setDeleteConfirmation({ id, name });
    setDeleteConfirmText("");
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    
    if (deleteConfirmText !== deleteConfirmation.name) {
      toast.error("Tenant name does not match. Deletion cancelled.");
      return;
    }

    deleteMutation.mutate({ id: deleteConfirmation.id });
    setDeleteConfirmation(null);
    setDeleteConfirmText("");
  };

  const handleToggleSuspension = (id: number, name: string, isActive: boolean) => {
    if (isActive) {
      if (confirm(`Suspend tenant "${name}"? Users will not be able to log in until reactivated.`)) {
        suspendMutation.mutate({ id });
      }
    } else {
      unsuspendMutation.mutate({ id });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">← Back to Dashboard</Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Tenant Management</h1>
                <p className="text-sm text-gray-600">Manage all organizations and their settings</p>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">

      {/* Explainer Section */}
      <Card className="mb-6 bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Building2 className="h-5 w-5" />
            What is Tenant Management?
          </CardTitle>
          <CardDescription className="text-orange-800">
            Control and monitor all organizations using your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-orange-900 space-y-4">
          <p>
            Each <strong>tenant</strong> represents an independent organization with isolated data, users, and settings. Tenant management gives you complete control over all organizations on your platform.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-600 font-bold text-lg">1</span>
                <strong>Create Tenants</strong>
              </div>
              <p className="text-xs text-orange-700">Add new organizations with unique slugs</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-600 font-bold text-lg">2</span>
                <strong>Suspend Access</strong>
              </div>
              <p className="text-xs text-orange-700">Block login for payment or policy issues</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-600 font-bold text-lg">3</span>
                <strong>Monitor Activity</strong>
              </div>
              <p className="text-xs text-orange-700">Track last used date and subscription status</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-600 font-bold text-lg">4</span>
                <strong>Manage Admins</strong>
              </div>
              <p className="text-xs text-orange-700">View primary admins and contact information</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            {organizations?.length || 0} tenant{organizations?.length !== 1 ? "s" : ""} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Primary Admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations?.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{org.slug}</code>
                  </TableCell>
                  <TableCell>
                    {org.primaryAdminEmail ? (
                      <span className="text-sm">{org.primaryAdminEmail}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No admin</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {org.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {org.planTier === 'enterprise' ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        Professional
                      </Badge>
                    ) : org.planTier === 'starter' ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        Scale
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        Trial
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{org.projectCount || 0}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {org.lastUsedAt ? (
                      <span className="text-sm">
                        {new Date(org.lastUsedAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSuspension(org.id, org.name, org.isActive)}
                        title={org.isActive ? "Suspend tenant" : "Activate tenant"}
                      >
                        {org.isActive ? (
                          <Ban className="h-4 w-4 text-orange-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTenant(org.id, org.name)}
                        title="Delete tenant"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!organizations || organizations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No tenants found. Create your first tenant to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </main>

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>
              Add a new organization to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Tenant Name</Label>
              <Input
                id="tenant-name"
                placeholder="e.g., Acme Corporation"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-slug">Slug (URL-friendly identifier)</Label>
              <Input
                id="tenant-slug"
                placeholder="e.g., acme-corp"
                value={newTenantSlug}
                onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              />
              <p className="text-sm text-muted-foreground">
                Used in URLs: /request/{newTenantSlug || "slug"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTenant} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmation} onOpenChange={() => {
        setDeleteConfirmation(null);
        setDeleteConfirmText("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ Permanent Deletion</DialogTitle>
            <DialogDescription>
              This action <strong>cannot be undone</strong>. All data associated with this tenant will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive mb-2">
                You are about to delete:
              </p>
              <p className="text-lg font-bold text-destructive">
                {deleteConfirmation?.name}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type the tenant name to confirm deletion:
              </Label>
              <Input
                id="delete-confirm"
                placeholder={deleteConfirmation?.name}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-900">
                <strong>💡 Tip:</strong> Consider <strong>suspending</strong> the tenant instead of deleting. 
                Suspended accounts can be reactivated, but deleted accounts are gone forever.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteConfirmation(null);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteConfirmText !== deleteConfirmation?.name || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

