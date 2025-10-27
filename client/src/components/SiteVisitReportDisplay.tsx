import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FileText, CheckCircle2, XCircle, Mail } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface SiteVisitReportDisplayProps {
  svr: any;
  jobData?: any;
  showEmailOption?: boolean;
  onEmailSVR?: (email: string) => void;
}

export function SiteVisitReportDisplay({
  svr,
  jobData,
  showEmailOption = false,
  onEmailSVR,
}: SiteVisitReportDisplayProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleEmailSubmit = () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (onEmailSVR) {
      onEmailSVR(emailAddress);
      setEmailAddress("");
      setShowEmailForm(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Site Visit Report
          </CardTitle>
          {showEmailOption && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailForm(!showEmailForm)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showEmailForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <Label htmlFor="emailAddress">Send report to email address</Label>
            <div className="flex gap-2">
              <Input
                id="emailAddress"
                type="email"
                placeholder="recipient@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
              <Button onClick={handleEmailSubmit} size="sm">
                Send
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Visit Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-900">Visit Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium text-gray-500">Visit Date</div>
              <div className="text-gray-900">{formatDateTime(svr.visitDate)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Engineer</div>
              <div className="text-gray-900">{svr.engineerName}</div>
            </div>
            {svr.ticketNumbers && (
              <div>
                <div className="text-sm font-medium text-gray-500">Ticket Numbers</div>
                <div className="text-gray-900">{svr.ticketNumbers}</div>
              </div>
            )}
            {svr.onsiteContact && (
              <div>
                <div className="text-sm font-medium text-gray-500">Onsite Contact</div>
                <div className="text-gray-900">{svr.onsiteContact}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-500">Time Arrived</div>
              <div className="text-gray-900">{svr.timeOnsite}</div>
            </div>
            {svr.timeLeftSite && (
              <div>
                <div className="text-sm font-medium text-gray-500">Time Left Site</div>
                <div className="text-gray-900">{svr.timeLeftSite}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Work Details */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-900">Work Details</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Issue/Fault Description</div>
              <div className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {svr.issueFault}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Actions Performed</div>
              <div className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {svr.actionsPerformed}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                {svr.issueResolved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">Issue Resolved</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 font-medium">Issue Not Resolved</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {svr.contactAgreed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">Contact Agreed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 font-medium">Contact Did Not Agree</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Client Sign-off */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-900">Client Sign-off</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium text-gray-500">Signed By</div>
                <div className="text-gray-900 font-semibold">{svr.clientSignatory}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Signed At</div>
                <div className="text-gray-900">{formatDateTime(svr.signedAt)}</div>
              </div>
            </div>
            {svr.clientSignatureData && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-2">Client Signature</div>
                <img
                  src={svr.clientSignatureData}
                  alt="Client Signature"
                  className="max-w-md border border-gray-300 bg-white p-2 rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600">
          <p>
            This Site Visit Report was completed on {formatDateTime(svr.createdAt)} and is permanently stored with this job record.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

