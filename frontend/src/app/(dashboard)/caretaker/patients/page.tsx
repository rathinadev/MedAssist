"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import api from "@/lib/api";
import type { PatientProfile } from "@/types";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

const addPatientSchema = z.object({
  user_email: z.string().email("Please enter a valid email"),
  age: z.number().min(1, "Age must be at least 1").max(150, "Invalid age"),
  medical_conditions: z.string().min(1, "Please enter medical conditions"),
});

type AddPatientValues = z.infer<typeof addPatientSchema>;

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddPatientValues>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      user_email: "",
      age: 0,
      medical_conditions: "",
    },
  });

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/patients/");
      setPatients(response.data.results || response.data);
    } catch {
      setError("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: AddPatientValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/patients/", data);
      toast.success("Patient added successfully!");
      setDialogOpen(false);
      form.reset();
      fetchPatients();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to add patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAdherenceBadge = (rate: number) => {
    if (rate >= 80) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {rate}%
        </Badge>
      );
    }
    if (rate >= 60) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          {rate}%
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        {rate}%
      </Badge>
    );
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchPatients} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patients and their medication adherence.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the patient&apos;s details to add them to your care list.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="user_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="patient@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="65"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Diabetes, Hypertension"
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
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Patient
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patients Table */}
      {filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery ? "No patients found" : "No patients yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : 'Click "Add Patient" to get started'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="hidden md:table-cell">
                  Conditions
                </TableHead>
                <TableHead>Adherence Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(`/caretaker/patients/${patient.id}`)
                  }
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{patient.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {patient.medical_conditions}
                  </TableCell>
                  <TableCell>
                    {getAdherenceBadge(patient.adherence_rate || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
