"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Info, RefreshCw, TrendingDown, Clock, ShieldAlert, Microscope } from "lucide-react";
import api from "@/lib/api";

export default function MLPlayground() {
    const [missRate, setMissRate] = useState(0.2);
    const [avgDelay, setAvgDelay] = useState(30);
    const [consecutiveMisses, setConsecutiveMisses] = useState(1);
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchPrediction = async () => {
        setLoading(true);
        try {
            const response = await api.post("/predictions/playground/", {
                miss_rate: missRate,
                avg_delay: avgDelay,
                consecutive_misses: consecutiveMisses,
            });
            setPrediction(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPrediction();
        }, 500);
        return () => clearTimeout(timer);
    }, [missRate, avgDelay, consecutiveMisses]);

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "high": return "bg-red-500 text-white hover:bg-red-600";
            case "medium": return "bg-amber-500 text-white hover:bg-amber-600";
            case "low": return "bg-emerald-500 text-white hover:bg-emerald-600";
            default: return "bg-gray-500 text-white";
        }
    };

    const getWeightedAdherenceColor = (score: number) => {
        if (score > 80) return "text-emerald-500";
        if (score > 50) return "text-amber-500";
        return "text-red-500";
    };

    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Microscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        AI Laboratory
                    </h1>
                </div>
                <p className="text-muted-foreground mt-1">
                    Interactive AI Sandbox: Simulate patient behavior to see how the Random Forest model analyzes and scores adherence risk.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input Controls */}
                <Card className="md:col-span-1 border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-blue-600" />
                            Patient Behavior
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                                <label>Miss Rate ({(missRate * 100).toFixed(0)}%)</label>
                            </div>
                            <input
                                type="range"
                                value={missRate}
                                min={0} max={1} step={0.05}
                                onChange={(e) => setMissRate(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <p className="text-xs text-slate-500">How many doses the patient simply forgot.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                                <label>Average Delay ({avgDelay} mins)</label>
                            </div>
                            <input
                                type="range"
                                value={avgDelay}
                                min={0} max={600} step={15}
                                onChange={(e) => setAvgDelay(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <p className="text-xs text-slate-500">Average time taken after the scheduled slot.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                                <label>Consecutive Misses ({consecutiveMisses})</label>
                            </div>
                            <input
                                type="range"
                                value={consecutiveMisses}
                                min={0} max={10} step={1}
                                onChange={(e) => setConsecutiveMisses(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <p className="text-xs text-slate-500">Current "streak" of missed medications.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Prediction Output */}
                <Card className="md:col-span-2 border-slate-200 shadow-lg relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                    )}
                    <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="h-4 w-4 text-indigo-600" />
                                Random Forest Analysis
                            </CardTitle>
                            <CardDescription className="text-xs">Ground truth & prediction analysis</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase py-0.5">
                            {prediction?.method_used || "Evaluating..."}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">Risk Level</span>
                                <Badge className={`px-4 py-1 text-sm ${getRiskColor(prediction?.risk_level)}`}>
                                    {prediction?.risk_level || "Unknown"}
                                </Badge>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">Health Score</span>
                                <span className={`text-2xl font-black ${getWeightedAdherenceColor(prediction?.weighted_adherence)}`}>
                                    {prediction?.weighted_adherence?.toFixed(1) || "0.0"}%
                                </span>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border-indigo-100 text-indigo-900 border-l-4 border-l-indigo-600 p-4 rounded-md flex gap-4 items-start">
                            <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="font-bold text-sm text-indigo-900 uppercase tracking-tight flex items-center gap-2">
                                    Clinical Logic Applied
                                </h5>
                                <p className="text-slate-700 italic text-sm mt-1">
                                    "{prediction?.explanation || "Calculating the behavior impact on patient health..."}"
                                </p>
                            </div>
                        </div>

                        <div className="text-slate-400 p-4 rounded-lg bg-slate-50 space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Info className="h-3 w-3" />
                                Technical Context for Teachers:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <Clock className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" />
                                    <span>Delay Penalty: 10% credit drop per hour (floors at 40%).</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <TrendingDown className="h-3 w-3 mt-0.5 text-red-500 shrink-0" />
                                    <span>Weighting: Model prioritizes "Weighted Adherence" over raw missed count.</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
