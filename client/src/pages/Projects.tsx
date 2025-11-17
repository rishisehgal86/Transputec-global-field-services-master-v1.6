import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, FolderOpen, Copy, ExternalLink, Edit, ToggleRight, ToggleLeft, Info, Building2, Link2, MapPin, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ProjectSites from "@/components/ProjectSites";

export default function Projects() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  
  // Filter state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation();
  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const toggleStatusMutation = trpc.projects.toggleStatus.useMutation({
    onSuccess: () => {
      toast.success("Project status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
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
    setLocation("/login");
    return null;
  }

  const resetForm = () => {
    setProjectId("");
    setName("");
    setDescription("");
    setClientName("");
    setClientEmail("");
    setClientPhone("");
  };

  const handleCreateProject = async () => {
    if (!projectId || !name) {
      toast.error("Project ID and Name are required");
      return;
    }

    try {
      await createProjectMutation.mutateAsync({
        projectId,
        name,
        description,
        clientName,
        clientEmail,
        clientPhone,
      });

      toast.success(`Project "${name}" created successfully`);
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProjectMutation.mutateAsync({ projectId });
      toast.success("Project deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const copyProjectLink = (projectId: string) => {
    const link = `${window.location.origin}/project-request/${projectId}`;
    navigator.clipboard.writeText(link);
    toast.success("Project link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">← Back to Dashboard</Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Projects</h1>
                <p className="text-sm text-gray-600">Manage project-based job assignments</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a project with a unique ID. Each project gets its own job request link.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectId">Project ID *</Label>
                      <Input
                        id="projectId"
                        placeholder="PROJ-001"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-gray-500">Unique identifier for this project</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        placeholder="Client XYZ Deployment"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Project description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        placeholder="John Doe"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="client@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Client Phone</Label>
                      <Input
                        id="clientPhone"
                        placeholder="+1234567890"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto p-6">
        {/* Permanent Summary Section - Always Visible */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  What Are Projects?
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Projects help you organize jobs and create dedicated client portals
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Info className="h-4 w-4" />
                    Learn More
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <FolderOpen className="h-6 w-6 text-primary" />
                      Complete Guide to Projects
                    </DialogTitle>
                    <DialogDescription>
                      Everything you need to know about organizing jobs with projects
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4 overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
                    {/* Key Features */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-semibold">Multi-Client Management</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Create separate projects for each client. Track work, billing, and performance metrics independently.
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Link2 className="h-4 w-4 text-accent" />
                            </div>
                            <h4 className="font-semibold">Unique Request Links</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Each project generates a dedicated public URL that clients can bookmark to submit service requests.
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-semibold">Site Library</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pre-load service locations with GPS coordinates. Bulk upload sites via Excel for easy management.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Real-World Use Cases */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Real-World Use Cases</h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted border">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                            IT Managed Service Provider (MSP)
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            An MSP manages IT infrastructure for 20 companies. They create 20 projects (one per client), upload each client's office locations, and share unique request links with each IT manager. Clients submit tickets directly, jobs are automatically organized by client, and monthly billing reports are generated per project.
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted border">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm">2</span>
                            Facilities Management Company
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            A company maintains HVAC, electrical, and plumbing for a corporate campus. They create separate projects for each service type with the same 30 building sites. Each department gets their own request link, engineers see the contract type, and billing is separated by service category.
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted border">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                            Telecommunications Field Services
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            A telecom provider manages network equipment installations. They create a project "5G Tower Rollout - Region North" with 100 tower sites pre-loaded. Field engineers receive jobs with exact tower locations, GPS tracking shows proximity to sites, and the client portal displays installation progress across all sites.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Key Benefits</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Complete Data Isolation</p>
                            <p className="text-xs text-muted-foreground">Each project's jobs, sites, and data remain completely separate</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Branded Client Portals</p>
                            <p className="text-xs text-muted-foreground">Each client gets their own dedicated request URL to bookmark</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Bulk Site Management</p>
                            <p className="text-xs text-muted-foreground">Upload hundreds of sites at once via Excel template</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Automatic Job Association</p>
                            <p className="text-xs text-muted-foreground">Jobs submitted via project links auto-tag to correct project</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Project-Based Reporting</p>
                            <p className="text-xs text-muted-foreground">Export and analyze data per client or contract</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">GPS-Validated Sites</p>
                            <p className="text-xs text-muted-foreground">Automatic geocoding ensures accurate tracking and ETAs</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Getting Started */}
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Info className="h-5 w-5 text-accent" />
                        Getting Started
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Click <strong>"New Project"</strong> to create your first project. You'll get a unique Project ID that becomes part of your client's request URL (e.g., <code className="text-xs bg-background px-1 py-0.5 rounded">/project-request/PROJ-001</code>).
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Projects are organizational containers that group related jobs together. Each project can represent a <strong>client</strong>, <strong>service contract</strong>, <strong>facility portfolio</strong>, or any logical grouping. Each project gets a unique request URL for client self-service.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mt-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-foreground">Create Project</p>
                  <p className="text-muted-foreground text-xs">Click "New Project" to get started</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-foreground">Add Sites</p>
                  <p className="text-muted-foreground text-xs">Upload locations via Excel or add manually</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-foreground">Share Link</p>
                  <p className="text-muted-foreground text-xs">Copy the request URL and send to clients</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-foreground">Auto-Organize</p>
                  <p className="text-muted-foreground text-xs">Jobs tag automatically to projects</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {projects && projects.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background font-sans"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.name} ({project.projectId})
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-3 py-2 border border-input rounded-md bg-background font-sans"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects
              .filter(project => {
                // Project selection filter
                if (selectedProjectId !== "all" && project.projectId !== selectedProjectId) return false;
                
                // Status filter
                if (statusFilter === "active" && !project.isActive) return false;
                if (statusFilter === "inactive" && project.isActive) return false;
                
                return true;
              })
              .map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        {project.name}
                        <Badge variant="outline">{project.projectId}</Badge>
                        {!project.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2">{project.description}</CardDescription>
                      )}
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Project Specific Despatch Request Link:</span>
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {window.location.origin}/project-request/{project.projectId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyProjectLink(project.projectId)}
                          title="Copy request link"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyProjectLink(project.projectId)}
                        title="Copy project request link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/project-request/${project.projectId}`, '_blank')}
                        title="Open project request page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate({ projectId: project.projectId, isActive: !project.isActive })}
                        disabled={toggleStatusMutation.isPending}
                        title={project.isActive ? "Deactivate project" : "Activate project"}
                      >
                        {project.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.projectId)}
                        disabled={deleteProjectMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {project.clientName && (
                      <div>
                        <div className="text-gray-500">Client</div>
                        <div className="font-medium">{project.clientName}</div>
                      </div>
                    )}
                    {project.clientEmail && (
                      <div>
                        <div className="text-gray-500">Email</div>
                        <div className="font-medium">{project.clientEmail}</div>
                      </div>
                    )}
                    {project.clientPhone && (
                      <div>
                        <div className="text-gray-500">Phone</div>
                        <div className="font-medium">{project.clientPhone}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-500">Created</div>
                      <div className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {/* Site Management */}
                  <div className="mt-6">
                    <ProjectSites key={project.projectId} projectId={project.projectId} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-4">
                Create projects to organize jobs and generate unique request links for clients
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

