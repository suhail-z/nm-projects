
import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ComplianceChecklist from "@/components/compliance/ComplianceChecklist";
import ComplianceScore from "@/components/compliance/ComplianceScore";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCallById, TranscriptSegment } from "@/services/callService";
import { useToast } from "@/hooks/use-toast";

const TranscriptPage = () => {
  const [activeTab, setActiveTab] = useState("transcript");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedSegment, setHighlightedSegment] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the call ID from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const callId = queryParams.get("id");

  // Query for fetching call data
  const { data: callData, isLoading, error } = useQuery({
    queryKey: ['call', callId],
    queryFn: () => getCallById(callId || ""),
    enabled: !!callId,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load transcript data. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });

  useEffect(() => {
    if (highlightedSegment && transcriptRef.current) {
      const element = document.getElementById(`segment-${highlightedSegment}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSegment]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <p>Loading transcript data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !callData) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12 text-destructive">
          <p>Error loading transcript. Please try again.</p>
        </div>
      </AppLayout>
    );
  }

  const { transcript, complianceItems, score, agent, date, time } = callData;

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Call Analysis</h2>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Customer support call - {date} {time} | Agent: {agent}
          </p>
          <div className="flex items-center">
            <audio 
              ref={audioRef} 
              src="/demo-audio.mp3" 
              onTimeUpdate={(e) => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
              className="hidden" 
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <span className="text-sm font-mono">
              {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
              {(currentTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript">
              <div 
                ref={transcriptRef} 
                className="rounded-lg border bg-card p-4 h-[calc(100vh-250px)] overflow-y-auto"
              >
                {transcript.map((segment: TranscriptSegment) => (
                  <div 
                    key={segment.id} 
                    id={`segment-${segment.id}`}
                    className={cn(
                      "mb-4 p-3 rounded-lg transition-colors",
                      segment.speaker === "agent" ? "bg-muted" : "bg-accent/10",
                      segment.flagged ? "border border-destructive/30" : "",
                      highlightedSegment === segment.id ? "ring-2 ring-ring" : ""
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-xs font-medium",
                        segment.speaker === "agent" ? "text-primary" : "text-secondary"
                      )}>
                        {segment.speaker.charAt(0).toUpperCase() + segment.speaker.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{segment.time}</span>
                    </div>
                    <p className="text-sm">{segment.text}</p>
                    {segment.flagged && (
                      <div className="mt-2 text-xs p-1.5 bg-destructive/10 text-destructive rounded border border-destructive/20">
                        <span className="font-medium">Compliance Issue:</span> {segment.flagReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="metrics">
              <div className="rounded-lg border bg-card p-4 h-[calc(100vh-250px)] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Call Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-xl font-medium">{callData.duration}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Agent Talk Time</p>
                        <p className="text-xl font-medium">{callData.analytics.agentTalkTime}%</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Customer Talk Time</p>
                        <p className="text-xl font-medium">{callData.analytics.customerTalkTime}%</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Issue Resolved</p>
                        <p className="text-xl font-medium text-success">{score >= 70 ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Language Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Agent Tone</p>
                        <p className="text-xl font-medium">
                          {callData.analytics.agentTone >= 90 ? "Excellent" : 
                           callData.analytics.agentTone >= 80 ? "Professional" : 
                           callData.analytics.agentTone >= 70 ? "Good" : "Needs Improvement"}
                        </p>
                        <div className="mt-2 h-2 bg-muted-foreground/20 rounded-full">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              callData.analytics.agentTone >= 85 ? "bg-success" :
                              callData.analytics.agentTone >= 70 ? "bg-warning" : "bg-destructive"
                            )} 
                            style={{ width: `${callData.analytics.agentTone}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Customer Sentiment</p>
                        <p className="text-xl font-medium">
                          {callData.analytics.customerSentiment >= 80 ? "Positive" : 
                           callData.analytics.customerSentiment >= 60 ? "Neutral" : "Negative"}
                        </p>
                        <div className="mt-2 h-2 bg-muted-foreground/20 rounded-full">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              callData.analytics.customerSentiment >= 80 ? "bg-success" :
                              callData.analytics.customerSentiment >= 60 ? "bg-warning" : "bg-destructive"
                            )} 
                            style={{ width: `${callData.analytics.customerSentiment}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Key Phrases</h3>
                    <div className="flex flex-wrap gap-2">
                      {callData.analytics.keyPhrases.map((phrase, index) => (
                        <div key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {phrase}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Script Adherence</h3>
                    <div className="space-y-2">
                      {complianceItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-sm">{item.requirement}</span>
                          <span className={cn(
                            "text-sm",
                            item.status === "compliant" ? "text-success" :
                            item.status === "warning" ? "text-warning" : "text-destructive"
                          )}>
                            {item.status === "compliant" ? "✓ Compliant" :
                             item.status === "warning" ? "⚠ Needs Review" : "✗ Non-compliant"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <ComplianceScore score={score} />
          
          <ComplianceChecklist 
            items={complianceItems}
            className="h-[calc(100vh-370px)] overflow-y-auto"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default TranscriptPage;
