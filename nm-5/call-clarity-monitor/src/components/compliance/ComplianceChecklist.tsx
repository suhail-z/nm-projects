
import { useState } from "react";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export type ComplianceItem = {
  id: string;
  category: string;
  requirement: string;
  status: "compliant" | "warning" | "violation"; 
  details: string;
  timestamp?: string;
};

interface ComplianceChecklistProps {
  items: ComplianceItem[];
  className?: string;
}

const ComplianceChecklist = ({ items, className }: ComplianceChecklistProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("all");

  // Group items by category
  const categorizedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ComplianceItem[]>);

  const statusCounts = {
    compliant: items.filter(item => item.status === "compliant").length,
    warning: items.filter(item => item.status === "warning").length,
    violation: items.filter(item => item.status === "violation").length,
  };

  const getStatusIcon = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "violation":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Compliance Checklist</h3>
        <div className="flex mt-2 gap-3 text-sm">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-success mr-1" />
            <span>{statusCounts.compliant} Compliant</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-warning mr-1" />
            <span>{statusCounts.warning} Warnings</span>
          </div>
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-destructive mr-1" />
            <span>{statusCounts.violation} Violations</span>
          </div>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="px-2 pt-2">
        {Object.entries(categorizedItems).map(([category, categoryItems]) => (
          <AccordionItem value={category} key={category}>
            <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
              <div className="flex items-center">
                <span className="font-medium">{category}</span>
                <div className="ml-2 flex space-x-1">
                  {categoryItems.some(item => item.status === "compliant") && (
                    <CheckCircle className="h-3 w-3 text-success" />
                  )}
                  {categoryItems.some(item => item.status === "warning") && (
                    <AlertTriangle className="h-3 w-3 text-warning" />
                  )}
                  {categoryItems.some(item => item.status === "violation") && (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-3">
              <ul className="space-y-2">
                {categoryItems.map((item) => (
                  <li 
                    key={item.id}
                    className={cn(
                      "p-2 rounded-md text-sm border",
                      item.status === "compliant" ? "border-success/30 bg-success/5" :
                      item.status === "warning" ? "border-warning/30 bg-warning/5" :
                      "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className="ml-2">{item.requirement}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground">
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <div className="max-w-[200px]">
                              <p className="font-medium">{item.requirement}</p>
                              <p className="text-xs mt-1">{item.details}</p>
                              {item.timestamp && (
                                <p className="text-xs mt-1 text-muted-foreground">
                                  At {item.timestamp}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ComplianceChecklist;
