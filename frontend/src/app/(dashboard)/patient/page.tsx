"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Flame,
  Activity,
  Pill,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { TodaySchedule, AdherenceStats, ScheduleItem } from "@/types";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function PatientDashboard() {
  const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [takingMed, setTakingMed] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [scheduleRes, statsRes] = await Promise.allSettled([
        api.get("/schedule/today/"),
        api.get("/adherence/stats/"),
      ]);

      if (scheduleRes.status === "fulfilled") setSchedule(scheduleRes.value.data);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTakeMedication = async (item: ScheduleItem) => {
    setTakingMed(item.medication.id);
    try {
      await api.post("/adherence/log/", {
        medication_id: item.medication.id,
        scheduled_time: item.scheduled_time,
        status: "taken",
        taken_time: new Date().toISOString(),
      });

      toast.success(`Marked ${item.medication.name} as taken!`);

      // Update schedule locally
      if (schedule) {
        setSchedule({
          ...schedule,
          medications: schedule.medications.map((m) =>
            m.medication.id === item.medication.id
              ? { ...m, status: "taken", taken_time: new Date().toISOString() }
              : m
          ),
        });
      }

      // Refresh stats
      try {
        const statsRes = await api.get("/adherence/stats/");
        setStats(statsRes.data);
      } catch {
        // stats refresh is non-critical
      }
    } catch {
      toast.error("Failed to log medication. Please try again.");
    } finally {
      setTakingMed(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "missed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "late":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "taken":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Taken
          </Badge>
        );
      case "missed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Missed
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Late
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const medications = schedule?.medications || [];
  const takenToday = medications.filter(
    (m) => m.status === "taken" || m.status === "late"
  ).length;
  const totalToday = medications.length;
  const remaining = totalToday - takenToday;

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
        <h1 className="text-2xl font-bold">Good day!</h1>
        <p className="text-muted-foreground">
          Here is your medication schedule for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adherence Rate</p>
                <p className="text-3xl font-bold">
                  {stats?.adherence_rate ?? "--"}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold">
                  {stats?.current_streak ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taken Today</p>
                <p className="text-3xl font-bold">
                  {takenToday}/{totalToday}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-3xl font-bold">{remaining}</p>
                <p className="text-xs text-muted-foreground">medications</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {!schedule || schedule.medications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Pill className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p>No medications scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.medications.map((item, idx) => (
                <div
                  key={`${item.medication.id}-${idx}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors",
                    item.status === "taken" && "bg-green-50/50 border-green-200",
                    item.status === "missed" && "bg-red-50/50 border-red-200",
                    item.status === "late" && "bg-yellow-50/50 border-yellow-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-medium">{item.medication.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.medication.dosage} - Scheduled at{" "}
                        {item.scheduled_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    {item.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleTakeMedication(item)}
                        disabled={takingMed === item.medication.id}
                      >
                        {takingMed === item.medication.id ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        Take
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
