"use client";

import { AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Prediction } from "@/types";
import { cn } from "@/lib/utils";

interface PredictionAlertProps {
  prediction: Prediction;
}

const riskConfig = {
  low: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Clock,
    label: "Low Risk",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: TrendingDown,
    label: "Medium Risk",
  },
  high: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    label: "High Risk",
  },
};

export function PredictionAlert({ prediction }: PredictionAlertProps) {
  const config = riskConfig[prediction.risk_level];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "border",
        prediction.risk_level === "high" && "border-red-200 bg-red-50/50",
        prediction.risk_level === "medium" && "border-yellow-200 bg-yellow-50/50",
        prediction.risk_level === "low" && "border-green-200 bg-green-50/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              prediction.risk_level === "high" && "bg-red-100",
              prediction.risk_level === "medium" && "bg-yellow-100",
              prediction.risk_level === "low" && "bg-green-100"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                prediction.risk_level === "high" && "text-red-600",
                prediction.risk_level === "medium" && "text-yellow-600",
                prediction.risk_level === "low" && "text-green-600"
              )}
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{prediction.medication.name}</h4>
              <Badge className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {prediction.message}
            </p>
            {prediction.predicted_delay_minutes > 0 && (
              <p className="text-xs text-muted-foreground">
                Predicted delay: {prediction.predicted_delay_minutes} minutes
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
