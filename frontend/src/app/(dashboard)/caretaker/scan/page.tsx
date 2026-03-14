"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PrescriptionScanner } from "@/components/shared/prescription-scanner";
import api from "@/lib/api";
import type { PatientProfile, Prescription } from "@/types";

export default function CaretakerScanPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients/");
        setPatients(res.data.results || res.data);
      } catch {
        toast.error("Failed to load patients");
      } finally {
        setIsLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const handleSaveMedications = async () => {
    if (!prescription || !selectedPatientId) return;

    setIsSaving(true);
    try {
      const promises = prescription.extracted_data.medications.map((med) =>
        api.post("/medications/", {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timings: med.timings || [],
          instructions: med.instructions || "",
          patient_id: selectedPatientId,
        })
      );

      await Promise.all(promises);
      toast.success(
        `${prescription.extracted_data.medications.length} medication(s) saved!`
      );
      setPrescription(null);
    } catch {
      toast.error("Failed to save some medications");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan Prescription</h1>
        <p className="text-muted-foreground">
          Upload a prescription image to automatically extract medications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Patient</CardTitle>
          <CardDescription>
            Choose a patient to associate the prescription with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Label>Patient</Label>
            {isLoadingPatients ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading patients...
                </span>
              </div>
            ) : (
              <Select
                onValueChange={(value) =>
                  setSelectedPatientId(parseInt(value))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.user.id.toString()}>
                      {p.user.name} ({p.user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <PrescriptionScanner
        patientId={selectedPatientId}
        onMedicationsExtracted={setPrescription}
      />

      {prescription &&
        prescription.extracted_data?.medications?.length > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={handleSaveMedications}
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Medications ({prescription.extracted_data.medications.length})
            </Button>
          </div>
        )}
    </div>
  );
}
