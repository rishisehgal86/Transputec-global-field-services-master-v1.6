import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugSites() {
  const [projectId, setProjectId] = useState("TRANSTEST5");
  const [debugData, setDebugData] = useState<any>(null);

  const debugMutation = trpc.projects.debugSites.useQuery(
    { projectId },
    { enabled: false }
  );

  const handleDebug = async () => {
    const result = await debugMutation.refetch();
    setDebugData(result.data);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Sites Query</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test getProjectSites()</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project ID</label>
              <Input
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Enter project ID"
              />
            </div>
            <Button onClick={handleDebug} disabled={debugMutation.isFetching}>
              {debugMutation.isFetching ? "Loading..." : "Run Debug Query"}
            </Button>
          </CardContent>
        </Card>

        {debugData && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 font-mono text-sm">
                <div>
                  <strong>Requested Project ID:</strong> {debugData.requestedProjectId}
                </div>
                <div>
                  <strong>Total Sites Returned:</strong> {debugData.totalSitesReturned}
                </div>
                <div>
                  <strong>Unique Project IDs in Results:</strong>
                  <pre className="mt-2 p-2 bg-muted rounded">
                    {JSON.stringify(debugData.uniqueProjectIdsInResults, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Sites Grouped by Project ID:</strong>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-96">
                    {JSON.stringify(debugData.sitesGroupedByProjectId, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>All Sites:</strong>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-96">
                    {JSON.stringify(debugData.allSites, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

