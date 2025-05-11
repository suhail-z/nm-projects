
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ComplianceStatus = "compliant" | "warning" | "violation";

interface ComplianceIndicatorProps {
  status: ComplianceStatus;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ComplianceIndicator = ({ 
  status, 
  showText = true, 
  size = "md", 
  className 
}: ComplianceIndicatorProps) => {
  
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  const iconMap = {
    compliant: <CheckCircle className={iconSize[size]} />,
    warning: <AlertTriangle className={iconSize[size]} />,
    violation: <XCircle className={iconSize[size]} />
  };
  
  const textMap = {
    compliant: "Compliant",
    warning: "Needs Review",
    violation: "Non-compliant"
  };
  
  const colorMap = {
    compliant: "text-success",
    warning: "text-warning",
    violation: "text-destructive"
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={colorMap[status]}>
        {iconMap[status]}
      </span>
      {showText && <span className={cn(colorMap[status], textSize[size], "font-medium")}>{textMap[status]}</span>}
    </div>
  );
};

export default ComplianceIndicator;
