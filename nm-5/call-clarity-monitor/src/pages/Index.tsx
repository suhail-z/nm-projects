
import { useState } from "react";
import { Upload, Mic, List, FileText, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [selectedCard, setSelectedCard] = useState("");
  
  const handleCardClick = (id: string) => {
    setSelectedCard(id);
  };
  
  const actionCards = [
    {
      id: "upload",
      title: "Upload Call",
      description: "Upload an existing call recording",
      icon: Upload,
      link: "/upload"
    },
    {
      id: "record",
      title: "Record Call",
      description: "Start a new call recording",
      icon: Mic,
      link: "/record"
    },
    {
      id: "history",
      title: "Call History",
      description: "View past analyzed calls",
      icon: List,
      link: "/history"
    },
  ];
  
  // Mock recent call data
  const recentCalls = [
    {
      id: "call-123",
      date: "May 3, 2025",
      agent: "Jane Smith",
      customer: "Robert Johnson",
      duration: "5:42",
      score: 92
    },
    {
      id: "call-122",
      date: "May 3, 2025",
      agent: "John Doe",
      customer: "Sarah Williams",
      duration: "8:19",
      score: 78
    },
    {
      id: "call-121",
      date: "May 2, 2025",
      agent: "Alice Johnson",
      customer: "Michael Brown",
      duration: "12:05",
      score: 68
    },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Call Clarity</h1>
        <p className="text-muted-foreground mt-2">
          Real-time call monitoring and compliance analysis
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        {actionCards.map((card) => (
          <Link to={card.link} key={card.id} className="block">
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedCard === card.id ? "border-primary ring-2 ring-primary/20" : ""
              )} 
              onClick={() => handleCardClick(card.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
                <card.icon className={cn(
                  "h-5 w-5 ml-2",
                  selectedCard === card.id ? "text-primary" : "text-muted-foreground"
                )} />
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Calls</h2>
        <div className="rounded-xl border">
          <div className="bg-muted/50 p-3">
            <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground">
              <div className="col-span-4 md:col-span-3">Date</div>
              <div className="col-span-3 hidden md:block">Agent</div>
              <div className="col-span-4 md:col-span-3">Customer</div>
              <div className="col-span-2 text-right md:text-left">Score</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>
          <div>
            {recentCalls.map((call) => (
              <div 
                key={call.id} 
                className="grid grid-cols-12 items-center border-t p-3 text-sm"
              >
                <div className="col-span-4 md:col-span-3 font-medium">{call.date}</div>
                <div className="col-span-3 hidden md:block">{call.agent}</div>
                <div className="col-span-4 md:col-span-3">{call.customer}</div>
                <div className="col-span-2 text-right md:text-left">
                  <span 
                    className={
                      call.score >= 90 ? "text-success" :
                      call.score >= 75 ? "text-warning" :
                      "text-destructive"
                    }
                  >
                    {call.score}%
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <Link to={`/transcript?id=${call.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" asChild>
            <Link to="/history">View All History</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
