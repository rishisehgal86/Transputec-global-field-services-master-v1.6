import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Calendar, Mail, FileSpreadsheet } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export default function ScheduledExports() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [schedule, setSchedule] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [format, setFormat] = useState<"csv" | "excel">("excel");
  const [status, setStatus] = useState("all");

  const { data: scheduledExports, isLoading, refetch } = trpc.jobs.getScheduledExports.useQuery();
  const createScheduleMutation = trpc.jobs.scheduleExport.useMutation();
  const removeScheduleMutation = trpc.jobs.removeScheduledExport.useMutation();

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

  const handleCreateSchedule = async () => {
    if (!recipientEmail) {
      toast.error("Please enter recipient email");
      return;
    }

    try {
      const result = await createScheduleMutation.mutateAsync({
        schedule,
        recipientEmail,
        format,
        status: status === "all" ? undefined : status,
        isActive: true,
      });

      if (result.success) {
        toast.success(`Scheduled ${schedule} export created successfully`);
        setDialogOpen(false);
        setRecipientEmail("");
        refetch();
      } else {
        toast.error("Failed to create scheduled export");
      }
    } catch (error) {
      toast.error("Error creating scheduled export");
    }
  };

  const handleRemoveSchedule = async (id: string) => {
    try {
      const result = await removeScheduleMutation.mutateAsync({ id });
      if (result.success) {
        toast.success("Scheduled export removed");
        refetch();
      } else {
        toast.error("Failed to remove scheduled export");
      }
    } catch (error) {
      toast.error("Error removing scheduled export");
    }
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
                <h1 className="text-xl font-bold">Scheduled Exports</h1>
                <p className="text-sm text-gray-600">Automated job export reports</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Scheduled Export</DialogTitle>
                  <DialogDescription>
                    Set up automated job export reports sent via email
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <RadioGroup value={schedule} onValueChange={(v) => setSchedule(v as any)} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="sched-daily" />
                        <Label htmlFor="sched-daily" className="font-normal cursor-pointer">Daily</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="sched-weekly" />
                        <Label htmlFor="sched-weekly" className="font-normal cursor-pointer">Weekly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="sched-monthly" />
                        <Label htmlFor="sched-monthly" className="font-normal cursor-pointer">Monthly</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-gray-500">
                      {schedule === 'daily' && 'Sent every day at 8:00 AM with previous day\'s jobs'}
                      {schedule === 'weekly' && 'Sent every Monday at 8:00 AM with last 7 days\' jobs'}
                      {schedule === 'monthly' && 'Sent on 1st of month at 8:00 AM with previous month\'s jobs'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="csv" id="fmt-csv" />
                        <Label htmlFor="fmt-csv" className="font-normal cursor-pointer">CSV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="excel" id="fmt-excel" />
                        <Label htmlFor="fmt-excel" className="font-normal cursor-pointer">Excel</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status Filter</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed Only</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateSchedule} disabled={createScheduleMutation.isPending}>
                    {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : scheduledExports && scheduledExports.length > 0 ? (
          <div className="grid gap-4">
            {scheduledExports.map((export_) => (
              <Card key={export_.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {export_.schedule.charAt(0).toUpperCase() + export_.schedule.slice(1)} Export
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Automated {export_.format.toUpperCase()} export sent to {export_.recipientEmail}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSchedule(export_.id)}
                      disabled={removeScheduleMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Schedule</div>
                      <div className="font-medium">{export_.cronExpression}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Format</div>
                      <div className="flex items-center gap-1">
                        <FileSpreadsheet className="h-4 w-4" />
                        {export_.format.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Recipient</div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {export_.recipientEmail}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Status</div>
                      <Badge variant={export_.isActive ? "default" : "secondary"}>
                        {export_.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scheduled Exports</h3>
              <p className="text-gray-600 mb-4">
                Create automated export schedules to receive regular job reports via email
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

