import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import SignatureCanvas from "react-signature-canvas";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SiteVisitReportFormProps {
  jobId: number;
  engineerName: string;
  onSubmit: (data: SiteVisitReportData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface SiteVisitReportData {
  jobId: number;
  visitDate: Date;
  ticketNumbers: string;
  engineerName: string;
  onsiteContact: string;
  timeOnsite: string;
  timeLeftSite: string;
  issueFault: string;
  actionsPerformed: string;
  issueResolved: boolean;
  contactAgreed: boolean;
  clientSignatory: string;
  clientSignatureData: string;
}

export function SiteVisitReportForm({
  jobId,
  engineerName,
  onSubmit,
  onCancel,
  isSubmitting = false
}: SiteVisitReportFormProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().slice(0, 16),
    ticketNumbers: "",
    onsiteContact: "",
    timeOnsite: new Date().toTimeString().slice(0, 5),
    timeLeftSite: "",
    issueFault: "",
    actionsPerformed: "",
    issueResolved: false,
    contactAgreed: false,
    clientSignatory: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate signature
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Client signature is required");
      return;
    }

    // Validate required fields
    if (!formData.clientSignatory.trim()) {
      toast.error("Client signatory name is required");
      return;
    }

    if (!formData.issueFault.trim() || !formData.actionsPerformed.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const signatureData = signatureRef.current.toDataURL();

    const svrData: SiteVisitReportData = {
      jobId,
      visitDate: new Date(formData.visitDate),
      ticketNumbers: formData.ticketNumbers,
      engineerName,
      onsiteContact: formData.onsiteContact,
      timeOnsite: formData.timeOnsite,
      timeLeftSite: formData.timeLeftSite,
      issueFault: formData.issueFault,
      actionsPerformed: formData.actionsPerformed,
      issueResolved: formData.issueResolved,
      contactAgreed: formData.contactAgreed,
      clientSignatory: formData.clientSignatory,
      clientSignatureData: signatureData,
    };

    onSubmit(svrData);
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Site Visit Report
          </CardTitle>
          <CardDescription>
            Complete this report before closing the job. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visit Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Visit Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visitDate">Visit Date & Time *</Label>
                <Input
                  id="visitDate"
                  type="datetime-local"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ticketNumbers">Ticket/Reference Numbers</Label>
                <Input
                  id="ticketNumbers"
                  value={formData.ticketNumbers}
                  onChange={(e) => setFormData({ ...formData, ticketNumbers: e.target.value })}
                  placeholder="e.g., INC123456, CHG789012"
                />
              </div>
              <div>
                <Label htmlFor="engineerName">Engineer Name</Label>
                <Input
                  id="engineerName"
                  value={engineerName}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="onsiteContact">Onsite Contact</Label>
                <Input
                  id="onsiteContact"
                  value={formData.onsiteContact}
                  onChange={(e) => setFormData({ ...formData, onsiteContact: e.target.value })}
                  placeholder="Name of person on site"
                />
              </div>
              <div>
                <Label htmlFor="timeOnsite">Time Arrived On Site *</Label>
                <Input
                  id="timeOnsite"
                  type="time"
                  value={formData.timeOnsite}
                  onChange={(e) => setFormData({ ...formData, timeOnsite: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="timeLeftSite">Time Left Site</Label>
                <Input
                  id="timeLeftSite"
                  type="time"
                  value={formData.timeLeftSite}
                  onChange={(e) => setFormData({ ...formData, timeLeftSite: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Work Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="issueFault">Issue/Fault Description *</Label>
                <Textarea
                  id="issueFault"
                  value={formData.issueFault}
                  onChange={(e) => setFormData({ ...formData, issueFault: e.target.value })}
                  placeholder="Describe the issue or fault encountered..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="actionsPerformed">Actions Performed *</Label>
                <Textarea
                  id="actionsPerformed"
                  value={formData.actionsPerformed}
                  onChange={(e) => setFormData({ ...formData, actionsPerformed: e.target.value })}
                  placeholder="Describe the work performed and steps taken..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="issueResolved"
                  checked={formData.issueResolved}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, issueResolved: checked as boolean })
                  }
                />
                <Label htmlFor="issueResolved" className="cursor-pointer">
                  Issue has been resolved
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contactAgreed"
                  checked={formData.contactAgreed}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, contactAgreed: checked as boolean })
                  }
                />
                <Label htmlFor="contactAgreed" className="cursor-pointer">
                  On-site contact agreed with work performed
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Sign-off */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Client Sign-off</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientSignatory">Client Name *</Label>
                <Input
                  id="clientSignatory"
                  value={formData.clientSignatory}
                  onChange={(e) => setFormData({ ...formData, clientSignatory: e.target.value })}
                  placeholder="Full name of person signing"
                  required
                />
              </div>
              <div>
                <Label>Client Signature *</Label>
                <div className="border-2 border-gray-300 rounded-lg bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-40 cursor-crosshair",
                    }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Signature
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  By signing above, the client confirms the work has been completed as described.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report & Complete Job"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

