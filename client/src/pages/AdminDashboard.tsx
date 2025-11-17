import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ExternalLink, MapPin, Users, LogOut, FolderOpen, Building2 } from "lucide-react";
import { LogoImage } from "@/components/LogoImage";
import { CompactDualTime } from "@/components/DualTimeDisplay";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { JobFilters } from "@/components/JobFilters";
import { ExportJobsDialog } from "@/components/ExportJobsDialog";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "urgent" | "overdue" | "pending" | "in_progress">("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  
  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Force full page reload to clear all client state
      window.location.replace('/');
    },
  });
  
  // Fetch organization for display
  const { data: organization } = trpc.organizations.getMy.useQuery(undefined, {
    enabled: isAuthenticated && !!user?.organizationId,
  });
  
  // Fetch projects for filter
  const { data: projects } = trpc.projects.list.useQuery();
  
  // Fetch all jobs or filtered jobs based on active filter
  const { data: allJobs, isLoading: isLoadingAll } = trpc.jobs.list.useQuery(undefined, {
    enabled: activeFilter === "all",
  });
  
  const { data: filteredJobs, isLoading: isLoadingFiltered } = trpc.jobs.getFiltered.useQuery(
    { filter: activeFilter as any },
    { enabled: activeFilter !== "all" }
  );
  
  const { data: filterCounts } = trpc.jobs.getFilterCounts.useQuery();
  
  let jobs = activeFilter === "all" ? allJobs : filteredJobs;
  const isLoading = activeFilter === "all" ? isLoadingAll : isLoadingFiltered;
  
  // Apply project filter if selected
  if (selectedProject !== "all" && jobs) {
    jobs = jobs.filter(job => job.projectId === selectedProject);
  }

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending_approval: { variant: "secondary", label: "Pending Approval" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      created: { variant: "secondary", label: "Created" },
      sent_to_engineer: { variant: "secondary", label: "Sent to Engineer" },
      accepted: { variant: "default", label: "Accepted" },
      declined: { variant: "destructive", label: "Declined" },
      en_route: { variant: "default", label: "En Route" },
      on_site: { variant: "default", label: "On Site" },
      completed: { variant: "outline", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Top Row: Logo, Title, Organization */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Link href="/">
                <LogoImage className="h-12 cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
              <div className="hidden md:block border-l border-border pl-4">
                <p className="text-base font-semibold text-foreground">On-Demand Despatch Field Services Platform</p>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            
            {/* Organization & Admin Display */}
            <div className="flex items-center gap-3">
              {organization && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-md border border-orange-200">
                  <span className="text-xs font-medium text-orange-700">Organization:</span>
                  <span className="text-sm font-semibold text-orange-900">{organization.name}</span>
                </div>
              )}
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                  <span className="text-xs text-gray-600">{user.email}</span>
                  {user.isPrimaryAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-medium">
                      Primary Admin
                    </span>
                  )}
                  {user.role === 'super_admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white font-medium">
                      Super Admin
                    </span>
                  )}
                  {user.role === 'admin' && !user.isPrimaryAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-600 text-white font-medium">
                      Admin
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Row: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Actions Group */}
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              <Link href="/admin/create">
                <Button size="default" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Admin Job Creation
                </Button>
              </Link>
              
              {/* Public Job Creation Form - Link + Copy */}
              <div className="flex items-center">
                <Link href={organization?.slug ? `/request/${organization.slug}` : "#"}>
                  <Button 
                    variant="outline"
                    disabled={!organization?.slug}
                    className="rounded-r-none border-r-0"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Public Job Creation Form
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => {
                    if (organization?.slug) {
                      const url = `${window.location.origin}/request/${organization.slug}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Public form URL copied!');
                    }
                  }}
                  disabled={!organization?.slug}
                  title="Copy public form URL"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </Button>
              </div>
              
              {/* Manage Projects */}
              <Link href="/projects">
                <Button variant="outline">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Manage Projects
                </Button>
              </Link>
            </div>
            
            {/* Secondary Actions Group */}
            <div className="flex items-center gap-2">
              <ExportJobsDialog />
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
              </Link>
              
              {/* Tenant Management (Super Admin Only) */}
              {user?.role === 'super_admin' && (
                <Link href="/admin/tenants">
                  <Button variant="outline" size="sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    Tenant Management
                  </Button>
                </Link>
              )}
              
              {/* Logout Button */}
              <Button 
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Field Service Jobs</h2>
          <p className="text-muted-foreground">Manage and track all dispatch requests</p>
        </div>

        {/* Quick Filters */}
        <div className="mb-6 space-y-4">
          <JobFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />
          
          {/* Project Filter */}
          {projects && projects.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Filter by Project:</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.projectId}>
                      {project.name} ({project.projectId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProject("all")}
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{job.siteName}</CardTitle>
                        {getStatusBadge(job.status)}
                      </div>
                      <CardDescription>
                        <div className="space-y-1">
                          <p><strong>Client:</strong> {job.clientName}</p>
                          {job.siteLocation && <p><strong>Location:</strong> {job.siteLocation}</p>}
                          {job.projectId && (
                            <p>
                              <strong>Project ID:</strong>{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {job.projectId}
                              </span>
                            </p>
                          )}
                          {job.projectName && <p><strong>Project Name:</strong> {job.projectName}</p>}
                          {job.scheduledDateTime && (
                            <div className="flex items-start gap-2">
                              <strong>Scheduled:</strong>
                              <CompactDualTime date={job.scheduledDateTime} timezone={job.timezone ?? undefined} />
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {job.status === "pending_approval" && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/job/${job.id}`}
                          >
                            Review Request
                          </Button>
                        </>
                      )}
                      {job.status !== "pending_approval" && (
                        <Link href={`/admin/job/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {job.engineerName && (
                      <div>
                        <p className="text-muted-foreground">Engineer</p>
                        <p className="font-medium">{job.engineerName}</p>
                      </div>
                    )}
                    {job.acceptedAt && (
                      <div>
                        <p className="text-muted-foreground">Accepted At</p>
                        <CompactDualTime date={job.acceptedAt} timezone={job.timezone ?? undefined} />
                      </div>
                    )}
                    {job.completedAt && (
                      <div>
                        <p className="text-muted-foreground">Completed At</p>
                        <CompactDualTime date={job.completedAt} timezone={job.timezone ?? undefined} />
                      </div>
                    )}
                  </div>
                  
                  {job.status === "accepted" || job.status === "created" || job.status === "sent_to_engineer" ? (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm font-medium text-foreground">Share Links:</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/engineer/${job.jobToken}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Copy Engineer Link
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/track/${job.jobToken}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Copy Client Link
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground mb-4">No jobs created yet</p>
              <Link href="/admin/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

