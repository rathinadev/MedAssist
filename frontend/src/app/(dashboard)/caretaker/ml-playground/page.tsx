"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Brain, Info, RefreshCw, TrendingDown, Clock,
    ShieldAlert, Microscope, Activity, Cpu, Zap, ArrowRight, Network,
    AlertTriangle, CheckCircle2, ChevronRight
} from "lucide-react";
import api from "@/lib/api";

export default function MLPlayground() {
    const [missRate, setMissRate] = useState(0.2);
    const [avgDelay, setAvgDelay] = useState(30);
    const [consecutiveMisses, setConsecutiveMisses] = useState(1);
    const [prediction, setPrediction] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [selectedProfileId, setSelectedProfileId] = useState<any>(null);

    const fetchProfiles = async () => {
        try {
            const response = await api.get("/predictions/playground/");
            setProfiles(response.data.profiles || []);
        } catch (err) {
            console.error("Failed to fetch profiles", err);
        }
    };

    const fetchPrediction = async () => {
        setLoading(true);
        setActiveStep(1);
        try {
            const response = await api.post("/predictions/playground/", {
                miss_rate: missRate,
                avg_delay: avgDelay,
                consecutive_misses: consecutiveMisses,
            });
            setTimeout(() => {
                setPrediction(response.data);
                setActiveStep(3);
                setLoading(false);
            }, 600);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    useEffect(() => {
        setActiveStep(1);
        const timer = setTimeout(() => {
            fetchPrediction();
        }, 500);
        return () => clearTimeout(timer);
    }, [missRate, avgDelay, consecutiveMisses]);

    const handleLoadProfile = (profile: any) => {
        setSelectedProfileId(profile.id);
        setMissRate(profile.stats.miss_rate);
        setAvgDelay(profile.stats.avg_delay);
        setConsecutiveMisses(profile.stats.consecutive_misses);
    };

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "high": return "bg-red-500 text-white shadow-lg shadow-red-200";
            case "medium": return "bg-amber-500 text-white shadow-lg shadow-amber-200";
            case "low": return "bg-emerald-500 text-white shadow-lg shadow-emerald-200";
            default: return "bg-gray-500 text-white";
        }
    };

    const getRiskTextColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "high": return "text-red-500";
            case "medium": return "text-amber-500";
            case "low": return "text-emerald-500";
            default: return "text-slate-500";
        }
    };

    const getWeightedAdherenceColor = (score: number) => {
        if (score > 80) return "text-emerald-500";
        if (score > 50) return "text-amber-500";
        return "text-red-500";
    };

    // Logic Explainer Trace
    const logicTrace = useMemo(() => {
        const trace = [];
        if (missRate > 0.3) trace.push({ label: "Severe Miss Rate", impact: "High", color: "text-red-500" });
        else if (missRate > 0.1) trace.push({ label: "Regular Misses", impact: "Medium", color: "text-amber-500" });

        if (avgDelay > 120) trace.push({ label: "Critical Window Delay", impact: "High", color: "text-red-500" });
        else if (avgDelay > 30) trace.push({ label: "Moderate Window Drift", impact: "Medium", color: "text-blue-500" });

        if (consecutiveMisses >= 3) trace.push({ label: "Abandonment Pattern", impact: "Critical", color: "text-red-600 font-bold" });

        if (trace.length === 0) trace.push({ label: "Optimal Behavior", impact: "None", color: "text-emerald-500" });
        return trace;
    }, [missRate, avgDelay, consecutiveMisses]);

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 rotate-3">
                            <Microscope className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">
                                AI Intelligence Lab
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-2 py-0">
                                    <Cpu className="h-3 w-3 mr-1" /> Multi-Tree Random Forest v4.0
                                </Badge>
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Inference Engine Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <ShieldAlert className="h-6 w-6 text-emerald-600 animate-pulse" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="text-sm">
                        <p className="font-black text-slate-800 uppercase tracking-tighter text-[10px]">Data Isolation Layer</p>
                        <p className="text-slate-500 text-xs font-medium">Synthetic Sandbox Active</p>
                    </div>
                </div>
            </div>

            {/* Quick Guide Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center gap-6 border-b-4 border-indigo-900/20">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    <Info className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">How to use the Lab</h3>
                    <p className="text-sm text-blue-50/80 font-medium leading-relaxed max-w-3xl">
                        This is a <strong className="text-white">Predictive Sandbox</strong>. 
                        Click a patient profile on the left to load their real-world behavior into the machine, or manually drag the sliders below to simulate hygiene "scenarios" and see how the AI adjusts its risk assessment in real-time.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Control Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-slate-200 shadow-xl overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-900 text-white pb-6 pt-8 px-8">
                            <CardTitle className="text-lg flex items-center gap-3">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                </div>
                                Behavioral Inputs
                            </CardTitle>
                            <CardDescription className="text-slate-400">Drag to observe logic drift in real-time</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12 pt-10 pb-12 px-8 bg-white">
                            {/* Profile Selector */}
                            <div className="space-y-3">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Load Patient Profile</span>
                                <div className="grid grid-cols-1 gap-2">
                                    {profiles.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleLoadProfile(p)}
                                            className={cn(
                                                "text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group border",
                                                selectedProfileId === p.id 
                                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-inner translate-x-2" 
                                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                            )}
                                        >
                                            <span className={cn(selectedProfileId !== p.id && "group-hover:translate-x-1 transition-transform")}>{p.name}</span>
                                            <ChevronRight className={cn("h-3 w-3", selectedProfileId === p.id ? "text-white/50" : "text-slate-300")} />
                                        </button>
                                    ))}
                                    {profiles.length === 0 && (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400 text-center font-bold italic">
                                            No active patient data found
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Miss Rate */}
                            <div className="group space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Miss Rate</span>
                                    <span className="px-3 py-1 bg-slate-900 rounded-full text-xs font-black text-white ring-4 ring-slate-100">
                                        {(missRate * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={missRate}
                                    min={0} max={1} step={0.05}
                                    onChange={(e) => setMissRate(parseFloat(e.target.value))}
                                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all shadow-inner"
                                />
                            </div>

                            {/* Delay */}
                            <div className="group space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Avg Delay</span>
                                    <span className="px-3 py-1 bg-slate-900 rounded-full text-xs font-black text-white ring-4 ring-slate-100">
                                        {avgDelay}m
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={avgDelay}
                                    min={0} max={600} step={15}
                                    onChange={(e) => setAvgDelay(parseInt(e.target.value))}
                                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all shadow-inner"
                                />
                            </div>

                            {/* Consecutive */}
                            <div className="group space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Streak Misses</span>
                                    <span className="px-3 py-1 bg-slate-900 rounded-full text-xs font-black text-white ring-4 ring-slate-100">
                                        {consecutiveMisses}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={consecutiveMisses}
                                    min={0} max={10} step={1}
                                    onChange={(e) => setConsecutiveMisses(parseInt(e.target.value))}
                                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all shadow-inner"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Real-time Logic Tracker */}
                    <Card className="border-indigo-100 bg-indigo-50/50 rounded-3xl overflow-hidden border shadow-sm">
                        <CardHeader className="pb-4 pt-6 px-8">
                            <CardTitle className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                <Network className="h-4 w-4" />
                                Logic Signal Trace
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-3">
                            {logicTrace.map((item, id) => (
                                <div key={id} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-white/80 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-left-2 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-2 w-2 rounded-full", item.color.replace('text-', 'bg-'))} />
                                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] font-black tracking-widest bg-slate-100 px-2 py-0 border-none">
                                        {item.impact}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Visualization Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Health Score Banner */}
                    <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-800 overflow-hidden rounded-[2.5rem] relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                        <CardContent className="p-8 flex flex-col items-center justify-center relative z-10">
                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] mb-2">Integrated Behavioral Health Score</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className={cn("text-7xl font-black tracking-tighter text-white transition-all duration-1000", loading ? "opacity-40" : "opacity-100")}>
                                    {prediction?.weighted_adherence?.toFixed(1) || "0.0"}
                                    <span className="text-2xl text-indigo-300 ml-1">%</span>
                                </h2>
                            </div>
                        </CardContent>
                    </Card>

                    {/* DUAL LOGIC COMPARISON WINDOW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* UNTRAINED: Clinical Rule Engine */}
                        <Card className="border-slate-200 shadow-xl overflow-hidden bg-white rounded-[2.5rem] flex flex-col">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 pt-6 px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-5 w-5 text-slate-400" />
                                        <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-widest">Clinical Engine</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black tracking-tighter uppercase text-slate-400 border-slate-200">Untrained</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Deterministic Risk</span>
                                <div className={cn(
                                    "px-8 py-4 rounded-3xl text-3xl font-black uppercase tracking-tight transition-all duration-1000",
                                    loading ? "bg-slate-100 text-slate-200" : getRiskColor(prediction?.clinical_engine?.risk_level)
                                )}>
                                    {prediction?.clinical_engine?.risk_level || "..."}
                                </div>
                                <p className="text-xs text-slate-500 italic font-medium leading-relaxed">
                                    "{prediction?.clinical_engine?.explanation || "Initializing..."}"
                                </p>
                            </CardContent>
                            <div className="p-4 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center border-t border-slate-100">
                                Heuristic Validation Only
                            </div>
                        </Card>

                        {/* TRAINED: AI Intelligence Lab */}
                        <Card className="border-indigo-100 shadow-xl overflow-hidden bg-white rounded-[2.5rem] flex flex-col ring-2 ring-indigo-500/20">
                            <CardHeader className="bg-indigo-600 border-b border-indigo-700 pb-4 pt-6 px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-indigo-100" />
                                        <CardTitle className="text-xs font-black text-white uppercase tracking-widest">AI Intelligence</CardTitle>
                                    </div>
                                    <Badge className="bg-white/20 text-indigo-50 text-[10px] font-black tracking-tighter uppercase border-none hover:bg-white/30">Trained on 7.2k Rows</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Probabilistic Insight</span>
                                {prediction?.ml_intelligence ? (
                                    <>
                                        <div className={cn(
                                            "px-8 py-4 rounded-3xl text-3xl font-black uppercase tracking-tight transition-all duration-1000",
                                            loading ? "bg-indigo-50 text-indigo-100" : getRiskColor(prediction?.ml_intelligence?.risk_level)
                                        )}>
                                            {prediction?.ml_intelligence?.risk_level}
                                        </div>
                                        <p className="text-xs text-indigo-900 font-bold leading-relaxed px-2 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                            {prediction?.ml_intelligence?.explanation}
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-3xl animate-pulse">
                                            <div className="h-6 w-32 bg-slate-200 rounded mx-auto" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Awaiting Brain Update...</p>
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-4 bg-indigo-50 text-[9px] font-black text-indigo-600 uppercase tracking-widest text-center border-t border-indigo-100">
                                Predictive Neural Inference
                            </div>
                        </Card>
                    </div>

                    {/* Contrast Alert Badge */}
                    {prediction?.clinical_engine?.risk_level !== prediction?.ml_intelligence?.risk_level && prediction?.ml_intelligence && (
                        <div className="bg-amber-100/80 border border-amber-200 text-amber-900 p-4 rounded-3xl flex items-center justify-between animate-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-amber-600 fill-amber-600" />
                                <span className="text-sm font-black uppercase tracking-tight">AI Logical Refinement Detected</span>
                            </div>
                            <span className="text-[11px] font-medium italic">Model corrected clinical heuristic based on learned patterns</span>
                        </div>
                    )}

                    {/* Neural Decision Flow Visualization */}
                    <Card className="border-slate-200 shadow-xl overflow-hidden bg-white rounded-[2.5rem]">
                        <CardHeader className="border-b border-slate-50 bg-white pb-6 pt-8 px-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-black flex items-center gap-3 text-slate-900 tracking-tight uppercase">
                                        <Network className="h-4 w-4 text-indigo-500" />
                                        Inference Node Trace
                                    </CardTitle>
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-slate-100">
                                    <div className={cn("h-2.5 w-2.5 rounded-full", loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">
                                        {loading ? "Re-weighting Forest..." : "Classification Stable"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 pt-10">
                            <div className="relative h-[280px] mb-10 px-12">
                                <VisualFlow
                                    activeStep={activeStep}
                                    missRate={missRate}
                                    avgDelay={avgDelay}
                                    consecutive={consecutiveMisses}
                                    resultRisk={prediction?.ml_intelligence?.risk_level || prediction?.clinical_engine?.risk_level}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Model Rationale Section */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-110 duration-1000">
                            <Brain className="h-48 w-48 text-indigo-400" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Heuristic Diagnostic Log</h3>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                                <p className="text-2xl font-black leading-tight text-white/95">
                                    "{prediction?.explanation || "Awaiting behavioral data to initialize diagnostic trace..."}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-2 p-8 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                                            <Network className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Weighted Adherence Engine</h4>
                                    </div>
                                    <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                                        Unlike simple counting, our engine applies a <strong>Medically-Sound Time Decay</strong>.
                                        The feature vector considers delay as a logarithmic penalty, ensuring 'Very Late' behavior
                                        triggers risk faster than 'Occasionally Late' behavior.
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                        <ChevronRight className="h-3 w-3" /> Sensitivity Level: High Accuracy
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/10 rounded-xl">
                                            <TrendingDown className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Feature Contribution</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <FeatureBar label="Frequency" value={missRate * 100} color="bg-indigo-500" />
                                        <FeatureBar label="Latency" value={(avgDelay / 600) * 100} color="bg-blue-400" />
                                        <FeatureBar label="Stability" value={(10 - consecutiveMisses) * 10} color="bg-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureBar({ label, value, color }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>{label}</span>
                <span>{value.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", color)}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function VisualFlow({ activeStep, missRate, avgDelay, consecutive, resultRisk }: any) {
    return (
        <div className="h-full w-full relative">
            <svg className="h-full w-full" viewBox="0 0 800 300">
                <defs>
                    <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>

                {/* Main Decision Paths */}
                <g className="opacity-20">
                    <path d="M 120 50 Q 250 150 450 150" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />
                    <path d="M 120 150 L 450 150" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />
                    <path d="M 120 250 Q 250 150 450 150" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />
                </g>

                {/* Active Logic Paths */}
                {activeStep >= 1 && (
                    <g>
                        <AnimatedPath d="M 120 50 Q 250 150 450 150" delay={0} />
                        <AnimatedPath d="M 120 150 L 450 150" delay={0.2} />
                        <AnimatedPath d="M 120 250 Q 250 150 450 150" delay={0.4} />
                    </g>
                )}

                {/* Nodes */}
                <g className="inputs">
                    <VisualNode x={100} y={50} label="Frequency" icon={<Activity className="h-4 w-4" />} active={activeStep >= 1} intensity={missRate} />
                    <VisualNode x={100} y={150} label="Latency" icon={<Clock className="h-4 w-4" />} active={activeStep >= 1} intensity={avgDelay / 600} />
                    <VisualNode x={100} y={250} label="Consistency" icon={<TrendingDown className="h-4 w-4" />} active={activeStep >= 1} intensity={consecutive / 10} />
                </g>

                <g className="forest" transform="translate(150, 0)">
                    <VisualNode x={150} y={100} label="Tree #1" active={activeStep >= 2} mini />
                    <VisualNode x={150} y={200} label="Tree #2" active={activeStep >= 2} mini />
                    <VisualNode x={250} y={150} label="Voter Node" active={activeStep >= 2} mini pulse />
                </g>

                {activeStep >= 3 && (
                    <g transform="translate(580, 0)">
                        <VisualNode
                            x={0} y={150}
                            label="Risk"
                            icon={<ShieldAlert className="h-8 w-8" />}
                            active={true}
                            isResult
                            resultColor={resultRisk === "high" ? "#ef4444" : resultRisk === "medium" ? "#f59e0b" : "#10b981"}
                        />
                    </g>
                )}
            </svg>
        </div>
    );
}

function VisualNode({ x, y, label, icon, active, mini, isResult, resultColor, intensity, pulse }: any) {
    return (
        <g transform={`translate(${x}, ${y})`}>
            {active && (
                <circle r={isResult ? 45 : mini ? 15 : 28} fill={isResult ? resultColor : "#6366f1"} className={cn("opacity-10", (pulse || isResult) && "animate-ping")} />
            )}

            <circle
                r={isResult ? 38 : mini ? 12 : 24}
                className={cn(
                    "transition-all duration-1000 stroke-[3px]",
                    active
                        ? (isResult ? "fill-white" : "fill-white stroke-indigo-600")
                        : "fill-white stroke-slate-100 shadow-sm"
                )}
                style={isResult && active ? { stroke: resultColor, fill: resultColor + '15' } : {}}
            />

            {/* Intensity Ring for Inputs */}
            {active && intensity !== undefined && !isResult && (
                <circle
                    r={24}
                    fill="none"
                    strokeDasharray={`${intensity * 150} 1000`}
                    stroke="#4f46e5"
                    strokeWidth="3"
                    className="transition-all duration-1000 -rotate-90 origin-center"
                />
            )}

            <foreignObject x={isResult ? -12 : mini ? -7 : -10} y={isResult ? -12 : mini ? -7 : -10} width="24" height="24">
                <div className={cn(
                    "transition-colors duration-1000 flex items-center justify-center h-full",
                    active ? (isResult ? "" : "text-indigo-600") : "text-slate-200"
                )} style={isResult && active ? { color: resultColor } : {}}>
                    {icon}
                </div>
            </foreignObject>

            {!mini && (
                <text
                    y={isResult ? 60 : 45}
                    textAnchor="middle"
                    className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] fill-slate-300 transition-all duration-1000",
                        active && (isResult ? "fill-slate-900" : "fill-indigo-600")
                    )}
                >
                    {label}
                </text>
            )}
        </g>
    );
}

function AnimatedPath({ d, delay }: any) {
    return (
        <g>
            <path d={d} fill="none" stroke="#4f46e5" strokeWidth="2.5" className="opacity-10" />
            <path
                d={d}
                fill="none"
                stroke="url(#activeGrad)"
                strokeWidth="2.5"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="animate-flow"
                style={{ animationDelay: `${delay}s` }}
            />
        </g>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
