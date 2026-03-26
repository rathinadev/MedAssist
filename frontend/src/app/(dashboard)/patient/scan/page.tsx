"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrescriptionScanner } from "@/components/shared/prescription-scanner";
import api from "@/lib/api";

export default function PatientScanPage() {
  const [patientId, setPatientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        // Get the current user's patient profile
        const res = await api.get("/patients/");
        const patientsList = res.data.results || res.data;
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const myProfile = patientsList.find(
            (p: { user: { email: string } }) => p.user.email === user.email
          );
          if (myProfile) {
            setPatientId(myProfile.user.id);
          }
        }
      } catch {
        // Patient profile not found
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan Prescription</h1>
        <p className="text-muted-foreground">
          Upload a prescription image to extract medication details.
        </p>
      </div>

      {!patientId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Not Found</CardTitle>
            <CardDescription>
              Your patient profile has not been set up yet. Please contact your
              caretaker.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Prescription</CardTitle>
              <CardDescription>
                Upload an image of your prescription. The extracted medications
                will be reviewed by your caretaker before being added.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionScanner patientId={patientId} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
