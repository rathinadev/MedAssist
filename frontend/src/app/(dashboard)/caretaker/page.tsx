"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Pill,
  Plus,
  ScanLine,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { PatientProfile, PredictionResponse } from "@/types";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function CaretakerDashboard() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [predictions, setPredictions] = useState<
    { patient: PatientProfile; prediction: PredictionResponse }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const patientsRes = await api.get("/patients/");
      const patientsList: PatientProfile[] = patientsRes.data.results || patientsRes.data;
      setPatients(patientsList);

      const predictionPromises = patientsList.slice(0, 10).map(async (p) => {
        try {
          const predRes = await api.get(`/predictions/${p.user.id}/`);
          return { patient: p, prediction: predRes.data as PredictionResponse };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(predictionPromises);
      setPredictions(
        results.filter(
          (r): r is { patient: PatientProfile; prediction: PredictionResponse } =>
            r !== null && r.prediction.overall_risk !== "low"
        )
      );
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const avgAdherence =
    patients.length > 0
      ? Math.round(
        patients.reduce((sum, p) => sum + (p.adherence_rate || 0), 0) /
        patients.length
      )
      : 0;

  const highRiskCount = predictions.filter(
    (p) => p.prediction.overall_risk === "high"
  ).length;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your patients and their medication adherence.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold">{patients.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Average Adherence
                </p>
                <p className="text-3xl font-bold">{avgAdherence}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  High Risk Patients
                </p>
                <p className="text-3xl font-bold">{highRiskCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Medications Managed
                </p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/caretaker/patients">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </Link>
        <Link href="/caretaker/scan">
          <Button variant="outline">
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Prescription
          </Button>
        </Link>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>
            Patients with low adherence or high-risk predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 && patients.filter((p) => (p.adherence_rate ?? 0) < 70).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No alerts at this time. All patients are doing well!
            </div>
          ) : (
            <div className="space-y-3">
              {patients
                .filter((p) => (p.adherence_rate ?? 0) < 70)
                .slice(0, 5)
                .map((patient) => (
                  <Link
                    key={`adherence-${patient.id}`}
                    href={`/caretaker/patients/${patient.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{patient.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Low adherence rate
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        (patient.adherence_rate ?? 0) < 50
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-yellow-200 bg-yellow-50 text-yellow-700"
                      }
                    >
                      {patient.adherence_rate}%
                    </Badge>
                  </Link>
                ))}
              {predictions.slice(0, 5).map(({ patient, prediction }) => (
                <Link
                  key={`pred-${patient.id}`}
                  href={`/caretaker/patients/${patient.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{patient.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.predictions.length} medication(s) at risk
                    </p>
                  </div>
                  <Badge
                    className={
                      prediction.overall_risk === "high"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {prediction.overall_risk} risk
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
