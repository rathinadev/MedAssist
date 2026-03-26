"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { AdherenceHistory } from "@/types";
import { cn } from "@/lib/utils";

export default function PatientHistoryPage() {
  const [history, setHistory] = useState<AdherenceHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/adherence/history/?from=${fromDate}&to=${toDate}`
      );
      setHistory(res.data);
    } catch {
      setError("Failed to load adherence history");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "missed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const takenPct =
    history && history.summary.total > 0
      ? Math.round((history.summary.taken / history.summary.total) * 100)
      : 0;
  const missedPct =
    history && history.summary.total > 0
      ? Math.round((history.summary.missed / history.summary.total) * 100)
      : 0;
  const latePct =
    history && history.summary.total > 0
      ? Math.round((history.summary.late / history.summary.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Adherence History</h1>
        <p className="text-muted-foreground">
          View your medication adherence records over time.
        </p>
      </div>

      {/* Date Range */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-auto"
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-auto"
              />
            </div>
            <Button onClick={fetchHistory} variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {history && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{history.summary.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Taken</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {history.summary.taken}
              </p>
              <p className="text-xs text-muted-foreground">{takenPct}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-muted-foreground">Missed</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {history.summary.missed}
              </p>
              <p className="text-xs text-muted-foreground">{missedPct}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {history.summary.late}
              </p>
              <p className="text-xs text-muted-foreground">{latePct}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex h-40 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchHistory} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : !history || history.logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No adherence logs found for this period
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adherence Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.logs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    log.status === "taken" && "border-green-200 bg-green-50/50",
                    log.status === "missed" && "border-red-200 bg-red-50/50",
                    log.status === "late" && "border-yellow-200 bg-yellow-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium text-sm">
                        {log.medication_name || `Medication #${log.medication}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.date ||
                          (log.taken_time
                            ? new Date(log.taken_time).toLocaleDateString()
                            : "N/A")}
                        {log.taken_time &&
                          ` at ${new Date(log.taken_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
