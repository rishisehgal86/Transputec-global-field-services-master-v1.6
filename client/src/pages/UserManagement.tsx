import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus, Trash2, Shield } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function UserManagement() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: users, isLoading, refetch } = trpc.auth.listUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "super_admin",
  });

  const createUserMutation = trpc.auth.createUser.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      setShowCreateForm(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const deactivateUserMutation = trpc.auth.deactivateUser.useMutation({
    onSuccess: () => {
      toast.success("User deactivated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate user");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only superusers can access user management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUserPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsCreating(true);
    try {
      await createUserMutation.mutateAsync({
        email: newUserEmail,
        name: newUserName,
        password: newUserPassword,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivateUser = async (userId: number, userName: string) => {
    if (userId === user?.id) {
      toast.error("You cannot deactivate your own account");
      return;
    }

    if (confirm(`Are you sure you want to deactivate ${userName}?`)) {
      await deactivateUserMutation.mutateAsync({ userId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                  {APP_TITLE}
                </h1>
              </Link>
              <p className="text-sm text-gray-600">User Management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Create User"}
              </Button>
              <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
          <p className="text-gray-600">Create and manage admin users</p>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <CardTitle>Create New Admin User</CardTitle>
              </div>
              <CardDescription>
                Add a new administrator with full access rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@transputec.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Initial Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    disabled={isCreating}
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">
                    User will be able to change this password after first login
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    "Create Admin User"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>
              All administrators with access to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{u.name}</h3>
                        {u.role === "super_admin" && (
                          <Badge variant="default" className="bg-purple-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Superuser
                          </Badge>
                        )}
                        {u.role === "admin" && (
                          <Badge variant="secondary">Admin</Badge>
                        )}
                        {u.isActive === 0 && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      {u.lastLogin && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last login: {new Date(u.lastLogin).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {u.role !== "super_admin" && u.isActive === 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivateUser(u.id, u.name)}
                        disabled={deactivateUserMutation.isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No users found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

