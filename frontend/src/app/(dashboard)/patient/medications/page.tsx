"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Pill } from "lucide-react";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import type { Medication } from "@/types";
import { MedicationCard } from "@/components/shared/medication-card";
import { CardListSkeleton } from "@/components/shared/loading-skeleton";

export default function PatientMedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/medications/");
      const data = res.data;
      setMedications(data.results || data);
    } catch {
      setError("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  if (isLoading) {
    return <CardListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchMedications} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Medications</h1>
        <p className="text-muted-foreground">
          View all your active medications and their schedules.
        </p>
      </div>

      {medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Pill className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">
            No medications yet
          </p>
          <p className="text-sm text-muted-foreground">
            Your caretaker will add medications for you.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {medications
            .filter((m) => m.is_active)
            .map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
        </div>
      )}
    </div>
  );
}
