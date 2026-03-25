"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  RefreshCw,
  Plus,
  ArrowLeft,
  Activity,
  Flame,
  Trophy,
  Clock,
  XCircle,
  AlertTriangle as AlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import type {
  PatientProfile,
  Medication,
  AdherenceHistory,
  AdherenceStats,
  PredictionResponse,
} from "@/types";
import { MedicationCard } from "@/components/shared/medication-card";
import { AdherenceChart } from "@/components/shared/adherence-chart";
import { PredictionAlert } from "@/components/shared/prediction-alert";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timings: z.string().min(1, "At least one timing is required"),
  instructions: z.string().optional(),
});

const profileSchema = z.object({
  age: z.string().min(1, "Age is required"),
  medical_conditions: z.string().optional(),
});

type MedicationValues = z.infer<typeof medicationSchema>;
type ProfileValues = z.infer<typeof profileSchema>;

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherenceHistory, setAdherenceHistory] =
    useState<AdherenceHistory | null>(null);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats | null>(
    null
  );
  const [predictions, setPredictions] = useState<PredictionResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const medForm = useForm<MedicationValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      timings: "",
      instructions: "",
    },
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: "0",
      medical_conditions: "",
    },
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch patient profile first to get the User ID
      const patientRes = await api.get(`/patients/${patientId}/`);
      const patientData = patientRes.data;
      setPatient(patientData);

      const realUserId = patientData.user.id;

      // 2. Fetch all other data using the correct User ID
      const [medsRes, historyRes, statsRes, predRes] = await Promise.allSettled([
        api.get(`/medications/?patient_id=${realUserId}`),
        api.get(
          `/adherence/history/?patient_id=${realUserId}&from=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&to=${new Date().toISOString().split("T")[0]}`
        ),
        api.get(`/adherence/stats/?patient_id=${realUserId}`),
        api.get(`/predictions/${realUserId}/`),
      ]);

      if (medsRes.status === "fulfilled") {
        const data = (medsRes as PromiseFulfilledResult<any>).value.data;
        setMedications(data.results || data);
      }
      if (historyRes.status === "fulfilled") {
        const data = (historyRes as PromiseFulfilledResult<any>).value.data;
        // Merge summary into history for frontend type compatibility
        setAdherenceHistory({
          logs: data.logs,
          ...data.summary
        });
      }
      if (statsRes.status === "fulfilled") {
        const data = (statsRes as PromiseFulfilledResult<any>).value.data;
        // Map backend naming to frontend naming
        setAdherenceStats({
          ...data,
          best_streak: data.longest_streak,
          total_scheduled: data.total_scheduled
        });
      }
      if (predRes.status === "fulfilled") {
        const data = (predRes as PromiseFulfilledResult<any>).value.data;
        // Ensure overall_risk exists
        if (!data.overall_risk && data.predictions) {
          const hasHigh = data.predictions.some((p: any) => p.risk_level === 'high');
          const hasMedium = data.predictions.some((p: any) => p.risk_level === 'medium');
          data.overall_risk = hasHigh ? 'high' : (hasMedium ? 'medium' : 'low');
        }
        setPredictions(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load patient data");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddMedDialog = () => {
    setEditingMed(null);
    medForm.reset({
      name: "",
      dosage: "",
      frequency: "",
      timings: "",
      instructions: "",
    });
    setMedDialogOpen(true);
  };

  const openEditMedDialog = (med: Medication) => {
    setEditingMed(med);
    medForm.reset({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timings: med.timings?.join(", ") || "",
      instructions: med.instructions || "",
    });
    setMedDialogOpen(true);
  };

  const handleDeleteMed = async (med: Medication) => {
    if (!confirm(`Are you sure you want to delete ${med.name}?`)) return;
    try {
      await api.delete(`/medications/${med.id}/`);
      toast.success("Medication deleted");
      setMedications((prev) => prev.filter((m) => m.id !== med.id));
    } catch {
      toast.error("Failed to delete medication");
    }
  };

  const onSubmitMed = async (data: MedicationValues) => {
    if (!patient) return;
    setIsSubmitting(true);
    const timingsArray = data.timings
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      timings: timingsArray,
      instructions: data.instructions || "",
      patient_id: patient.user.id,
    };

    try {
      if (editingMed) {
        const res = await api.put(`/medications/${editingMed.id}/`, payload);
        setMedications((prev) =>
          prev.map((m) => (m.id === editingMed.id ? res.data : m))
        );
        toast.success("Medication updated");
      } else {
        const res = await api.post("/medications/", payload);
        setMedications((prev) => [...prev, res.data]);
        toast.success("Medication added");
      }
      setMedDialogOpen(false);
      medForm.reset();
    } catch {
      toast.error(
        editingMed ? "Failed to update medication" : "Failed to add medication"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitProfile = async (data: ProfileValues) => {
    if (!patient) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        age: parseInt(data.age, 10),
      };
      const res = await api.patch(`/patients/${patientId}/`, payload);
      setPatient(res.data);
      toast.success("Patient profile updated");
      setProfileDialogOpen(false);
    } catch {
      toast.error("Failed to update patient profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditProfileDialog = () => {
    if (!patient) return;
    profileForm.reset({
      age: patient.age.toString(),
      medical_conditions: patient.medical_conditions || "",
    });
    setProfileDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Patient not found"}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button + Patient Info */}
      <div className="flex items-start gap-4">
        <Link href="/caretaker/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{patient.user.name}</h1>
          <p className="text-muted-foreground">{patient.user.email}</p>
        </div>
      </div>

      {/* Patient info card */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Clinical Configuration</CardTitle>
            <CardDescription>Patient demographics and medical history</CardDescription>
          </div>
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={openEditProfileDialog}>
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Patient Profile</DialogTitle>
                <DialogDescription>
                  Update demographic and clinical details for {patient.user.name}.
                </DialogDescription>
              </DialogHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="medical_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <Input placeholder="Diabetes, Hypertension..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setProfileDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="text-lg font-semibold">{patient.age}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Medical Conditions
              </p>
              <p className="text-lg font-semibold">
                {patient.medical_conditions || "None listed"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adherence Rate</p>
              <p className="text-lg font-semibold">
                {patient.adherence_rate != null
                  ? `${patient.adherence_rate}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="medications">
        <TabsList>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={medDialogOpen} onOpenChange={setMedDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddMedDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMed ? "Edit Medication" : "Add Medication"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMed
                      ? "Update the medication details."
                      : "Add a new medication for this patient."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...medForm}>
                  <form
                    onSubmit={medForm.handleSubmit(onSubmitMed)}
                    className="space-y-4"
                  >
                    <FormField
                      control={medForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Metformin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medForm.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Once daily">
                                Once daily
                              </SelectItem>
                              <SelectItem value="Twice daily">
                                Twice daily
                              </SelectItem>
                              <SelectItem value="Three times daily">
                                Three times daily
                              </SelectItem>
                              <SelectItem value="Four times daily">
                                Four times daily
                              </SelectItem>
                              <SelectItem value="As needed">
                                As needed
                              </SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medForm.control}
                      name="timings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timings</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="08:00, 20:00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Separate multiple times with commas
                          </p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medForm.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Take after meals"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMedDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingMed ? "Update" : "Add"} Medication
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {medications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <p className="text-muted-foreground">No medications yet</p>
              <p className="text-sm text-muted-foreground">
                Add a medication to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {medications.map((med) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  showActions
                  onEdit={openEditMedDialog}
                  onDelete={handleDeleteMed}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Adherence Tab */}
        <TabsContent value="adherence" className="space-y-4">
          {adherenceStats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Adherence Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {adherenceStats.adherence_rate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Streak
                      </p>
                      <p className="text-2xl font-bold">
                        {adherenceStats.current_streak} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Best Streak
                      </p>
                      <p className="text-2xl font-bold">
                        {adherenceStats.best_streak} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Missed
                      </p>
                      <p className="text-2xl font-bold">
                        {adherenceStats.total_missed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {adherenceStats && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Most Missed Medication
                  </p>
                  <p className="text-lg font-semibold">
                    {adherenceStats.most_missed_medication || "None"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Best Time Slot
                  </p>
                  <p className="text-lg font-semibold">
                    {adherenceStats.best_time_slot || "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <AdherenceChart logs={adherenceHistory?.logs || []} />
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {predictions && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">Overall Risk</CardTitle>
                <CardDescription>
                  AI-predicted medication adherence risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    predictions.overall_risk === "high"
                      ? "bg-red-100 text-red-700"
                      : predictions.overall_risk === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }
                >
                  {(predictions.overall_risk || "low").toUpperCase()} RISK
                </Badge>
              </CardContent>
            </Card>
          )}

          {!predictions || predictions.predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <AlertIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No predictions available</p>
              <p className="text-sm text-muted-foreground">
                Predictions will appear once there is enough adherence data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.predictions.map((pred, i) => (
                <PredictionAlert key={i} prediction={pred} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
