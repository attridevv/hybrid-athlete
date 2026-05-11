"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Award, Clock, Heart, BarChart3, Zap, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

interface DashboardData {
  readiness: any;
  readinessTrend: number;
  latestCheckIn: any;
  weeklyMileage: number;
  weeklyVolume: number;
  weeklyRuns: number;
  weeklyWorkouts: number;
  mobilityCompliance: number;
  load: any;
  painAvg: number;
  recentRuns: any[];
  readinessHistory: any[];
}

function readinessColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function readinessBg(score: number) {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load (${res.status})`);
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Could not load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const readiness = data?.readiness;
  const load = data?.load;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Command Center</h1>
        <p className="text-zinc-500 mt-1 text-sm">Tactical performance overview</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-xs text-zinc-400 hover:text-zinc-200 underline">Retry</button>
        </div>
      )}

      {loading && !data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-3 w-16 bg-zinc-800 rounded mb-3" />
              <div className="h-8 w-20 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Top Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Readiness Score */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${readinessBg(readiness?.overall || 50)} border`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${readinessColor(readiness?.overall || 50)}`}>
                {readiness?.overall || "--"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${(data?.readinessTrend || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                <span className="text-xs text-zinc-500">
                  {data?.readinessTrend != null ? `${data.readinessTrend >= 0 ? "+" : ""}${data.readinessTrend}` : "--"} pts
                </span>
              </div>
              <Progress value={readiness?.overall || 0} className="mt-3 h-1" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Mileage */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Weekly Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">
                {data?.weeklyMileage || "0.0"} <span className="text-lg text-zinc-500">km</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Heart className="h-3 w-3 text-rose-400" />
                <span className="text-xs text-zinc-500">{data?.weeklyRuns || 0} sessions</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Training Load */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">ACWR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">
                {load?.acwr || "--"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <BarChart3 className={`h-3 w-3 ${load?.status === "optimal" ? "text-emerald-400" : "text-amber-400"}`} />
                <span className="text-xs text-zinc-500 capitalize">{load?.status?.replace("_", " ") || "No data"}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sleep */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sleep</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">
                {data?.latestCheckIn?.sleepHours || "--"}<span className="text-lg text-zinc-500">h</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-indigo-400" />
                <span className="text-xs text-zinc-500">
                  Quality: {data?.latestCheckIn?.sleepQuality || "--"}/10
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Readiness Trend */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-300">Readiness Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.readinessHistory && data.readinessHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={[...data.readinessHistory].reverse().map((s, i) => ({
                  day: `D${i + 1}`,
                  score: s.overall,
                  sleep: s.sleepScore,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sleep" stroke="#818cf8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-zinc-600 text-sm">
                No readiness data yet — complete your first check-in
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-300">Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Mobility Compliance</span>
                  <span>{data?.mobilityCompliance || 0}%</span>
                </div>
                <Progress value={data?.mobilityCompliance || 0} className="h-2" />
                {(data?.mobilityCompliance || 0) < 60 && (
                  <p className="text-[10px] text-amber-400 mt-1">Below target — aim for daily mobility</p>
                )}
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Pain Average</span>
                  <span className={data?.painAvg && data.painAvg > 4 ? "text-amber-400" : "text-emerald-400"}>
                    {(data?.painAvg || 0)}/10
                  </span>
                </div>
                <Progress value={Math.min(100, (data?.painAvg || 0) * 10)} className="h-2 [&>div]:bg-amber-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Weekly Volume</span>
                  <span>{data?.weeklyVolume?.toLocaleString() || 0} kg</span>
                </div>
                <Progress value={Math.min(100, ((data?.weeklyVolume || 0) / 20000) * 100)} className="h-2 [&>div]:bg-blue-500" />
              </div>
              <div className="border-t border-zinc-800 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Run sessions</span>
                  <span className="text-zinc-100 font-medium">{data?.weeklyRuns || 0}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-zinc-400">Workout sessions</span>
                  <span className="text-zinc-100 font-medium">{data?.weeklyWorkouts || 0}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-zinc-400">Acute Load</span>
                  <span className="text-zinc-100 font-medium">{load?.acuteLoad || "--"}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-zinc-400">Fatigue Index</span>
                  <span className={`font-medium ${(load?.fatigueIndex || 0) > 70 ? "text-amber-400" : "text-zinc-100"}`}>
                    {load?.fatigueIndex || "--"}/100
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
