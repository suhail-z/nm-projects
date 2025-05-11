
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ComplianceScoreProps {
  score: number;
  className?: string;
}

const ComplianceScore = ({ score, className }: ComplianceScoreProps) => {
  const getScoreColor = () => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };
  
  const getScoreBackground = () => {
    if (score >= 85) return "bg-success/10 border-success/30";
    if (score >= 70) return "bg-warning/10 border-warning/30";
    return "bg-destructive/10 border-destructive/30";
  };
  
  const getProgressColor = () => {
    if (score >= 85) return "bg-success";
    if (score >= 70) return "bg-warning";
    return "bg-destructive";
  };
  
  const getRiskLevel = () => {
    if (score >= 85) return "Low";
    if (score >= 70) return "Medium";
    return "High";
  };

  return (
    <Card className={cn("border", getScoreBackground(), className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Compliance Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-2">
          <div className={cn("text-5xl font-bold", getScoreColor())}>
            {score}%
          </div>
          <div className="mt-2 text-sm font-medium">
            Risk Level: <span className={getScoreColor()}>{getRiskLevel()}</span>
          </div>
        </div>
        
        <Progress 
          value={score} 
          className={cn("h-2 mt-4", getProgressColor())}
        />
        
        <div className="flex justify-between text-xs mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceScore;
