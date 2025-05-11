
import { useState } from "react";
import { Calendar, Download } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CallTable, type CallRecord } from "@/components/call-history/CallTable";
import { useQuery } from "@tanstack/react-query";
import { getCallHistory } from "@/services/callService";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
  const { toast } = useToast();
  
  // Query for fetching call history data
  const { data: callHistory = [], isLoading, error } = useQuery({
    queryKey: ['callHistory'],
    queryFn: getCallHistory,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load call history. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Call History</h2>
        <p className="text-muted-foreground">
          Review past calls and compliance analysis results
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="warning">Needs Review</SelectItem>
                <SelectItem value="violation">Non-compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="alice">Alice Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Button variant="outline" className="w-full md:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>
        <Button variant="outline" className="w-full md:w-auto"
          onClick={() => {
            toast({
              title: "Export Started",
              description: "Your report is being generated and will download shortly.",
            });
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading call history...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-12 text-destructive">
          <p>Error loading call history. Please try again.</p>
        </div>
      ) : (
        <CallTable data={callHistory} />
      )}
    </AppLayout>
  );
};

export default HistoryPage;
