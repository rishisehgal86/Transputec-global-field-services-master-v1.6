import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function ExportJobsDialog() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [deliveryMethod, setDeliveryMethod] = useState<"download" | "email">("download");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Get current month dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    };
  };

  const handleThisMonth = () => {
    const { start, end } = getCurrentMonthDates();
    setStartDate(start);
    setEndDate(end);
  };

  const exportJobsMutation = trpc.jobs.exportJobs.useQuery(
    {
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      status: status === "all" ? undefined : status,
    },
    {
      enabled: false, // Don't run automatically
    }
  );

  const emailExportMutation = trpc.jobs.emailExport.useMutation();

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    if (deliveryMethod === "email" && !recipientEmail) {
      toast.error("Please enter recipient email address");
      return;
    }

    setIsExporting(true);
    
    try {
      // Trigger the query
      const result = await exportJobsMutation.refetch();
      
      if (!result.data || result.data.length === 0) {
        toast.info("No jobs found for the selected date range and status");
        setIsExporting(false);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(result.data[0]);
      const csvContent = [
        headers.join(','),
        ...result.data.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in values
            const stringValue = String(value || '');
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ].join('\n');

      // Create and download file based on format
      let blob: Blob;
      let filename: string;
      
      if (format === 'excel') {
        // For Excel, we need to fetch the binary data from server
        const response = await fetch('/api/trpc/jobs.exportJobsExcel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status === 'all' ? undefined : status,
          }),
        });
        
        if (!response.ok) throw new Error('Excel export failed');
        
        const excelBlob = await response.blob();
        blob = excelBlob;
        filename = `jobs_export_${startDate}_to_${endDate}${status !== 'all' ? `_${status}` : ''}.xlsx`;
      } else {
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `jobs_export_${startDate}_to_${endDate}${status !== 'all' ? `_${status}` : ''}.csv`;
      }
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (deliveryMethod === "email") {
        // Send via email
        const emailResult = await emailExportMutation.mutateAsync({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: status === "all" ? undefined : status,
          format,
          recipientEmail,
        });
        
        if (emailResult.success) {
          toast.success(`Export emailed to ${recipientEmail} (${emailResult.count} jobs)`);
          setOpen(false);
        } else {
          toast.error("Failed to send export email");
        }
      } else {
        toast.success(`Exported ${result.data.length} jobs successfully`);
        setOpen(false);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export jobs");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Jobs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Jobs</DialogTitle>
          <DialogDescription>
            Export jobs to CSV file by selecting a date range and optional status filter.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Quick action button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleThisMonth}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              This Month
            </Button>
          </div>

          {/* Date range inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Format selector */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as "csv" | "excel")} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label htmlFor="format-csv" className="font-normal cursor-pointer">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="format-excel" />
                <Label htmlFor="format-excel" className="font-normal cursor-pointer">Excel (.xlsx)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status Filter</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="sent_to_engineer">Sent to Engineer</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="en_route">En Route</SelectItem>
                <SelectItem value="on_site">On Site</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery method */}
          <div className="space-y-2">
            <Label>Delivery Method</Label>
            <RadioGroup value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as "download" | "email")} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="download" id="delivery-download" />
                <Label htmlFor="delivery-download" className="font-normal cursor-pointer flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="delivery-email" />
                <Label htmlFor="delivery-email" className="font-normal cursor-pointer flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Email recipient (shown only when email delivery is selected) */}
          {deliveryMethod === "email" && (
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="admin@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !startDate || !endDate}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export to CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

