"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Brain, Info, RefreshCw, TrendingDown, Clock,
    ShieldAlert, Microscope, Activity, Cpu, Zap, ArrowRight, Network
} from "lucide-react";
import api from "@/lib/api";

export default function MLPlayground() {
    const [missRate, setMissRate] = useState(0.2);
    const [avgDelay, setAvgDelay] = useState(30);
    const [consecutiveMisses, setConsecutiveMisses] = useState(1);
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const fetchPrediction = async () => {
        setLoading(true);
        setActiveStep(1);
        try {
            const response = await api.post("/predictions/playground/", {
                miss_rate: missRate,
                avg_delay: avgDelay,
                consecutive_misses: consecutiveMisses,
            });
            // Simulate "processing" time for the visual nodes
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
        setActiveStep(1);
        const timer = setTimeout(() => {
            fetchPrediction();
        }, 500);
        return () => clearTimeout(timer);
    }, [missRate, avgDelay, consecutiveMisses]);

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "high": return "bg-red-500 text-white";
            case "medium": return "bg-amber-500 text-white";
            case "low": return "bg-emerald-500 text-white";
            default: return "bg-gray-500 text-white";
        }
    };

    const getWeightedAdherenceColor = (score: number) => {
        if (score > 80) return "text-emerald-500";
        if (score > 50) return "text-amber-500";
        return "text-red-500";
    };

    return (
        <div className="space-y-8 p-6 max-w-6xl mx-auto min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                            <Microscope className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                AI Intelligence Lab
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50">
                                    <Cpu className="h-3 w-3 mr-1" /> Multi-Tree Random Forest
                                </Badge>
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-sm text-slate-500 font-medium">Explainable Machine Learning</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-2 rounded-lg bg-emerald-50">
                        <ShieldAlert className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-xs">
                        <p className="font-bold text-slate-800 uppercase tracking-tighter">Sandbox Mode</p>
                        <p className="text-slate-500">Local isolation active - Real data protected</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Control Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white pb-6 pt-6">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-400" />
                                Input Behavioral Metrics
                            </CardTitle>
                            <CardDescription className="text-slate-400">Configure parameters for simulation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-10 pt-8 pb-10">
                            {/* Miss Rate */}
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Miss Rate</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-black text-slate-600">
                                        {(missRate * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={missRate}
                                    min={0} max={1} step={0.05}
                                    onChange={(e) => setMissRate(parseFloat(e.target.value))}
                                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                    <span>Compliant</span>
                                    <span>Non-Compliant</span>
                                </div>
                            </div>

                            {/* Delay */}
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    <span>Avg Delay</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-black text-slate-600">
                                        {avgDelay} Mins
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={avgDelay}
                                    min={0} max={600} step={15}
                                    onChange={(e) => setAvgDelay(parseInt(e.target.value))}
                                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                    <span>On-Time</span>
                                    <span>10h Late</span>
                                </div>
                            </div>

                            {/* Consecutive */}
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    <span>Consecutive Misses</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-black text-slate-600">
                                        {consecutiveMisses}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={consecutiveMisses}
                                    min={0} max={10} step={1}
                                    onChange={(e) => setConsecutiveMisses(parseInt(e.target.value))}
                                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                    <span>Occasional</span>
                                    <span>High Abandonment</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AlertBox title="Teacher's Key Insight" icon={<Info className="h-4 w-4" />}>
                        The system doesn't just check 'Missed' doses. It uses a <strong>Time-Weighted Adherence</strong> score where late doses lose 10% value per hour of delay.
                    </AlertBox>
                </div>

                {/* Right Visualization Column */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-slate-200 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    Neural Execution Path
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full animate-pulse", loading ? "bg-amber-500" : "bg-emerald-500")} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                        {loading ? "Computing Nodes..." : "Inference Ready"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 pt-8">
                            {/* Visual Flow Area */}
                            <div className="relative h-[320px] mb-8 px-12">
                                <VisualFlow
                                    activeStep={activeStep}
                                    missRate={missRate}
                                    avgDelay={avgDelay}
                                    consecutive={consecutiveMisses}
                                    resultRisk={prediction?.risk_level}
                                />
                            </div>

                            {/* Footer Data Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100">
                                <ResultStat
                                    label="Risk Classification"
                                    value={prediction?.risk_level || "..."}
                                    color={getRiskColor(prediction?.risk_level)}
                                    isLoading={loading}
                                />
                                <ResultStat
                                    label="Weighted Adherence"
                                    value={`${prediction?.weighted_adherence?.toFixed(1) || "0.0"}%`}
                                    color={getWeightedAdherenceColor(prediction?.weighted_adherence)}
                                    isLoading={loading}
                                    isSpecial
                                />
                                <ResultStat
                                    label="Predicted Next Delay"
                                    value={`${prediction?.predicted_delay_minutes || 0}m`}
                                    isLoading={loading}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logic Breakdown Card */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                            <Brain className="h-32 w-32 text-indigo-400" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Model Decision Log</h3>
                                <div className="h-1 w-12 bg-indigo-500 rounded-full mb-6" />
                                <p className="text-xl font-medium leading-relaxed italic border-l-2 border-indigo-500/30 pl-6 py-1">
                                    "{prediction?.explanation || "Awaiting behavioral data to initialize diagnostic trace..."}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 pt-8 border-t border-white/5">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <Network className="h-4 w-4 text-emerald-400" />
                                        Weighted Scoring (Ground Truth)
                                    </h4>
                                    <p className="text-[13px] text-slate-400 leading-relaxed">
                                        Instead of binary counting, we apply a <strong>Time Decay function</strong>.
                                        Each late hour reduces the patient's 'credit' by 10%.
                                        A 4-hour delay scores 70%, while 10+ hours scores a baseline of 40%.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <TrendingDown className="h-4 w-4 text-blue-400" />
                                        Regression Analysis
                                    </h4>
                                    <p className="text-[13px] text-slate-400 leading-relaxed">
                                        The second forest (Regressor) predicts the <strong>Next Expected Delay</strong>.
                                        This helps caretakers anticipate when a patient is likely to miss their window.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VisualFlow({ activeStep, missRate, avgDelay, consecutive, resultRisk }: any) {
    const isHigh = missRate > 0.4 || consecutive > 4 || avgDelay > 240;

    return (
        <div className="h-full w-full relative">
            <svg className="h-full w-full" viewBox="0 0 800 300">
                <defs>
                    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Input Nodes */}
                <g className="inputs">
                    <VisualNode x={100} y={50} label="Behavior" icon={<Activity className="h-4 w-4" />} active={activeStep >= 1} />
                    <VisualNode x={100} y={150} label="Delay" icon={<Clock className="h-4 w-4" />} active={activeStep >= 1} />
                    <VisualNode x={100} y={250} label="History" icon={<TrendingDown className="h-4 w-4" />} active={activeStep >= 1} />
                </g>

                {/* Processing Forest */}
                <g className="forest" transform="translate(100, 0)">
                    {/* Connection Paths */}
                    <AnimatedPath d="M 120 50 Q 250 150 350 150" active={activeStep >= 2} />
                    <AnimatedPath d="M 120 150 L 350 150" active={activeStep >= 2} />
                    <AnimatedPath d="M 120 250 Q 250 150 350 150" active={activeStep >= 2} />

                    {/* Middle Nodes */}
                    <VisualNode x={230} y={100} label="Tree #1" active={activeStep >= 2} mini />
                    <VisualNode x={230} y={200} label="Tree #2" active={activeStep >= 2} mini />
                    <VisualNode x={300} y={150} label="Voter Node" active={activeStep >= 2} mini />
                </g>

                {/* Result Node */}
                <g className="outputs" transform="translate(450, 0)">
                    <AnimatedPath d="M 0 150 L 120 150" active={activeStep >= 3} />
                    <VisualNode
                        x={150} y={150}
                        label="Risk"
                        icon={<ShieldAlert className="h-6 w-6" />}
                        active={activeStep >= 3}
                        isResult
                        resultColor={resultRisk === "high" ? "#ef4444" : resultRisk === "medium" ? "#f59e0b" : "#10b981"}
                    />
                </g>

                {/* Animated Particles */}
                {activeStep === 1 && (
                    <circle r="4" fill="#6366f1" filter="url(#glow)">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path="M 120 50 Q 300 150 450 150" />
                    </circle>
                )}
                {activeStep === 2 && (
                    <circle r="5" fill="#f59e0b" filter="url(#glow)">
                        <animateMotion dur="1s" repeatCount="indefinite" path="M 350 150 L 580 150" />
                    </circle>
                )}
            </svg>
        </div>
    );
}

function VisualNode({ x, y, label, icon, active, mini, isResult, resultColor }: any) {
    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Outer Glow */}
            {active && (
                <circle r={isResult ? 40 : mini ? 15 : 25} fill={isResult ? resultColor : "#6366f1"} className="opacity-10 animate-ping" />
            )}

            {/* Circle Body */}
            <circle
                r={isResult ? 35 : mini ? 12 : 22}
                className={cn(
                    "transition-all duration-700 stroke-[2.5px]",
                    active
                        ? (isResult ? "fill-white" : "fill-white stroke-indigo-600")
                        : "fill-slate-50 stroke-slate-200"
                )}
                style={isResult && active ? { stroke: resultColor, fill: resultColor + '10' } : {}}
            />

            {/* Icon/Content */}
            <foreignObject x={isResult ? -10 : mini ? -6 : -9} y={isResult ? -10 : mini ? -6 : -9} width="20" height="20">
                <div className={cn(
                    "transition-colors duration-700",
                    active ? (isResult ? "text-slate-900" : "text-indigo-600") : "text-slate-300"
                )} style={isResult && active ? { color: resultColor } : {}}>
                    {icon}
                </div>
            </foreignObject>

            {/* Label */}
            {!mini && (
                <text
                    y={isResult ? 55 : mini ? 25 : 40}
                    textAnchor="middle"
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest fill-slate-400 transition-colors duration-700",
                        active && (isResult ? "fill-slate-900" : "fill-indigo-600")
                    )}
                >
                    {label}
                </text>
            )}
        </g>
    );
}

function AnimatedPath({ d, active }: any) {
    return (
        <>
            <path d={d} fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
            <path
                d={d}
                fill="none"
                className={cn(
                    "transition-all duration-1000 stroke-indigo-500/20",
                    active ? "stroke-dashoffset-0" : "stroke-dashoffset-[100]"
                )}
                strokeWidth="2.5"
                strokeDasharray="100"
            />
        </>
    );
}

function ResultStat({ label, value, color, isLoading, isSpecial }: any) {
    return (
        <div className={cn(
            "p-6 flex flex-col items-center justify-center border-r last:border-r-0 border-slate-100 transition-colors duration-500",
            isSpecial && "bg-slate-50/30"
        )}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{label}</span>
            {isLoading ? (
                <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
                <div className={cn(
                    "text-2xl font-black uppercase tracking-tight px-3 py-1 rounded-xl transition-all duration-700",
                    color || "text-slate-900"
                )}>
                    {value}
                </div>
            )}
        </div>
    );
}

function AlertBox({ title, icon, children }: any) {
    return (
        <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-200/50 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                <Cpu className="h-16 w-16 text-white" />
            </div>
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3 text-white">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        {icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{title}</span>
                </div>
                <p className="text-sm text-indigo-50 leading-relaxed font-medium">
                    {children}
                </p>
            </CardContent>
        </Card>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
