"use client";

import { Clock, Pill, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Medication } from "@/types";

interface MedicationCardProps {
  medication: Medication;
  onEdit?: (medication: Medication) => void;
  onDelete?: (medication: Medication) => void;
  showActions?: boolean;
}

export function MedicationCard({
  medication,
  onEdit,
  onDelete,
  showActions = false,
}: MedicationCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{medication.name}</h3>
              <p className="text-sm text-muted-foreground">
                {medication.dosage}
              </p>
            </div>
          </div>

          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(medication)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(medication)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {medication.frequency}
          </Badge>
          {medication.timings?.map((time, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {time}
            </Badge>
          ))}
        </div>

        {medication.instructions && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/50 p-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {medication.instructions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
