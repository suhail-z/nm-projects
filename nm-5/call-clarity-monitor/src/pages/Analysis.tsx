
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCallById } from "@/services/callService";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalysisPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
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
          description: "Failed to load analysis data. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <p>Loading analysis data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !callData) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12 text-destructive">
          <p>Error loading analysis. Please try again.</p>
        </div>
      </AppLayout>
    );
  }

  // Prepare data for charts
  const talkTimeData = [
    { name: 'Agent', value: callData.analytics.agentTalkTime },
    { name: 'Customer', value: callData.analytics.customerTalkTime },
  ];

  const complianceStatusData = callData.complianceItems.reduce((acc, item) => {
    const existingItem = acc.find(i => i.status === item.status);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      acc.push({ status: item.status, count: 1 });
    }
    return acc;
  }, [] as { status: string; count: number }[]);

  const sentimentData = [
    { name: 'Agent Tone', value: callData.analytics.agentTone },
    { name: 'Customer Sentiment', value: callData.analytics.customerSentiment },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history">
              <ChevronLeft className="h-4 w-4" />
              Back to History
            </Link>
          </Button>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Call Analysis</h2>
        <p className="text-muted-foreground">
          {callData.date} {callData.time} | Agent: {callData.agent} | Customer: {callData.customer}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Call Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-4xl font-bold",
                  callData.score >= 85 ? "text-success" :
                  callData.score >= 70 ? "text-warning" : "text-destructive"
                )}>
                  {callData.score}%
                </div>
                <div className="mt-2 h-2 bg-muted-foreground/20 rounded-full">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      callData.score >= 85 ? "bg-success" :
                      callData.score >= 70 ? "bg-warning" : "bg-destructive"
                    )} 
                    style={{ width: `${callData.score}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{callData.duration}</div>
                <p className="text-sm text-muted-foreground mt-1">Total call time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Talk Time Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={talkTimeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {talkTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Key Phrases</CardTitle>
                <CardDescription>Most frequently mentioned terms during the call</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {callData.analytics.keyPhrases.map((phrase, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium"
                      style={{ fontSize: `${100 + ((callData.analytics.keyPhrases.length - index) * 5)}%` }}
                    >
                      {phrase}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Interaction Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Silence Periods</span>
                      <span className="font-medium">{callData.analytics.silencePeriods}</span>
                    </div>
                    <div className="h-2 bg-muted-foreground/20 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(callData.analytics.silencePeriods * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Interruptions</span>
                      <span className="font-medium">{callData.analytics.interruptionCount}</span>
                    </div>
                    <div className="h-2 bg-muted-foreground/20 rounded-full">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${Math.min(callData.analytics.interruptionCount * 15, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compliance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Distribution of compliance findings</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={complianceStatusData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Count" 
                        fill="#8884d8"
                        className="fill-current text-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compliance Details</CardTitle>
                <CardDescription>Detailed compliance findings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {callData.complianceItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.requirement}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          item.status === "compliant" ? "bg-success/20 text-success" :
                          item.status === "warning" ? "bg-warning/20 text-warning" : 
                          "bg-destructive/20 text-destructive"
                        )}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.details}</p>
                      {item.timestamp && (
                        <p className="text-xs text-muted-foreground mt-2">Time: {item.timestamp}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sentiment">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Agent tone vs customer sentiment</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sentimentData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Score" 
                        fill="#10b981"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Interpretation</CardTitle>
                <CardDescription>Analysis of call sentiment patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Agent Tone</h4>
                    <div className="h-2 bg-muted-foreground/20 rounded-full mb-1">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          callData.analytics.agentTone >= 85 ? "bg-success" :
                          callData.analytics.agentTone >= 70 ? "bg-warning" : "bg-destructive"
                        )} 
                        style={{ width: `${callData.analytics.agentTone}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {callData.analytics.agentTone >= 90 ? 
                        "Excellent: Agent maintained a highly professional and supportive tone throughout the call." :
                      callData.analytics.agentTone >= 80 ?
                        "Professional: Agent maintained a consistently professional tone during the interaction." :
                      callData.analytics.agentTone >= 70 ?
                        "Good: Agent's tone was generally appropriate with some room for improvement." :
                        "Needs Improvement: Agent's tone showed signs of frustration or impatience."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Customer Sentiment</h4>
                    <div className="h-2 bg-muted-foreground/20 rounded-full mb-1">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          callData.analytics.customerSentiment >= 80 ? "bg-success" :
                          callData.analytics.customerSentiment >= 60 ? "bg-warning" : "bg-destructive"
                        )} 
                        style={{ width: `${callData.analytics.customerSentiment}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {callData.analytics.customerSentiment >= 80 ? 
                        "Positive: Customer expressed satisfaction and positive sentiment throughout the call." :
                      callData.analytics.customerSentiment >= 60 ?
                        "Neutral: Customer maintained a generally neutral tone during the interaction." :
                        "Negative: Customer expressed dissatisfaction or frustration during the call."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Interaction Quality</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Silence</span>
                          <span className={callData.analytics.silencePeriods > 5 ? "text-warning" : "text-success"}>
                            {callData.analytics.silencePeriods}
                          </span>
                        </div>
                        <div className="h-2 bg-muted-foreground/20 rounded-full">
                          <div 
                            className={callData.analytics.silencePeriods > 5 ? "h-full bg-warning rounded-full" : "h-full bg-success rounded-full"} 
                            style={{ width: `${Math.min(callData.analytics.silencePeriods * 10, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Interruptions</span>
                          <span className={callData.analytics.interruptionCount > 3 ? "text-destructive" : "text-success"}>
                            {callData.analytics.interruptionCount}
                          </span>
                        </div>
                        <div className="h-2 bg-muted-foreground/20 rounded-full">
                          <div 
                            className={callData.analytics.interruptionCount > 3 ? "h-full bg-destructive rounded-full" : "h-full bg-success rounded-full"}
                            style={{ width: `${Math.min(callData.analytics.interruptionCount * 15, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default AnalysisPage;
