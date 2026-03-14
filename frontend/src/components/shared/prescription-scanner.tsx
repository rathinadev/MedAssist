"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, FileImage } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Prescription } from "@/types";

interface PrescriptionScannerProps {
  patientId: number | null;
  onMedicationsExtracted?: (prescription: Prescription) => void;
}

export function PrescriptionScanner({
  patientId,
  onMedicationsExtracted,
}: PrescriptionScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setFile(f);
    setPrescription(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleScan = async () => {
    if (!file || !patientId) {
      toast.error("Please select a file and patient");
      return;
    }

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("patient_id", patientId.toString());

      const response = await api.post("/prescriptions/scan/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPrescription(response.data);
      onMedicationsExtracted?.(response.data);
      toast.success("Prescription scanned successfully!");
    } catch {
      toast.error("Failed to scan prescription. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setPrescription(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <Card
          className={`border-2 border-dashed transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Drag & drop a prescription image
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              or click to browse files
            </p>
            <label className="mt-4 cursor-pointer">
              <Button variant="outline" asChild>
                <span>Choose File</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Prescription preview"
                  className="h-32 w-32 rounded-lg object-cover border"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-muted">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleScan}
                  disabled={isScanning || !patientId}
                  className="mt-4"
                >
                  {isScanning && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isScanning ? "Scanning..." : "Scan Prescription"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {prescription && prescription.extracted_data?.medications?.length > 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-bold">Scan Complete!</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Doctor</p>
                <p className="font-medium text-sm">{prescription.extracted_data.doctor_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Date</p>
                <p className="font-medium text-sm">{prescription.extracted_data.date || "Unknown"}</p>
              </div>
            </div>

            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <div className="h-4 w-1 bg-primary rounded-full" />
              Extracted Medications ({prescription.extracted_data.medications.length})
            </h3>
            {prescription.extracted_data.doctor_name && (
              <p className="text-sm text-muted-foreground mb-2">
                Doctor: {prescription.extracted_data.doctor_name}
                {prescription.extracted_data.date &&
                  ` | Date: ${prescription.extracted_data.date}`}
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Instructions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.extracted_data.medications.map((med, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.frequency}</TableCell>
                    <TableCell className="text-sm">
                      {med.instructions || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
